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
            has_touch=True,
            permissions=["geolocation"],
            geolocation={"latitude": 35.6605, "longitude": 139.7005}
        )
        page = await context.new_page()

        print("--- Opening index.html with geolocation ---")
        try:
            await page.goto("http://localhost:8003/index.html", timeout=5000)
            await page.wait_for_timeout(2000)
            
            # Click addSpotBtn
            print("Clicking #addSpotBtn...")
            await page.click("#addSpotBtn")
            await page.wait_for_timeout(2000)
            
            # Take screenshot of the modal
            os.makedirs("scratch", exist_ok=True)
            await page.screenshot(path="scratch/screenshot_add_modal_mobile.png")
            print("Screenshot saved to scratch/screenshot_add_modal_mobile.png")
            
            # Print display style of addSpotModal
            display = await page.evaluate("window.getComputedStyle(document.getElementById('addSpotModal')).display")
            print("addSpotModal display style:", display)
            
        except Exception as e:
            print("Failed to show Add Spot Modal with geoloc:", e)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
