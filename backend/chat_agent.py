from utils import embed_text, supabase, client, proxy_url, OPENAI_API_KEY
from openai import OpenAI

def search_top_k(query: str, k: int = 5):
    query_embedding = embed_text([query])
    res = supabase.rpc("match_documents", {"query": query_embedding[0], "top_k": k}).execute()
    return res.data

def build_prompt(query, retrieved_docs):
    # Build content summary
    content_blocks = []
    for i, doc in enumerate(retrieved_docs, start=1):
        block = f"{doc['content']}"
        if doc.get("file_type") == "link" and doc.get("link"):
            block += f"\n   Watch here: {doc['link']}"
        content_blocks.append(block)

    context = "\n\n".join(content_blocks)

    conversation = [{"role": "system", "content": "You are a helpful assistant. You have to chat in spoken language."},
                    {"role": "system", "content": f"References:\n{context}\n\n"},
                    {"role": "system", "content": "When asked a question that is not related to the content, you have to answer based on your knowledge or say that \"I don’t have an answer for that yet. Let me connect you with the coach.\""},
                    # {"role": "system", "content": "You don't have to contain provided reference information in your response when user message not related with that like greeting."},
                    {"role": "user", "content": query}]
    # Construct the prompt
    # prompt = (
    #     f"You are a helpful assistant. Use ONLY the following text content to answer the question.\n"
    #     f"Retrieved Context:\n{context}\n\n"
    #     f"Instructions:\n"
    #     f"- Include video links if relevant.\n"
    #     f"- If the information is insufficient, say: "
    #     f"\"I don’t have an answer for that yet. Let me connect you with the coach.\" \n"
    #     f"replay with short and human speaking style answer\n\n"
    #     f"{query}\n\n"
    # )
    # prompt = f"""You are a helpful assistant. Use ONLY the following text content to answer the question.
    #             Context:
    #             {context}
    #             If you can't find special information above contxt, you can say: "I don’t have an answer for that yet. Let me connect you with the coach.\"
    #             If query is normal question and you can answer without special context information, answer base on your knowledge.
    #             If include with video link, answer with video link.

    #             User:{query}
    #             Your:"""
    prompt = f"""You are a helpful assistant.

            reference content:
            {context}
        
            You can refer to the content above to answer users' questions. However, you have to interact with users like a normal person.
            When asked a question that is not related to the content, you have to answer based on your knowledge or say that "I don’t have an answer for that yet. Let me connect you with the coach."
            You don't have to contain above content information in your response when user message not related with that like greeting.

            This is user message: {query}
            what is your response?"""
    return conversation


def chat_with_bot(chat_id, user, question):
    print(user)
    data = {
        "username": user.username,
        "fullname": user.first_name,
        "user_id": user.id,
        "chat_id": chat_id,
        "role": "user",
        "message": question
    }
    response = supabase.table("chat_history").insert(data).execute()

    references = search_top_k(question)

    conversation = build_prompt(question, references)
    
    response = client.chat.completions.create(
        model="gpt-5",
        messages=conversation
    )
    
    result_msg = response.choices[0].message.content

    data = {
        "username": user.username,
        "fullname": user.first_name,
        "user_id": user.id,
        "chat_id": chat_id,
        "role": "bot",
        "message": result_msg
    }
    response = supabase.table("chat_history").insert(data).execute()
    
    return result_msg