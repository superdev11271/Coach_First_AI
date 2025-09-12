from ingestion import flask_app
from telegram_bot import run_bot_in_thread

def start_services():
    # Start Telegram bot
    run_bot_in_thread()
    return flask_app

def main():
    app = start_services()
    # Start Flask app in development mode
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)

if __name__ == "__main__":
    main()
