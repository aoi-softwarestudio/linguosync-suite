import sys
import time
from playwright.sync_api import sync_playwright

def run():
    print("[TEST] Starting Playwright browser...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Go to local VendiMap
        url = "http://localhost:8003/"
        print(f"[TEST] Loading page: {url} ...")
        page.goto(url)
        page.wait_for_load_state("networkidle")
        print("[TEST] Page loaded.")
        
        # 1. Verify that getRandomLineupForManufacturer mock data has [売切] items
        print("[TEST] Verifying mock data contains [売切]...")
        lineup_suntory = page.evaluate("getRandomLineupForManufacturer('サントリー')")
        print(f"[TEST] Mock Suntory Lineup: {lineup_suntory}")
        assert any("[売切]" in item for item in lineup_suntory), "Mock database should contain [売切] items"
        print("[TEST] Mock data verification passed.")
        
        # 2. Verify lineup parser & renderer in showDetailPanel
        print("[TEST] Verifying lineup parsing and CSS classes in showDetailPanel...")
        
        # Create a mock spot with sold out items
        mock_spot = {
            "id": 99999,
            "name": "テスト自販機",
            "lat": 35.6605,
            "lng": 139.7005,
            "manufacturer": "サントリー",
            "rating": 4.5,
            "priceRange": "130円〜160円",
            "hasTrashBin": "あり",
            "paymentMethods": ["現金", "交通系IC"],
            "rarity": 0,
            "lineup": [
                "天然水 [コールド] (130円)",
                "BOSS レインボーマウンテン [ホット] [売切] (140円)",
                "ペプシコーラ [コールド] [売り切れ] (160円)",
                "伊右衛門 [コールド] [soldout] (150円)"
            ],
            "description": "テスト用",
            "photos": [],
            "verifiedCount": 12,
            "lastUpdated": "2026/06/02",
            "namingRightsAvailable": True,
            "comments": []
        }
        
        # Call showDetailPanel with the mock spot
        page.evaluate("(spot) => showDetailPanel(spot)", mock_spot)
        page.wait_for_timeout(500)  # Wait for rendering
        
        # Check rendered HTML in #spotLineup
        lineup_html = page.locator("#spotLineup").inner_html()
        
        # Check badges count
        badges = page.locator("#spotLineup .lineup-item-badge")
        assert badges.count() == 4, f"Should render 4 badges, got {badges.count()}"
        
        # Check sold-out-item badges count (BOSS, pepsi, green tea)
        sold_out_badges = page.locator("#spotLineup .lineup-item-badge.sold-out-item")
        assert sold_out_badges.count() == 3, f"Should render 3 sold-out-item badges, got {sold_out_badges.count()}"
        
        # Check sold-out tags count
        sold_out_tags = page.locator("#spotLineup .sold-out-tag")
        assert sold_out_tags.count() == 3, f"Should render 3 sold-out-tag elements, got {sold_out_tags.count()}"
        print("[TEST] Lineup parser & renderer verification passed.")
        
        # 3. Verify OSM fetchedGrids caching
        print("[TEST] Verifying fetchedGrids OSM grid caching...")
        # Clear fetchedGrids
        page.evaluate("clearFetchedGrids()")
        
        # Trigger first fetch
        page.evaluate("fetchOSMVendingMachines(35.6605, 139.7005)")
        grids_len_1 = page.evaluate("getFetchedGrids().length")
        assert grids_len_1 == 1, f"fetchedGrids should have 1 item, got {grids_len_1}"
        
        # Trigger second fetch within 300m (e.g. slight shift)
        # 35.6605, 139.7005 to 35.6610, 139.7010 is about 70m
        page.evaluate("fetchOSMVendingMachines(35.6610, 139.7010)")
        grids_len_2 = page.evaluate("getFetchedGrids().length")
        assert grids_len_2 == 1, f"fetchedGrids should still have 1 item because of 300m threshold, got {grids_len_2}"
        
        # Trigger third fetch outside 300m (e.g. to Shinjuku center 35.6909, 139.7002 is about 3.3km away)
        page.evaluate("fetchOSMVendingMachines(35.6909, 139.7002)")
        grids_len_3 = page.evaluate("getFetchedGrids().length")
        assert grids_len_3 == 2, f"fetchedGrids should have 2 items now, got {grids_len_3}"
        print("[TEST] OSM fetchedGrids grid caching verification passed.")
        
        # 4. Check CSS styles in style.css are loaded
        print("[TEST] Verifying custom CSS rules (.sold-out-item) exist in DOM...")
        css_exists = page.evaluate("""() => {
            const sheets = Array.from(document.styleSheets);
            for (const sheet of sheets) {
                try {
                    const rules = Array.from(sheet.cssRules || sheet.rules);
                    for (const rule of rules) {
                        if (rule.selectorText && rule.selectorText.includes('.sold-out-item')) {
                            return true;
                        }
                    }
                } catch(e) {}
            }
            return false;
        }""")
        assert css_exists, "CSS rules for .sold-out-item should be present in style.css"
        print("[TEST] Custom CSS rules verification passed.")
        
        print("[TEST] ALL VERIFICATIONS PASSED SUCCESSFULLY!")
        
        browser.close()

if __name__ == "__main__":
    run()
