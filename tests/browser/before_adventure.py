"""Capture v0.3 from its pinned release commit for a same-chapter comparison."""
from pathlib import Path
import os
from playwright.sync_api import sync_playwright
out=Path('evidence')
out.mkdir(exist_ok=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=os.getenv('CHROME_BIN') or None)
    for stage,width,height in [(90,1363,768),(180,390,844)]:
        p=browser.new_page(viewport={'width':width,'height':height})
        p.goto('http://127.0.0.1:4174/?lang=en')
        p.evaluate("(n)=>localStorage.setItem('prallwerk.save.v1',JSON.stringify({version:1,unlocked:n,completed:[],best:{}}))",stage)
        p.reload()
        p.locator('#start').click()
        p.locator('#board-name').wait_for()
        p.screenshot(path=out/f'before-v03-finale-{stage}.jpg',quality=85)
        p.close()
    browser.close()
