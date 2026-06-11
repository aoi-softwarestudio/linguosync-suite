import re
import sys

def verify_js(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We will build a mask of the same size as content.
    # mask[i] = True if content[i] should be ignored (inside string, comment, regex literal)
    mask = [False] * len(content)
    
    in_squote = False
    in_dquote = False
    in_backtick = False
    in_line_comment = False
    in_block_comment = False
    in_regex = False
    
    escaped = False
    idx = 0
    n = len(content)
    
    while idx < n:
        char = content[idx]
        
        if escaped:
            mask[idx] = True
            escaped = False
            idx += 1
            continue
            
        if in_line_comment:
            mask[idx] = True
            if char == '\n':
                in_line_comment = False
            idx += 1
            continue
            
        if in_block_comment:
            mask[idx] = True
            if char == '/' and idx > 0 and content[idx-1] == '*':
                in_block_comment = False
            idx += 1
            continue
            
        if in_squote:
            mask[idx] = True
            if char == '\\':
                escaped = True
            elif char == "'":
                in_squote = False
            idx += 1
            continue
            
        if in_dquote:
            mask[idx] = True
            if char == '\\':
                escaped = True
            elif char == '"':
                in_dquote = False
            idx += 1
            continue
            
        if in_backtick:
            mask[idx] = True
            if char == '\\':
                escaped = True
            elif char == '`':
                in_backtick = False
            idx += 1
            continue
            
        if in_regex:
            mask[idx] = True
            if char == '\\':
                escaped = True
            elif char == '/':
                in_regex = False
                # also skip flags if any
                while idx + 1 < n and content[idx+1] in 'gimy':
                    idx += 1
                    mask[idx] = True
            idx += 1
            continue
            
        # Check comment start
        if char == '/' and idx + 1 < n:
            next_char = content[idx+1]
            if next_char == '/':
                in_line_comment = True
                mask[idx] = True
                idx += 1
                mask[idx] = True
                idx += 1
                continue
            elif next_char == '*':
                in_block_comment = True
                mask[idx] = True
                idx += 1
                mask[idx] = True
                idx += 1
                continue
            # Regex literal check: in JS, regexes can start after ( = , : ? & | ! [ { ; or at start of statement.
            # For simplicity, if we see '/' not followed by '*' or '/' and not preceded by letters/numbers/closing braces:
            prev_idx = idx - 1
            while prev_idx >= 0 and content[prev_idx].isspace():
                prev_idx -= 1
            
            is_regex_start = True
            if prev_idx >= 0:
                prev_char = content[prev_idx]
                # If preceded by alphanumeric, closing braces, etc., it is division, not regex start.
                if prev_char.isalnum() or prev_char in ')]}':
                    is_regex_start = False
            
            if is_regex_start:
                in_regex = True
                mask[idx] = True
                idx += 1
                continue
                
        if char == "'":
            in_squote = True
            mask[idx] = True
        elif char == '"':
            in_dquote = True
            mask[idx] = True
        elif char == '`':
            in_backtick = True
            mask[idx] = True
            
        idx += 1
        
    # Now check balance
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    line = 1
    col = 1
    
    for idx, char in enumerate(content):
        if char == '\n':
            line += 1
            col = 1
        else:
            col += 1
            
        if mask[idx]:
            continue
            
        if char in '({[':
            stack.append((char, line, col))
        elif char in ')}]':
            if not stack:
                print(f"Unmatched closing character '{char}' at line {line}, col {col}")
                # Print context
                lines = content.split('\n')
                print("Line:", lines[line-1])
                return False
            top, l, c = stack.pop()
            if pairs[char] != top:
                print(f"Mismatched closing character '{char}' at line {line}, col {col} (expected match for '{top}' from line {l}, col {c})")
                lines = content.split('\n')
                print(f"Opening line {l}: {lines[l-1]}")
                print(f"Closing line {line}: {lines[line-1]}")
                return False
                
    if stack:
        print(f"Unmatched opening characters at end of file:")
        lines = content.split('\n')
        for char, l, c in stack[-5:]:
            print(f"  '{char}' at line {l}, col {c}")
            print(f"  Line: {lines[l-1]}")
        return False
        
    print("Brace/bracket/parenthesis syntax matches successfully!")
    return True

if __name__ == '__main__':
    if len(sys.argv) > 1:
        path = sys.argv[1]
    else:
        path = 'app.js'
    sys.exit(0 if verify_js(path) else 1)
