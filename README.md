# panda3d-webgl-runtime
binary framework for panda3d-webgl branch

built with emscripten "incoming" branch.


what's done :

 - panda / bullet / LUI

 - LZMA compress all emscripten elements

 - introduce coroutines "bluelet" for threads replacement.

 - dynamic assets loading from webservers with BrowserFS

 - openal

 - provides vt100 display for consoles.
 
 - some basic shaders.

Demo: http://pmp-p.github.io/panda3d-webgl-runtime/index.html

WIP:
    - websockets gateway.
    
    - some basic shaders.

TODO:

    - panda3d.ode / panda3d.physics
    
    - python 3 or better pypy.js

    - nuitka integration.


