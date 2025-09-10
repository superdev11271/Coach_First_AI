from ingestion import flask_app
from telegram_bot import run_bot_in_thread

def main():
    run_bot_in_thread()
    flask_app.run(host="0.0.0.0")


if __name__ == "__main__":
    main()
    