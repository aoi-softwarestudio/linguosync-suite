import asyncio
from playwright.async_api import async_playwright
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            viewport={"width": 390, "height": 844},  # iPhone 12 Pro size
            is_mobile=True,
            has_touch=True
        )
        page = await context.new_page()

        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"[{msg.type.upper()}] {msg.text}"))
        page.on("pageerror", lambda err: console_messages.append(f"[EXCEPTION] {err.stack or err.message}"))

        print("--- 1. Opening index.html ---")
        try:
            await page.goto("http://localhost:8003/index.html", timeout=5000)
            await page.wait_for_timeout(2000)
            print("Loaded. Initial logs:")
            print("\n".join(console_messages))
            console_messages.clear()
        except Exception as e:
            print("Failed to load page:", e)
            await browser.close()
            return

        print("\n--- 2. Testing Filters (Via DOM clicks) ---")
        # Locate all filter chips and click them one by one
        try:
            # Get list of filter chips text to click
            filter_texts = ["ゴミ箱あり", "100円以下", "激レア", "キャッシュレス可", "💖 お気に入り", "すべて"]
            for txt in filter_texts:
                print(f"Clicking filter chip: {txt}")
                # Use locator for class and text content
                locator = page.locator(f".filter-chip:has-text('{txt}')")
                if await locator.count() > 0:
                    await locator.first.click()
                    await page.wait_for_timeout(600)
                else:
                    print(f"Filter chip not found: {txt}")
        except Exception as e:
            print("Failed during filter click test:", e)
        
        print("Filter test logs:")
        print("\n".join(console_messages))
        console_messages.clear()

        print("\n--- 3. Testing Search Query Input (Via DOM fill) ---")
        search_queries = ["コカ", "ボス", "100円", "ゴミ", "電子マネー", "レア"]
        try:
            for q in search_queries:
                print(f"Typing query in search bar: {q}")
                await page.fill("#searchInput", q)
                await page.press("#searchInput", "Enter")
                await page.wait_for_timeout(600)
            
            # Clear search
            print("Clearing search bar...")
            await page.fill("#searchInput", "")
            await page.press("#searchInput", "Enter")
            await page.wait_for_timeout(500)
        except Exception as e:
            print("Failed during search test:", e)

        print("Search test logs:")
        print("\n".join(console_messages))
        console_messages.clear()

        print("\n--- 4. Opening Detail Panel for first spot ---")
        try:
            await page.evaluate("window.showDetailPanel(window.initialSpots[0])")
            await page.wait_for_timeout(1000)
            print("Detail Panel opened. Logs:")
            print("\n".join(console_messages))
            console_messages.clear()
        except Exception as e:
            print("Failed to open detail panel:", e)

        print("\n--- 5. Clicking Status Report Button ('new') ---")
        try:
            await page.click("#statusReportNew")
            await page.wait_for_timeout(1500)
            print("Clicked status report. Logs:")
            print("\n".join(console_messages))
            console_messages.clear()
        except Exception as e:
            print("Failed to click status button:", e)

        print("\n--- 6. Opening Achievements Modal & Switching Tabs ---")
        try:
            await page.evaluate("document.getElementById('achievementsModal').style.display = 'flex'")
            await page.wait_for_timeout(500)
            
            # Switch to Missions tab
            print("Switching to Missions tab...")
            await page.click("#modalTabBtnMissions")
            await page.wait_for_timeout(500)
            
            # Switch to Territory tab
            print("Switching to Territory tab...")
            await page.click("#modalTabBtnTerritory")
            await page.wait_for_timeout(500)
            
            print("Modal navigation logs:")
            print("\n".join(console_messages))
            console_messages.clear()
        except Exception as e:
            print("Failed in achievements modal test:", e)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
