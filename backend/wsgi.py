from main import start_services

# Start both Flask app and Telegram bot
flask_app = start_services()

if __name__ == "__main__":
    flask_app.run()