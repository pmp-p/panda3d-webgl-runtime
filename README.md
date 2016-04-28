# panda3d-webgl-runtime
binary framework for panda3d-webgl branch

built with emscripten "incoming" branch.


what's done :

 - panda / bullet / LUI

 - LZMA compress all emscripten elements

 - introduce coroutines "bluelet" for threads replacement.

 - dynamic assets loading from webservers with BrowserFS

 - 2D audio with SDL

 - provides vt100 display for consoles.


TODO:

    - panda3d.ode / panda3d.physics
    
    - websockets gateway
    
    - 3D audio : correct openal linking.
 
    - python 3 or better pypy.js

    - nuitka integration.


