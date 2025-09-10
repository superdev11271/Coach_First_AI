import os
from dotenv import load_dotenv
from supabase import create_client, Client
from openai import OpenAI
import openai
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.proxies import GenericProxyConfig
from multiprocessing import Value

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ADMIN_ID = os.getenv("ADMIN_ID")
mode = os.getenv("MODE")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
user_metadata = supabase.auth.admin.get_user_by_id(ADMIN_ID).user.user_metadata

if mode == "develop":
    proxy_url = os.getenv("PROXY_URL")
    os.environ["HTTP_PROXY"] = proxy_url
    os.environ["HTTPS_PROXY"] = proxy_url
    openai.proxy = {
        "http": proxy_url,
        "https": proxy_url,
    }

is_bot_share = Value('i', 1 if user_metadata["is_bot"] else 0)
client = OpenAI(api_key=OPENAI_API_KEY)

os.environ["HTTP_PROXY"] = ""
os.environ["HTTPS_PROXY"] = ""
if mode == "develop":
    ytt_api = YouTubeTranscriptApi(
        proxy_config=GenericProxyConfig(
            http_url=proxy_url,
            https_url=proxy_url,
        )
    )
else:
    ytt_api = YouTubeTranscriptApi()


def embed_text(text):
    """Get OpenAI embedding for a chunk of text"""
    resp = client.embeddings.create(
        input=text,
        model="text-embedding-3-large"  # or "large" if you want higher quality
    )
    
    data = resp.data
    embeddings = [item.embedding for item in data]
    return embeddings