import os
import io
import tempfile
import fitz
import docx2txt
import threading
from utils import embed_text, supabase, ytt_api, is_bot_share
from flask import Flask, request, jsonify
import re
import edoc
from PIL import Image
import pytesseract
from flask_cors import CORS

def is_youtube_url(url):
    # Regex to match common YouTube URL patterns
    youtube_regex = (
        r'(https?://)?(www\.)?'
        r'(youtube|youtu|youtube-nocookie)\.(com|be)/'
        r'(watch\?v=|embed/|v/|.+\?v=)?([^&=%\?]{11})'
    )
    youtube_regex_match = re.match(youtube_regex, url)
    return youtube_regex_match is not None


def extract_video_id(url):
    # Regex to extract YouTube video ID (11 characters)
    regex = r'(?:v=|\/embed\/|\/\d+\/|\/shorts\/|\/watch\?v=|youtu\.be\/|\/embed\/|\/v\/|\/)([a-zA-Z0-9_-]{11})'
    
    # Find all matches
    match = re.search(regex, url)
    
    if match:
        video_id = match.group(1)
        # Ensure it's exactly 11 characters
        if len(video_id) == 11:
            return video_id
    return None


def ocr_pdf_from_bytes_pymupdf(pdf_bytes):
    """
    Run OCR on a PDF given as bytes using PyMuPDF to render pages as images.
    No Poppler required.
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for i, page in enumerate(doc, start=1):
        # Render page to an image (RGB)
        pix = page.get_pixmap(dpi=300)
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        
        # Run OCR
        page_text = pytesseract.image_to_string(img, lang="eng")
        text += f"\n--- OCR Page {i} ---\n{page_text}"
    return text


def extract_pdf_text_from_bytes(pdf_bytes, min_chars_threshold=20):
    """
    Extract text from PDF bytes. If not enough text, run OCR using PyMuPDF.
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    extracted_text = ""

    for page in doc:
        page_text = page.get_text()
        extracted_text += page_text
    
    if len(extracted_text) > min_chars_threshold:
        print("✅ PDF is text-based. Extracting directly.")
        return extracted_text
    else:
        print("⚠️ PDF is image-based. Running OCR fallback.")
        return ocr_pdf_from_bytes_pymupdf(pdf_bytes)
    

def extract_text(file_path: str, file_type: str) -> str:
    """Extract plain text from PDF, DOCX, TXT"""
    text = ""
    if file_type == "pdf":
        with open(file_path, "rb") as f:
            pdf_bytes = f.read()
        text = extract_pdf_text_from_bytes(pdf_bytes)

    elif file_type== "docx":
        text = docx2txt.process(file_path)
    
    elif file_type == "txt":
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
    
    elif file_type == "doc":
        text = edoc.extraxt_txt(file_path)
    
    else:
        raise ValueError("Unsupported file type")
    
    return text


def chunk_text(text: str, chunk_size=300, overlap=50):
    """Split text into chunks with overlap"""
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start += chunk_size - overlap
    return chunks



def process_file(file_storage_path, file_name, file_path, file_type, user_id):
    if not file_storage_path or not file_type or not user_id:
        print({"error": "Missing required params"})
        return None
    
    if file_type == "link":
        
        if is_youtube_url(file_path):
            video_id = extract_video_id(file_path)
            transcript = ytt_api.fetch(video_id)
            text = " ".join([entry.text for entry in transcript])
        else:
            return
    else:
        try:
            response = supabase.storage.from_("coaching-files").download(file_storage_path)
            if not response:
                print({"error": "File not found in Supabase"})
                return

            with tempfile.NamedTemporaryFile(delete=False, suffix=file_type) as tmp:
                tmp.write(response)
                tmp_path = tmp.name
        except Exception as e:
            print({"error": f"Download failed: {str(e)}"})
            return None
        try:
            text = extract_text(tmp_path, file_type)
        except Exception as e:
            print({"error": f"Extract failed: {str(e)}"})
            return
        finally:
            os.remove(tmp_path)  # cleanup temp file
    if text == "":
        return
    
    chunks = chunk_text(text)

    embeddings = embed_text(chunks)
    data = []
    for i, embedding in enumerate(embeddings):
        data.append({
            "user_id": user_id,
            "file_name": file_name,
            "file_path" : file_path,
            "file_type" : file_type,
            "file_storage_path":file_storage_path,
            "content": chunks[i],
            "chunk_index": i,
            "embedding": embedding
        })

    supabase.table("documents").insert(data).execute()


def process_file_in_thread(file_storage_path, file_name, file_path, file_type, user_id, file_id, callback=None):
    def wrapper():
        try:
            process_file(file_storage_path, file_name, file_path, file_type, user_id)
            if callback:
                callback(file_id,file_type, None)  # success
        except Exception as e:
            if callback:
                callback(None, None, e)  # error

    thread = threading.Thread(target=wrapper, daemon=True)
    thread.start()
    return thread


def on_process_complete(file_id, file_type, error):
    if error:
        print(f"❌ Process failed: {error}")
        try:
            if file_type == "link":
                response = (supabase.table("videolinks").update({"status": "failed", "updated_at": "NOW()"}).eq("id", file_id).execute())
            else:
                response = (supabase.table("files").update({"status": "failed", "updated_at": "NOW()"}).eq("id", file_id).execute())
            print("✅ Status updated successfully")
        except Exception as e:
            print({"error": f"Update status failed: {str(e)}"})
    else:
        print("✅ Process finished successfully")
        try:
            if file_type == "link":
                response = (supabase.table("videolinks").update({"status": "processed", "updated_at": "NOW()"}).eq("id", file_id).execute())
            else:
                response = (supabase.table("files").update({"status": "processed", "updated_at": "NOW()"}).eq("id", file_id).execute())
            print("✅ Status updated successfully")
        except Exception as e:
            print({"error": f"Update status failed: {str(e)}"})

def on_update_embedding_complete(error=None):
    if error:
        print(f"❌ Process failed: {error}")
    else:
        print("✅ update embedding finished successfully")


def update_embedding(ducument_id):
    content = supabase.table("documents")\
                    .select("content")\
                    .eq("id", ducument_id)\
                    .execute()
    embeddings = embed_text([content.data[0]["content"]])
    (supabase.table("documents").update({"embedding": embeddings[0]}).eq("id", ducument_id).execute())

def process_update_embedding_in_thread(document_id, callback=None):
    def wrapper():
        try:
            update_embedding(document_id)
            if callback:
                callback()  # success
        except Exception as e:
            if callback:
                callback(e)  # error

    thread = threading.Thread(target=wrapper, daemon=True)
    thread.start()
    return thread



flask_app = Flask("Coaching-AI")
CORS(flask_app)


@flask_app.route("/api/process-file", methods=["POST"])
def process_file_request():
    data = request.json
    
    file_path = data.get("file_path")
    file_type = data.get("file_type")
    file_name = data.get("file_name")
    file_storage_path = data.get("file_storage_path")
    user_id = data.get("user_id")
    file_id = data.get("file_id")
    
    process_file_in_thread(file_storage_path, file_name, file_path, file_type, user_id, file_id, callback=on_process_complete)

    return jsonify({
        "status": "success"
    })

@flask_app.route("/api/process-video-link", methods=["POST"])
def process_link_request():
    data = request.json
    
    file_path = data.get("video_url")
    file_type = "link"
    file_name = ""
    file_storage_path = data.get("video_url")
    user_id = data.get("user_id")
    file_id = data.get("video_link_id")
    
    process_file_in_thread(file_storage_path, file_name, file_path, file_type, user_id, file_id, callback=on_process_complete)

    return jsonify({
        "status": "success"
    })


@flask_app.route("/api/update-embedding", methods=["POST"])
def process_update_embedding():
    data = request.json
    
    document_id = data.get("document_id")
    
    process_update_embedding_in_thread(document_id, callback=on_update_embedding_complete)

    return jsonify({
        "status": "success"
    })

@flask_app.route("/api/update-bot-settings", methods=["POST"])

def process_update_bot_mode():
    data = request.json
    is_bot = data.get("is_bot")
    with is_bot_share.get_lock():
        is_bot_share.value = int(is_bot)
    return jsonify({
        "status": "success"
    })