'use strict';
const {contextBridge,ipcRenderer}=require('electron');
const invoke=(channel,payload)=>ipcRenderer.invoke(channel,payload).then(r=>{if(!r.ok)throw Error(r.error);return r.value});
contextBridge.exposeInMainWorld('desktop',Object.freeze({
 selectImages:()=>invoke('images:select'),
 saveFile:payload=>invoke('file:save',payload),
 openProject:()=>invoke('project:open'),
 beginFolder:()=>invoke('folder:begin'),
 writeFolder:payload=>invoke('folder:write',payload),
 finishFolder:payload=>invoke('folder:finish',payload)
}));
