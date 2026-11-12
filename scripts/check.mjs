import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const needed=['index.html','assets/app.mjs','assets/core.mjs','assets/store.mjs','assets/config.js','assets/icons.mjs','assets/base.css','assets/hajri.css','assets/legal.css','assets/icon.svg','assets/icon-192.png','assets/icon-512.png','manifest.webmanifest','sw.js','README.md','START-HERE.txt','ANDROID-NOTES.md','privacy.html','help.html','terms.html','about.html','contact.html','delete-data.html'];
for(const name of needed){const p=path.join(base,name);if(!fs.existsSync(p)||!fs.statSync(p).size)throw Error('Missing or empty file: '+name);}
const html=fs.readFileSync(path.join(base,'index.html'),'utf8');for(const name of ['app.mjs','base.css','hajri.css','manifest.webmanifest'])if(!html.includes(name))throw Error('Missing HTML link '+name);
const sw=fs.readFileSync(path.join(base,'sw.js'),'utf8');for(const name of ['assets/app.mjs','privacy.html','assets/hajri.css'])if(!sw.includes(name))throw Error('Missing SW asset '+name);
const manifest=JSON.parse(fs.readFileSync(path.join(base,'manifest.webmanifest'),'utf8'));if(!manifest.icons?.length)throw Error('Manifest missing icons');
console.log('PASS: all '+needed.length+' required files, links, service-worker cache and PWA manifest.');
