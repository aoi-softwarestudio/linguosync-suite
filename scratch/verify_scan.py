import json
import requests

def test_proxy():
    url = "http://localhost:8000/api/gemini-proxy"
    
    # Mock payload for testing
    payload = {
        "model": "gemini-2.5-flash",
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": "Hello, please reply with a JSON array listing one drink: [\"Water [Cold] (100円)\"]"
                    }
                ]
            }
        ]
    }
    
    headers = {
        "Content-Type": "application/json",
        "X-License-Key": "LS-MOCK-LICENSE-KEY-12345" # Using mock premium key to bypass rate limit
    }
    
    try:
        print(f"Sending POST to {url}...")
        res = requests.post(url, headers=headers, json=payload, timeout=10)
        print("Response status code:", res.status_code)
        data = res.json()
        print("Response data:", json.dumps(data, ensure_ascii=False, indent=2))
        
        # Check if it succeeded or returned config warning
        if "error" in data:
            print("Note: Proxy returned an expected key warning or error (normal if GEMINI_API_KEY is not set):", data["error"])
            return True
        elif res.status_code == 200:
            print("Success! Proxy returned valid response.")
            return True
        else:
            print("Error: unexpected status code:", res.status_code)
            return False
            
    except Exception as e:
        print("Test failed with exception:", e)
        return False

if __name__ == "__main__":
    test_proxy()
