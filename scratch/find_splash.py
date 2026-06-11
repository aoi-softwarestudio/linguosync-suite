with open('app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

keywords = ['splash', 'loading', 'overlay', 'loadingScreen', 'splash-screen', 'initApp', 'DOMContentLoaded', 'vendimap-icon', 'logo', 'brand-icon']
print(f'Searching {len(lines)} lines...')
for i, l in enumerate(lines):
    ll = l.lower()
    for kw in keywords:
        if kw.lower() in ll:
            print(f'Line {i+1}: {l.rstrip()[:140]}')
            break
