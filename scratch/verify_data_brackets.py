import re
import os

js_path = r"c:\COO\開発部門\data.js"

with open(js_path, "r", encoding="utf-8") as f:
    js_content = f.read()

print(f"Checking JS content of size {len(js_content)} characters...")

stack = []
pairs = {
    '}': '{',
    ')': '(',
    ']': '['
}
openers = set(pairs.values())
closers = set(pairs.keys())

in_single_quote = False
in_double_quote = False
in_template = False
in_single_comment = False
in_multi_comment = False
escaped = False

i = 0
n = len(js_content)
errors = []

line = 1
col = 1

while i < n:
    char = js_content[i]
    
    if char == '\n':
        line += 1
        col = 1
    else:
        col += 1

    if escaped:
        escaped = False
        i += 1
        continue

    if in_multi_comment:
        if char == '*' and i + 1 < n and js_content[i+1] == '/':
            in_multi_comment = False
            i += 2
        else:
            i += 1
        continue

    if in_single_comment:
        if char == '\n':
            in_single_comment = False
        i += 1
        continue

    if in_single_quote:
        if char == '\\':
            escaped = True
        elif char == "'":
            in_single_quote = False
        i += 1
        continue

    if in_double_quote:
        if char == '\\':
            escaped = True
        elif char == '"':
            in_double_quote = False
        i += 1
        continue

    if in_template:
        if char == '\\':
            escaped = True
        elif char == '`':
            in_template = False
        i += 1
        continue

    if char == '/' and i + 1 < n and js_content[i+1] == '/':
        in_single_comment = True
        i += 2
        continue
    elif char == '/' and i + 1 < n and js_content[i+1] == '*':
        in_multi_comment = True
        i += 2
        continue
    elif char == "'":
        in_single_quote = True
        i += 1
        continue
    elif char == '"':
        in_double_quote = True
        i += 1
        continue
    elif char == '`':
        in_template = True
        i += 1
        continue

    if char in openers:
        stack.append((char, line, col))
    elif char in closers:
        expected = pairs[char]
        if not stack:
            errors.append(f"Unexpected closing '{char}' at line {line}, col {col}")
        else:
            top, op_line, op_col = stack.pop()
            if top != expected:
                errors.append(f"Mismatched closing '{char}' at line {line}, col {col}. Expected '{top}' from line {op_line}, col {op_col}")

    i += 1

if stack:
    for op, l, c in stack:
        errors.append(f"Unclosed '{op}' from line {l}, col {c}")

if errors:
    print(f"Verification: FAILED! Found {len(errors)} syntax errors:")
    for err in errors[:20]:
        print(" -", err)
else:
    print("Verification: SUCCESS! All brackets, parentheses, and strings matched perfectly outside comments and strings.")
