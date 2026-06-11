import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Capture console errors
        console_errors = []
        page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ["error", "warning"] else None)
        page.on("pageerror", lambda err: console_errors.append(f"[PAGE-ERROR] {err.message}"))
        
        print("Navigating to VendiMap...")
        try:
            await page.goto("http://localhost:8003/index.html", timeout=10000)
            await page.wait_for_timeout(3000) # Wait for Leaflet to initialize
            
            title = await page.title()
            print("Page Title:", title)
            
            content = await page.content()
            print("Content Length:", len(content))
            
            print("\nConsole Errors/Warnings:")
            for err in console_errors:
                print(err)
                
            # Take screenshot to verify if it is indeed blank
            screenshot_path = "scratch/blank_screen_check.png"
            await page.screenshot(path=screenshot_path)
            print(f"\nScreenshot saved to {screenshot_path}")
            
        except Exception as e:
            print("Failed to run check:", e)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
