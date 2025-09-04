from utils import embed_text, supabase, client, proxy_url, OPENAI_API_KEY
from openai import OpenAI

def search_top_k(query: str, k: int = 5):
    query_embedding = embed_text([query])
    res = supabase.rpc("match_documents", {"query": query_embedding[0], "top_k": k}).execute()
    return res.data

def build_rag_prompt(query, retrieved_docs, coach_name="Coach"):
    """
    Build a dynamic prompt for GPT layer in a RAG pipeline.
    
    Parameters:
        query (str): User's question or message.
        retrieved_docs (list of dict): Each dict contains:
            {
                "content": str,       # Retrieved text
                "link": str,          # Reference link
                "type": str           # e.g., "article", "video"
            }
        coach_name (str): Name or persona of the coach.
    
    Returns:
        str: A formatted prompt for GPT.
    """

    # Filter relevant matches
    if not retrieved_docs:
        # Fallback when no relevant information found
        return (
            f"The user asked: \"{query}\".\n"
            f"No relevant information was found in the database.\n"
            f"Respond politely in {coach_name}'s tone: "
            f"\"I don’t have an answer for that yet. Let me connect you with the coach.\""
        )

    # Build content summary
    content_blocks = []
    for i, doc in enumerate(retrieved_docs, start=1):
        block = f"{doc['content']}"
        if doc.get("file_type") == "link" and doc.get("link"):
            block += f"\n   Watch here: {doc['link']}"
        content_blocks.append(block)

    context = "\n\n".join(content_blocks)

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
    prompt = f"""You are a helpful assistant. Use ONLY the following text content to answer the question.
                Context:
                {context}
                If you can't find special information above contxt, you can say: "I don’t have an answer for that yet. Let me connect you with the coach.\"
                If query is normal question and you can answer without special context information, answer base on your knowledge.
                If include with video link, answer with video link.

                User:{query}
                Your:"""
    return prompt


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
    
    ref_text = ""
    for reference in references:
        ref_text += reference["content"]

    prompt = f"""You are a helpful assistant.
    
                reference content:
                {ref_text}
            
                You can refer to the content above to answer users' questions. However, you have to interact with users like a normal person.
                When asked a question that is not related to the content, you have to answer based on your knowledge or say that "I don’t have an answer for that yet. Let me connect you with the coach."
                You don't have to contain above content information in your response when user message not related with that like greeting.

                This is user message: {question}
                what is your response?"""
    # prompt = build_rag_prompt(question, references)
    import os
    os.environ["HTTP_PROXY"] = proxy_url
    os.environ["HTTPS_PROXY"] = proxy_url
    client = OpenAI(api_key=OPENAI_API_KEY)
    response = client.chat.completions.create(
        model="gpt-5",
        messages=[{"role": "user", "content": prompt}]
    )
    
    os.environ["HTTP_PROXY"] = ""
    os.environ["HTTPS_PROXY"] = ""

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