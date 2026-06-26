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

        print("--- 1. Injecting Corrupted LocalStorage Data & Opening Page ---")
        try:
            # Navigate to page first so we are on the correct origin to set localStorage
            await page.goto("http://localhost:8003/index.html", timeout=5000)
            await page.wait_for_timeout(1000)
            
            # Inject corrupted data representing older/malformed storage
            await page.evaluate("""() => {
                localStorage.setItem('vendimap_missions_state', '{"date":"2026-06-25","missions":null}');
                localStorage.setItem('vendimap_gamification_state', '{"level":2,"xp":50}');
            }""")
            
            # Reload page to let the app load the corrupted storage
            print("Reloading page with malformed localStorage...")
            await page.reload()
            await page.wait_for_timeout(2000)
            print("Loaded. Initial logs:")
            print("\n".join(console_messages))
            console_messages.clear()
        except Exception as e:
            print("Failed to load page with malformed data:", e)
            await browser.close()
            return

        print("\n--- 2. Opening Achievements Modal ---")
        try:
            await page.evaluate("document.getElementById('achievementsModal').style.display = 'flex'")
            await page.wait_for_timeout(500)
            print("Modal opened. Logs:")
            print("\n".join(console_messages))
            console_messages.clear()
        except Exception as e:
            print("Failed to open modal:", e)

        print("\n--- 3. Clicking Missions Tab Button (Expected crash if not robust) ---")
        try:
            print("Clicking Missions tab...")
            await page.click("#modalTabBtnMissions")
            await page.wait_for_timeout(1000)
            print("Missions tab clicked logs:")
            print("\n".join(console_messages))
            console_messages.clear()
        except Exception as e:
            print("Failed during missions click:", e)

        print("\n--- 4. Clicking Territory Tab Button (Expected crash if not robust) ---")
        try:
            print("Clicking Territory tab...")
            await page.click("#modalTabBtnTerritory")
            await page.wait_for_timeout(1000)
            print("Territory tab clicked logs:")
            print("\n".join(console_messages))
            console_messages.clear()
        except Exception as e:
            print("Failed during territory click:", e)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
