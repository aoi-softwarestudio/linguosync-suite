import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Show initMap function
for i in range(1640, 1850):
    print(f'{i+1}: {lines[i].rstrip()[:150]}')
