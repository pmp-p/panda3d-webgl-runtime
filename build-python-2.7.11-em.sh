#!/usr/bin/env bash

if [ -f emsdk ]
then
	. emsdk
else
	echo "emsdk config file not found, will use system emscripten sdk"
fi


PY="Python-2.7.11"
PYXZ=$PY.tar.xz
PYXZ_URL="https://www.python.org/ftp/python/2.7.11/$PYXZ"

echo "Getting $PYXZ_URL"

if [ -d "$PY-em" ]
then
    PY="$PY-em"    
    echo
    echo " 1-2 - $PY already there and patch assumed, building directly"
    echo

else
    echo "About to get $PY source code from $PYXZ_URL"
    echo "<press enter>"
    read
    wget -c $PYXZ_URL
    NF=$(tar xvpf "$PYXZ"|wc -l)
    echo
    echo " 1 - $NF files uncompressed"
    echo
    mv "$PY" "$PY-em"
    PY="$PY-em"    

    pushd "$PY"
    echo
    echo " 2 - patching $PY for emscripten build"
    echo
    patch -p1 < "../$PY.diff"
    popd
fi

set -ue

PYTHON_DIR="$PWD/$PY"

EMSCRIPTEN_USR_DIR="$PWD/embuilt"
LIBTAR_DIR="$PWD/libtar"

if false
then
    BUILD_TRIPPLE=$(${LIBTAR_DIR}/autoconf/config.guess)
    pushd "${LIBTAR_DIR}"
    emconfigure ./configure --disable-shared --enable-static --host=asmjs-unknown-emscripten --build=${BUILD_TRIPPLE} --prefix=${EMSCRIPTEN_USR_DIR}
    emmake make
    emmake make -C lib install
    make distclean
    rm -f a.out a.out.js
    popd
fi

EMSCRIPTEN_USR_DIR=$PWD/embuilt
BUILD_TRIPPLE=$(${PYTHON_DIR}/config.guess)

OSNAME=$(uname -s)

if [ "${OSNAME}" == "Linux" ]
then
	PYTHON_BINARY=python
else
	PYTHON_BINARY=python.exe
fi


echo
echo " 3 - will build $PY"
echo "       in $PYTHON_DIR"
echo "       host [ $BUILD_TRIPPLE ]"
echo "       host python $PYTHON_BINARY" 
echo "       target dir [ $EMSCRIPTEN_USR_DIR ]"
echo



if emcc -v >/dev/null 2>&1
then
    echo
    echo " 4 - emscripten found, ready to build"
    echo    
else
    echo
    echo " 4 - *ERROR* emscripten not found in the path, do you need to call emsdk_env.sh ?"
    echo "exiting ..."
    exit
fi

mkdir -p "$EMSCRIPTEN_USR_DIR"

echo "<press enter>"
read

pushd "${PYTHON_DIR}"


if [ ! -f "${PYTHON_BINARY}" ]
then
	./configure
	make ${PYTHON_BINARY} Parser/pgen
	mv ${PYTHON_BINARY} hostpython
	mv Parser/pgen Parser/hostpgen
	make distclean
fi

CONFIG_SITE=./config.site emconfigure ./configure --without-threads --without-pymalloc --disable-shared --disable-ipv6 --without-gcc --host=asmjs-unknown-emscripten --build=${BUILD_TRIPPLE} --prefix=${EMSCRIPTEN_USR_DIR}

cp ../Setup.local Modules/

emmake make HOSTPYTHON=./hostpython HOSTPGEN=./Parser/hostpgen CROSS_COMPILE=yes

python ../patch_makefile.py

emmake make install HOSTPYTHON=./hostpython HOSTPGEN=./Parser/hostpgen CROSS_COMPILE=yes
emmake make libinstall HOSTPYTHON=./hostpython HOSTPGEN=./Parser/hostpgen CROSS_COMPILE=yes
make distclean

popd

