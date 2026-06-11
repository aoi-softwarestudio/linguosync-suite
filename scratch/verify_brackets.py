def check_brackets(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        code = f.read()

    # Track brackets: {}, (), []
    stack = []
    lines = code.split('\n')
    
    # Simple scanner that ignores comments and string literals
    in_string = False
    string_char = None
    in_comment = False  # /* ... */
    in_line_comment = False  # // ...
    
    for line_num, line in enumerate(lines, 1):
        i = 0
        n = len(line)
        in_line_comment = False
        while i < n:
            char = line[i]
            
            # Handle comments
            if not in_string:
                if not in_comment and i + 1 < n and line[i:i+2] == '//':
                    in_line_comment = True
                    break
                if not in_comment and i + 1 < n and line[i:i+2] == '/*':
                    in_comment = True
                    i += 2
                    continue
                if in_comment and i + 1 < n and line[i:i+2] == '*/':
                    in_comment = False
                    i += 2
                    continue
            
            if in_comment:
                i += 1
                continue
                
            # Handle string literals
            if char in ['"', "'", '`']:
                # Check for escaped characters
                is_escaped = False
                backslashes = 0
                k = i - 1
                while k >= 0 and line[k] == '\\':
                    backslashes += 1
                    k -= 1
                if backslashes % 2 == 1:
                    is_escaped = True
                    
                if not in_string:
                    in_string = True
                    string_char = char
                elif in_string and char == string_char and not is_escaped:
                    in_string = False
                    string_char = None
                    
            if in_string:
                i += 1
                continue
                
            # Track brackets outside comments and strings
            if char in ['{', '(', '[']:
                stack.append((char, line_num, i + 1))
            elif char in ['}', ')', ']']:
                if not stack:
                    print(f"ERROR: Extra closing bracket '{char}' at line {line_num}, col {i+1}")
                    return False
                top, l, col = stack.pop()
                expected = {'}': '{', ')': '(', ']': '['}[char]
                if top != expected:
                    print(f"ERROR: Mismatched bracket. Found '{char}' at line {line_num}, col {i+1}, expected matching '{top}' from line {l}, col {col}")
                    return False
            i += 1

    if stack:
        print("ERROR: Unclosed brackets remaining at end of file:")
        for char, l, col in stack:
            print(f"  Unclosed '{char}' at line {l}, col {col}")
        return False
        
    print("Brackets/braces are fully balanced!")
    return True

if __name__ == '__main__':
    check_brackets('../app.js')
