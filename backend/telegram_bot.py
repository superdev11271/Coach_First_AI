import os
from dotenv import load_dotenv
import threading
import asyncio
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from telegram.constants import ChatAction
from multiprocessing import Process
from chat_agent import chat_with_bot
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


import threading
import time
from telegram import Update
from telegram.ext import ContextTypes
from telegram.constants import ChatAction
from chat_agent import chat_with_bot

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.message.from_user
    chat_id = update.effective_chat.id
    text = update.message.text

    print(f"Received from {user.first_name} (@{user.username}): {text}")

    # This will hold the result
    result = {}

    # Define a wrapper to run chat_with_bot in a thread
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

    # Wait for thread to finish (should already be done)
    thread.join()
    print(result['answer'])
    # Send the answer
    await update.message.reply_text(result['answer'])


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Hello! I am coach-firat AI bot. Send /help for commands.")

async def flag(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Hello! I am coach-firat AI bot. Send /help for commands.")

async def transcript(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Hello! I am coach-firat AI bot. Send /help for commands.")

async def takeover(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Hello! I am coach-firat AI bot. Send /help for commands.")


# Handler for /help command
async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("""
                                    Available commands:\n
                                    /start - start bot\n
                                    /help - this help \n
                                    /transcript – Pulls latest conversation logs. \n
                                    /flag – Marks a specific response for later review. \n
                                    /takeover – Stops AI replies and hands conversation to human.
                                    
                                    """)

def run_telegram_bot():
    telegram_app = Application.builder().token(TELEGRAM_TOKEN).build()
    telegram_app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    telegram_app.add_handler(CommandHandler("start", start))
    telegram_app.add_handler(CommandHandler("help", help_command))
    telegram_app.add_handler(CommandHandler("flag", flag))
    telegram_app.add_handler(CommandHandler("transcript", transcript))
    telegram_app.add_handler(CommandHandler("takeover", takeover))


    print("Telegram Bot is started!")
    telegram_app.run_polling()

def run_bot_in_thread():    
    p = Process(target=run_telegram_bot)
    p.start()

if __name__ == "__main__":
    run_bot_in_thread()

    print("Main thread continues while bot runs in background...")
    while True:
        pass