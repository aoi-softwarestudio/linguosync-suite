import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find script tags
scripts = re.findall(r'<script[^>]*>', content)
for s in scripts:
    print(s)

# Also find app.js version reference
matches = re.findall(r'app\.js[^"]*', content)
print('app.js references:', matches)
