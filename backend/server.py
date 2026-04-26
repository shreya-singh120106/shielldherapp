from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
import logging
import uuid
import re
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", os.environ.get("EMERGENT_LLM_KEY", ""))

app = FastAPI(title="ShieldHer API")
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class ToxicCheckIn(BaseModel):
    message: str
    sender: Optional[str] = "Unknown"


class ToxicCheckOut(BaseModel):
    id: str
    is_toxic: bool
    confidence: float
    category: str
    reason: str
    sender: str
    message_preview: str


class WellnessIn(BaseModel):
    score: int = Field(..., ge=0, le=100)
    phase: str = "Luteal"
    mood: Optional[str] = "balanced"


class WellnessInsight(BaseModel):
    title: str
    body: str
    action: str
    accent: str  # travel | cyber | wellness


class WellnessOut(BaseModel):
    id: str
    score: int
    phase: str
    insights: List[WellnessInsight]


# ---------- Helpers ----------
def _extract_json(text: str) -> dict:
    """Robustly pull the first JSON object out of an LLM response."""
    if not text:
        raise ValueError("empty response")
    # strip markdown fences
    cleaned = re.sub(r"```(?:json)?", "", text).replace("```", "").strip()
    # try direct parse
    try:
        return json.loads(cleaned)
    except Exception:
        pass
    # fallback: greedy match for first {...}
    match = re.search(r"\{[\s\S]*\}", cleaned)
    if match:
        return json.loads(match.group(0))
    raise ValueError(f"could not parse JSON from: {text[:200]}")


async def _llm_chat(system_message: str, user_text: str, session_id: str) -> str:
    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured")
    chat = LlmChat(
        api_key=ANTHROPIC_API_KEY,
        session_id=session_id,
        system_message=system_message,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")
    response = await chat.send_message(UserMessage(text=user_text))
    return response


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "ShieldHer API online", "version": "1.0"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.dict())
    await db.status_checks.insert_one(status_obj.dict())
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    docs = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    return [StatusCheck(**d) for d in docs]


@api_router.post("/ai/toxic-check", response_model=ToxicCheckOut)
async def toxic_check(payload: ToxicCheckIn):
    system = (
        "You are ShieldHer Cyber Shield — an expert content safety classifier. "
        "Classify the user-supplied message for harmful intent (harassment, threats, "
        "sexual coercion, stalking, scams, phishing, hate speech). "
        "Respond ONLY with strict JSON matching this schema: "
        '{"is_toxic": boolean, "confidence": number (0-1), '
        '"category": "safe"|"harassment"|"threat"|"scam"|"sexual"|"hate"|"phishing"|"stalking", '
        '"reason": "one short sentence (<=18 words) explaining why"}'
        " No commentary, no markdown, no trailing text."
    )
    try:
        raw = await _llm_chat(system, payload.message, f"toxic-{uuid.uuid4()}")
        data = _extract_json(raw)
    except Exception as e:
        logger.error(f"toxic-check LLM error: {e}")
        raise HTTPException(status_code=502, detail=f"AI classification failed: {e}")

    preview = payload.message if len(payload.message) <= 80 else payload.message[:77] + "..."
    result = ToxicCheckOut(
        id=str(uuid.uuid4()),
        is_toxic=bool(data.get("is_toxic", False)),
        confidence=float(data.get("confidence", 0.0)),
        category=str(data.get("category", "safe")),
        reason=str(data.get("reason", ""))[:200],
        sender=payload.sender or "Unknown",
        message_preview=preview,
    )
    await db.toxic_checks.insert_one(result.dict())
    return result


@api_router.post("/ai/wellness-insights", response_model=WellnessOut)
async def wellness_insights(payload: WellnessIn):
    system = (
        "You are ShieldHer Wellness Intelligence — a warm, concise coach that links cycle "
        "phase and wellness score to daily behavior suggestions across Safety, Cyber, and "
        "Career growth. Output strict JSON only, no markdown. Schema: "
        '{"insights": [{"title": "4-7 words", "body": "1-2 sentences, actionable, empathetic", '
        '"action": "verb-led CTA, max 4 words", "accent": "wellness"|"travel"|"cyber"}]}. '
        "Return exactly 2 insights. Avoid medical advice; keep tone empowering."
    )
    user_text = (
        f"Wellness score: {payload.score}/100. Cycle phase: {payload.phase}. "
        f"Self-reported mood: {payload.mood}. Produce 2 behavior insights for today."
    )
    try:
        raw = await _llm_chat(system, user_text, f"wellness-{uuid.uuid4()}")
        data = _extract_json(raw)
        items = data.get("insights", [])[:2]
        insights = [
            WellnessInsight(
                title=str(i.get("title", "Today's focus")),
                body=str(i.get("body", "")),
                action=str(i.get("action", "Try it")),
                accent=str(i.get("accent", "wellness")),
            )
            for i in items
        ]
        if len(insights) < 2:
            raise ValueError("fewer than 2 insights returned")
    except Exception as e:
        logger.error(f"wellness-insights LLM error: {e}")
        raise HTTPException(status_code=502, detail=f"AI insights failed: {e}")

    result = WellnessOut(
        id=str(uuid.uuid4()),
        score=payload.score,
        phase=payload.phase,
        insights=insights,
    )
    await db.wellness_insights.insert_one(result.dict())
    return result


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
