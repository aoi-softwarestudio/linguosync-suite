import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Strip strings
content_clean = re.sub(r'"([^"\\]|\\.)*"', '""', content)
content_clean = re.sub(r"'([^'\\]|\\.)*'", "''", content_clean)
content_clean = re.sub(r"`([^`\\]|\\.)*`", "``", content_clean)
content_clean = re.sub(r'//.*', '', content_clean)
content_clean = re.sub(r'/\*.*?\*/', '', content_clean, flags=re.DOTALL)

lines = content_clean.split('\n')
for idx, line in enumerate(lines[2290:2320], start=2291):
    print(f"{idx}: {repr(line)}")
