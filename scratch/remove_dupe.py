with open('app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f'Total lines: {len(lines)}')

# Find the second performNewSpotAIScan (at around line 2876) and its end
second_start = None
second_end = None

func_count = 0
for i, line in enumerate(lines):
    if 'async function performNewSpotAIScan(dataUrl)' in line:
        func_count += 1
        if func_count == 2:
            second_start = i
            print(f'Second performNewSpotAIScan starts at line {i+1}')
            break

if second_start is not None:
    # Find the closing brace by tracking depth
    depth = 0
    for i in range(second_start, len(lines)):
        for c in lines[i]:
            if c == '{':
                depth += 1
            elif c == '}':
                depth -= 1
        if depth == 0 and i > second_start:
            second_end = i
            print(f'Function ends at line {i+1}: {lines[i].rstrip()[:80]}')
            break

if second_start is not None and second_end is not None:
    # Remove lines second_start to second_end (inclusive)
    # Also remove leading blank lines before it
    remove_start = second_start
    while remove_start > 0 and lines[remove_start - 1].strip() == '':
        remove_start -= 1
        
    print(f'Will remove lines {remove_start+1} to {second_end+1}')
    new_lines = lines[:remove_start] + lines[second_end+1:]
    
    with open('app.js', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print(f'Done. New total lines: {len(new_lines)}')
else:
    print('Could not find function boundaries')
