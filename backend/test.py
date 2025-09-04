import nltk
import tiktoken
from typing import List, Dict

# Download sentence tokenizer (only first time)
nltk.download('punkt')
nltk.download('punkt_tab')

def count_tokens(text: str, model_name: str = "gpt-3.5-turbo") -> int:
    """Count tokens using OpenAI's tokenizer."""
    encoding = tiktoken.encoding_for_model(model_name)
    return len(encoding.encode(text))

def semantic_chunk_text(
    text: str,
    max_tokens: int = 400,
    overlap_tokens: int = 80,
    model_name: str = "gpt-3.5-turbo",
    metadata: Dict = None
) -> List[Dict]:
    """
    Split text into semantic chunks based on sentence boundaries.
    
    Args:
        text: Input text.
        max_tokens: Target maximum tokens per chunk.
        overlap_tokens: Overlap size between chunks in tokens.
        model_name: Model tokenizer to use.
        metadata: Optional dictionary to attach to each chunk.

    Returns:
        List of dicts with 'content' and 'metadata'.
    """
    sentences = nltk.sent_tokenize(text)
    encoding = tiktoken.encoding_for_model(model_name)

    chunks = []
    current_chunk = []
    current_tokens = 0

    for sentence in sentences:
        sentence_tokens = len(encoding.encode(sentence))

        # If adding this sentence exceeds the max chunk size → finalize the chunk
        if current_tokens + sentence_tokens > max_tokens:
            chunk_text = " ".join(current_chunk)
            chunks.append({
                "content": chunk_text,
                "metadata": metadata or {}
            })
            # Start new chunk with overlap (reuse last sentence if needed)
            overlap_sentences = []
            overlap_count = 0
            for sent in reversed(current_chunk):
                sent_tokens = len(encoding.encode(sent))
                if overlap_count + sent_tokens <= overlap_tokens:
                    overlap_sentences.insert(0, sent)
                    overlap_count += sent_tokens
                else:
                    break

            current_chunk = overlap_sentences + [sentence]
            current_tokens = sum(len(encoding.encode(s)) for s in current_chunk)
        else:
            current_chunk.append(sentence)
            current_tokens += sentence_tokens

    # Add the final chunk
    if current_chunk:
        chunks.append({
            "content": " ".join(current_chunk),
            "metadata": metadata or {}
        })

    return chunks


# Example usage
if __name__ == "__main__":
    sample_text = """
    Retrieval-Augmented Generation (RAG) is a powerful technique that combines
    document retrieval with language generation. Instead of relying solely on
    the model's internal knowledge, RAG retrieves relevant documents from an
    external database or vector store. This improves accuracy and grounding.
    Chunking strategies are crucial for effective retrieval. Poor chunking can
    lead to missing context or retrieving irrelevant sections.
    """

    chunks = semantic_chunk_text(
        sample_text,
        max_tokens=400,
        overlap_tokens=80,
        metadata={"source": "whitepaper.pdf", "page": 2}
    )

    for idx, c in enumerate(chunks):
        print(f"--- Chunk {idx+1} ---")
        print(c["content"])
        print("Metadata:", c["metadata"])
        print()
