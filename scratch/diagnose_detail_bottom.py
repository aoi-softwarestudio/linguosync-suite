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

        print("--- Opening index.html for bottom detail panel test ---")
        try:
            await page.goto("http://localhost:8003/index.html", timeout=5000)
            await page.wait_for_timeout(2000)
            
            # Open detail panel
            await page.evaluate("window.showDetailPanel(window.initialSpots[0])")
            await page.wait_for_timeout(2000)
            
            # Scroll the detail panel to the bottom
            # The detail panel selector is #detailPanel
            await page.evaluate('''() => {
                const panel = document.getElementById('detailPanel');
                if (panel) {
                    panel.scrollTop = panel.scrollHeight;
                }
            }''')
            await page.wait_for_timeout(1000)
            
            # Take screenshot
            os.makedirs("scratch", exist_ok=True)
            await page.screenshot(path="scratch/screenshot_detail_bottom_mobile.png")
            print("Screenshot saved to scratch/screenshot_detail_bottom_mobile.png")
            
        except Exception as e:
            print("Failed to show detail panel bottom:", e)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
