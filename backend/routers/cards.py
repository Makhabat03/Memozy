import json
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from utils.groq_client import get_groq
from utils.supabase import get_supabase
from utils.pdf_parser import extract_text_from_pdf
from utils.image_parser import extract_text_from_image

router = APIRouter(prefix="/cards", tags=["cards"])


class TextGenerateRequest(BaseModel):
    text: str
    deck_id: str
    num_cards: int = 10


def _generate_cards_from_text(text: str, num_cards: int) -> list[dict]:
    groq = get_groq()
    response = groq.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": (
                    f"Create {num_cards} flashcards from the text below.\n\n"
                    "For EACH card include these 4 fields:\n"
                    "- front: a clear question or vocabulary term\n"
                    "- back: concise answer (1-3 sentences)\n"
                    "Return ONLY a valid JSON array, no other text:\n"
                    '[{"front":"...","back":"..."}, ...]\n\n'
                    f"TEXT:\n{text[:8000]}"
                ),
            }
        ],
        max_tokens=4096,
        temperature=0.6,
    )
    content = response.choices[0].message.content or "[]"
    start = content.find("[")
    end = content.rfind("]") + 1
    if start == -1 or end == 0:
        raise ValueError("No JSON array found in Groq response")
    return json.loads(content[start:end])


def _save_cards(deck_id: str, cards: list[dict]) -> list[dict]:
    sb = get_supabase()
    rows = [
        {
            "deck_id": deck_id,
            "front": c.get("front", ""),
            "back": c.get("back", ""),
        }
        for c in cards
    ]
    result = sb.table("cards").insert(rows).execute()
    sb.table("decks").update({"card_count": len(rows)}).eq("id", deck_id).execute()
    return result.data


@router.post("/generate/text")
async def generate_from_text(body: TextGenerateRequest):
    try:
        cards = _generate_cards_from_text(body.text, body.num_cards)
        saved = _save_cards(body.deck_id, cards)
        return {"cards": saved, "count": len(saved)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/pdf")
async def generate_from_pdf(
    file: UploadFile = File(...),
    deck_id: str = Form(...),
    num_cards: int = Form(10),
):
    try:
        file_bytes = await file.read()
        text = extract_text_from_pdf(file_bytes)
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")
        cards = _generate_cards_from_text(text, num_cards)
        saved = _save_cards(deck_id, cards)
        return {"cards": saved, "count": len(saved)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/image")
async def generate_from_image(
    file: UploadFile = File(...),
    deck_id: str = Form(...),
    num_cards: int = Form(10),
):
    try:
        file_bytes = await file.read()
        mime = file.content_type or "image/jpeg"
        text = extract_text_from_image(file_bytes, mime)
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from image")
        cards = _generate_cards_from_text(text, num_cards)
        saved = _save_cards(deck_id, cards)
        return {"cards": saved, "count": len(saved)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{deck_id}")
async def get_cards(deck_id: str):
    try:
        sb = get_supabase()
        result = sb.table("cards").select("*").eq("deck_id", deck_id).execute()
        return {"cards": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{card_id}")
async def update_card(card_id: str, body: dict):
    try:
        sb = get_supabase()
        result = sb.table("cards").update(body).eq("id", card_id).execute()
        return {"card": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
