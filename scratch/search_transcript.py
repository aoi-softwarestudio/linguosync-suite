import os
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

path = r"C:\Users\小島蒼大\.gemini\antigravity\brain\f575ad2f-300b-438b-b406-9b336a8f84ab\.system_generated\logs\transcript.jsonl"
if not os.path.exists(path):
    print("Log path does not exist:", path)
    sys.exit(0)

print("Searching transcript.jsonl for '統合':")
with open(path, 'r', encoding='utf-8') as f:
    for line_idx, line in enumerate(f, start=1):
        try:
            data = json.loads(line)
            content = data.get('content', '')
            if '統合' in content:
                print(f"Line {line_idx} ({data.get('type')}, {data.get('source')}):")
                print(content[:500] + "..." if len(content) > 500 else content)
                print("-" * 40)
        except Exception as e:
            pass
