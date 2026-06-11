with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find all occurrences of both functions with their line numbers
lines = content.split('\n')
for func_name in ['handleNewSpotPhotoUpload', 'performNewSpotAIScan']:
    occurrences = []
    for i, line in enumerate(lines, 1):
        if f'function {func_name}' in line or f'async function {func_name}' in line:
            occurrences.append((i, line.strip()[:100]))
    print(f'\n{func_name}: found at lines {[o[0] for o in occurrences]}')
    for line_num, line_text in occurrences:
        print(f'  Line {line_num}: {line_text}')
