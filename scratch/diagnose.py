import asyncio
from playwright.async_api import async_playwright
import os
import sys

# Configure UTF-8 stdout
sys.stdout.reconfigure(encoding='utf-8')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Listen to console logs
        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"[{msg.type.upper()}] {msg.text}"))
        page.on("pageerror", lambda err: console_messages.append(f"[EXCEPTION] {err.stack or err.message}"))

        print("--- Opening debug.html ---")
        try:
            await page.goto("http://localhost:8003/debug.html", timeout=5000)
            await page.wait_for_timeout(3000)
            print("Console logs for debug.html:")
            print("\n".join(console_messages))
            
            # Print page content of debug.html results
            content = await page.inner_text("#results")
            print("\nDebug.html innerText results:\n", content)
        except Exception as e:
            print("Failed to open debug.html:", e)

        print("\n--- Opening index.html ---")
        console_messages.clear()
        try:
            await page.goto("http://localhost:8003/index.html", timeout=5000)
            await page.wait_for_timeout(3000)
            
            # Take screenshot
            os.makedirs("scratch", exist_ok=True)
            await page.screenshot(path="scratch/screenshot.png")
            print("Screenshot saved to scratch/screenshot.png")
            
            # Print console logs of index.html
            print("\nIndex.html Console Messages:\n", "\n".join(console_messages))
            
            # Check visible status of elements
            for el_id in ["map", "achievementsModal", "loginModal", "aiScanOverlay"]:
                try:
                    el = page.locator(f"#{el_id}")
                    is_visible = await el.is_visible()
                    print(f"Element #{el_id} visible: {is_visible}")
                except Exception as ex:
                    print(f"Element #{el_id} check failed: {ex}")
                    
        except Exception as e:
            print("Failed to open index.html:", e)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
