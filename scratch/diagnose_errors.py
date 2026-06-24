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

        print("\n--- 2. Opening Detail Panel for first spot ---")
        try:
            await page.evaluate("window.showDetailPanel(window.initialSpots[0])")
            await page.wait_for_timeout(1000)
            print("Detail Panel opened. Logs:")
            print("\n".join(console_messages))
            console_messages.clear()
        except Exception as e:
            print("Failed to open detail panel:", e)

        print("\n--- 3. Clicking Status Report Button ('new') ---")
        try:
            # Click the 'new' status button
            await page.click("#statusReportNew")
            await page.wait_for_timeout(1500)
            print("Clicked status report. Logs:")
            print("\n".join(console_messages))
            console_messages.clear()
        except Exception as e:
            print("Failed to click status button:", e)

        print("\n--- 4. Logging in (Mock) & Updating Owner Message ---")
        try:
            # Inject a mock logged-in user who owns the first spot so we can test owner message edit
            # First spot owner name can be grabbed or we can assign one
            spot_id = await page.evaluate("window.initialSpots[0].id || window.initialSpots[0].osmId")
            await page.evaluate(f"""
                window.currentUser = {{ name: "Test Owner", email: "test@example.com" }};
                const spot = window.initialSpots.find(s => (s.id || s.osmId) == '{spot_id}');
                spot.owner = "Test Owner";
                window.showDetailPanel(spot);
            """)
            await page.wait_for_timeout(1000)
            
            # Now the owner message edit box should be visible. Let's write a message and save.
            await page.fill("#ownerMessageInput", "こんにちは！新鮮なドリンク入荷しました！")
            await page.click("#updateOwnerMessageBtn")
            await page.wait_for_timeout(1500)
            print("Updated owner message. Logs:")
            print("\n".join(console_messages))
            console_messages.clear()
        except Exception as e:
            print("Failed to update owner message:", e)

        print("\n--- 5. Opening Achievements Modal & Switching Tabs ---")
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
            
            # Switch back to Achievements tab
            print("Switching to Achievements tab...")
            await page.click("#modalTabBtnAchievements")
            await page.wait_for_timeout(500)
            
            print("Modal navigation logs:")
            print("\n".join(console_messages))
            console_messages.clear()
        except Exception as e:
            print("Failed in achievements modal test:", e)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
