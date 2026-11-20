"""Open saved campaign checkpoints and play the actual boards through the keyboard."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

base=os.environ.get('PREVIEW_URL','http://127.0.0.1:4175')
routes=json.loads(Path('tests/campaign-routes.json').read_text())
out=Path('evidence')
out.mkdir(exist_ok=True)
scores={}
errors=[]
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=os.getenv('CHROME_BIN') or None)
    for initial in (3,15,90,179):
        lang='de' if initial in (15,179) else 'en'
        p=browser.new_page(viewport={'width':390 if lang=='de' else 1363,'height':844 if lang=='de' else 768})
        p.on('pageerror',lambda e: errors.append(str(e)))
        p.goto(base+'/?lang='+lang)
        value={'version':1,'completed':list(range(1,initial)),'unlocked':initial if initial>3 else 2,'best':{'1':1700,'2':2150}}
        p.evaluate("(s)=>localStorage.setItem('prallwerk.save.v1',JSON.stringify(s))",value)
        p.reload()
        chapters=p.locator('#chapter-picker select')
        assert chapters.locator('option').count()==12
        chapters.select_option('11')
        expect(p.locator('#stage-cards [data-stage="180"]')).to_be_disabled()
        p.locator('#start').click()
        stages=(179,180) if initial==179 else (initial,)
        for id in stages:
            expect(p.locator('#stage-code')).to_contain_text(str(id).zfill(2))
            p.screenshot(path=out/f'campaign-stage-{id}.jpg',quality=88)
            angle=0
            for goal in routes[id-1]:
                fire=p.get_by_role('button',name='Salve starten' if lang=='de' else 'Fire volley',exact=True)
                fire.wait_for(timeout=30000)
                board=p.locator('#game');board.focus()
                key='ArrowRight' if goal>angle else 'ArrowLeft'
                for _ in range(abs(goal-angle)):p.keyboard.press(key)
                angle=goal
                p.keyboard.press('Space')
                fast=p.locator('#fire-btn')
                if '×3' in fast.inner_text():fast.click()
            expect(p.locator('#modal .result-total')).to_be_visible(timeout=30000)
            data=p.evaluate("JSON.parse(localStorage.getItem('prallwerk.save.v1'))")
            assert data['unlocked']==min(id+1,180) and id in data['completed']
            assert data['best']['1']==1700
            scores[id]=data['best'][str(id)]
            if id<180:
                p.locator('#modal [data-act=next]').click()
                expect(p.locator('#stage-code')).to_contain_text(str(id+1).zfill(2))
            else:
                expect(p.locator('#dialog-title')).to_have_text('Alle 180 Level geschafft!')
                assert p.locator('#modal [data-act=next]').count()==0
                p.screenshot(path=out/'campaign-complete.jpg',quality=88)
        p.close()
    browser.close()
assert not errors,errors
(out/'campaign-checkpoints.json').write_text(json.dumps(scores,indent=2))
print('Browser victories:',scores)
