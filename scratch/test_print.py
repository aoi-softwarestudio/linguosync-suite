import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

content_clean = re.sub(r'//.*', '', content)
content_clean = re.sub(r'/\*.*?\*/', '', content_clean, flags=re.DOTALL)
content_clean = re.sub(r'"([^"\\]|\\.)*"', '""', content_clean)
content_clean = re.sub(r"'([^'\\]|\\.)*'", "''", content_clean)
content_clean = re.sub(r"`([^`\\]|\\.)*`", "``", content_clean)

lines = content_clean.split('\n')
for idx, line in enumerate(lines[:15], start=1):
    print(f"{idx}: {repr(line)}")
