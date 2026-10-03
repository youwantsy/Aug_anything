'use strict';
const {app,BrowserWindow,Menu,protocol,net,session,ipcMain,dialog}=require('electron');
const path=require('node:path'),fs=require('node:fs/promises');
const {createStorage}=require('./storage.cjs');
protocol.registerSchemesAsPrivileged([{scheme:'aug',privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
app.enableSandbox();let win;let closing=false;
function trusted(event){return win&&!win.isDestroyed()&&event.sender===win.webContents&&event.senderFrame===win.webContents.mainFrame&&event.senderFrame.url==='aug://app/index.html'}
app.whenReady().then(async()=>{
 const resources=new Set(['index.html','styles.css','catalog.js','augmentation.js','actions.js','native.js']);
 protocol.handle('aug',async request=>{const u=new URL(request.url),name=u.pathname.slice(1);if(u.host!=='app'||u.search||u.hash||!resources.has(name))return new Response('Not found',{status:404});return new Response(await fs.readFile(path.join(__dirname,'generated',name)),{headers:{'Content-Type':name.endsWith('.html')?'text/html; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':'text/javascript; charset=utf-8'}})});
 session.defaultSession.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));session.defaultSession.setPermissionCheckHandler(()=>false);
 session.defaultSession.webRequest.onBeforeRequest((details,callback)=>callback({cancel:!['aug:','devtools:','blob:','data:'].some(p=>details.url.startsWith(p))}));
 win=new BrowserWindow({width:1440,height:1000,minWidth:390,minHeight:600,title:'Aug Anything',backgroundColor:'#f6f5f1',icon:path.join(__dirname,'icon.ico'),show:false,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,sandbox:true,nodeIntegration:false,webSecurity:true,allowRunningInsecureContent:false,webviewTag:false,spellcheck:false}});
 Menu.setApplicationMenu(null);win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',event=>event.preventDefault());win.webContents.on('will-attach-webview',event=>event.preventDefault());
 const storage=createStorage(dialog,()=>win);for(const [channel,method]of Object.entries({'images:select':'selectImages','file:save':'saveFile','project:open':'openProject','folder:begin':'beginFolder','folder:write':'writeFolder','folder:finish':'finishFolder'}))ipcMain.handle(channel,async(event,payload)=>{if(!trusted(event))return{ok:false,error:'Untrusted IPC sender'};try{return{ok:true,value:await storage[method](payload)}}catch(e){return{ok:false,error:e.code==='EEXIST'?'같은 이름의 파일이 있습니다. 새 이름으로 저장하세요.':e.message}}});
 win.once('ready-to-show',()=>win.show());win.on('closed',()=>{storage.clear();win=null});
 win.on('close',event=>{if(closing)return;event.preventDefault();dialog.showMessageBox(win,{type:'question',buttons:['앱 계속 사용','종료'],defaultId:0,cancelId:0,title:'Aug Anything 종료',message:'저장하지 않은 이미지·결과·프로젝트는 종료 시 사라집니다.',detail:'필요한 결과 또는 프로젝트 JSON을 저장한 후 종료하세요.'}).then(r=>{if(r.response===1){closing=true;win.close()}})});
 await win.loadURL('aug://app/index.html');
});
app.on('window-all-closed',()=>app.quit());
