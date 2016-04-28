console.log('webfrost: Go Pods !            '+window.location.href.indexOf('localhost'));

//
setdefault('autorun',true);
setdefault( 'autorun', window.location.href.indexOf('localhost')!=7 );

setdefault('WEBFROST_EMSCRIPT','pandawgl');
setdefault('WEBFROST_MEM',true);
setdefault('ASM_SIZE', 34737691); // 33 * 1024 * 1024);
setdefault('MEM_SIZE', 9988933); // 10 * 1024 *1024);
setdefault('CONSOLE', false);
setdefault('hasConsole', false);
setdefault('SPLASH', false);
if (setdefault('JSDIR','./js/')){
    console.log("    *-- JSDIR set-up is required to have lzma workers");
    console.log("    *-- Javascript include dir is set to :"+JSDIR);
}

setdefault('GRAB_MOUSE',false);


//mandatory !
var ldstatus = document.getElementById("status");
var LRead = document.getElementById("linereader");

// deprecated
var em_ctrl = document.getElementById('em_ctrl');
var em_keys = document.getElementById('em_keys');
var em_char = document.getElementById("em_char");
var em_char_len_was = 0 ;
var em_char_serial = 0 ;
var em_char_last   = 0 ;

// how many lines to keep in memory for stdout console
var SCROLL_BACKLOG = 100;

// where do theses lines can display
var c_stdout = document.getElementById("c_stdout");
var c_stdout_tty = false;


// code file access cache
var FMap  = {};

// small battery status  C/charge L/oading  D/ischarge time
var Bat = { 'c':'c' , 'l':'l', 'd':'d' } ;



var Queue = function() {
    var functionSet=(function() {
        var _elements=[]; // creating a private array
        return [
            // push function
            function()
            { return _elements.push .apply(_elements,arguments); },
            // shift function
            function()
            { return _elements.shift .apply(_elements,arguments); },
            function() { return _elements.length; },
            function(n) { return _elements.length=n; }
        ];
    })();
    this.push=functionSet[0];
    this.shift=functionSet[1];
    Object.defineProperty(this,'length',{
        'get':functionSet[2],
        'set':functionSet[3],
        'writeable':true,
        'enumerable':false,
        'configurable':false
    });
    // initializing the queue with given arguments
    this.push.apply(this,arguments);
}




window.kbQ = new Queue() ;
window.Kreadlines = new Queue() ;

window.buf = Object();
window.buf.stdin = new Queue();
window.buf.stdout = new Queue();
window.buf.stderr = new Queue();
window.buf.traceback = new Queue();



window.traceback = new Queue();
window.trace = false;
//unused
window.trace_trigger = false;


var ldbar_asm = document.getElementById("ldbar_asm");
var ldbar_mem = document.getElementById("ldbar_mem");
var ld_asm = document.getElementById("ld_asm");
var ld_mem = document.getElementById("ld_mem");
var ld = document.getElementById("ld");

var canvas = document.getElementById("canvas");



var pagename = window.location.pathname.split('/').pop();

URL_BASE = window.location.href.replace("/"+pagename,"").replace("#","");

MAIN_JS   = URL_BASE + "/" + WEBFROST_EMSCRIPT;



//TODO: remove obsolete
// CONNECT TO THE CONTROL FRAME IF ANY
window.parent.p3dw = window;
window.code_paste = '';
//


window.KLock = false ;
window.KFlag = 10000;
window.KEditing = true;


window.C_bridge_push = null;
window.brdata = null ;

window.EMScript = null;


/*
=============================================================

Licenses:
    pandawgl:
    panda webgl-port : Modified BSD License
    https://github.com/panda3d/panda3d/blob/master/LICENSE

    lzma.js
    lzma_worker.js : MIT https://github.com/nmrugg/LZMA-JS

    BrowserFS:
    MIT License https://github.com/jvilk/BrowserFS

=============================================================

*/

// https://www.w3.org/TR/battery-status/
function updateBatteryStatus(battery) {
    Bat['c'] = battery.charging ? 1 : 0;
    Bat['l'] = battery.level+0.000;
    Bat['d'] = battery.dischargingTime / 60 ;
}


navigator.getBattery().then(
    function(battery) {
        // Update the battery status initially when the promise resolves ...
        updateBatteryStatus(battery);

        // .. and for any subsequent updates.
        battery.onchargingchange = function () {
          updateBatteryStatus(battery);
        };

        battery.onlevelchange = function () {
          updateBatteryStatus(battery);
        };

        battery.ondischargingtimechange = function () {
          updateBatteryStatus(battery);
        };
    }
);


function setStatus(status_text){

    if (!status_text) {
        if (window.SPLASH){
            ld.style.display = "none";
            canvas.style.display = "block";

        }
        status_text = '&gt;&gt;&gt; ';
    }
    ldstatus.innerHTML = status_text ;
}




function include(filename, filetype){
    if (filetype===null ||typeof filetype === 'undefined')
        filetype = 'js';
    if ( (filename.indexOf('.') === 0) || (filename.indexOf('/') === 0 ) ){
        //absolute !
    } else {
        //corrected
        filename = window.JSDIR + filename;
    }
    if (filetype=="js"){ //if filename is a external JavaScript file
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
        fileref.setAttribute('async',false);
    }
    else if (filetype=="css"){ //if filename is an external CSS file
        var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }   else {
        console.log("#error can't include "+filename+' as ' +filetype);
        return false;
    }
    if (typeof fileref!="undefined")
        console.log("#included "+filename+' as ' +filetype);

        document.getElementsByTagName("head")[0].appendChild(fileref)
        fileref.async = false;
        fileref.defer = false;
        //fileref.src = window.URL.createObjectURL( window.EMScript );
        document.body.appendChild(fileref);
}

//???? include('lzma.js'); // include does not work with this one ...

//include('json_parse.js'); useless

include('browserfs.p3dwgl.js');


// LIB



function getflags(e){
    flag = 10000 ;
    if (e.shiftKey)
        flag+=1000;
    if (e.ctrlKey)
        flag+=100;
    if (e.metaKey)
        flag+=10;
    if (e.altKey)
        flag+=1;
    return flag
}


function undef(e,o){
    if (o===null)
        o = window;
    try {
        e = o[e];
    } catch (x) { return true }
    if (typeof e === 'undefined' || e === null)
        return true;
    return false;
}




function setdefault(n,v,o){
    if (o == null)
        o = window;
    if (undef(n,o)){
        o[n]=v;
        console.log('  |-- ['+n+'] set to ['+ o[n]+']' );
        return true;
    }
    return false;
}

function toArray(data) {
    if (typeof data === 'string') {
      var arr = new Array(data.length);
      for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
      data = arr;
    }
    return data;
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function dirname(path){
    return path.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');
}

function basename(path){
    return path.split('/').pop();
}


function fileExists(urlToFile)
{
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', urlToFile, false);
    xhr.send();
    return (xhr.status == 200 );
}

//TODO: switch to lzma forever !

if ( fileExists( MAIN_JS + '.js.lzma') ){
    EMSCRIPTEN_ASM = WEBFROST_EMSCRIPT+'.js.lzma';
    console.log('found LZMA Compressed engine at '+ EMSCRIPTEN_ASM);
    MEMORY_FILE = WEBFROST_EMSCRIPT+'.html.mem.lzma';
    //FIXME BC
    EMBC_FILE = WEBFROST_EMSCRIPT+'.embc.lzma';
    var LZMA_ASM = new LZMA(window.JSDIR + "lzma_worker.js");
    var LZMA_MEM = new LZMA(window.JSDIR + "lzma_worker.js");
    var LZMA_EMBC= new LZMA(window.JSDIR + "lzma_worker.js");
} else {
    EMSCRIPTEN_ASM = WEBFROST_EMSCRIPT+'.js';
    console.log('trying standard engine at '+ EMSCRIPTEN_ASM );
    EMBC_FILE = WEBFROST_EMSCRIPT+'.embc';
    MEMORY_FILE = WEBFROST_EMSCRIPT+'.html.mem';
}




//======================================
console.log('Begin: canvas.pointerlock');
function canvas_grab_mouse(){
    GRAB_MOUSE = !GRAB_MOUSE;
    if ( GRAB_MOUSE ){
        canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;

        canvas.onclick = function() {
            canvas.requestPointerLock();
        }
    }

}

if (GRAB_MOUSE)
    canvas_grab_mouse();


document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;

// pointer lock event listeners
function lockChangeAlert() {
    if(document.pointerLockElement === canvas || document.mozPointerLockElement === canvas || document.webkitPointerLockElement === canvas) {
        console.log('lockChangeAlert: locked - turning bridge.stdin OFF');
        window.KLock = true;
        window.KEditing = false;
        canvas.focus();
        //if (em_char)
          //  em_char.focus();
    } else {
        console.log('lockChangeAlert: Un-locked ');
        window.KLock = false;

        if (LRead){
            console.log('lockChangeAlert->LRead - turning on bridge.stdin on');
            canvas.blur();
            window.KEditing = true;
            LRead.focus();
        }
    }
}

// Hook pointer lock state change events for different browsers
document.addEventListener('pointerlockchange', lockChangeAlert, false);
document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);

console.log('End: canvas.pointerlock');


//====================================

/*
    http://www.dbp-consulting.com/tutorials/canvas/CanvasKeyEvents.html
    http://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html

*/


// output.jsbin.com/awenaq/4
var Podium = {};
Podium.keydown = function(target,k) {
    var oEvent = document.createEvent('KeyboardEvent');

    // Chromium Hack
    Object.defineProperty(oEvent, 'keyCode', {
                get : function() {
                    return this.keyCodeVal;
                }
    });
    Object.defineProperty(oEvent, 'which', {
                get : function() {
                    return this.keyCodeVal;
                }
    });

    if (oEvent.initKeyboardEvent) {
        oEvent.initKeyboardEvent("keydown", true, true, document.defaultView, false, false, false, false, k, k);
    } else {
        oEvent.initKeyEvent("keydown", true, true, document.defaultView, false, false, false, false, k, 0);
    }

    oEvent.keyCodeVal = k;

    if (oEvent.keyCode !== k) {
        alert("keyCode mismatch " + oEvent.keyCode + "(" + oEvent.which + ")");
    }

    return target.dispatchEvent(oEvent);
}

function char_transfer(e){
    kc = e.which || e.charCode || e.keyCode ;
    //console.log("char_transfer :",kc);
    e.preventDefault();
    if (kc==13){
        window.em_char.focus();
    }
    if (kc==9){
        window.em_char.focus();
    }
    return false;
}

function getchar(e){

    kc = e.which || e.charCode || e.keyCode ;
    //e.preventDefault();
    cv = window.em_char.value ;
    em_ctrl.value=cv+" +"+kc ;
    //window.em_char.value="";

    if (kc==9){
        e.preventDefault();
        window.em_char.focus();
        return false;
    }

    if (kc==13) {
        //console.log('getchar : flush '+window.em_char.value);
        window.em_char_len_was = 0;
        window.em_char.value  = '';
        return Podium.keydown(em_ctrl,kc);

    } else {
        //ctrl chars
        if ( (kc<=0x1f) && (kc >= 0x7F || kc <= 0x9F)){

            return true;
        }
        console.log('getchar : ' + kc +' '+e.repeat);
        window.kbQ.push( getflags(e) );
        window.kbQ.push( kc );
        return Podium.keydown(em_ctrl,kc);
    }
    return false;

    //return true;
}

function canvas_move(e){
    var rect = canvas.getBoundingClientRect();
    console.log("Mouse: "+ (e.clientX- rect.left) + ' , '+ (e.clientY- rect.top) );
}

function canvas_contextmenu(e) {
    if (e.button === 2) {
        e.preventDefault();
        return false;
    }
}

function canvas_hook(){

    function handlefocusC(e){

        if(e.type=='mouseover'){
            console.log('handlefocusC(in)->canvas');
            canvas.focus();
            window.KEditing = false;
            return false;
        }

        if(e.type=='mouseout'){
            canvas.blur();
            window.KEditing = true;
            window.KLock = false ;
            if (LRead){
                console.log('handlefocusC(out)->LRead');
                LRead.focus();
            }
            return false;
        }
        return true;
    }

    canvas.contentEditable = true;
    canvas.setAttribute('tabindex','0');
    //canvas.addEventListener('mousemove',canvas_move,false);
    canvas.addEventListener('contextmenu',canvas_contextmenu,false);
    canvas.addEventListener('mouseover',handlefocusC,false);
    canvas.addEventListener('mouseout',handlefocusC,false);

}

function edit_keys(e) {
    if (e.keyCode == 9) e.preventDefault();

    //some char was added
    if (window.em_char.value.length > window.em_char_len_was ){
        window.em_char_len_was = window.em_char.value.length ;
        return false;
    }

    window.em_char_len_was = window.em_char.value.length ;
    // shorter or same it is editing !
    kc = e.which || e.charCode || e.keyCode ;
    if ( e.altKey)
        if (kc==13){
            console.log('@@@@ Alt+Enter : Full screen request repeat='+e.repeat);
            return  e.preventDefault();
        }

    console.log('flags : ' + getflags(e) +' ctrlkey : '+kc+' '+e.repeat);
    return Podium.keydown(em_ctrl,kc);
}


function getchar_hook(){
    console.log('Begin: canvas.getchar');
    //Good but need other control chars
    //window.em_ctrl.addEventListener('keydown',char_transfer,true)
    window.em_ctrl.addEventListener('keyup',char_transfer,true);

    //good but not afer fullscreen
    window.em_char.addEventListener('keypress',getchar,true);
    //window.em_char.addEventListener('keydown',edit_keys,false);
    window.em_char.addEventListener('keyup',edit_keys,false);
    console.log('End: canvas.getchar');
    return ;
}


// READLINE INTERFACE
console.log('Begin: canvas.readline');


function readline(e){
    kc = e.which || e.keyCode||e.charCode ;
    if (kc == 13){
        fc_stdout(LRead.value);
        console.log('readline('+ kc +') '+ LRead.value );
        window.Kreadlines.push(LRead.value);
        LRead.value = "";
        LRead.focus();
    }
}

if (LRead)
    LRead.onkeyup = readline ;

console.log('End: canvas.readline');


console.log('Begin: bridge');



function BR_KBR(kf){
    if  (window.kbQ.length>0){
        if (kf==1){
            kc= window.kbQ.shift();
            //console.log('sent kbd flag :' + kc );
            return kc;
        }

        if (window.kbQ.length>0){
            kc= window.kbQ.shift();
            //console.log('sent kbd char :' + String.fromCharCode(kc) );
            return kc;
        }
    }
//TODO: use various negative state to do things like pause/resume/sound on-off
// http://www.panda3d.org/forums/viewtopic.php?t=4439
    return -1;
}


// thanks to http://blog.rodneyrehm.de/archives/33-libsass.js-An-Emscripten-Experiment.html for better understanding
var C_char = function (str) {
    return allocate(intArrayFromString(str), 'i8', ALLOC_STACK); //NORMAL);
}

function BR_py2js(jsdata){
    if (window.trace_trigger)
        if (window.trace=='on')
            window.trace='off';
            // window.trace_trigger  is reset by the tracer function

    // try to parse json only if we have something to transmit to reduce load
    if (window.Kreadlines.length>0){
        try {
            //window.brdata = json_parse(jsdata);
            window.brdata = JSON.parse(jsdata);
        } catch (x) {
                console.log('BR_py2js.bridge_parse: bad json ' +jsdata);
        }

        //dont go back to json if event is not useable
        ev=false;

        // do not flush lines buffer if python/em stdin has not been consummed yet.
        if ( window.brdata['i']['si'] != 'w') {

            //if (window.Kreadlines.length>0){
                rl = window.Kreadlines.shift() ;

                if (rl.indexOf('/')==0){
                    console.log('flushed ['+rl+'] to stdin' );
                    window.brdata['c']['i'] = rl ;
                    window.brdata['c']['si'] = 'w' ;
                } else {
                    console.log('flushed interactive stdin [>>> '+rl+']' );
                    if (!c_stdout_tty)
                        fc_stdout('>>> '+ rl );
                    window.brdata['i']['i'] = rl ;
                    window.brdata['i']['si'] = 'w' ;
                }
                ev=true;
            //}
        } else {
            if ( window.brdata['c']['si'] != 'w') {
                // if interactive keyboard was not read then we are inside a running program
                rl = window.Kreadlines.shift() ;
                window.brdata['c']['i'] = rl ;
                window.brdata['c']['si'] = 'w' ;
                ev=true;
            }
        }
        if (ev){
            window.brdata['b'] = Bat ;
            window.brdata['l'] += 1 ;
            jsdata = JSON.stringify( window.brdata );
        }
    }

    if (window.C_bridge_push)
        window.C_bridge_push( C_char( jsdata ) );
    else
        console.log('bridge not up');
    return jsdata.length;
}

function brget(who,dotname){
    if (undef(dotname)){
        console.error("BR_async_call window."+dotname+' is not defined');
        return -1;
    }
// TODO handle dot path of objects.
    return window[funcname]
}

function call_later(callerid,call,data){
    result = call( data );
    console.log('callerid : '+callerid+' result = ',result );
}

function BR_async_call(dotname,jsonstruct){

    call = brget('BR_async_call',dotname)
    if (!call)
        return -1;
    windows.jscall += 1;
    callerid = 0+  windows.jscall ;

    setTimeout(call_later , 1 , call , JSON.parse(jsonstruct) );
    return callerid;
}


function BR_void(funcname){
    call = brget('BR_void',funcname)
    if (!call)
        return -1;
    call();
//TODO: return >0 == exceptions
    return 0;
}



function BR_void_parametric(dotname,jsonstruct){
/* TODO:
    https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/arguments
       - multi args call
       - object
*/
    call = brget('BR_void_parametric',dotname)
    if (!call)
        return -1;

    call(JSON.parse(jsonstruct));
//TODO: return >0 == exceptions
    return 0;
}


function BR_Link(){
    window.C_bridge_push = Module.cwrap('bridge_push', 'number', ['number']);
    console.log('webfrost: bridge up');
    setStatus('Ready');

}


console.log('End: bridge');


//================================
console.log('Begin: canvas.size');

function enterFullScreen(){
    var pointerLock = document.getElementById('pointerLock').checked;
    var wresize  = document.getElementById('resize').checked ;
    return Module.requestFullScreen(pointerLock,wresize);
}


console.log('   canvas.size [resize deferred to PostRun]');

function resize_gl(){
    var realToCSSPixels = window.devicePixelRatio || 1;

    // Lookup the size the browser is displaying the canvas in CSS pixels
    // and compute a size needed to make our drawingbuffer match it in
    // device pixels.
    var displayWidth  = Math.floor(gl.canvas.clientWidth  * realToCSSPixels);
    var displayHeight = Math.floor(gl.canvas.clientHeight * realToCSSPixels);

    // Check if the canvas is not the same size.
    if (gl.canvas.width  != displayWidth || gl.canvas.height != displayHeight) {
        // Make the canvas the same size
        gl.canvas.width  = displayWidth;
        gl.canvas.height = displayHeight;

        // Set the viewport to match
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        console.log('   canvas.size [resized]');

      return true;
    }
    console.log('   canvas.size [ *NOT* resized]');
    return false;
}

function glcontextlost(e){
    alert('WebGL context lost. You will need to reload the page.');
    e.preventDefault();
}

canvas.addEventListener("webglcontextlost",glcontextlost,false);

console.log('End: canvas.size');



//==================================== emscripten ===============================

function BR_set(key,value){
        window[key]=value;
    console.log('window.'+key+' <= '+value );
    return 'ok';
}

// emscripten - stdout / stderr

function BR_trace(ft,set_it){
    if (set_it)
        window.trace = (window.trace =='on') ;

    if (window.trace)
        console.log('trace(on)')
    else
        console.log('trace(off)')
}


function fc_stderr(text){
    if (arguments.length > 1)
        text = Array.prototype.slice.call(arguments).join(' ');
    if (text){
        /*
        lt = text.split('\n');
        for(i=0;i<lt.length;i++){
            if (window.trace)
                window.traceback.push( lt );

        }
        */
        if (window.trace=='on')
            buf.traceback.push( text );
        console.error(text);
    }
}

function fc_stdout(text){
    if (arguments.length > 1)
        text = Array.prototype.slice.call(arguments).join(' ');
    if (text){
        try {
            lt = text.split('\n');
        } catch(x) {
            return;
        }
        if (window.trace=='on')
            for(i=0;i<lt.length;i++)
                buf.traceback.push( lt[i] );

        if (c_stdout && c_stdout_tty){
            last_line = 0 ;
            if (lt.length>1){
                for(i=0;i<lt.length-1;i++)
                    c_stdout.print(lt[i])
                last_line = lt.length-1;
            } else
                last_line = 0;

            if (lt[last_line]!='>>> ')
                c_stdout.print(lt[last_line])
            else
                c_stdout.write(lt[last_line])

        }
        console.log(text);
    }
}


// emscripten - filesystem
function setupENV(){
    /* NO ERR , but not working
*/
    FS.init(); //em_c_stdin, em_c_stdout, em_c_stderr );
    ENV['OS'] = 'JS';
    ENV['PYTHONHOME'] = '/';

}

function setupBFS() {
  // Constructs an instance of the backed file system.
    var lsfs = new BrowserFS.FileSystem.XmlHttpRequest('directio');
    BrowserFS.initialize(lsfs);

    var BFS = new BrowserFS.EmscriptenFS();

    FS.createFolder(FS.root, '/srv', true, true);
    FS.mount(BFS, {root: '/'}, 'srv');
}




function VFS_getAssetDbg(tn){
    console.log("VFS_getDbg : '"+tn+"'");
    return 1;
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


// emscripten - loader


function EMSCRIPTEN_RUN(){
    if (window.SPLASH) {
        sz= Math.round( (window.EMScript.length || window.EMScript.size)/1024/1024 );
        setStatus('Decompressing ...');
        ld_asm.innerHTML = 'ASM '+ Math.round(  window.ASM_SZ/ 1024 / 1024 ) + '/' + sz +' MB';
    }
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.defer = true;
    script.src = window.URL.createObjectURL( window.EMScript );
    document.body.appendChild(script);

    if (window.SPLASH)
        console.log('Running .. ' + sz +' MB');
    else
        console.log('Running ..');

    setStatus('Running ...');
}

function ASM_updateProgress(evt) {
    if (!window.SPLASH) return;
    var percentComplete = ( evt.loaded /ASM_SIZE )*100;
    window.ASM_SZ = evt.loaded ;
    window.ASM_DEC = evt.loaded ;
    ldbar_asm.style.width = percentComplete + '%';
}
function MEM_updateProgress(evt) {
    if (!window.SPLASH) return;
    var percentComplete = ( evt.loaded / MEM_SIZE )*100;
    ld_mem.innerHTML = 'MEM '+ Math.round(  window.MEM_SZ/ 1024 / 1024 ) + ' / ' +Math.round(  MEM_SIZE / 1024 / 1024 ) +' MB';
    window.MEM_SZ = evt.loaded ;
    window.MEM_DEC = evt.loaded ;
    ldbar_mem.style.width = percentComplete + '%';
}


function on_asm_progress_update(percent) {
    console.log("on_asm_progress_update : " +percent);
    if (!window.SPLASH) return;

    window.ASM_DEC +=  (ASM_SIZE-window.ASM_SZ) /2 ;
    var percentComplete = ( window.ASM_DEC /ASM_SIZE )*100;
    if (percentComplete>100) percentComplete=100;
    ldbar_asm.style.width = percentComplete + '%';
}

function on_mem_progress_update(percent) {
    console.log("on_mem_progress_update : " +percent);
    if (!window.SPLASH) return;
    window.MEM_DEC +=  (MEM_SIZE-window.MEM_SZ) /2 ;
    var percentComplete = ( window.MEM_DEC /MEM_SIZE )*100;
    if (percentComplete>100) percentComplete=100;
    ldbar_mem.style.width = percentComplete + '%';
}

function on_embc_progress_update(percent) {
    console.log("on_embc_progress_update : " +percent);
    if (!window.SPLASH) return;
}




function EMSCRIPTEN_GET() {
    console.log('EMSCRIPTEN_GET : Downloading application...');
    setStatus("Downloading application...");


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
            setStatus( 'Decompressing ...' );
            if (window.SPLASH)
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




/*                          emscripten configuration


    =============================================================================================
    =============================================================================================
    =============================================================================================
    =============================================================================================
    =============================================================================================

*/

var Module = {

    preRun: [ setupENV , setupBFS ],
//getchar_hook,
    postRun: [ BR_Link , canvas_hook, resize_gl ],

    print: fc_stdout,

    printErr: fc_stderr,

    canvas: canvas ,
    setStatus: setStatus,
    keyboardListeningElement : canvas, //em_ctrl ,
    doNotCaptureKeyboard : false,
    BR_eval :   function (jscmd){
                    eval( jscmd ) ;
                },

};



// install emscripten hooks

Module['BR_py2js']= BR_py2js ;
Module['BR_KBR']  = BR_KBR ;
Module['BR_trace']= BR_trace ;
Module['BR_set']  = BR_set;
Module['callfs']  = VFS_getAsset;
Module['BR_void']  = BR_void ;


/*


    =============================================================================================
    =============================================================================================
    =============================================================================================
    =============================================================================================
    =============================================================================================




*/
//*********************** EM BC loader ***************************************************

function BC_GET(){
    function copyLzmaDec(src)  {
        //var dst = new ArrayBuffer(src.byteLength);
        var dst = new ArrayBuffer(src.length);
        new Uint8Array(dst).set(new Uint8Array(src));
        return dst;
    }

    if ( fileExists( EMBC_FILE ) ){
        console.log("**** emterpreterFileRequest LZMA ****")
        function on_embc_decompress_complete(bcresult) {
            Module.emterpreterFile =  copyLzmaDec(bcresult);
            EMSCRIPTEN_GET();
        }
        function embc_transferComplete(evt){
            console.log( 'Decompressing EMBC ...');
            LZMA_ASM.decompress( new Uint8Array(xhr.response)  , on_embc_decompress_complete ,on_embc_progress_update );
        }
        var xhr = new XMLHttpRequest();
            xhr.open('GET', EMBC_FILE, true);
            xhr.responseType = 'arraybuffer';
            xhr.onload =  embc_transferComplete;
            xhr.send(null);
        return true;
    } else {
        //fallback
        EMBC_FILE = WEBFROST_EMSCRIPT + '.embc';
    }
    if ( fileExists( EMBC_FILE ) ){
        console.log("**** classic emterpreterFileRequest ****")
        var xhr = new XMLHttpRequest();
            xhr.open('GET', EMBC_FILE , true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function() {
                    console.log('EMBC: '+resp.length);
                    Module.emterpreterFile = xhr.response;
                    EMSCRIPTEN_GET();
                };
            xhr.send(null);
    } else {
        console.log('@@@@@@@@@@ emterpreting disabled @@@@@@@@@');
        EMSCRIPTEN_GET();
    }
}


//***********************  EM LOADER SPARE PART ******************************************
if (autorun){
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
        xhr.open('GET', MEMORY_FILE); //, true);
        xhr.responseType = 'arraybuffer';
        xhr.onprogress = MEM_updateProgress ;

        function on_mdecompress_complete(result) {
            setStatus('Running ....');
            console.log('MEM : '+result.length);

            if (window.SPLASH){
                ld_mem.innerHTML = 'MEM '+ Math.round(  window.MEM_SZ/ 1024 / 1024 ) + ' / ' + Math.round( result.length / 1024 / 1024 ) +' MB';
                ldbar_mem.style.width = '100%';
            }

            fk_xhr.response = result;
            fk_xhr.status = 200 ;
            try { window.MEM_OK(fk_xhr); }
            catch (x) { }

        }

        function mem_transferComplete(evt){
            if (window.SPLASH)
                ld_mem.innerHTML = 'MEM '+ Math.round(  window.MEM_SZ/ 1024 / 1024 ) + ' / ' + Math.round( MEM_SIZE/ 1024 / 1024 ) +' MB';
            console.log( 'Decompressing MEM ...');
            LZMA_MEM.decompress( new Uint8Array(xhr.response) , on_mdecompress_complete ,on_mem_progress_update );
        }

        xhr.addEventListener("load", mem_transferComplete);
        xhr.send(null);

    } else {

        console.log("classic memoryInitializerRequest");
        var xhr = Module['memoryInitializerRequest'] = new XMLHttpRequest();
            xhr.open('GET', WEBFROST_EMSCRIPT+'.html.mem' , true);
            xhr.responseType = 'arraybuffer';
            xhr.onprogress = MEM_updateProgress;
            xhr.send(null);
    }
} else {
    console.log('*************** AUTOLOAD:MEM IS OFF ***********');
}

window.onload = function() {
    try { gl = canvas.getContext("webgl"); }
    catch (x) { gl = null; }
    if (gl) {
        if (autorun)
            BC_GET();
            //EMSCRIPTEN_GET();
        else {
            console.log('*************** AUTORUN:JS IS OFF ***********');
            setStatus('dev>');
        }
    }
    else {
        setStatus("Uh, your browser doesn't support WebGL. This application won't work.");
    }
}

window.onerror = function(event) {
  // TODO: do not warn on ok events like simulating an infinite loop or exitStatus
  setStatus('Exception thrown, see JavaScript console');

};


console.log('End: webfrost, expect some freezing in the browser');
// END
