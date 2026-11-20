"""Exercise every finale using keyboard shots and the visible rune picker."""
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
    for chapter in range(1,13):
        stage=chapter*6
        lang='de' if chapter%2 else 'en'
        mobile=chapter%4 in (0,1)
        p=browser.new_page(viewport={'width':390 if mobile else 1363,'height':844 if mobile else 768},has_touch=mobile)
        p.on('pageerror',lambda e:errors.append(str(e)))
        p.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
        p.goto(base)
        # Each legacy chapter endpoint is a real migration boundary.
        old={'version':1,'completed':list(range(1,chapter*15)),'best':{'1':1700},'unlocked':chapter*15,'settings':{'language':lang}}
        raw=json.dumps(old)
        p.evaluate("(s)=>localStorage.setItem('prallwerk.save.v1',s)",raw)
        p.reload()
        assert p.locator('#chapter-picker option').count()==12
        assert p.locator('#stage-cards button').count()==6
        p.locator('#start').click()
        expect(p.locator('#stage-code')).to_contain_text(str(stage).zfill(2))
        p.screenshot(path=out/f'finale-{stage:02d}-{lang}.jpg',quality=85)
        angle=0
        for goal in routes[stage-1]:
            if isinstance(goal,str):
                rune=p.locator(f'#modal [data-rune="{goal}"]')
                expect(rune).to_be_visible(timeout=30000)
                if stage==36:
                    p.locator('#modal [data-lang=de]').click()
                    expect(p.locator('#dialog-title')).to_have_text('Rune wählen')
                    p.screenshot(path=out/'rune-picker-de.jpg',quality=88)
                    p.locator('#modal [data-lang=en]').click()
                rune.click()
                continue
            label='Salve starten' if lang=='de' else 'Fire volley'
            p.get_by_role('button',name=label,exact=True).wait_for(timeout=30000)
            p.locator('#game').focus()
            key='ArrowRight' if goal>angle else 'ArrowLeft'
            for _ in range(abs(goal-angle)):p.keyboard.press(key)
            angle=goal
            p.keyboard.press('Space')
            if '×3' in p.locator('#fire-btn').inner_text():p.locator('#fire-btn').click()
        expect(p.locator('#modal .result-total')).to_be_visible(timeout=30000)
        data=p.evaluate("JSON.parse(localStorage.getItem('prallwerk.save.v2'))")
        assert data['unlocked']==min(stage+1,72) and data['completed']==[stage]
        assert data['legacy']['best']['1']==1700
        assert p.evaluate("localStorage.getItem('prallwerk.save.v1')")==raw
        scores[stage]=data['best'][str(stage)]
        if stage<72:
            p.locator('#modal [data-act=next]').click()
            expect(p.locator('#stage-code')).to_contain_text(str(stage+1).zfill(2))
        else:
            assert p.locator('#modal [data-act=next]').count()==0
            p.screenshot(path=out/'adventure-finale-result.jpg',quality=88)
        print(stage,scores[stage],flush=True)
        p.close()
    # Unranked links must never unlock the campaign or store competitive scores.
    p=browser.new_page()
    p.goto(base+'/?practice=1&lang=en')
    for _ in range(2):
        p.get_by_role('button',name='Fire volley',exact=True).click()
        p.locator('#fire-btn').click()
    expect(p.get_by_text('Practice run · unranked')).to_be_visible(timeout=30000)
    assert p.evaluate("JSON.parse(localStorage.getItem('prallwerk.save.v2')).completed")==[]
    browser.close()
assert not errors,errors
(out/'campaign-checkpoints.json').write_text(json.dumps(scores,indent=2))
