with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

in_squote = False
in_dquote = False
in_backtick = False
in_line_comment = False
in_block_comment = False

squote_start = None
dquote_start = None
backtick_start = None
block_comment_start = None

line = 1
col = 1

escaped = False

for idx, char in enumerate(content):
    if char == '\n':
        line += 1
        col = 1
    else:
        col += 1
        
    if escaped:
        escaped = False
        continue
        
    if char == '\\' and (in_squote or in_dquote or in_backtick):
        escaped = True
        continue
        
    if in_line_comment:
        if char == '\n':
            in_line_comment = False
        continue
        
    if in_block_comment:
        if char == '/' and content[idx-1] == '*':
            in_block_comment = False
        continue
        
    if in_squote:
        if char == "'":
            in_squote = False
        continue
        
    if in_dquote:
        if char == '"':
            in_dquote = False
        continue
        
    if in_backtick:
        if char == '`':
            in_backtick = False
        continue
        
    # Check for comment start
    if char == '/' and idx + 1 < len(content):
        next_char = content[idx+1]
        if next_char == '/':
            in_line_comment = True
            continue
        elif next_char == '*':
            in_block_comment = True
            block_comment_start = (line, col)
            continue
            
    if char == "'":
        in_squote = True
        squote_start = (line, col)
    elif char == '"':
        in_dquote = True
        dquote_start = (line, col)
    elif char == '`':
        in_backtick = True
        backtick_start = (line, col)

if in_squote:
    print(f"Unclosed single quote starting at line {squote_start[0]}, col {squote_start[1]}")
if in_dquote:
    print(f"Unclosed double quote starting at line {dquote_start[0]}, col {dquote_start[1]}")
if in_backtick:
    print(f"Unclosed backtick starting at line {backtick_start[0]}, col {backtick_start[1]}")
if in_block_comment:
    print(f"Unclosed block comment starting at line {block_comment_start[0]}, col {block_comment_start[1]}")

if not (in_squote or in_dquote or in_backtick or in_block_comment):
    print("All quotes and comments are correctly closed!")
