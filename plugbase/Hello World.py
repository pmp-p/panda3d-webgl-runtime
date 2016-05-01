from __future__ import with_statement
from __future__ import print_function
from __future__ import absolute_import

import plugbase

import time

#you preferences prefix for events def on_prefix*  eg on_button_clicked
on_prefix  = 'on_'

#TODO: underscore or camelcase events translation/mix

def cfg(fn):
    return {
        'title':None,
        'po-file':None,
        'kbd': {
            'wireframe':'w',
            'escape':'escape',
            'grabmouse':'g',
            'forward':'z',
            'left':'q',
            'right':'d',
            'back':'s',
            '_NET_WM_MOVERESIZE_SIZE_KEYBOARD':'f1',
            '_NET_WM_MOVERESIZE_MOVE_KEYBOARD':'f2',
        },
    }


with plugbase.PluginGlobalManager( { 'config': cfg('server.cfg') } ) as pgm:
    # when using "with" global keyword "use" is not set in builtins like in plugin
    # so you can choose the name yourself. eg "pgm"

    pgm.setLogger( __import__(__name__) ) #let pollute your __main__ with some logging utilities

    #but  maybe "use" is a cool name to get used to.
    use = pgm

    last_beat = RunTime.PASS
    heart_mon = None


    #here you can already start to prototype your future plugins


    #first use a prototype that only log call
    heart_mon = use.Future('some.heart.monitor')




    # then write one later that implements
    class heart_base( use.Prototype ):
        """ will print a beat """

        def beat(self,hb,*argv,**kw):
            print("beat:",hb)

    #and maybe use event driven
        def on_heart_(self,beat,*argv,**kw):
            print("beat(event):",hb)



    class TicTac(use.BlueThread):

        def run(self):

            if elapsed(2):
                #if use.not_yet(heart_mon):
                print('tic')

            if elapsed(2,delay=1):
                #if use.not_yet(heart_mon):
                print('tac')

            if elapsed(4,once=True):
                global heart_mon

                # now use the implemented class
                heart_mon._mutate( heart_base )


            #wait few seconds then start LUI windows manager
            if elapsed(6,once=True):
                print("toe! starting LUI WM")
                if RunTime.em_:
                    RunTime.sfx("get_ready")

                with use('ui') as ui:
                    if ui.lui.LUIBase.build():
                        taskbar = ui.lui.TaskBar(width='100%',height=24,left=0,top=0)


    def on_heart_(self,beat,*argv,**kw):
        if use.not_yet(heart_mon):
            heart_mon.beat( beat )
            heart_mon.not_yet_implemented( beat )

        else:
            #the fix messages appear only once if string does not change
            #display nothing and return False after that

            if fix('on_heart_'):
               warn("%s now a working prototype"%heart_mon)
               #make a beat call on it
               heart_mon.beat( beat )
               heart_mon.not_yet_implemented( beat )



    def on_world_map_name_(self,*argv,**kw):
        ev=use.pdict(*argv,**kw)
        print_('on_map_name_',ev.name,ev.value,ev.oldv)

    def on_salutations_changed(self,origins,emitter):
        if self in origins :
            print('%s said hello to me' % (emit) )




    #not working yet need websockets pgm.preload('net.loopback')

    ecam = pgm('camera.edit')




    kbd = use('hid.linereader')

    #don't want a plugin to load , then fake it ...
    scr=pgm.Future('screen.sp3d')

    #but still you can use it, but be carefull this will keep ref to objects !
    scr.setTitle( 'Hello World' )


    # ... then instance it later all changes will be applied to it
    scr = scr._mutate_replay( pgm('screen.sp3d') )


    tictac = TicTac()


    # cam = use('camera.third')
    # world = use('world.wp3d')
    # is like
    with use('world.wp3d') as world, use('camera.third') as cam:
    # ab-use of with is intended to ease cleanup of plugins


        print("starting a bluethread")
        tictac.start()

        def main_loop():

            print("starting engine loop")
            while RunTime and not RunTime.wantQuit:

                #this is a coroutine , the loop is running full speed
                def read_stdin():
                    while not kbd.heardEnter():
                        if elapsed(1):
                            #print('+') # heartbeat every one second
                            #evt('heartbeat',ctx='main')
                            global last_beat
                            act('heart',RunTime.PASS - last_beat ,**{'-':['v'],'ctx':'main'})
                            last_beat = RunTime.PASS
                            pass
                        yield bluelet.null()

                    #flush stdin buffer, clean it and return it
                    data= kbd.readline()
                    data= data.strip().lower()
                    yield bluelet.end( value = data )


                print("starting program loop",elapsed,pgm)

                #scr.status = 'Now you should have clock tic/tac and heartbeat rate spamming your control terminal'


                while not pgm.Quit:
                    try:
                        cmd = yield read_stdin()

                        if cmd in ('r',):
                            print('reload')
                            pgm.Quit=True

                        elif cmd in  ('q','quit','exit'):
                            pgm.exit()

                        elif cmd in  ('u'):
                            #ugly exit is
                            RunTime.TASK = 0


                        elif cmd:
                            print("echo: %s"%cmd)
                            #evt(*cmd.split(' '),ctx='gsc')
                            evt('map_rotate',ctx='gsc')

                        else:
                            #you can exec python code there dynamically while editing
                            execfile('plugbase/include_test.py')

                            print(a_bug)

                            print("unreachable code because of previous bug")
                            #world.test()
                            #ecam.setMode(scr,world)

                    #raised when bluethread exits
                    except GeneratorExit:
                        #go out of the loop directly because pgm is probably gone
                        break

                    except:
                        #use RunTime.PASS to change content of log msg because duplicate are discarded
                        use.ns.exc('runtime error #%s' % RunTime.PASS )
                        pass
                        print("resuming...")




                # not Quit !

                if RunTime and not RunTime.wantQuit:
                    print("maybe-quit-restart-continue-plugin")
                    if pgm.Quit:
                        print("restarting, YOU SHOULD CLEAN UP THERE")
                        pgm.Quit = False
                    else:
                        break

        RunTime.CoRoutines.append( main_loop )


def update(self):
    didit=pluginGlobalManager.eventManager.flush()
    if didit>0:
        print_("%s events flushed" % didit )


print_("update should now hook with taskmgr if defined, or use a coroutine loop given by you, then plugin manager should bind events")

#
