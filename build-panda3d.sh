. /opt/sdk/emsdk/emsdk_env.sh

pushd panda3d

. emflags

PF="--nothing --use-freetype --use-openssl --use-openal --use-python --use-direct --use-pview --use-openal --no-egl --use-gles2"
PF="$PF --use-bullet --use-png --no-jpeg --use-zlib"
python makepanda/makepanda.py $PF --optimize 3 --outputdir ../embuilt --target emscripten --threads 4 $*

popd
