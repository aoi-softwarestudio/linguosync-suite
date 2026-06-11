with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

depth_curly = 0
depth_paren = 0
depth_bracket = 0
in_str = False
str_char = None
prev_char = None
line_num = 1
errors = []

i = 0
while i < len(content):
    c = content[i]
    
    if c == '\n':
        line_num += 1
    
    if in_str:
        if prev_char != chr(92) and c == str_char:
            in_str = False
        prev_char = c
        i += 1
        continue
    
    if c in ['"', "'", '`']:
        in_str = True
        str_char = c
        prev_char = c
        i += 1
        continue
    
    if c == '/' and i+1 < len(content) and content[i+1] == '/':
        while i < len(content) and content[i] != '\n':
            i += 1
        continue
    
    if c == '/' and i+1 < len(content) and content[i+1] == '*':
        i += 2
        while i+1 < len(content) and not (content[i] == '*' and content[i+1] == '/'):
            if content[i] == '\n':
                line_num += 1
            i += 1
        i += 2
        continue
    
    if c == '{': depth_curly += 1
    elif c == '}': depth_curly -= 1
    elif c == '(': depth_paren += 1
    elif c == ')': depth_paren -= 1
    elif c == '[': depth_bracket += 1
    elif c == ']': depth_bracket -= 1
    
    if depth_curly < 0 or depth_paren < 0 or depth_bracket < 0:
        errors.append(f'Line {line_num}: unexpected closing - curly={depth_curly} paren={depth_paren} bracket={depth_bracket}')
        depth_curly = max(0, depth_curly)
        depth_paren = max(0, depth_paren)
        depth_bracket = max(0, depth_bracket)
    
    prev_char = c
    i += 1

print(f'Final: curly={depth_curly} paren={depth_paren} bracket={depth_bracket}')
if errors:
    print('Errors found:')
    for e in errors[:20]:
        print(e)
else:
    print('No bracket errors found.')
