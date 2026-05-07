from datetime import date, datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils.supabase import get_supabase

router = APIRouter(prefix="/gamify", tags=["gamify"])

BADGES = {
    "first_deck": lambda p, _: p.get("deck_count", 0) >= 1,
    "streak_7": lambda p, _: p.get("streak_count", 0) >= 7,
    "streak_30": lambda p, _: p.get("streak_count", 0) >= 30,
    "level_5": lambda p, _: p.get("level", 1) >= 5,
    "cards_100": lambda p, stats: stats.get("total_cards_studied", 0) >= 100,
    "cards_500": lambda p, stats: stats.get("total_cards_studied", 0) >= 500,
}


class StudyCompleteRequest(BaseModel):
    user_id: str
    deck_id: str
    cards_reviewed: int
    correct_count: int


@router.post("/study-complete")
async def study_complete(body: StudyCompleteRequest):
    try:
        sb = get_supabase()
        profile_result = sb.table("profiles").select("*").eq("id", body.user_id).single().execute()
        profile = profile_result.data

        today = date.today()
        last_date = profile.get("streak_last_date")
        streak = profile.get("streak_count", 0)

        if last_date:
            last = date.fromisoformat(str(last_date))
            delta = (today - last).days
            if delta == 1:
                streak += 1
            elif delta > 1:
                streak = 1
        else:
            streak = 1

        streak_bonus = min(streak * 5, 50)
        xp_earned = body.correct_count * 10 + streak_bonus

        current_xp = profile.get("xp", 0) + xp_earned
        current_level = profile.get("level", 1)
        new_level = current_xp // 500 + 1
        leveled_up = new_level > current_level

        new_max_streak = max(profile.get("max_streak", 0), streak)
        sb.table("profiles").update({
            "xp": current_xp,
            "level": new_level,
            "streak_count": streak,
            "streak_last_date": today.isoformat(),
            "max_streak": new_max_streak,
        }).eq("id", body.user_id).execute()

        sb.table("study_sessions").insert({
            "user_id": body.user_id,
            "deck_id": body.deck_id,
            "cards_studied": body.cards_reviewed,
            "xp_earned": xp_earned,
        }).execute()

        sessions_result = sb.table("study_sessions").select("cards_studied").eq("user_id", body.user_id).execute()
        total_cards = sum(s["cards_studied"] for s in sessions_result.data)

        existing_badges = sb.table("badges").select("badge_type").eq("user_id", body.user_id).execute()
        earned_types = {b["badge_type"] for b in existing_badges.data}

        decks_count = sb.table("decks").select("id", count="exact").eq("user_id", body.user_id).execute().count or 0

        updated_profile = {**profile, "level": new_level, "streak_count": streak, "deck_count": decks_count}
        stats = {"total_cards_studied": total_cards}

        badges_earned = []
        for badge_type, check_fn in BADGES.items():
            if badge_type not in earned_types and check_fn(updated_profile, stats):
                sb.table("badges").insert({"user_id": body.user_id, "badge_type": badge_type}).execute()
                badges_earned.append(badge_type)

        return {
            "xp_earned": xp_earned,
            "new_total_xp": current_xp,
            "leveled_up": leveled_up,
            "new_level": new_level,
            "streak": streak,
            "badges_earned": badges_earned,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/profile/{user_id}")
async def get_profile(user_id: str):
    try:
        sb = get_supabase()
        profile = sb.table("profiles").select("*").eq("id", user_id).single().execute()
        badges = sb.table("badges").select("*").eq("user_id", user_id).execute()
        sessions = sb.table("study_sessions").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(90).execute()
        return {"profile": profile.data, "badges": badges.data, "recent_sessions": sessions.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
