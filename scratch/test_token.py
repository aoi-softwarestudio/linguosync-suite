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
    print("MY_GITHUB_TOKEN not found in environment or .env")
    exit(1)

headers = {
    "Authorization": f"token {token}",
    "Accept": "application/vnd.github.v3+json"
}

# Get user
user_res = requests.get("https://api.github.com/user", headers=headers)
if user_res.status_code == 200:
    print(f"Authenticated as User: {user_res.json().get('login')}")
else:
    print(f"Auth failed: {user_res.status_code} - {user_res.text}")
    exit(1)

# List repos
repos_res = requests.get("https://api.github.com/user/repos", headers=headers)
if repos_res.status_code == 200:
    print("Accessible Repositories:")
    for repo in repos_res.json():
        print(f" - {repo['full_name']} (Private: {repo['private']})")
else:
    print(f"Failed to list repos: {repos_res.status_code} - {repos_res.text}")
