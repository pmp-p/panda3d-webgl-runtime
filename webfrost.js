// CONNECT TO THE CONTROL FRAME
window.parent.p3dw = window;
window.code_paste = '';

var canvas = document.querySelector('canvas');

canvas.requestPointerLock = canvas.requestPointerLock ||
           canvas.mozRequestPointerLock ||
           canvas.webkitRequestPointerLock;

document.exitPointerLock = document.exitPointerLock ||
         document.mozExitPointerLock ||
         document.webkitExitPointerLock;

canvas.onclick = function() {
    canvas.requestPointerLock();
}

// pointer lock event listeners

// Hook pointer lock state change events for different browsers
document.addEventListener('pointerlockchange', lockChangeAlert, false);
document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);

function lockChangeAlert() {
  if(document.pointerLockElement === canvas ||
  document.mozPointerLockElement === canvas ||
  document.webkitPointerLockElement === canvas) {
    console.log('The pointer lock status is now locked');
    //document.addEventListener("mousemove", canvasLoop, false);
  } else {
    console.log('The pointer lock status is now unlocked');
    //document.removeEventListener("mousemove", canvasLoop, false);
  }
}

function enterFullScreen(){
    var pointerLock = document.getElementById('pointerLock').checked;
    var wresize  = document.getElementById('resize').checked ;
    return Module.requestFullScreen(pointerLock,wresize);
}

function fileExists(urlToFile)
{
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', urlToFile, false);
    xhr.send();
    return (xhr.status == 200 );
}


console.log('Go Pods !');

var pagename = window.location.pathname.split('/').pop();

URL_BASE = window.location.href.replace("/"+pagename,"").replace("#","");

MAIN_JS   = URL_BASE + "/" + WEBFROST_EMSCRIPT;

if ( fileExists( MAIN_JS + '.js.lzma') ){
    EMSCRIPTEN_ASM = WEBFROST_EMSCRIPT+'.js.lzma';
    console.log('found LZMA Compressed engine at '+ EMSCRIPTEN_ASM);
    MEMORY_FILE = WEBFROST_EMSCRIPT+'.html.mem.lzma';
    var LZMA_ASM = new LZMA("js/lzma_worker.js");
    var LZMA_MEM = new LZMA("js/lzma_worker.js");
} else {
    EMSCRIPTEN_ASM = WEBFROST_EMSCRIPT+'.js';
    console.log('trying standard engine at '+ EMSCRIPTEN_ASM );
    MEMORY_FILE = WEBFROST_EMSCRIPT+'.html.mem';
}

var statusElement   = document.getElementById('status');
var progressElement = document.getElementById('progress');
var spinnerElement  = document.getElementById('spinner');

var ldtext = document.getElementById("ldtext");
var ldbar_asm = document.getElementById("ldbar_asm");
var ldbar_mem = document.getElementById("ldbar_mem");
var ld_asm = document.getElementById("ld_asm");
var ld_mem = document.getElementById("ld_mem");
var ldstatus = document.getElementById("ldstatus");
var ld = document.getElementById("ld");
var canvas = document.getElementById("canvas");


window.EMScript = null;
/* ============================ FS ================================= */

function setupBFS() {
  // Constructs an instance of the backed file system.
    var lsfs = new BrowserFS.FileSystem.XmlHttpRequest('directio');
    BrowserFS.initialize(lsfs);

    var BFS = new BrowserFS.EmscriptenFS();
    FS.createFolder(FS.root, '/srv', true, true);
    FS.mount(BFS, {root: '/'}, 'srv');
}


function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}


function EMSCRIPTEN_RUN(){
    sz= Math.round( (window.EMScript.length || window.EMScript.size)/1024/1024 );
    ldtext.innerHTML = 'Decompressing ...';
    ld_asm.innerHTML = 'ASM '+ Math.round(  window.ASM_SZ/ 1024 / 1024 ) + '/' + sz +' MB';
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.defer = true;
    script.src = window.URL.createObjectURL( window.EMScript );
    document.body.appendChild(script);
    console.log('Running ... ' + sz +' MB');
    ldtext.innerHTML = 'Running ...';
    ldstatus.innerHTML = 'Running';
}

function ASM_updateProgress(evt) {
    var percentComplete = ( evt.loaded /ASM_SIZE )*100;
    window.ASM_SZ = evt.loaded ;
    window.ASM_DEC = evt.loaded ;
    ldbar_asm.style.width = percentComplete + '%';
}
function MEM_updateProgress(evt) {
    var percentComplete = ( evt.loaded / MEM_SIZE )*100;
    ld_mem.innerHTML = 'MEM '+ Math.round(  window.MEM_SZ/ 1024 / 1024 ) + ' / ' +Math.round(  MEM_SIZE / 1024 / 1024 ) +' MB';
    window.MEM_SZ = evt.loaded ;
    window.MEM_DEC = evt.loaded ;
    ldbar_mem.style.width = percentComplete + '%';
}


function on_asm_progress_update(percent) {
    console.log("on_asm_progress_update : " +percent);
    window.ASM_DEC +=  (ASM_SIZE-window.ASM_SZ) /2 ;
    var percentComplete = ( window.ASM_DEC /ASM_SIZE )*100;
    if (percentComplete>100) percentComplete=100;
    ldbar_asm.style.width = percentComplete + '%';
}

function on_mem_progress_update(percent) {
    console.log("on_mem_progress_update : " +percent);

    window.MEM_DEC +=  (MEM_SIZE-window.MEM_SZ) /2 ;
    var percentComplete = ( window.MEM_DEC /MEM_SIZE )*100;
    if (percentComplete>100) percentComplete=100;
    ldbar_mem.style.width = percentComplete + '%';
}


function EMSCRIPTEN_GET() {
    console.log('EMSCRIPTEN_GET : Downloading application...');
    ldtext.innerHTML = "Downloading application...";

    var xhr = new XMLHttpRequest();
    xhr.open('GET', EMSCRIPTEN_ASM, true);
    xhr.responseType = 'arraybuffer';
    xhr.onprogress = ASM_updateProgress ;
    function on_decompress_complete(result) {
        window.EMScript = new Blob( [result] ,{type: 'text/javascript'});
        EMSCRIPTEN_RUN();
    }


    function transferComplete(evt) {
        if (xhr.status==404){
            console.log("EMSCRIPTEN_GET: File not found");
            return;
        }

        if ( endsWith(EMSCRIPTEN_ASM,'.lzma') ){
            console.log('EMSCRIPTEN_GET: inflating lzma.decompress('+EMSCRIPTEN_ASM+')')
            ldtext.innerHTML = 'Decompressing ...';
            ld_asm.innerHTML = 'ASM '+ Math.round(  window.ASM_SZ/ 1024 / 1024 ) + ' / ' + '?' +' MB';
            LZMA_ASM.decompress( new Uint8Array(xhr.response) , on_decompress_complete ,on_asm_progress_update );

        //
        } else if ( endsWith(EMSCRIPTEN_ASM,'.gz') ){
            console.log('EMSCRIPTEN_GET: inflating gzip.decompress('+EMSCRIPTEN_ASM+')')
            var gunzip = new Zlib.Gunzip(  new Uint8Array(xhr.response) );
            window.EMScript = new Blob( [gunzip.decompress()] ,{type: 'text/javascript'});
            EMSCRIPTEN_RUN();
         } else {
            console.log("EMSCRIPTEN_GET: raw js");
            window.EMScript = new Blob([xhr.response], {type: 'text/javascript'});
            EMSCRIPTEN_RUN();
         }
    }
    xhr.addEventListener("load", transferComplete);
    xhr.send();
}


/* emscripten configuration */
var Module = {

    preRun: [ setupBFS ],

    postRun: [],

    print: (function() {
        var element = document.getElementById('output');
        if (element) element.value = ''; // clear browser cache
        return function(text) {
            if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
            // These replacements are necessary if you render to raw HTML
            //text = text.replace(/&/g, "&amp;");
            //text = text.replace(/</g, "&lt;");
            //text = text.replace(/>/g, "&gt;");
            //text = text.replace('\n', '<br>', 'g');
            console.log(text);
            if (element) {
                element.value += text + "\n";
                element.scrollTop = element.scrollHeight; // focus on bottom
            }
        };
    })(),


    printErr: function(text) {
      if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
      if (0) { // XXX disabled for safety typeof dump == 'function') {
        dump(text + '\n'); // fast, straight to the real console
      } else {
        console.error(text);
      }
    },

    canvas: (function() {
      var canvas = document.getElementById('canvas');

      // As a default initial behavior, pop up an alert when webgl context is lost. To make your
      // application robust, you may want to override this behavior before shipping!
      // See http://www.khronos.org/registry/webgl/specs/latest/1.0/#5.15.2
        canvas.addEventListener("webglcontextlost",
            function(e) {
                alert('WebGL context lost. You will need to reload the page.'); e.preventDefault();
            }, false);
        return canvas;
    })(),

    setStatus: function(text) {
        if (!text) {
            ld.style.display = "none";
            canvas.style.display = "block";
            ldstatus.innerHTML = 'Ready';
        }
        ldstatus.innerHTML = text;
    },
};



function toArray(data) {
    if (typeof data === 'string') {
      var arr = new Array(data.length);
      for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
      data = arr;
    }
    return data;
}



function dirname(path){
    return path.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');
}

function basename(path){
    return path.split('/').pop();
}

function VFS_getAssetDbg(tn){
    console.log("VFS_getDbg : '"+tn+"'");
    return 1;
}

var FMap  = {};

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function VFS_getAsset(tnraw){

    if ( endsWith(tnraw,'.py')){

        if (tnraw == 'tmp/bamboo.py'){
            if (window.code_paste=='')
                return -1;
            window.code_paste='';
        } else {
            //FIXME: always reload python code add a ?v=xxxx brython like trick to get caching off
        }
    } else {
        if ( tnraw in FMap)
            return FMap[tnraw];
    }

    // console.log("VFS_getAsset : '" + tn +"'");
    tn = tnraw ;
    if (tn.charAt(0)=='/'){
        turl = URL_BASE + tn;
    } else {
        if (tn.charAt(0)=='.'){
            turl = URL_BASE + '/' +  tn;
        } else {
            tn = '/'+tn
            turl = URL_BASE + tn;
        }
    }

    turl = turl.replace('/srv/','/');

    var tD_name  = dirname(tn);
    var tB_name = basename(tn);
    console.log("VFS_getAsset : "+turl+' as '+tn);
    // progress on transfers from the server to the client (downloads)
    window.currentTransferSize = 0 ;
    window.currentTransfer = tnraw;

    var oReq = new XMLHttpRequest();

    function updateProgress (oEvent) {
      if (oEvent.lengthComputable) {
        var percentComplete = oEvent.loaded / oEvent.total;
        // ...
      } else {
        // / (window.currentTransferSize+1)
        // Unable to compute progress information since the total size is unknown
      }
    }

    function transferComplete(evt) {
        if (oReq.status==404){
            console.log("VFS_getAsset: File not found : "+ tB_name + ' in ' + (tD_name || '/') );
            window.currentTransferSize = -1 ;

        } else {
            console.log("VFS_getAsset: Transfer is complete saving : "+tB_name + " in " + ( tD_name || '/' ));
            var arraybuffer = oReq.response;
            window.currentTransferSize = arraybuffer.length;
            FS.createPath('/',tD_name,true,true);
            FS.createDataFile(tD_name,tB_name, arraybuffer, true, true);
        }
        FMap[window.currentTransfer] = window.currentTransferSize;
    }

    function transferFailed(evt) {
      console.log("VFS_getAsset: An error occurred while transferring the file : "+window.currentTransfer);
    }

    function transferCanceled(evt) {
      console.log("VFS_getAsset: transfer "+window.currentTransfer+" has been canceled by the user.");
    }
    oReq.overrideMimeType("text/plain; charset=x-user-defined");
    oReq.addEventListener("progress", updateProgress);
    oReq.addEventListener("load", transferComplete);
    oReq.addEventListener("error", transferFailed);
    oReq.addEventListener("abort", transferCanceled);

    oReq.open("GET",turl,false);
    oReq.send();

    return window.currentTransferSize;
}



// install emscripten hooks

function BR_py2js(jsdata){
    //console.log("BR_py2js = " + jsdata);

}


Module['BR_py2js'] = BR_py2js ;
Module['callfs']  = VFS_getAsset;


//***********************  EM LOADER SPARE PART ******************************************

function fk_addEventListener(evt,tgt){
    //console.log( 'fk_addEventListener '+evt+' '+tgt);
    window.MEM_OK = tgt;
}

if ( fileExists(  MEMORY_FILE ) ){
    console.log("**** memoryInitializerRequest LZMA ****");

    var fk_xhr = Object();
        fk_xhr.response = null;
        fk_xhr.status = null ;
        fk_xhr.responseType = 'arraybuffer';
        fk_xhr.addEventListener = fk_addEventListener;


    Module['memoryInitializerRequest'] = fk_xhr;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', MEMORY_FILE, true);
    xhr.responseType = 'arraybuffer';
    xhr.onprogress = MEM_updateProgress ;

    function on_mdecompress_complete(result) {
        ldtext.innerHTML = 'Running ...';
        console.log('MEM :'+result.length);
        ld_mem.innerHTML = 'MEM '+ Math.round(  window.MEM_SZ/ 1024 / 1024 ) + ' / ' + Math.round( result.length / 1024 / 1024 ) +' MB';
        ldbar_mem.style.width = '100%';
        fk_xhr.response = result;
        fk_xhr.status = 200 ;
        try { window.MEM_OK(fk_xhr); }
        catch (x) { } 
    }

    function mem_transferComplete(evt){
        ld_mem.innerHTML = 'MEM '+ Math.round(  window.MEM_SZ/ 1024 / 1024 ) + ' / ' + Math.round( MEM_SIZE/ 1024 / 1024 ) +' MB';
        ldtext.innerHTML = 'Decompressing ...';
        LZMA_MEM.decompress( new Uint8Array(xhr.response) , on_mdecompress_complete ,on_mem_progress_update );
    }

    xhr.addEventListener("load", mem_transferComplete);
    xhr.send();

} else {
    console.log("classic memoryInitializerRequest");
    var xhr = Module['memoryInitializerRequest'] = new XMLHttpRequest();
        xhr.open('GET', WEBFROST_EMSCRIPT+'.html.mem' , true);
        xhr.responseType = 'arraybuffer';
        xhr.onprogress = MEM_updateProgress;
        xhr.send(null);
}

window.onload = function() {
    try { gl = canvas.getContext("webgl"); }
    catch (x) { gl = null; }
    if (gl) {
        EMSCRIPTEN_GET();
    }
    else {
        ldtext.innerHTML = "Uh, your browser doesn't support WebGL. This application won't work.";
    }
}

window.onerror = function(event) {
  // TODO: do not warn on ok events like simulating an infinite loop or exitStatus
  ldtext.innerHTML = 'Exception thrown, see JavaScript console';

};


// END
