with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

mask = [False] * len(content)
states = [None] * len(content)

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
    current_state = f"esc={escaped}, sq={in_squote}, dq={in_dquote}, bt={in_backtick}, reg={in_regex}, lc={in_line_comment}, bc={in_block_comment}"
    states[idx] = current_state
    
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
            while idx + 1 < n and content[idx+1] in 'gimy':
                idx += 1
                mask[idx] = True
        idx += 1
        continue
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
        prev_idx = idx - 1
        while prev_idx >= 0 and content[prev_idx].isspace():
            prev_idx -= 1
        is_regex_start = True
        if prev_idx >= 0:
            prev_char = content[prev_idx]
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

lines = content.split('\n')
for line_no, line_str in enumerate(lines, start=1):
    if 'text:' in line_str and 'あなたは自販機' in line_str:
        print(f"Checking line {line_no}:")
        start_idx = content.find(line_str)
        for i in range(30, min(len(line_str), 102)):
            char = line_str[i]
            is_masked = mask[start_idx + i]
            state_str = states[start_idx + i]
            print(f"{i+1:3d} ({char}): masked={is_masked}, state=[{state_str}]")
        break
