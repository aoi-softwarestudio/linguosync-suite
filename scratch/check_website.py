import requests

try:
    r = requests.get('http://localhost:8003/')
    print('index.html status:', r.status_code)
    print('index.html size:', len(r.text))
except Exception as e:
    print('index.html failed:', e)

try:
    r = requests.get('http://localhost:8003/app.js')
    print('app.js status:', r.status_code)
    print('app.js size:', len(r.text))
except Exception as e:
    print('app.js failed:', e)

try:
    r = requests.get('http://localhost:8003/sw.js')
    print('sw.js status:', r.status_code)
    print('sw.js size:', len(r.text))
except Exception as e:
    print('sw.js failed:', e)
