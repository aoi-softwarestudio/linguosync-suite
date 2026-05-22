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

commits_url = "https://api.github.com/repos/kojimasota3-art/linguosync-suite/commits"
res = requests.get(commits_url, headers=headers)
if res.status_code == 200:
    commits = res.json()
    print(f"Recent {len(commits[:10])} commits:")
    for commit in commits[:10]:
        print(f" - {commit['commit']['message']}")
else:
    print(f"Failed to check commits: {res.status_code} - {res.text}")
