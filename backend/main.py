from ingestion import flask_app
from telegram_bot import run_bot_in_thread

def main():
    run_bot_in_thread()
    flask_app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)


if __name__ == "__main__":
    main()


    # process_file_in_thread(
    #     "1756721361066-uwc02emowub.pdf",
    #     "Quotation for Coach.pdf",
    #     "https://cawpadbjqekvfmpswoxt.supabase.co/storage/v1/object/public/coaching-files/1756721361066-uwc02emowub.pdf",
    #     "pdf",
    #     "3f74be90-c243-4ad5-aed3-7a5cc6785797",
    #     callback=on_process_complete
    # )

    # print("Main thread continues while file processes in background.")