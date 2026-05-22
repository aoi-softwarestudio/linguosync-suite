import os
import requests

# Load .env
env_path = ".env"
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line.startswith("MY_GITHUB_TOKEN="):
                token = line.split("=", 1)[1].strip().strip('"').strip("'")
                os.environ["MY_GITHUB_TOKEN"] = token
                break

token = os.getenv("MY_GITHUB_TOKEN")
if not token:
    print("MY_GITHUB_TOKEN not found")
    exit(1)

headers = {
    "Authorization": f"token {token}",
    "Accept": "application/vnd.github.v3+json"
}

repo_url = "https://api.github.com/repos/kojimasota3-art/linguosync-suite/contents"
res = requests.get(repo_url, headers=headers)
if res.status_code == 200:
    items = res.json()
    print(f"Repository contains {len(items)} top-level items:")
    for item in items:
        print(f" - {item['name']} ({item['type']})")
else:
    print(f"Failed to check contents: {res.status_code} - {res.text}")
