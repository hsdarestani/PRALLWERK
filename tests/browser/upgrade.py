"""Play from visible controls only. Capture fair baseline comparisons and frame timings."""
import json
import math
import os
import re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE = os.getenv('PREVIEW_URL', 'http://127.0.0.1:4175').rstrip('/')
OUT = Path(os.getenv('EVIDENCE_DIR', 'evidence'))
OUT.mkdir(exist_ok=True)
results = []
errors = []

def capture(p, name):
    p.screenshot(path=OUT / (name + '.jpg'), quality=87)

def no_overflow(p):
    overflow=p.evaluate("""() => [...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,8).map(e=>[e.tagName,e.className,Math.ceil(e.getBoundingClientRect().right)])""")
    assert p.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'),(p.viewport_size,overflow)

def switch(p, lang, dialog=False):
    scope = p.locator('#modal' if dialog else 'header')
    scope.locator('[data-lang=' + lang + ']').click()
    expect(p.locator('html')).to_have_attribute('lang', 'de-DE' if lang=='de' else 'en')

def profile(p):
    return p.evaluate("JSON.parse(localStorage.getItem('prallwerk.save.v1'))")

def ready(p):
    expect(p.locator('#phase')).to_have_text(re.compile('^(Ready|Schussbereit)$'), timeout=20000)

def gesture(p, angle, touch, cancel=False):
    ready(p)
    canvas = p.locator('#game')
    canvas.scroll_into_view_if_needed()
    box = canvas.bounding_box()
    def xy(x,y):
        return (box['x'] + x*box['width']/420, box['y'] + y*box['height']/560)
    start=xy(210,475)
    end=xy(210+math.sin(angle)*164,500-math.cos(angle)*164)
    if touch:
        client=p.context.new_cdp_session(p)
        for kind,point in [('touchStart',start),('touchMove',end),('touchCancel' if cancel else 'touchEnd',None)]:
            points=[] if point is None else [{'x':point[0],'y':point[1]}]
            client.send('Input.dispatchTouchEvent',{'type':kind,'touchPoints':points})
        client.detach()
    else:
        p.mouse.move(*start); p.mouse.down(); p.mouse.move(*end,steps=4); p.mouse.up()

def faster(p):
    if '×3' in p.locator('#fire-label').inner_text():
        p.locator('#fire-btn').click()

def play(browser,lang,touch):
    width,height=(390,844) if touch else (1363,768)
    ctx=browser.new_context(viewport={'width':width,'height':height},has_touch=touch,
                            is_mobile=touch,device_scale_factor=2 if touch else 1)
    p=ctx.new_page()
    p.on('pageerror',lambda err: errors.append(str(err)))
    p.on('console',lambda msg: errors.append(msg.text) if msg.type=='error' else None)
    p.goto(BASE+'/?lang='+lang)
    expect(p.locator('#start')).to_be_visible()
    assert p.locator('.hero-art img').evaluate('img=>img.complete && img.naturalWidth>0')
    no_overflow(p)
    mode='mobile' if touch else 'desktop'
    capture(p,'after-'+mode+'-home-'+lang)
    alt='en' if lang=='de' else 'de'
    switch(p,alt); switch(p,lang)
    p.locator('#start').click()
    if touch:
        gesture(p,0,True,cancel=True)
        ready(p); assert p.locator('#shots').inner_text()=='6 / 6'
    # Collect real-animation frame intervals while the first volley flies.
    p.evaluate("""() => { window.qaFrames=[]; let previous;
        function collect(now){if(previous)qaFrames.push(now-previous);previous=now;
        if(qaFrames.length<80)requestAnimationFrame(collect)}requestAnimationFrame(collect); }""")
    gesture(p,0,touch)
    expect(p.locator('#callout')).to_be_visible(timeout=5000)
    capture(p,'after-'+mode+'-chain-'+lang)
    remaining=p.locator('#shots').inner_text()
    switch(p,alt)
    assert p.locator('#shots').inner_text()==remaining
    switch(p,lang)
    ready(p)
    gesture(p,0,touch); faster(p)
    next_stage=p.locator('#modal [data-act=next]')
    expect(next_stage).to_be_visible(timeout=20000)
    assert profile(p)['best']['1']==1700
    switch(p,alt,True);assert p.locator('.result-total').inner_text()==('1,700' if alt=='en' else '1.700')
    switch(p,lang,True);next_stage.click()
    capture(p,'after-'+mode+'-stage2-'+lang)
    for _ in range(3):
        gesture(p,.9,touch);faster(p)
    expect(p.locator('#modal .result-total')).to_be_visible(timeout=20000)
    save=profile(p);assert save['completed']==[1,2] and save['best']['2']>=2150
    capture(p,'after-'+mode+'-result-'+lang)
    timings=sorted(p.evaluate('window.qaFrames'))
    assert len(timings)==80
    results.append(dict(locale=lang,input=mode,stage1=save['best']['1'],stage2=save['best']['2'],
                        medianFrameMs=round(timings[40],2),p95FrameMs=round(timings[75],2)))
    print(results[-1],flush=True)
    p.goto(BASE+'/')
    expect(p.locator('html')).to_have_attribute('lang','de-DE' if lang=='de' else 'en')
    assert profile(p)['best']==save['best']
    ctx.close()

def controls(browser):
    p=browser.new_page(viewport={'width':1363,'height':768})
    p.on('pageerror',lambda err:errors.append(str(err)))
    p.add_init_script("""window.qaVoices=0; const original=AudioContext.prototype.createOscillator;
        AudioContext.prototype.createOscillator=function(...args){
          window.qaVoices++;return original.apply(this,args)
        };""")
    p.goto(BASE); expect(p.locator('html')).to_have_attribute('lang','de-DE')
    # Restore a real v1-shaped record, reload and inspect its user-visible continuity.
    p.evaluate("""localStorage.setItem('prallwerk.save.v1',JSON.stringify({version:1,best:{1:1700},completed:[1],unlocked:2,settings:{sound:false,motion:true,contrast:false}}))""")
    p.reload();expect(p.locator('[data-stage="2"]')).to_be_enabled()
    p.locator('header [data-act=settings]').click()
    switch(p,'en',True)
    p.locator('#opt-sound').check();p.locator('#opt-motion').uncheck();p.locator('#opt-contrast').check()
    p.locator('#volume').focus();p.keyboard.press('Home');p.keyboard.press('ArrowRight')
    expect(p.locator('#volume-val')).to_have_text('1%')
    p.locator('#modal .actions [data-act=close]').click()
    assert profile(p)['settings']==dict(sound=True,motion=False,contrast=True,volume=.01,language='en')
    assert p.locator('body').evaluate("e=>e.classList.contains('still')&&e.classList.contains('high')")
    p.wait_for_function('window.qaVoices>0')
    p.locator('#audio').click();assert not profile(p)['settings']['sound']
    p.locator('[data-act=help]:visible').first.click();expect(p.get_by_text('Read the shot')).to_be_visible()
    p.keyboard.press('Escape');p.locator('[data-act=privacy]').click()
    expect(p.locator('#dialog-title')).to_have_text('Privacy');p.keyboard.press('Escape')
    p.locator('[data-stage="1"]').click()
    p.locator('#game').focus();p.keyboard.press('ArrowLeft');p.keyboard.press('ArrowRight');p.keyboard.press('Space')
    p.keyboard.press('Escape');expect(p.locator('#dialog-title')).to_have_text('Paused')
    frozen=(p.locator('#shots').inner_text(),p.locator('#score').inner_text())
    p.wait_for_timeout(350)
    assert frozen==(p.locator('#shots').inner_text(),p.locator('#score').inner_text())
    p.locator('#modal [data-act=restart]').click()
    p.locator('#modal [data-act=cancel]').click();expect(p.locator('#dialog-title')).to_have_text('Paused')
    p.locator('#modal [data-act=restart]').click();p.locator('#modal [data-act=confirm]').click()
    ready(p);assert p.locator('#shots').inner_text()=='6 / 6'
    for _ in range(6):
        gesture(p,.15,False);faster(p)
    expect(p.locator('#dialog-title')).to_have_text('Circuit broken.',timeout=20000)
    p.locator('#modal [data-act=again]').click();ready(p)
    assert profile(p)['best']['1']==1700 and p.locator('#score').inner_text()=='0'
    p.close()

def layouts(browser):
    for w,h in [(340,680),(390,844),(768,1024),(1363,768),(844,390)]:
        p=browser.new_page(viewport={'width':w,'height':h})
        p.goto(BASE+'/?lang=de');no_overflow(p);p.locator('#start').click();no_overflow(p)
        assert p.locator('#game').bounding_box()['width']>130
        button=p.locator('#fire-btn').bounding_box()
        assert button['y']+button['height']<=h+1,(w,h,button)
        p.locator('#pause').click();no_overflow(p)
        r=p.locator('dialog').bounding_box();assert r['x']>=0 and r['x']+r['width']<=w+1
        p.close()

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True)
    for lang,touch in [('en',False),('de',True),('de',False),('en',True)]:play(browser,lang,touch)
    controls(browser);layouts(browser);browser.close()
assert not errors,errors
(OUT/'results.json').write_text(json.dumps({'runs':results,'applicationErrors':errors},indent=2))
print('Control, save migration, defeat, keyboard, settings and responsive acceptance passed.',flush=True)
