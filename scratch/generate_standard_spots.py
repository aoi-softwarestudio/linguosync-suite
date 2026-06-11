import re
import ast
import random

# Central coordinates
CITIES = [
    {"name": "札幌", "lat": 43.0680, "lng": 141.3480},
    {"name": "仙台", "lat": 38.2610, "lng": 140.8810},
    {"name": "新宿", "lat": 35.6890, "lng": 139.7000},
    {"name": "横浜", "lat": 35.4520, "lng": 139.6310},
    {"name": "名古屋", "lat": 35.1700, "lng": 136.9010},
    {"name": "京都", "lat": 35.0040, "lng": 135.7590},
    {"name": "大阪", "lat": 34.6980, "lng": 135.4950},
    {"name": "神戸", "lat": 34.6920, "lng": 135.1950},
    {"name": "広島", "lat": 34.3920, "lng": 132.4520},
    {"name": "福岡", "lat": 33.5890, "lng": 130.3990}
]

def generate_spots():
    # 1. Read the first 100 spots from existing data.js
    # To do this safely, we can read data.js, find ID 100, and keep all spots up to ID 100.
    # But since we wrote the parsing code, we can parse data.js, filter out anything with ID > 100, and keep the first 100 spots.
    with open('../data.js', 'r', encoding='utf-8') as f:
        content = f.read()

    js_data = content.strip()
    if js_data.startswith('export const initialSpots ='):
        js_data = js_data[len('export const initialSpots ='):].strip()
    if js_data.endswith(';'):
        js_data = js_data[:-1].strip()

    keys = ["id", "name", "lat", "lng", "manufacturer", "rating", "priceRange", "hasTrashBin", "paymentMethods", "rarity", "lineup", "description", "type", "photos", "verifiedCount", "lastUpdated"]
    py_data = js_data
    for key in keys:
        py_data = re.sub(r'\b' + key + r'\s*:', f'"{key}":', py_data)
    py_data = py_data.replace('true', 'True').replace('false', 'False').replace('null', 'None')

    existing_spots = ast.literal_eval(py_data)
    # Keep only spots with ID <= 100
    existing_spots = [s for s in existing_spots if s["id"] <= 100]
    print(f"Loaded {len(existing_spots)} verified spots.")

    random.seed(42)

    # 2. Generate 300 new spots with details marked as "不明"
    new_spots = []
    current_id = 101

    for city in CITIES:
        for i in range(1, 31):
            lat_offset = random.uniform(-0.0035, 0.0035)
            lng_offset = random.uniform(-0.0035, 0.0035)
            lat = round(city["lat"] + lat_offset, 6)
            lng = round(city["lng"] + lng_offset, 6)

            name = f"街角自販機 {city['name']}街区第{i}号"
            desc = "一般的な飲料自販機（詳細情報未確認）"

            spot = {
                "id": current_id,
                "name": name,
                "lat": lat,
                "lng": lng,
                "manufacturer": "不明",
                "rating": 0.0,
                "priceRange": "不明",
                "hasTrashBin": "不明",
                "paymentMethods": [],
                "rarity": 1,
                "lineup": [],
                "description": desc,
                "type": "standard",
                "photos": [],
                "verifiedCount": 0,
                "lastUpdated": "不明"
            }
            new_spots.append(spot)
            current_id += 1

    all_spots = existing_spots + new_spots
    print(f"Generated {len(new_spots)} new spots with unknown details. Total spots: {len(all_spots)}")

    # 3. Write back to data.js
    js_output = "export const initialSpots = [\n"
    for i, s in enumerate(all_spots):
        js_output += "    {\n"
        js_output += f"        id: {s['id']},\n"
        js_output += f'        name: "{s["name"]}",\n'
        js_output += f"        lat: {s['lat']},\n"
        js_output += f"        lng: {s['lng']},\n"
        js_output += f'        manufacturer: "{s["manufacturer"]}",\n'
        js_output += f"        rating: {s['rating']},\n"
        js_output += f'        priceRange: "{s["priceRange"]}",\n'
        js_output += f'        hasTrashBin: "{s["hasTrashBin"]}",\n'
        
        pm_str = ", ".join([f'"{m}"' for m in s["paymentMethods"]])
        js_output += f"        paymentMethods: [{pm_str}],\n"
        
        js_output += f"        rarity: {s['rarity']},\n"
        
        lineup_str = ", ".join([f'"{item}"' for item in s["lineup"]])
        js_output += f"        lineup: [{lineup_str}],\n"
        
        js_output += f'        description: "{s["description"]}",\n'
        js_output += f'        type: "{s["type"]}",\n'
        js_output += "        photos: [],\n"
        js_output += f"        verifiedCount: {s['verifiedCount']},\n"
        js_output += f'        lastUpdated: "{s["lastUpdated"]}"\n'
        
        if i == len(all_spots) - 1:
            js_output += "    }\n"
        else:
            js_output += "    },\n"
    js_output += "];\n"

    with open('../data.js', 'w', encoding='utf-8') as f:
        f.write(js_output)
    print("Successfully wrote 400 spots (with 300 unknown) to data.js!")

if __name__ == '__main__':
    generate_spots()
