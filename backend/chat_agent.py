from utils import embed_text, supabase, client


def search_top_k(query: str, k: int = 5):
    query_embedding = embed_text([query])
    res = supabase.rpc("match_documents", {"query": query_embedding[0], "top_k": k}).execute()
    return res.data

def build_prompt(query, retrieved_docs, histories):
    # Build content summary
    content_blocks = []
    for i, doc in enumerate(retrieved_docs, start=1):
        block = f"{doc['content']}"
        if doc.get("file_type") == "link" and doc.get("link"):
            block += f"\n   Watch here: {doc['link']}"
        content_blocks.append(block)

    context = "\n\n".join(content_blocks)
    history = [
        {
            "role": "assistant" if m["role"] == "bot" else "user",
            "content": m["message"]
        }
        for m in histories
    ]
    conversation = [{"role": "system", "content": "You are a helpful assistant. You have to chat in spoken language. Please answer concisely."},
                    {"role": "system", "content": f"References1:\n{context}\n\n"},
                    {"role": "system", "content": "When asked a question that is not related to the content, you have to answer based on your knowledge or say that \"I don’t have an answer for that yet. Let me connect you with the coach.\""}] + history + [{"role": "user", "content": query}]
    return conversation


def chat_with_bot(chat_id, user, question):
    

    references = search_top_k(question)

    histories = supabase.table("chat_history")\
                .select("id, chat_id, role, message")\
                .eq("chat_id", chat_id)\
                .order("created_at")\
                .limit(20)\
                .execute()
    
    conversation = build_prompt(question, references, histories.data)
    response = client.chat.completions.create(
        model="gpt-5",
        messages=conversation
    )
    
    result_msg = response.choices[0].message.content

    document_ids = [doc['id'] for doc in references]

    data = [{
                "username": user.username,
                "fullname": user.first_name,
                "user_id": user.id,
                "chat_id": chat_id,
                "role": "user",
                "message": question,
                "document_ids":[]
            },
            {
                "username": user.username,
                "fullname": user.first_name,
                "user_id": user.id,
                "chat_id": chat_id,
                "role": "bot",
                "message": result_msg,
                "document_ids":document_ids
            }]
    
    response = supabase.table("chat_history").insert(data).execute()

    return result_msg