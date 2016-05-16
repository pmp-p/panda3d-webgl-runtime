
p = ['altbininstall libinstall inclinstall libainstall','maninstall libinstall inclinstall libainstall sharedinstall']


f=open('makefile.tmp','wb')

for r in open('Makefile','rb').readlines():
    newstr = r
    for test in p:
        if r.find(test)>0:
            newstr =  newstr.replace(' libinstall ',' ') 
            print(r[:-1],newstr)
            f.write( newstr)
            p.remove(test)
            break

    f.write(newstr)
f.close()

import os
os.rename('Makefile','Makefile.old')
os.rename('makefile.tmp','Makefile')
os.unlink('Makefile.old')
