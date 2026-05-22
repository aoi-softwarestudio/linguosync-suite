from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import whisper
from deep_translator import GoogleTranslator
from pydantic import BaseModel
from typing import List
import os
import tempfile
import math
import json
from gtts import gTTS
from pydub import AudioSegment
import subprocess
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup exports directory
os.makedirs("exports", exist_ok=True)
app.mount("/exports", StaticFiles(directory="exports"), name="exports")

# Real-time Empire Statistics Database
STATS_FILE = "empire_stats.json"

def load_stats():
    if os.path.exists(STATS_FILE):
        try:
            with open(STATS_FILE, "r") as f:
                return json.load(f)
        except:
            pass
    return {
        "studyflow": {"uploads": 0, "flashcards": 0, "exams": 0},
        "novacapital": {"analyses": 0, "mock_trades": 0},
        "linguosync": {"transcriptions": 0, "exports": 0},
        "total_activities": 0
    }

def save_stats(stats):
    try:
        with open(STATS_FILE, "w") as f:
            json.dump(stats, f)
    except:
        pass

class ActivityReport(BaseModel):
    venture: str
    action: str

@app.post("/api/report-activity")
async def report_activity(report: ActivityReport):
    stats = load_stats()
    v = report.venture.lower()
    a = report.action.lower()
    if v in stats and a in stats[v]:
        stats[v][a] += 1
        stats["total_activities"] += 1
        save_stats(stats)
        return {"status": "success", "stats": stats}
    return {"status": "error", "message": "Invalid venture or action"}

@app.get("/api/empire-stats")
async def get_empire_stats():
    stats = load_stats()
    activity_count = stats.get("total_activities", 0)
    base_arr = 82450000
    base_users = 124500
    base_vc_pool = 12000000
    actual_arr = base_arr + (activity_count * 150000)
    actual_users = base_users + activity_count
    efficiency = 98.2 + (math.sin(time.time() / 100) * 0.5)
    
    # Count processed files in exports directory for LinguoSync exports stat
    exports_count = 0
    if os.path.exists("exports"):
        try:
            exports_count = len([f for f in os.listdir("exports") if os.path.isfile(os.path.join("exports", f))])
        except:
            pass
    stats["linguosync"]["exports"] = exports_count
    
    return {
        "stats": stats,
        "metrics": {
            "arr": actual_arr,
            "users": actual_users,
            "efficiency": f"{efficiency:.2f}%",
            "vc_pool": base_vc_pool
        }
    }

import hashlib
import uuid

USERS_FILE = "users.json"

def load_users():
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print("Error loading users:", e)
    return {}

def save_users(users):
    try:
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(users, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print("Error saving users:", e)

def merge_sync_data(server: dict, client: dict) -> dict:
    merged = {}
    
    # 1. Standard keys
    for key in ["studyflow_xp", "studyflow_streak"]:
        s_val = int(server.get(key, 0)) if server.get(key) else 0
        c_val = int(client.get(key, 0)) if client.get(key) else 0
        merged[key] = max(s_val, c_val)
        
    # 2. Daily quests and dates
    s_date = server.get("studyflow_quests_date", "")
    c_date = client.get("studyflow_quests_date", "")
    if c_date > s_date:
        merged["studyflow_quests_date"] = c_date
        merged["studyflow_daily_quests"] = client.get("studyflow_daily_quests", [])
    elif s_date > c_date:
        merged["studyflow_quests_date"] = s_date
        merged["studyflow_daily_quests"] = server.get("studyflow_daily_quests", [])
    else:
        merged["studyflow_quests_date"] = s_date or c_date
        s_quests = server.get("studyflow_daily_quests", []) or []
        c_quests = client.get("studyflow_daily_quests", []) or []
        merged_quests = []
        sq_dict = {q.get("text", ""): q for q in s_quests if q and "text" in q}
        for cq in c_quests:
            if not cq or "text" not in cq: continue
            text = cq.get("text", "")
            if text in sq_dict:
                merged_q = cq.copy()
                merged_q["completed"] = cq.get("completed", False) or sq_dict[text].get("completed", False)
                merged_quests.append(merged_q)
            else:
                merged_quests.append(cq)
        cq_texts = {q.get("text", "") for q in c_quests if q and "text" in q}
        for sq_text, sq in sq_dict.items():
            if sq_text not in cq_texts:
                merged_quests.append(sq)
        merged["studyflow_daily_quests"] = merged_quests

    # 3. Mastered cards
    s_cards = server.get("studyflow_mastered_cards", []) or []
    c_cards = client.get("studyflow_mastered_cards", []) or []
    merged["studyflow_mastered_cards"] = list(set(s_cards + c_cards))
    
    # 4. Unlocked trophies
    s_trophies = server.get("studyflow_unlocked_trophies", []) or []
    c_trophies = client.get("studyflow_unlocked_trophies", []) or []
    merged["studyflow_unlocked_trophies"] = list(set(s_trophies + c_trophies))
    
    # 5. Weaknesses
    s_weak = server.get("studyflow_weaknesses", []) or []
    c_weak = client.get("studyflow_weaknesses", []) or []
    # Support both list of strings (current client storage format) and list of dicts
    weak_set = set()
    for w in s_weak:
        if isinstance(w, str):
            weak_set.add(w)
        elif isinstance(w, dict) and "term" in w:
            weak_set.add(w["term"])
    for w in c_weak:
        if isinstance(w, str):
            weak_set.add(w)
        elif isinstance(w, dict) and "term" in w:
            weak_set.add(w["term"])
    merged["studyflow_weaknesses"] = list(weak_set)
    
    # 6. Projects
    s_projs = server.get("studyflow_projects", []) or []
    c_projs = client.get("studyflow_projects", []) or []
    proj_dict = {}
    for p in s_projs:
        if p and "id" in p:
            proj_dict[p["id"]] = p
    for p in c_projs:
        if p and "id" in p:
            pid = p["id"]
            if pid in proj_dict:
                s_updated = int(proj_dict[pid].get("updated", 0))
                c_updated = int(p.get("updated", 0))
                if c_updated >= s_updated:
                    proj_dict[pid] = p
            else:
                proj_dict[pid] = p
    merged["studyflow_projects"] = list(proj_dict.values())
    
    # 7. Active project ID
    max_c_updated = max([int(p.get("updated", 0)) for p in c_projs if p], default=0)
    max_s_updated = max([int(p.get("updated", 0)) for p in s_projs if p], default=0)
    if max_c_updated >= max_s_updated:
        merged["studyflow_active_project_id"] = client.get("studyflow_active_project_id", "")
    else:
        merged["studyflow_active_project_id"] = server.get("studyflow_active_project_id", "")
        
    return merged

class RegisterRequest(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class SyncRequest(BaseModel):
    token: str
    username: str
    data: dict

class UserDataRequest(BaseModel):
    token: str
    username: str

@app.post("/api/auth/register")
async def auth_register(req: RegisterRequest):
    users = load_users()
    uname = req.username.strip()
    ulower = uname.lower()
    
    if not uname:
        return {"status": "error", "message": "ユーザー名を入力してください。"}
    if len(req.password) < 4:
        return {"status": "error", "message": "パスワードは4文字以上で設定してください。"}
    if ulower in users:
        return {"status": "error", "message": "このユーザー名は既に登録されています。"}
        
    pw_hash = hashlib.sha256(req.password.encode("utf-8")).hexdigest()
    token = uuid.uuid4().hex
    
    users[ulower] = {
        "username": uname,
        "password_hash": pw_hash,
        "token": token,
        "data": {}
    }
    save_users(users)
    return {"status": "success", "token": token, "username": uname}

@app.post("/api/auth/login")
async def auth_login(req: LoginRequest):
    users = load_users()
    uname = req.username.strip()
    ulower = uname.lower()
    
    if ulower not in users:
        return {"status": "error", "message": "ユーザー名またはパスワードが正しくありません。"}
        
    user_record = users[ulower]
    pw_hash = hashlib.sha256(req.password.encode("utf-8")).hexdigest()
    
    if user_record["password_hash"] != pw_hash:
        return {"status": "error", "message": "ユーザー名またはパスワードが正しくありません。"}
        
    token = uuid.uuid4().hex
    user_record["token"] = token
    save_users(users)
    
    return {
        "status": "success", 
        "token": token, 
        "username": user_record["username"],
        "data": user_record.get("data", {})
    }

@app.post("/api/auth/sync")
async def auth_sync(req: SyncRequest):
    users = load_users()
    ulower = req.username.strip().lower()
    
    if ulower not in users or users[ulower].get("token") != req.token:
        return {"status": "error", "message": "セッションの有効期限が切れました。再ログインしてください。"}
        
    user_record = users[ulower]
    server_data = user_record.get("data", {}) or {}
    client_data = req.data
    
    merged_data = merge_sync_data(server_data, client_data)
    
    user_record["data"] = merged_data
    save_users(users)
    
    return {"status": "success", "data": merged_data}

@app.post("/api/auth/user-data")
async def auth_user_data(req: UserDataRequest):
    users = load_users()
    ulower = req.username.strip().lower()
    
    if ulower not in users or users[ulower].get("token") != req.token:
        return {"status": "error", "message": "セッションの有効期限が切れました。"}
        
    user_record = users[ulower]
    return {"status": "success", "username": user_record["username"], "data": user_record.get("data", {})}

class GeminiPayload(BaseModel):
    contents: List[dict]
    model: str = "gemini-3.5-flash"

@app.post("/api/gemini-proxy")
async def gemini_proxy(payload: GeminiPayload):
    import requests
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"error": "GEMINI_API_KEY not configured on server"}
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{payload.model}:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    try:
        res = requests.post(url, headers=headers, json={"contents": payload.contents}, timeout=30)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

import re

DEPARTMENTS = {
    "COO": "../../skills",
    "開発部門": "../skills",
    "マーケティング部門": "../../マーケティング部門/skills",
    "ライティング部門": "../../ライティング部門/skills",
    "リサーチ部門": "../../リサーチ部門/skills",
    "動画作成部門": "../../動画作成部門/skills",
    "秘書": "../../秘書/skills"
}

class SkillInfo(BaseModel):
    department: str
    filename: str
    filepath: str
    title: str
    purpose: str
    checklist: str
    deliverable: str
    raw_content: str

class SaveSkillRequest(BaseModel):
    department: str
    filename: str
    title: str
    purpose: str
    checklist: str
    deliverable: str

@app.get("/api/skills")
async def get_skills():
    import re
    server_dir = os.path.dirname(os.path.abspath(__file__))
    skills_list = []
    
    for dept, rel_path in DEPARTMENTS.items():
        dept_skills_dir = os.path.abspath(os.path.join(server_dir, rel_path))
        if os.path.exists(dept_skills_dir):
            try:
                for file in os.listdir(dept_skills_dir):
                    if file.endswith(".md"):
                        filepath = os.path.join(dept_skills_dir, file)
                        try:
                            with open(filepath, "r", encoding="utf-8") as f:
                                content = f.read()
                            
                            title = ""
                            purpose = ""
                            checklist = ""
                            deliverable = ""
                            
                            for line in content.split("\n"):
                                if line.startswith("# "):
                                    title = line[2:].strip()
                                    break
                            
                            sections = re.split(r'\n## ', content)
                            for sec in sections:
                                sec_lines = sec.split("\n")
                                header = sec_lines[0].strip().lower()
                                body = "\n".join(sec_lines[1:]).strip()
                                
                                if body.endswith("\n---"):
                                    body = body[:-4].strip()
                                elif body.endswith("---"):
                                    body = body[:-3].strip()
                                    
                                if "purpose" in header or "目的" in header:
                                    purpose = body
                                elif "checklist" in header or "チェックリスト" in header:
                                    checklist = body
                                elif "deliverable" in header or "成果物" in header:
                                    deliverable = body
                                    
                            skills_list.append({
                                "department": dept,
                                "filename": file,
                                "filepath": filepath,
                                "title": title or file,
                                "purpose": purpose,
                                "checklist": checklist,
                                "deliverable": deliverable,
                                "raw_content": content
                            })
                        except Exception as file_err:
                            print(f"Error reading skill file {filepath}: {file_err}")
            except Exception as dir_err:
                print(f"Error reading directory {dept_skills_dir}: {dir_err}")
                
    return {"status": "success", "skills": skills_list}

@app.post("/api/skills")
async def save_skill(req: SaveSkillRequest):
    server_dir = os.path.dirname(os.path.abspath(__file__))
    if req.department not in DEPARTMENTS:
        return {"status": "error", "message": "Invalid department"}
        
    dept_skills_dir = os.path.abspath(os.path.join(server_dir, DEPARTMENTS[req.department]))
    os.makedirs(dept_skills_dir, exist_ok=True)
    
    filename = req.filename
    if not filename.endswith(".md"):
        filename += ".md"
        
    filepath = os.path.join(dept_skills_dir, filename)
    
    content = f"""# {req.title}

## Purpose
{req.purpose}

---

## 📋 Execution Checklist
{req.checklist}

---

## 📝 Deliverable Format
{req.deliverable}
"""
    
    try:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        return {"status": "success", "filepath": filepath}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Static files served directly at the root /
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
app.mount("/", StaticFiles(directory=base_dir, html=True), name="static")

# Lazy loading of Whisper model
whisper_model = None

def get_whisper_model():
    global whisper_model
    if whisper_model is None:
        print("Loading Whisper AI model (small) lazily...", flush=True)
        import torch
        device = "cuda" if torch.cuda.is_available() else "cpu"
        whisper_model = whisper.load_model("small", device=device)
        print(f"Whisper model loaded on {device}!", flush=True)
    return whisper_model

def format_time(seconds):
    s = math.floor(seconds)
    hours = s // 3600
    minutes = (s % 3600) // 60
    seconds = s % 60
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}"

def parse_time_to_ms(time_str):
    parts = time_str.split(":")
    h, m, s = int(parts[0]), int(parts[1]), int(parts[2])
    return (h * 3600 + m * 60 + s) * 1000

@app.post("/api/process-video")
async def process_video(file: UploadFile = File(...)):
    print(f"Received file: {file.filename}")
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name
        
        print(f"Transcribing audio with Whisper AI...")
        
        # Helper to generate placeholder
        def get_placeholder():
            topic = "this amazing video"
            fn = file.filename.lower()
            if "ocean" in fn or "sea" in fn: topic = "the beautiful ocean and sea life"
            elif "blaze" in fn or "promo" in fn: topic = "this incredible animation"
            return [
                {"time": "00:00:01", "text": f"Hello everyone. Let's take a look at {topic}."},
                {"time": "00:00:04", "text": "With LinguoSync, you can easily add professional voiceovers."}
            ]

        try:
            result = get_whisper_model().transcribe(tmp_path)
            scripts_original = []
            for segment in result["segments"]:
                start_time = format_time(segment["start"])
                original_text = segment["text"].strip()
                if not original_text: continue
                scripts_original.append({"time": start_time, "text": original_text})
                
            if not scripts_original:
                print("No spoken words detected (empty segments). Returning dynamic placeholder script.")
                scripts_original = get_placeholder()
                
        except Exception as whisper_err:
            if "does not contain any stream" in str(whisper_err) or "Failed to load audio" in str(whisper_err):
                print("No audio track found. Returning dynamic placeholder script.")
                scripts_original = get_placeholder()
            else:
                raise whisper_err
            
        print("Transcription complete.")
        os.remove(tmp_path)
        
        return {
            "status": "success",
            "scripts": {
                "original": scripts_original
            }
        }
    except Exception as e:
        print(f"Error processing video: {e}")
        return {"status": "error", "message": str(e)}

class Segment(BaseModel):
    time: str
    text: str

class TranslateRequest(BaseModel):
    target_lang: str
    segments: List[Segment]
    gemini_key: str = ""

import urllib.request
import urllib.parse

def translate_with_gemini(text, target_lang, api_key):
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={api_key}"
        prompt = (
            f"You are a professional video dubbing translator and localization expert.\n"
            f"Task: Translate the following subtitle segments to the target language '{target_lang}'.\n\n"
            f"Strict Constraints:\n"
            f"1. Tone & Style: Natural, native flow suitable for professional voice-overs.\n"
            f"2. Sentence Length: The translated sentences MUST be concise and match the approximate speech duration "
            f"of the original segments to prevent dubbing delays. Avoid wordy phrasing.\n"
            f"3. Grammatical Consistency: If the target language is Japanese ('ja'), consistently use Polite honorific tone ('です' / 'ます'). "
            f"Do not mix with raw dictionary forms.\n"
            f"4. Structure Preservation: Keep the exact double newlines '\\n\\n' separating the translated segments. "
            f"Do not merge segments or drop any segment. The number of paragraphs in the output must EXACTLY match the input.\n"
            f"5. Metadata Exclusion: Return ONLY the translated segments. Do not include any conversational introductions, "
            f"prefaces, notes, explanations, or 'Here is the translation' text.\n\n"
            f"Text to translate:\n{text}"
        )
        data = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            return res_data['candidates'][0]['content']['parts'][0]['text'].strip()
    except Exception as e:
        print(f"Gemini translation failed: {e}")
        return None

@app.post("/api/translate")
async def translate_scripts(req: TranslateRequest):
    print(f"Translating {len(req.segments)} segments to {req.target_lang}...")
    if not req.segments:
        return {"status": "success", "translated_scripts": []}
        
    try:
        # Join with double newline to preserve paragraph context for MUCH better translation accuracy
        contextual_text = "\n\n".join([seg.text for seg in req.segments])
        
        translated_texts = []
        is_translated = False
        
        # Try Gemini LLM Translation using user's BYOK key or the server's environment master key
        api_key_to_use = req.gemini_key or os.getenv("GEMINI_API_KEY") or ""
        
        if api_key_to_use:
            print("Using Gemini API Translation (BYOK or Server Master)...")
            gemini_translated = translate_with_gemini(contextual_text, req.target_lang, api_key_to_use)
            if gemini_translated:
                translated_texts = [t.strip() for t in gemini_translated.split("\n\n")]
                is_translated = True
                print("Gemini Translation succeeded.")
        
        if not is_translated:
            print("Using free Google Web Translator...")
            # Use source='auto' to support translating from ANY language (e.g. Japanese videos)
            translator = GoogleTranslator(source='auto', target=req.target_lang)
            try:
                translated_combined = translator.translate(contextual_text)
                translated_texts = [t.strip() for t in translated_combined.split("\n\n")]
            except Exception as e:
                print(f"Contextual translation failed: {e}. Falling back to individual loops...")
                translated_texts = []
                for seg in req.segments:
                    try:
                        translated_texts.append(translator.translate(seg.text))
                        time.sleep(0.3)
                    except Exception as ex:
                        print(f"Fallback error: {ex}")
                        translated_texts.append(seg.text)
                    
        translated_segments = []
        for i, seg in enumerate(req.segments):
            # Fallback to original text if translation returns None or empty
            t_text = translated_texts[i] if (i < len(translated_texts) and translated_texts[i]) else seg.text
            translated_segments.append({"time": seg.time, "text": t_text})
            
        print("Translation complete.")
        return {"status": "success", "translated_scripts": translated_segments}
    except Exception as e:
        print(f"Error in translation: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/api/export")
async def export_video(
    file: UploadFile = File(...),
    scripts: str = Form(...),
    target_lang: str = Form(...),
    emotion: str = Form("casual"),
    voice_pitch: str = Form("92"),
    gemini_key: str = Form("")
):
    print(f"Exporting video for {file.filename} in {target_lang} (Emotion: {emotion}, Pitch Slider: {voice_pitch})")
    try:
        segments = json.loads(scripts)
        
        # 1. Save uploaded file
        input_ext = os.path.splitext(file.filename)[1]
        tmp_in = tempfile.NamedTemporaryFile(delete=False, suffix=input_ext)
        contents = await file.read()
        tmp_in.write(contents)
        tmp_in.close()
        input_path = tmp_in.name
            
        # 2. Generate Audio Track
        gtts_lang = target_lang
        if gtts_lang == "zh-CN": gtts_lang = "zh-CN"
        
        # Base silent audio (10 minutes)
        final_audio = AudioSegment.silent(duration=10 * 60 * 1000)
        max_time_ms = 0
        
        # Pitch and speed scaling computation
        pitch_val = int(voice_pitch)
        pitch_factor = 1.0 + (pitch_val - 92) / 200 # range 0.79 to 1.04
        
        speed_factor = 1.0
        if emotion == "excited":
            pitch_factor += 0.15
            speed_factor = 1.15
        elif emotion == "professional":
            pitch_factor -= 0.05
            speed_factor = 0.90
            
        def modify_audio(sound, speed=1.0, pitch=1.0):
            combined = speed * pitch
            if combined != 1.0:
                # Modulate playback speed & pitch using frame_rate overriding
                sound = sound._spawn(sound.raw_data, overrides={
                    "frame_rate": int(sound.frame_rate * combined)
                }).set_frame_rate(sound.frame_rate)
            return sound
            
        for seg in segments:
            t_ms = parse_time_to_ms(seg["time"])
            text = seg["text"].strip()
            if not text: continue
            
            tmp_mp3 = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
            tmp_mp3.close() # Close immediately to release Windows file lock
            
            try:
                tts = gTTS(text=text, lang=gtts_lang)
                tts.save(tmp_mp3.name)
                speech = AudioSegment.from_mp3(tmp_mp3.name)
                
                # Apply parameters
                speech = modify_audio(speech, speed=speed_factor, pitch=pitch_factor)
                
                final_audio = final_audio.overlay(speech, position=t_ms)
                end_time = t_ms + len(speech)
                if end_time > max_time_ms: max_time_ms = end_time
            except Exception as e:
                print(f"Failed to generate TTS for '{text}': {e}")
            finally:
                if os.path.exists(tmp_mp3.name): os.remove(tmp_mp3.name)
                    
        # Trim audio to exact required length (+ 1 second buffer)
        final_audio = final_audio[:max_time_ms + 1000]
        
        tmp_wav = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        tmp_wav.close() # Close immediately to release Windows file lock
        final_audio.export(tmp_wav.name, format="wav")
        audio_path = tmp_wav.name
            
        # 3. Merge with FFmpeg
        output_filename = f"export_{int(time.time())}.mp4"
        output_path = os.path.join("exports", output_filename)
        
        is_video = file.content_type.startswith("video/")
        
        if is_video:
            # -c:v copy to preserve video quality, replace audio map
            cmd = [
                "ffmpeg", "-y", "-i", input_path, "-i", audio_path,
                "-c:v", "copy", "-c:a", "aac",
                "-map", "0:v:0", "-map", "1:a:0",
                "-shortest", output_path
            ]
        else:
            # Image to video
            cmd = [
                "ffmpeg", "-y", "-loop", "1", "-i", input_path, "-i", audio_path,
                "-c:v", "libx264", "-tune", "stillimage", "-c:a", "aac", "-b:a", "192k",
                "-pix_fmt", "yuv420p", "-shortest", output_path
            ]
            
        print("Running FFmpeg:", " ".join(cmd))
        process = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if process.returncode != 0:
            print("FFmpeg Error:", process.stderr.decode("utf-8"))
            raise Exception("FFmpeg failed to merge audio and video.")
            
        # Cleanup temp files
        if os.path.exists(input_path): os.remove(input_path)
        if os.path.exists(audio_path): os.remove(audio_path)
        
        print("Export successful!")
        return {
            "status": "success",
            "download_url": f"http://localhost:8000/exports/{output_filename}"
        }
        
    except Exception as e:
        print(f"Export Error: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
