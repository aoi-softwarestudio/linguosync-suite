import asyncio
from playwright.async_api import async_playwright
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            viewport={"width": 375, "height": 667},
            is_mobile=True,
            has_touch=True
        )
        page = await context.new_page()

        print("--- Opening index.html for Add Spot Modal test ---")
        try:
            await page.goto("http://localhost:8003/index.html", timeout=5000)
            await page.wait_for_timeout(2000)
            
            # Click addSpotBtn to open modal
            await page.click("#addSpotBtn")
            await page.wait_for_timeout(1000)
            
            # Take screenshot
            os.makedirs("scratch", exist_ok=True)
            await page.screenshot(path="scratch/screenshot_add_mobile.png")
            print("Screenshot saved to scratch/screenshot_add_mobile.png")
            
        except Exception as e:
            print("Failed to show Add Spot Modal:", e)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
