#!/usr/bin/env python3
"""
Generate TTS narration audio for demo video using edge-tts.
Uses a clear woman voice (en-US-JennyNeural).
Outputs individual scene audio files and a merged timeline.
"""

import asyncio
import json
import os
import subprocess
import sys

NARRATION_FILE = os.path.join(os.path.dirname(__file__), "narration.json")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
VOICE = "en-US-JennyNeural"
RATE = "-5%"
PITCH = "+0Hz"

async def generate_scene_audio(scene_id: str, text: str, output_path: str):
    """Generate audio for a single scene using edge-tts."""
    import edge_tts
    
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
    await communicate.save(output_path)
    
    # Get audio duration using ffprobe
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
         "-of", "csv=p=0", output_path],
        capture_output=True, text=True
    )
    duration = float(result.stdout.strip()) if result.stdout.strip() else 0
    return duration

async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    audio_dir = os.path.join(OUTPUT_DIR, "audio")
    os.makedirs(audio_dir, exist_ok=True)
    
    # Load narration
    with open(NARRATION_FILE, "r") as f:
        narration = json.load(f)
    
    print(f"🎙️  Generating TTS narration with voice: {VOICE}")
    print(f"   Output: {audio_dir}")
    
    timeline = []
    
    for scene in narration["scenes"]:
        scene_id = scene["id"]
        text = scene["narration"]
        output_path = os.path.join(audio_dir, f"{scene_id}.mp3")
        
        print(f"\n   📢 Scene: {scene_id}")
        print(f"      Text: {text[:60]}...")
        
        duration = await generate_scene_audio(scene_id, text, output_path)
        
        timeline.append({
            "id": scene_id,
            "audio_file": output_path,
            "audio_duration": duration,
            "scene_duration": scene["duration"],
            "narration": text,
            "caption": scene["caption"],
        })
        
        print(f"      ✅ Audio: {duration:.1f}s (scene: {scene['duration']}s)")
    
    # Save timeline
    timeline_path = os.path.join(OUTPUT_DIR, "timeline.json")
    with open(timeline_path, "w") as f:
        json.dump(timeline, f, indent=2)
    
    print(f"\n🎵 Timeline saved to: {timeline_path}")
    
    # Generate SRT captions
    generate_srt_captions(timeline)
    
    print(f"\n✅ TTS generation complete!")

def generate_srt_captions(timeline):
    """Generate SRT subtitle file from timeline."""
    srt_path = os.path.join(OUTPUT_DIR, "captions.srt")
    srt_lines = []
    counter = 1
    current_time = 0.0
    
    for entry in timeline:
        duration = entry["scene_duration"]
        caption = entry["caption"]
        
        start = format_srt_time(current_time)
        end = format_srt_time(current_time + duration)
        
        srt_lines.append(f"{counter}")
        srt_lines.append(f"{start} --> {end}")
        srt_lines.append(caption)
        srt_lines.append("")
        
        counter += 1
        current_time += duration
    
    with open(srt_path, "w") as f:
        f.write("\n".join(srt_lines))
    
    print(f"📝 Captions saved to: {srt_path}")

def format_srt_time(seconds: float) -> str:
    """Format seconds to SRT timestamp (HH:MM:SS,mmm)."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

if __name__ == "__main__":
    asyncio.run(main())
