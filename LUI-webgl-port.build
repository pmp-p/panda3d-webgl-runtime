#!/bin/bash
if [ -f emsdk ]
then
	. emsdk
else
	echo "will use system em sdk"
fi

. emflags

pushd LUI

python update_module_builder.py

if [ -f source/interrogate_module.cpp ]
then
	echo not using cmake
else
	python build.py --optimize 3
fi

if grep panda3d.lui source/interrogate_module.cpp
then
    echo module_name ok
else
    echo 'Please rewrite source/interrogate_module.cpp'
    echo '"PyObject *module = Dtool_PyModuleInitHelper(defs, "lui");"'
    echo 'to'
    echo '"PyObject *module = Dtool_PyModuleInitHelper(defs, "panda3d.lui");"'
    echo "<then enter>"
    read

    cd source
    /usr/bin/interrogate -fnames -string -refcount -assert -python-native \
  -S/usr/include/panda3d/parser-inc -S/usr/include/panda3d/ -srcdir . \
 -oc interrogate_wrapper.cpp -od interrogate.in -module panda3d.lui -library lui -nomangle -DINTERROGATE \
 -DCPPPARSER -D__STDC__=1 -D__cplusplus=201103L -DNDEBUG -DOPTIMIZE=4 -D__attribute__\(x\)= -D__i386__ *.h
    cd ..
    echo 'ready to build <press enter>'
    read
fi

#export CXXFLAGS="-std=c++11 -O2 -DNDEBUG -Wno-c++11-extensions -Wno-deprecated-register -fPIC -ffast-math -fno-exceptions"

P3D="../embuilt/include"
UI="/usr/include"

INC="-I$P3D -I$UI/eigen3 -I$UI/freetype2 -I../embuilt/include/python2.7"

mkdir ../embuilt/LUI -p

for cxx in $(find source/|grep cxx$)
do
    echo $cxx 
    SRC=$(basename $cxx .cxx)
    if [ -f ../embuilt/LUI/$SRC.o ]
    then
        echo -n "$SRC.o "
    else
        echo
        echo Building $SRC.o
        em++ -c -g $CXXFLAGS -o ../embuilt/LUI/$SRC.o source/$SRC.cxx $INC
        echo
    fi
done

for cpp in $(find source/|grep cpp$)
do
    echo $cpp
    SRC=$(basename $cpp .cpp)
    if [ -f ../embuilt/LUI/$SRC.o ]
    then
        echo -n "$SRC.o "
    else
        echo
        echo Building $SRC.o
        em++ -c -g $CXXFLAGS -o ../embuilt/LUI/$SRC.o source/$SRC.cpp $INC
        echo
    fi
done

echo
echo Linking ...

#

LNK="-L../embuilt/lib"

CF="-ffast-math -fno-exceptions"
# -fno-rtti"
EMF="$CF -s WARN_ON_UNDEFINED_SYMBOLS=1 -s AGGRESSIVE_VARIABLE_ELIMINATION=1 -s INLINING_LIMIT=1 -s DEMANGLE_SUPPORT=0 -s ASSERTIONS=0"

em++ -O3 -DNDEBUG $EMF -shared -Wl,-soname=lui.bc -o ../embuilt/panda3d/lui.bc $(echo -n ../embuilt/LUI/*.o) $LNK

popd

