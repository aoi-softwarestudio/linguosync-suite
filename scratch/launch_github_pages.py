import os
import requests
import json
import time

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
    print("[Error] MY_GITHUB_TOKEN not found in environment or .env")
    exit(1)

owner = "kojimasota3-art"
repo = "linguosync-suite"

headers = {
    "Authorization": f"token {token}",
    "Accept": "application/vnd.github.v3+json"
}

print(f"Step 1: Changing repository visibility of '{owner}/{repo}' to PUBLIC...")
patch_url = f"https://api.github.com/repos/{owner}/{repo}"
patch_payload = {
    "private": False
}
res_patch = requests.patch(patch_url, headers=headers, json=patch_payload)

if res_patch.status_code == 200:
    print(" -> Repository visibility successfully updated to PUBLIC!")
else:
    print(f" -> Failed to update visibility: {res_patch.status_code} - {res_patch.text}")
    exit(1)

# Wait a brief moment for GitHub backend to register visibility change
time.sleep(2)

print(f"Step 2: Enabling GitHub Pages on '{owner}/{repo}' using the 'main' branch at root '/'...")
pages_url = f"https://api.github.com/repos/{owner}/{repo}/pages"
pages_payload = {
    "source": {
        "branch": "main",
        "path": "/"
    }
}
res_pages = requests.post(pages_url, headers=headers, json=pages_payload)

if res_pages.status_code == 201:
    print(" -> GitHub Pages successfully enabled!")
    pages_info = res_pages.json()
    html_url = pages_info.get("html_url", f"https://{owner}.github.io/{repo}/")
    print(f"\n==================================================")
    print(f"🎉 SOCIALINTENT AI IS OFFICIALLY LIVE ONLINE!")
    print(f"Permanent URL: {html_url}SocialIntent/index.html")
    print(f"VentureOS (Dashboard) URL: {html_url}VentureOS/index.html")
    print(f"==================================================")
elif res_pages.status_code == 409:
    # 409 Conflict means Pages is already enabled
    print(" -> GitHub Pages is already enabled on this repository.")
    html_url = f"https://{owner}.github.io/{repo}/"
    print(f"\n==================================================")
    print(f"🎉 SOCIALINTENT AI IS ALREADY LIVE ONLINE!")
    print(f"Permanent URL: {html_url}SocialIntent/index.html")
    print(f"VentureOS (Dashboard) URL: {html_url}VentureOS/index.html")
    print(f"==================================================")
else:
    print(f" -> Failed to enable Pages: {res_pages.status_code} - {res_pages.text}")
    print("\nIf you see a message saying 'branch is not yet built', GitHub may be processing the initial push.")
    print("Please wait 30 seconds and run this script again, or manually enable it in GitHub settings.")
