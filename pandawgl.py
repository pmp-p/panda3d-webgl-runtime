# Author: PmpP
from __future__ import with_statement
from __future__ import print_function
from __future__ import absolute_import
#this one nukes sys.path ! => from __future__ import unicode_literals

clear_str = ''.join( map(chr, [27, 91, 72, 27, 91, 50, 74] ) )


global BLACKLIST
BLACKLIST = []
def BL(modname):
    if not modname in BLACKLIST:
        print("blacklist += %s " % modname)
        BLACKLIST.append(modname)

try:
    import functools
    import _functools
    from future.utils import raise_with_traceback
except:
    print("no : future")

global PY2,PY3,__NATIVE__,__P3D_RUN__

import site
import io, sys, os
try:
    import __builtin__
    PY2=True
    PY3=False
except:
    PY3=True
    PY2=False
    import builtins
    builtins.__builtin__ = builtins

import inspect, traceback
import time
import math, random

#showbase
import imp, importlib, atexit, profile, pstats

import logging
import queue

# https://bugs.python.org/issue9329 freeze tool cannot handle JSON module properly ...
from encodings import hex_codec

import struct, re, json


import gettext
kwargs={}
if sys.version_info[0] < 3:
    kwargs= {'unicode' : True }

gettext.install('pandawgl', **kwargs)


__builtin__.__NATIVE__ =  os.environ['LOGNAME'] != 'web_user'
__builtin__.__P3D_RUN__ = []

LT = time.time()

if not __NATIVE__:
    print(sys.version)
    print("Time :",LT)
    print("================ environ =================")
    for k in os.environ.keys():
        print(k,os.environ[k])
    print("================= /environ ===============")

    assets='/rsr'

else:
    assets= '%s/rsr'% os.getcwd()


try:
    import new
except:
    print("no : new")

try:
    import curses
except:
    print("no : curses")



#try:import prompt_toolkit
#except:print("no : prompt_toolkit")

#from prompt_toolkit.application import Application
#from prompt_toolkit.interface import CommandLineInterface
#from prompt_toolkit.layout import Window
#from prompt_toolkit.layout.controls import BufferControl
#from prompt_toolkit.layout.processors import BeforeInput
#from prompt_toolkit.shortcuts import create_eventloop
#from prompt_toolkit.token import Token
#from prompt_toolkit.utils import Callback



class P3dwglrt:
    native =  __NATIVE__
    LT = LT
    NT = 0
    TICK = 0
    PASTE = '/tmp/bamboo.py'
    EXEC_ONCE = '/index.py'
    TIMER = 1
    INTV = 60
    NOEXIT = 60 * 5 # kill the script after x minutes

    BR_STATUS = -1
    BR_RUN = True
    EXEC = False;

    PASS = 0

    prefix = '/srv'

    readlines = []

    prompt = []

    prompter=">>> "

if not __NATIVE__:
    #go to root of webroot as emscripten is by default in /home/web_user
    while sys.path:
        sys.path.pop()
    os.chdir(P3dwglrt.prefix)

# dangerous with relative import ?
#    BL('signal')
#    BL('threading')
#    BL('thread')
#    BL('socket')


sys.path.insert(0,os.getcwd())


def safe_err(s):
    sys.stderr.write(s+"\n")

def ErrorReport(stage='pandawgl',error='',data='',orig='',logger=None):
    error=str(error)
    if error.find(':')>=0:
        errc,error =error.split(':',1)
    else:
        errc='?'
    safe_err( "\n\033[31m    \\\\\\\\\\\\\\\\\ [ %s , %s ] //////////////\n" %(stage,errc) )
    safe_err( "   ************[ %s ]**********\n"% error )
    safe_err( traceback.format_exc() )
    safe_err("%s%s%s"%("    ========================= END ERROR (WebFrost) =====================\033[0m",'',"\n"*2))
    return False




import panda3d
import panda3d.core

print( _("adding assets path '%s' to panda3d ") % assets )
panda3d.core.getModelPath().appendDirectory(assets)

print(_("setting default .bam extension"))

#wp =  panda3d.core.WindowProperties.getDefault()
#wp.clearSize()
#panda3d.core.WindowProperties.setDefault(wp);

#panda3d.core.loadPrcFileData('','win-size 853 480')

panda3d.core.loadPrcFileData('','default-model-extension .bam')
panda3d.core.loadPrcFileData('','show-frame-rate-meter #t')
panda3d.core.loadPrcFileData('','want-dev #f')
panda3d.core.loadPrcFileData('','textures-power-2 1')


import panda3d.direct

#BL = blacklist

import direct

try:
    import direct.actor
    import direct.actor.Actor
except:
    print("no : direct.actor")

try:
    import direct.showbase
    import direct.showbase.Loader
    import direct.showbase.ShowBase
except:
    print("no : direct.showbase")

try:
    import direct.task
    import direct.task.Task
except:
    print("no : direct.task")

try:
    import direct.gui
    BL('direct.gui.string')
    BL('direct.gui.encodings')
    import direct.gui.OnscreenText
    import direct.gui.OnscreenImage
except:
    print("no : direct.gui")

try:
    import direct.interval
    BL('import direct.interval.types')
    import direct.interval.Interval
except:
    print("no : direct.interval")

try:
    import direct.directtools
    BL('direct.directtools.panda3d')
except: print("no : direct.directtools")

try:
    import direct.fsm
    BL('direct.fsm.direct')
except: print("no : direct.fsm")

try: import direct.directnotify
except: print("no : direct.directnotify")

try: import direct.directutil
except: print("no : direct.directutil")

try: import direct.directbase
     #would open a window on native
     #BL import direct.directbase.DirectStart
except: print("no : direct.directbase")

try: import direct.stdpy.file
except: print("no : direct.stdpy")

#soon needed stuff
try:
    import cPickle as pickle
except:
    print( "no: cPickle" )
    try:
        import pickle
    except:
        print( "no: pickle" )

try:import threading
except:print("no: threading")

try:import socket
except:print("no: socket")


#==================== extra stuff ====================
print("="*79)
if 1:
    print("import test.pystone")
    import test.pystone

if 0:
    print("="*82)
    import direct.directbase.DirectStart
    print("******* beware Showbase instance !!!! *********")

print("="*80)



try:import panda3d.lui
except Exception as error:
    ErrorReport("panda3d.lui",error)


try: import panda3d.physics
except: print("no : panda3d.physics")


try: import panda3d.ode
except: print("no : panda3d.ode")

try: import panda3d.bullet
except: print("no : panda3d.bullet")

from direct.task.TaskManagerGlobal import taskMgr




def feedOnce(pyfn):
    print( "-------------------------------- chewing Once %s -------------------------" % pyfn)
    P3dwglrt.EXEC = True
    autobound =  sys.modules.has_key('plugbase')
    try:
        execfile( pyfn , globals() )
    except Exception as error:
        ErrorReport("ouch, my teeth",error)
        P3dwglrt.EXEC = False
    finally:
        os.unlink(pyfn)
    if not autobound :
        if ('plugbase' in sys.modules):
            print("found plugbase")
            print(" ** plugbase auto bind on __main__.update() ** ")
            try:
                pluginGlobalManager.eventManager.bind(sys.modules['__main__'], 'on_' )
                __P3D_RUN__.append(sys.modules['__main__'].update)
            except:
                print('failed')
    print( "---------------------------------- maybe fed Once -------------------------------")
    return direct.task.Task.Task.cont


def feedMe(pyfn):
    #global PY2,PY3,__P3D_RUN__
    print( "-------------------------------- chewing %s -------------------------" % pyfn)
    try:
        P3dwglrt.EXEC = True
        if PY2:
            execfile( pyfn , globals(), globals())
        elif PY3:
            with open( pyfn ) as sourceCode:
                exec(sourceCode.read(),globals(), globals() )
    except Exception as error:
        P3dwglrt.EXEC = False
        ErrorReport("ouch, my teeth",error)

    if ('plugbase' in sys.modules):
        print("found plugbase")
        themain = sys.modules['__main__']
        if hasattr(themain, 'update'):
            print(" ** plugbase auto bind on __main__.update() ** ")
            pluginGlobalManager.eventManager.bind(themain, 'on_' )
            __P3D_RUN__.append(themain.update)
        else:
            print("\n\n\n*** pluginGlobalManager need a .update entry to you main code ! ****\n\n\n")


    print( "---------------------------------- maybe fed -------------------------------")
    return direct.task.Task.Task.cont

def feedLoop(task):
    global vfs
    P3dwglrt.PASS += 1
    P3dwglrt.NT = time.time()

    if P3dwglrt.BR_RUN:
        evc=False
        jsd=None
        try:
            jsd = json.loads( panda3d.py2js )

            #somethin new on js bridge
            if P3dwglrt.BR_STATUS<jsd['l']:
                P3dwglrt.BR_STATUS = jsd['l']

                if 'w' in jsd['c'].get('si',''):
                    print(u'stdin [%s]'%jsd['c']['i'] )
                    rl = jsd['c'].pop('i')
                    if rl[0]=='/':
                        rl=rl[1:]
                    P3dwglrt.readlines.append( rl )
                    jsd['c']['si']=u'r'
                    #mark consummed
                    evc=True

                elif 'w' in jsd['i'].get('si',''):
                    #print(u'interactive prompt got [%s]' % jsd['i']['i'] )
                    P3dwglrt.prompt.append( jsd['i'].pop('i') )
                    jsd['i']['si']=u'r'
                    #mark consummed
                    evc=True
            else:
                evc=True

        except Exception as error:
            P3dwglrt.BR_RUN=False
            ErrorReport("pandawgl.feedLoop bridge has burned, turning it off",error)
            print(jsd)

        finally:
            #dump if unknow
            if not evc and jsd is not None:
                print(jsd)

            panda3d.py2js = json.dumps( jsd )


        if len( P3dwglrt.prompt ):
            exline = P3dwglrt.prompt.pop(0)
            autobound =  sys.modules.has_key('plugbase')
            sys.stderr.write("---------------- interact --------------\n")
            if EmModule.used:
                try:EmModule.wsetattr('trace','on')
                except:pass

            try:
                exec( exline , globals() )
            except Exception as error:
                ErrorReport("pandawgl.interactive",error)
            finally:
                if EmModule.used:
                    try:EmModule.wsetattr('trace','off')
                    except:pass
                print(P3dwglrt.prompter)
                sys.stderr.write("---------------- /interact --------------\n")

            if not autobound:
                if ('plugbase' in sys.modules):
                    sys.stderr.write("found plugbase")
                    themain = sys.modules['__main__']
                    if hasattr(themain, 'update'):
                        sys.stderr.write(" ** plugbase auto bind on __main__.update() ** ")
                        pluginGlobalManager.eventManager.bind(themain, 'on_' )
                        __P3D_RUN__.append(themain.update)
                    else:
                        sys.stderr.write('not bound')

    if vfs.exists( P3dwglrt.PASTE ) :
        return feedOnce(P3dwglrt.PASTE )

    elif P3dwglrt.EXEC_ONCE:

        ec = direct.task.Task.Task.cont
        if vfs.exists( P3dwglrt.EXEC_ONCE ):
            print('P3dwglrt.EXEC_ONCE',P3dwglrt.EXEC_ONCE)
            ec = feedMe( P3dwglrt.EXEC_ONCE )
        else:
            print("no index.py found, entering interactive mode")
            print(P3dwglrt.prompter)

        P3dwglrt.EXEC_ONCE = None
        return ec

    elif (P3dwglrt.NT - P3dwglrt.LT) > P3dwglrt.TIMER:
        P3dwglrt.LT = P3dwglrt.NT
        P3dwglrt.NOEXIT -=1
        P3dwglrt.TICK +=1

        if P3dwglrt.NOEXIT < 0:
            if __P3D_RUN__:
                pass
                #print("dead from hunger, #FIXME try to kill script to save energy !")
                #P3dwglrt.TASK=0
                #return direct.task.Task.Task.exit

    if P3dwglrt.TICK > P3dwglrt.INTV:
        if not P3dwglrt.BR_RUN:
            pass
            #print("%s: No %s bamboo pasted code found to eat, waiting ..." % ( P3dwglrt.NOEXIT , P3dwglrt.PASTE ) )
        P3dwglrt.TICK=0

    try:
        pluginGlobalManager
        runloop =True
    except:
        runloop =False

    if runloop:
        pluginGlobalManager.update()

    try:
        #need usleep() there !
        if __NATIVE__:
            time.sleep(.001)
        if __P3D_RUN__:
            for task in __P3D_RUN__:
                if task() == direct.task.Task.Task.exit:
                    P3dwglrt.TASK=0
                    return direct.task.Task.Task.exit
    except Exception as error:
        ErrorReport("pandawgl.feedLoop",error)
    finally:
        return direct.task.Task.Task.cont

vfs = panda3d.core.VirtualFileSystem.getGlobalPtr()

feedTask = taskMgr.add(feedLoop, "feedLoop")

P3dwglrt.TASK = len( direct.task.TaskManagerGlobal.taskMgr.getTasks() )

if not __NATIVE__:
    # Replacement for __import__()
    def import_hook(name, globals=None, locals=None, fromlist=None, level=-1):
        parent = determine_parent(globals)
        q, tail = find_head_package(parent, name)
        m = load_tail(q, tail)
        if not fromlist:
            return q
        if hasattr(m, "__path__"):
            ensure_fromlist(m, fromlist)
        return m

    def determine_parent(globals):
        if PY2:
            if not globals or  not globals.has_key("__name__"):
                return None
        elif PY3:
            if not globals or  not (  "__name__"in globals ):
                return None


        pname = globals['__name__']
        if globals.has_key("__path__"):
            parent = sys.modules[pname]
            assert globals is parent.__dict__
            return parent
        if '.' in pname:
            i = pname.rfind('.')
            pname = pname[:i]
            parent = sys.modules[pname]
            assert parent.__name__ == pname
            return parent
        return None

    def find_head_package(parent, name):
        if '.' in name:
            i = name.find('.')
            head = name[:i]
            tail = name[i+1:]
        else:
            head = name
            tail = ""
        if parent:
            qname = "%s.%s" % (parent.__name__, head)
        else:
            qname = head
        q = import_module(head, qname, parent)
        if q: return q, tail
        if parent:
            qname = head
            parent = None
            q = import_module(head, qname, parent)
            if q: return q, tail
            #raise ImportError, "No module named " + qname
            raise ImportError( "No module named " + qname )

    def load_tail(q, tail):
        m = q
        while tail:
            i = tail.find('.')
            if i < 0: i = len(tail)
            head, tail = tail[:i], tail[i+1:]
            mname = "%s.%s" % (m.__name__, head)
            m = import_module(head, mname, m)
            if not m:
                #raise ImportError, "No module named " + mname
                raise ImportError( "No module named " + mname )
        return m

    def ensure_fromlist(m, fromlist, recursive=0):
        for sub in fromlist:
            if sub == "*":
                if not recursive:
                    try:
                        all = m.__all__
                    except AttributeError:
                        pass
                    else:
                        ensure_fromlist(m, all, 1)
                continue
            if sub != "*" and not hasattr(m, sub):
                subname = "%s.%s" % (m.__name__, sub)
                submod = import_module(sub, subname, m)
                if not submod:
                    #raise ImportError, "No module named " + subname
                    raise ImportError( "No module named " + subname )


    def MLoad(fullname,pkg=False):
        if pkg:
            source= '%s/%s/__init__.py' % (P3dwglrt.prefix, fullname.replace('.','/') )
        else:
            source= '%s/%s.py' % (P3dwglrt.prefix, fullname.replace('.','/') )

        mod=imp.load_source(fullname, source )
        if '.' in fullname:
            pn, cn = fullname.rsplit('.', 1)
            #print("\tMLoad Parent-child set %s as %s in %s " % (mod,cn,pn) )
            setattr( sys.modules[pn], cn, sys.modules[fullname] )
            #print(sys.modules[pn],getattr(sys.modules[pn],cn))
        return mod


    def import_module(partname, fqname, parent):
        if fqname in BLACKLIST:
            return None
        try:
            return sys.modules[fqname]
        except KeyError:
            pass
        m = None
        if parent and not hasattr(parent,'__path__'):
            #print("510: AttributeError __path__ for",parent)
            thepath=repr(parent)
            #print(thepath)
            thepath=thepath.split("'")[3]
            #print(thepath)
            thepath=thepath.rsplit('/',1)[0]
            #print(thepath)
            setattr(parent,'__path__',thepath )

        try:
            fp, pathname, stuff = imp.find_module(partname, parent and parent.__path__)
        except ImportError:
            if not fqname.startswith('plugbase'):
                print("608: NO FALLBACK module",fqname)
                return None
            if os.path.isfile('%s/%s/__init__.py' %  (P3dwglrt.prefix,fqname.replace('.','/') ) ):
                #print("FALLBACK pkg",fqname)
                m = MLoad(fqname,True)
            elif os.path.isfile('%s/%s.py' %  (P3dwglrt.prefix,fqname.replace('.','/') ) ):
                m = MLoad(fqname)
            if m is None:
                return None
        if m is None:
            try:
                m = imp.load_module(fqname, fp, pathname, stuff)
            finally:
                if fp: fp.close()
        elif parent:
            setattr(parent, partname, m)

        return m


    # Replacement for reload()
    def reload_hook(module):
        name = module.__name__
        if '.' not in name:
            return import_module(name, name, None)
        i = name.rfind('.')
        pname = name[:i]
        parent = sys.modules[pname]
        return import_module(name[i+1:], name, parent)


    # Save the original hooks
    original_import = __builtin__.__import__
    original_reload = __builtin__.reload

    # Now install our hooks
    __builtin__.__import__ = import_hook
    __builtin__.reload = reload_hook

    __builtin__.P3dwglrt = P3dwglrt
    __builtin__.fopen = direct.stdpy.file.open

    run_index=False
    print("webfrost ready")

    panda3d.py2js = json.dumps( {
            "l" : 0 ,
            "c" : {
                "i" : '', "si" : 'r' ,
                "o" : '', "so" : '' ,
                },
            "i" : {
                "i" : '', "si" : 'r',
                "o" : '', "so" : '' ,
                },
            "s" : [ 7000 ] ,
            7000: {
                "i":'', "si": '',
                "o":'', "so": '',
            },
        })


    import EmModule
    print( EmModule )
    print( EmModule.greet() )
    EmModule.used = True
    #EmModule.run_once()

elif __NATIVE__:
    class EmModule:
        used = False


    P3dwglrt.BR_RUN = False
    print('Native in [ %s ]' % os.getcwd() )
    print("nofrost on")
    if not sys.argv[-1].count('pandawgl'):
        if PY2:
            __builtin__.fopen = file
            P3dwglrt.EXEC_ONCE = sys.argv[-1]
            if vfs.exists( P3dwglrt.EXEC_ONCE ):
                print("Main script set to [ %s ]" % P3dwglrt.EXEC_ONCE )
                while P3dwglrt.TASK:
                    direct.task.TaskManagerGlobal.taskMgr.step()
                    time.sleep(0.001)
                print('done')
                sys.exit(0)
            else:
                print("Not found [ %s ]" % P3dwglrt.EXEC_ONCE )

        elif PY3:
            __builtins__.fopen = open
            if 1:
                P3dwglrt.EXEC_ONCE = sys.argv[-1]
            else:
                import index
                index.direct = direct
                pluginGlobalManager.eventManager.bind(index, 'on_' )

            while P3dwglrt.TASK:
                direct.task.TaskManagerGlobal.taskMgr.step()
                time.sleep(0.001)
#
