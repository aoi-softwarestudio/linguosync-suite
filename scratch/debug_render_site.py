import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    print("=== DEBUGGING RENDER SITE ===")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            viewport={"width": 390, "height": 844},
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1",
            is_mobile=True,
            has_touch=True
        )
        page = await context.new_page()
        
        # Log console messages
        page.on("console", lambda msg: print(f"[Console] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[PageError] {err}"))
        
        print("Navigating to https://vendimap-app.onrender.com/index.html?v=2...")
        try:
            res = await page.goto("https://vendimap-app.onrender.com/index.html?v=2", timeout=15000)
            print(f"HTTP Status: {res.status}")
        except Exception as e:
            print(f"Navigation failed: {e}")
            
        await page.wait_for_timeout(5000)
        
        # Take a screenshot to confirm what is rendered
        screenshot_path = r"C:\Users\小島蒼大\.gemini\antigravity\brain\d7e8b68a-d088-4761-a910-c0c83a0bf497\debug_render_site.png"
        await page.screenshot(path=screenshot_path)
        print(f"[+] Saved screenshot to: {screenshot_path}")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
