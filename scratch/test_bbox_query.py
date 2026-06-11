import requests

def test_bbox():
    # Insert a dummy spot to query
    url_add = "http://localhost:8000/api/add-spot"
    spot_data = {
        "spot_id": "999999",
        "name": "テスト用BBox自販機",
        "lat": 35.658,
        "lng": 139.701,
        "manufacturer": "サントリー",
        "price_range": "100円〜150円",
        "has_trash_bin": "あり",
        "payment_methods": ["現金", "交通系IC"],
        "lineup": ["伊右衛門 [コールド] (130円)"],
        "description": "テスト用の自販機です",
        "last_updated": "2026/05/30"
    }
    
    # Try adding the spot (might already exist, handle gracefully)
    try:
        res = requests.post(url_add, json=spot_data)
        print("Add dummy spot response:", res.status_code, res.json())
    except Exception as e:
        print("Add dummy spot failed (could be already added):", e)

    # 1. Query outside bounding box
    params_outside = {
        "min_lat": 35.660,
        "max_lat": 35.670,
        "min_lng": 139.710,
        "max_lng": 139.720
    }
    res = requests.get("http://localhost:8000/api/global-spots", params=params_outside)
    spots_outside = res.json().get("spots", [])
    print(f"Spots outside BBox (should not contain 999999): {[s['spot_id'] for s in spots_outside if s['spot_id'] == '999999']}")

    # 2. Query inside bounding box
    params_inside = {
        "min_lat": 35.650,
        "max_lat": 35.660,
        "min_lng": 139.700,
        "max_lng": 139.710
    }
    res = requests.get("http://localhost:8000/api/global-spots", params=params_inside)
    spots_inside = res.json().get("spots", [])
    print(f"Spots inside BBox (should contain 999999): {[s['spot_id'] for s in spots_inside if s['spot_id'] == '999999']}")

if __name__ == "__main__":
    test_bbox()
