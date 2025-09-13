import os
from dotenv import load_dotenv
import threading
import asyncio
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from telegram.constants import ChatAction
from multiprocessing import Process
from chat_agent import chat_with_bot
from utils import supabase, ADMIN_ID

load_dotenv()
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")

async def typing_action(chat_id: int, context: ContextTypes.DEFAULT_TYPE, stop_event: asyncio.Event):
    """Background task: repeatedly send typing action until stopped."""
    try:
        while not stop_event.is_set():
            print(">>> Sending typing action...")
            await context.bot.send_chat_action(chat_id=chat_id, action=ChatAction.TYPING)
            await asyncio.sleep(3)  # repeat every few seconds
    except Exception as e:
        print("Typing task stopped with error:", e)

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.message.from_user
    chat_id = update.effective_chat.id
    text = update.message.text

    print(f"Received from {user.first_name} (@{user.username}): {text}")
    share_ns = context.bot_data["share_ns"]
    is_bot = share_ns.is_bot
    telegram_username = share_ns.telegram_username
    
    if is_bot == False:
        await update.message.reply_text(f"AI bot is not working now. Please contact with coach({telegram_username}).")
        return
    # This will hold the result
    result = {}

    result['answer'] = ""
    def bot_thread():
        result['answer'] = chat_with_bot(chat_id, user, text)

    thread = threading.Thread(target=bot_thread)
    thread.start()

    # While the thread is alive, send typing action
    try:
        while thread.is_alive():
            await context.bot.send_chat_action(chat_id=chat_id, action=ChatAction.TYPING)
            await asyncio.sleep(2)  # resend every 2 seconds
    except Exception as e:
        print("Typing action error:", e)

    thread.join()
    # Send the answer
    if result['answer'] != "":
        await update.message.reply_text(result['answer'])


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    share_ns = context.bot_data["share_ns"]
    telegram_username = share_ns.telegram_username
    if update.message.from_user.username != telegram_username[1:]:
        await update.message.reply_text("Hello! I am coach-firat AI bot. Send /help for commands.")
    else:
        supabase.auth.admin.update_user_by_id(
            ADMIN_ID,
            {
                "user_metadata": {
                    "chat_id": update.effective_chat.id
                }
            }
        )
        await update.message.reply_text("Hello! I am coach-firat AI bot for admin. Send /help for commands.")

async def flag(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        share_ns = context.bot_data["share_ns"]
        telegram_username = share_ns.telegram_username
        chat_id = update.effective_chat.id
        if update.message.from_user.username != telegram_username[1:]:
            return
        histories = supabase.table("chat_history")\
                    .select("id, username,role, message, document_ids")\
                    .order("created_at")\
                    .limit(60)\
                    .execute()
        index = None
        for i, d in enumerate(histories.data):
            if d["message"] == update.message.reply_to_message.text.split(": ", 1)[1]:
                index = i
        
        print(index)
        if index == None or index - 1 < 0 or histories.data[index]["role"] != "bot":
            return
        print(index)
        item = histories.data[index]
        supabase.table("flagged_answers").insert({"question":histories.data[index - 1]["message"], "answer":item["message"], "document_ids":item["document_ids"]}).execute()
        print("successfully flaged!")
        await context.bot.send_message(chat_id=chat_id, text="successfully flaged!")
        
    except Exception as e:
        print("Typing action error:", e)


async def transcript(update: Update, context: ContextTypes.DEFAULT_TYPE):
    share_ns = context.bot_data["share_ns"]
    telegram_username = share_ns.telegram_username
    if update.message.from_user.username != telegram_username[1:]:
        return
    chat_id = update.effective_chat.id
    try:
        histories = supabase.table("chat_history")\
                    .select("id, username, role, message")\
                    .order("created_at")\
                    .limit(50)\
                    .execute()
        # Replay each message in order
        for msg in histories.data:
            prefix = f"👤{msg["username"]}: " if msg["role"] == "user" else "🤖 Bot: "
            await context.bot.send_message(chat_id=chat_id, text=prefix + msg["message"])
    except:
        await context.bot.send_message(chat_id=chat_id, text="Now you can't see history")

async def takeover(update: Update, context: ContextTypes.DEFAULT_TYPE):
    share_ns = context.bot_data["share_ns"]
    telegram_username = share_ns.telegram_username
    if update.message.from_user.username != telegram_username[1:]:
        await update.message.reply_text("Hello! I am coach-firat AI bot.")
        return
    
    share_ns = context.bot_data["share_ns"]
    n_is_bot = False if share_ns.is_bot else True
    supabase.auth.admin.update_user_by_id(
            ADMIN_ID,
            {
                "user_metadata": {
                    "is_bot": n_is_bot
                }
            }
        )
    share_ns.is_bot = n_is_bot

    if n_is_bot:
        await update.message.reply_text("Bot is working now.")
    else:            
        await update.message.reply_text("Bot is not working. You have to handle user messages.")
    


# Handler for /help command
async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    share_ns = context.bot_data["share_ns"]
    telegram_username = share_ns.telegram_username
    if update.message.from_user.username != telegram_username[1:]:
        await update.message.reply_text("""
                                    Available commands:\n
                                    /start - start bot\n
                                    /help - this help \n
                                    """)
        return
    await update.message.reply_text("""
                                    Available commands:\n
                                    /start - start bot\n
                                    /help - this help \n
                                    /transcript – Pulls latest conversation logs. \n
                                    /flag – Marks a specific response for later review. \n
                                    /takeover – Stops AI replies and hands conversation to human.
                                    
                                    """)

def run_telegram_bot(share_ns):
    telegram_app = Application.builder().token(TELEGRAM_TOKEN).build()
    telegram_app.bot_data["share_ns"] = share_ns
    telegram_app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    telegram_app.add_handler(CommandHandler("start", start))
    telegram_app.add_handler(CommandHandler("help", help_command))
    telegram_app.add_handler(CommandHandler("flag", flag))
    telegram_app.add_handler(CommandHandler("transcript", transcript))
    telegram_app.add_handler(CommandHandler("takeover", takeover))


    print("Telegram Bot is started!")
    telegram_app.run_polling()

def run_bot_in_thread(ns):
    
    p = Process(target=run_telegram_bot, args=(ns,))
    p.start()

if __name__ == "__main__":
    run_bot_in_thread()

    print("Main thread continues while bot runs in background...")
    while True:
        pass