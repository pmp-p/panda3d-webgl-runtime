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



#this is a coroutine , the loop is running full speed
def read_stdin():
    while not kbd.heardEnter():
        yield bluelet.null()

    #flush stdin buffer, clean it and return it
    data= kbd.readline()
    data= data.strip().lower()
    yield bluelet.end( value = data )


with plugbase.PluginGlobalManager( { 'config': cfg('server.cfg') } ) as use:
    # when using "with" global keyword "use" is not set in builtins like in plugin
    # so you can choose the name yourself. eg "pgm"

    use.setLogger( __import__(__name__) ) #let pollute your __main__ with some logging utilities

    #ecam = use('camera.edit')

    kbd = use('hid.linereader')

    ml = use('models.loader')



    # cam = use('camera.third')
    # world = use('world.wp3d')
    # is like
    with use('world.wp3d') as world, use('camera.third') as cam, use('screen.sp3d') as scr:
    # ab-use of with is intended to ease cleanup of plugins

        with use('ui') as ui:
            if ui.lui.LUIBase.build():
                taskbar = ui.lui.TaskBar(width='100%',height=24,left=0,top=0)


        def runtest(*self):
            execfile('plugbase/include_test.py', globals(), globals() )



        def main_loop():

            print("starting engine loop")
            while RunTime and not RunTime.wantQuit:


                if RunTime.em:
                    print("starting sample")
                    setTimeout( runtest , 2000 )
                else:
                    print("starting program loop")

                while not use.Quit:
                    try:
                        cmd = yield read_stdin()

                        if cmd in ('r',):
                            print('reload')
                            use.Quit=True

                        elif cmd in  ('q','quit','exit'):
                            use.exit()

                        else:
                            print("echo: %s"%cmd)
                            #evt(*cmd.split(' '),ctx='gsc')
                            #evt('map_rotate',ctx='gsc')

                            #you can exec python code there dynamically while editing

                            runtest()

#                            print(a_bug)

#                            print("unreachable code because of previous bug")

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
                    if use.Quit:
                        print("restarting, YOU SHOULD CLEAN UP THERE")
                        use.Quit = False
                    else:
                        break

        RunTime.CoRoutines.append( main_loop )


def update(self):
    pass


print_("update should now hook with taskmgr if defined, or use a coroutine loop given by you, then plugin manager should bind events")

#
