import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
total_lines = len(lines)
print(f'Total lines: {total_lines}')

# Count all functions
func_names = re.findall(r'(?:async\s+)?function\s+(\w+)\s*\(', content)
print(f'Total function declarations: {len(func_names)}')

from collections import Counter
counts = Counter(func_names)
dupes = [(n, c) for n, c in counts.items() if c > 1]
if dupes:
    print('Duplicate function names:')
    for name, count in dupes:
        # Find all line numbers
        lnums = [i+1 for i, l in enumerate(lines) if re.search(r'(?:async\s+)?function\s+' + name + r'\s*\(', l)]
        print(f'  {name}: {count} times at lines {lnums}')
else:
    print('No duplicate function names.')

# Also check for any syntax issues - look for common problems:
# 1. Consecutive closing braces that might indicate missing code
# 2. Lines with just '}' followed immediately by another function

# Look for 'import' issues - the file uses ESM 
import_lines = [(i+1, l.strip()) for i, l in enumerate(lines) if l.strip().startswith('import ')]
print(f'\nImport statements ({len(import_lines)}):')
for ln, l in import_lines[:10]:
    print(f'  Line {ln}: {l[:100]}')

# Look for export statements
export_lines = [(i+1, l.strip()) for i, l in enumerate(lines) if l.strip().startswith('export ')]
print(f'\nExport statements ({len(export_lines)}):')
for ln, l in export_lines[:10]:
    print(f'  Line {ln}: {l[:100]}')
