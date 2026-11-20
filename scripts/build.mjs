import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
await mkdir('dist/server',{recursive:true});
const modules=['engine','campaign','medals','levels','locale','save','trajectory','audio','icons','render','app'];
for(const name of modules){
  const source=await readFile('src/'+name+'.ts','utf8');
  const js=stripTypeScriptTypes(source,{mode:'strip'}).replaceAll(/from '(\.\/[^']+)\.ts'/g,"from '$1.js'");
  await writeFile('dist/'+name+'.js',js);
}
await cp('public','dist',{recursive:true});
const assets={};
for(const path of ['index.html','style.css','icon.svg',...modules.map(m=>m+'.js')]){
  assets['/'+path]=await readFile('dist/'+path,'utf8');
}
assets['/workshop.webp']=(await readFile('public/workshop.webp')).toString('base64');
const {dictionary}=await import('../src/locale.ts');
const labels=Object.fromEntries(['de','en'].map(lang=>{
  const {title,description,notFound,method}=dictionary(lang);
  return [lang,{title,description,notFound,method}];
}));
const template=await readFile('scripts/worker-template.mjs','utf8');
await writeFile('dist/server/index.js','const assets='+JSON.stringify(assets)+';\nconst labels='+JSON.stringify(labels)+';\n'+template);
console.log('Built PRALLWERK 0.4.0 with '+Object.keys(assets).length+' assets.');
