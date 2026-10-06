import {cp,rm,readdir,readFile,writeFile,mkdir} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await cp('public','dist',{recursive:true});
const work=await readFile('components/selected-work.html','utf8'),areas=await readFile('components/service-areas.html','utf8');
for(const f of await readdir('dist'))if(f.endsWith('.html')){let s=await readFile('dist/'+f,'utf8');s=s.replace('<!-- HSV_SELECTED_WORK -->',work).replace('<!-- HSV_SERVICE_AREAS -->',areas).replaceAll('https://hsvdesign-redesign.imcamron.chatgpt.site','https://hsvdesigns.com');await writeFile('dist/'+f,s);}
for(const f of ['sitemap.xml','robots.txt']){const s=await readFile('dist/'+f,'utf8');await writeFile('dist/'+f,s.replaceAll('https://hsvdesign-redesign.imcamron.chatgpt.site','https://hsvdesigns.com'));}
console.log('Built homepage, ten service-area pages, dashboard, and static assets for hsvdesigns.com.');
