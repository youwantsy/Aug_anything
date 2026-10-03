const path=require('path'),assert=require('node:assert/strict');
(async()=>{
 const asar=await import('@electron/asar'),file=path.resolve(__dirname,'../dist/win-unpacked/resources/app.asar'),files=asar.listPackage(file);
 assert.ok(files.some(f=>f.endsWith(path.join('desktop','main.cjs'))));
 assert.ok(!files.some(f=>/node_modules|test-output|\.git[\\/]|tests[\\/]/.test(f)));
 const read=(...parts)=>asar.extractFile(file,path.join(...parts)).toString();
 const main=read('desktop','main.cjs'),renderer=read('desktop','generated','index.html'),storage=read('desktop','storage.cjs'),native=read('desktop','generated','native.js');
 assert.ok(main.includes('sandbox:true'));assert.ok(renderer.includes("script-src 'self'"));assert.ok(storage.includes('Export write already in progress'));assert.ok(native.includes('Windows 대화상자'));assert.ok(!main.includes("appendSwitch('remote-debugging"));
 console.log(JSON.stringify({packaged:true,files,checks:['asar resources present','no dev dependencies or test data','sandbox and CSP','latest storage guard','native copy','no default debug port']},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
