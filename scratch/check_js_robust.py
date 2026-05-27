import re
import sys

js_path = r"c:\COO\開発部門\StudyFlow\app.js"

with open(js_path, "r", encoding="utf-8") as f:
    code = f.read()

# Let's parse the javascript character by character
stack = []
pairs = { '}': '{', ')': '(', ']': '[' }
openers = set(pairs.values())
closers = set(pairs.keys())

i = 0
n = len(code)
errors = []

line = 1
col = 1

while i < n:
    char = code[i]
    
    # Track line and col
    if char == '\n':
        line += 1
        col = 1
        i += 1
        continue
    else:
        col += 1

    # Skip comments
    if char == '/' and i + 1 < n and code[i+1] == '/':
        # Line comment
        i += 2
        col += 2
        while i < n and code[i] != '\n':
            i += 1
            col += 1
        continue
    elif char == '/' and i + 1 < n and code[i+1] == '*':
        # Block comment
        i += 2
        col += 2
        while i < n:
            if code[i] == '*' and i + 1 < n and code[i+1] == '/':
                i += 2
                col += 2
                break
            if code[i] == '\n':
                line += 1
                col = 1
            else:
                col += 1
            i += 1
        continue

    # Skip string literals
    if char in ("'", '"', '`'):
        quote = char
        i += 1
        col += 1
        while i < n:
            if code[i] == '\\':
                # Skip escaped character
                if code[i+1] == '\n':
                    line += 1
                    col = 1
                else:
                    col += 1
                i += 2
                col += 1
                continue
            if code[i] == quote:
                i += 1
                col += 1
                break
            if code[i] == '\n':
                line += 1
                col = 1
            else:
                col += 1
            i += 1
        continue

    # Skip Regex literal
    # A slash starts a regex literal if it is preceded by an operator, keyword, punctuation, or start of file
    # We can detect this heuristically: look backward at the last non-whitespace character
    if char == '/':
        # Let's find last non-whitespace character
        prev_idx = i - 1
        while prev_idx >= 0 and code[prev_idx].isspace():
            prev_idx -= 1
        
        is_regex = False
        if prev_idx < 0:
            is_regex = True
        else:
            prev_char = code[prev_idx]
            # If prev char is an operator or punctuation, it's a regex
            # e.g., '=', '(', ',', ':', '[', '{', '!', '&', '|', '?', ';', '\n', etc.
            if prev_char in "=,:[{!&|?;()/*-+^%":
                is_regex = True
            # Also check if it's a keyword like return, case, throw, void, yield
            # we can look at the word before
            word_match = re.search(r'\b(return|case|throw|void|yield|typeof|delete|in|instanceof|new)\s*$', code[:i])
            if word_match:
                is_regex = True
                
        if is_regex:
            # Skip regex literal
            i += 1
            col += 1
            in_char_class = False
            while i < n:
                if code[i] == '\\':
                    # skip escaped char in regex
                    i += 2
                    col += 2
                    continue
                if code[i] == '[':
                    in_char_class = True
                elif code[i] == ']':
                    in_char_class = False
                elif code[i] == '/' and not in_char_class:
                    # End of regex literal
                    i += 1
                    col += 1
                    # Skip flags
                    while i < n and code[i] in 'gimsuy':
                        i += 1
                        col += 1
                    break
                
                if code[i] == '\n':
                    line += 1
                    col = 1
                else:
                    col += 1
                i += 1
            continue

    # Track brackets
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
    print(f"FAILED! Found {len(errors)} syntax errors:")
    for err in errors:
        print(" -", err)
else:
    print("SUCCESS! No bracket mismatches found.")
