from playwright.sync_api import sync_playwright
import math, pathlib
import os
out=pathlib.Path(os.environ.get('EVIDENCE_DIR','evidence'));out.mkdir(exist_ok=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True)
 for mobile in (False,True):
  p=b.new_page(viewport={'width':390 if mobile else 1363,'height':844 if mobile else 768},has_touch=mobile,is_mobile=mobile)
  p.goto(os.environ['BASELINE_URL']);p.locator('#fire-btn').click()
  def shoot(a):
   p.wait_for_function("!document.querySelector('#fire-btn').disabled")
   r=p.locator('#game').bounding_box()
   dx=math.sin(a)*120;dy=math.cos(a)*120
   x=r['x']+r['width']*(210+dx)/420;y=r['y']+r['height']*(500-dy)/560
   if mobile:p.touchscreen.tap(x,y)
   else:p.mouse.move(r['x']+r['width']/2,y+30);p.mouse.down();p.mouse.move(x,y,steps=4);p.mouse.up()
  shoot(0);p.wait_for_timeout(640);p.screenshot(path=out/('before-mobile.jpg' if mobile else 'before-desktop.jpg'));shoot(0)
  p.locator('[data-action=next]').click(timeout=20000)
  for _ in range(3):shoot(.9)
  print('baseline',mobile,p.locator('dialog[open] .result-score').inner_text(timeout=20000),flush=True)
  p.close()
