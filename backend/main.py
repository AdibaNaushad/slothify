from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv

load_dotenv()
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

app = FastAPI(title="Slothify AI Backend")

# Allow React frontend to communicate with the FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextRequest(BaseModel):
    text: str
    action: str

# Define how Gemma should behave for each action
PROMPT_TEMPLATES = {
    "summarize": "Condense the following text into a short, useful summary. Do not add conversational filler:\n\n",
    "keypoints": "Extract the most important key points from this text using bullet points:\n\n",
    "checklist": "Convert the following text into a checklist of actionable tasks. Preserve important dates and requirements:\n\n",
    "simplify": "Explain the following text in very simple, easy-to-understand language:\n\n"
}

@app.post("/api/process-text")
async def process_text(request: TextRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="No text provided")

    system_instruction = PROMPT_TEMPLATES.get(request.action, PROMPT_TEMPLATES["summarize"])
    full_prompt = f"{system_instruction}{request.text}"

    # Payload for the local Ollama API
    payload = {
        "model": "gemma:2b",
        "prompt": full_prompt,
        "stream": False
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            # Route the request to the local Ollama instance
            response = await client.post("http://localhost:11434/api/generate", json=payload)
            response.raise_for_status()
            result = response.json()
            return {"result": result.get("response", "").strip()}
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=500, detail=f"Ollama Error: {e}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")



class AudioRequest(BaseModel):
    text: str

@app.post("/api/text-to-speech")
async def generate_speech(request: AudioRequest):
    if not ELEVENLABS_API_KEY:
        raise HTTPException(status_code=500, detail="ElevenLabs API key is missing.")
    
    # Using 'Rachel' (a default ElevenLabs voice ID)
    voice_id = "21m00Tcm4TlvDq8ikWAM" 
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY
    }
    
    payload = {
        "text": request.text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.5}
    }
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            # Return the raw audio bytes directly to the frontend
            return Response(content=response.content, media_type="audio/mpeg")
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=response.status_code, detail="ElevenLabs API error")
