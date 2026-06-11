with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')

# Check for the export line at the end - it's exporting initialSpots which is imported
# This means index.html must use type=module AND both scripts must coordinate properly
# Let's verify the index.html script loading
print('Last 5 lines of app.js:')
for ln in lines[-5:]:
    print(repr(ln))

# Also check line 4146 (where export is)
print()
print(f'Line 4146: {repr(lines[4145])}')
print(f'Line 4147 (last): {repr(lines[4146]) if len(lines) > 4146 else "EOF"}')
