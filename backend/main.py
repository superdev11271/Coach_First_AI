from ingestion import flask_app
from telegram_bot import run_bot_in_thread
from multiprocessing import Manager
from utils import user_metadata

def start_services():
    # Start Telegram bot
    manager = Manager()
    ns = manager.Namespace()
    ns.is_bot = user_metadata["is_bot"]
    ns.telegram_username = user_metadata["telegram_id"]
    
    flask_app.config['ns'] = ns

    run_bot_in_thread(ns)
    return flask_app

def main():
    app = start_services()
    # Start Flask app in development mode
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)

if __name__ == "__main__":
    main()
