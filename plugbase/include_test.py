print_("Hello World 1")

from panda3d.core import *
from direct.actor import Actor


global pdelay

if not RunTime.em:
    panda3d.core.getModelPath().appendDirectory('/usr/share/panda3d')
    #panda3d.core.getModelPath().appendDirectory('/usr/share/panda3d/models')
    panda3d.core.loadPrcFileData('','default-model-extension .egg')
else:
    print( len( fopen('rsr/maps/envir-ground.jpg').read() ) )
    print( len( fopen('rsr/tex/amiga.jpg').read() ) )


print_('shader support : %s' % scr.shader_supported() )

self = __import__(__name__)


cm = CardMaker('')
cm.setFrame(-2, 2, -2, 2)
floor = render.attachNewNode(PandaNode("floor"))

# Load the scene.
floorTex = loader.loadTexture('rsr/maps/envir-ground.jpg')
for y in range(12):
    for x in range(12):
        nn = floor.attachNewNode(cm.generate())
        nn.setP(-90)
        nn.setPos((x - 6) * 4, (y - 6) * 4, 0)
floor.setTexture(floorTex)
floor.flattenStrong()

class fwrite:
    def __init__(self,fn,mode='wb'):
        self.f = open(fn,mode)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.f.close()

    def __call__(self,*data):
        if data:
            for wstr in map(str,data):
                self.f.write( wstr )
            return
        self.f.write('\n')




def colour_tex(vert='',frag='',**kw):
    kw.setdefault('common',"""
// Auto generated
    """)

    vert="""//GLSL
void main(void) {
    gl_Position = ftransform();
}
"""
    frag ="""//GLSL
void main() {
  gl_FragColor = vec4( %(r)s, %(v)s, %(b)s, %(a)s );
}
"""
    return GLSL_V.translate( vert , **kw ) , GLSL_F.translate( frag , **kw )


def copy_tex(vert='',frag='',**kw):
    kw['common']="""
varying vec2 vUV;
"""
    vert="""//GLSL
void main(void) {
    gl_Position = ftransform();
    vUV = <uv>
}
"""
    frag = """//GLSL
void main() {
    gl_FragColor = texture2D( t_texture0, vUV.st );
}
    """
    return ml.GLSL_V.translate(vert, **kw) , ml.GLSL_F.translate(frag,**kw)




def black_white(vert='',frag='',**kw):
    kw['common']="""
varying vec2 vUV;
"""
    vert="""//GLSL
void main(void) {
    gl_Position = ftransform();
    vUV = <uv>
}
"""

    frag = """//GLSL

void main() {
    float luminance = dot( texture2D( t_texture0, vUV).rgb, vec3(0.3, 0.59, 0.11));
    gl_FragColor = vec4(luminance, luminance, luminance, 1.0);
}
"""
    return ml.GLSL_V.translate( vert , **kw ) , ml.GLSL_F.translate( frag , **kw )


def fresnel(vert='',frag='',**kw):
    kw['common']="""
// Varying
varying vec3 vPosition;
varying vec3 vNormalW;

    """
    vert="""
void main(void) {
    gl_Position = ftransform()
    vPosition = vec3( <pos> )
    vNormalW = normalize(vec3( <world> * vec4( <norm>, 0.0)))
}
    """
    frag="""

void main(void) {
    vec3 vPositionW = vec3( <world> * vec4(vPosition, 1.0));
    vec3 color = vec3(1., 1., 1.);
    vec3 viewDirectionW = normalize( <cam> - vPositionW);

    // Fresnel
    float fresnelTerm = dot(viewDirectionW, vNormalW);
    fresnelTerm = clamp(1.0 - fresnelTerm, 0., 1.);

    gl_FragColor = vec4(color * fresnelTerm, 1.);
}
    """
    return ml.GLSL_V.translate( vert , **kw ) , ml.GLSL_F.translate( frag , **kw )


def cell_shading(vert='',frag='',**kw):
    kw['common']="""
// Lights
varying vec3 vPositionW;
varying vec3 vNormalW;
varying vec2 vUV;
"""

    vert="""//GLSL
void main(void) {
    gl_Position = ftransform()
    vPositionW = vec3( <world> * gl_Vertex  );
    vNormalW = normalize(vec3( <world> * vec4( <norm>, 0.0)));
    vUV = <uv>
}

    """


    frag="""//GLSL
#define MAX_LIGHTS 1

void main(void) {

    vec3 vLightPosition = vec3( gl_LightSource[0].position )

    // Light
    vec3 lightVectorW = normalize(vLightPosition - vPositionW)

    //toonthreshold
    float TTH[4]
    TTH[0] = 0.95
    TTH[1] = 0.5
    TTH[2] = 0.2
    TTH[3] = 0.03

    //brightness level
    float TBL[5]
    TBL[0] = 1.0
    TBL[1] = 0.8
    TBL[2] = 0.6
    TBL[3] = 0.35
    TBL[4] = 0.2


    // diffuse
    float ndl = max(0., dot(vNormalW, lightVectorW))

    vec3 color = texture2D( t_texture0, vUV).rgb

    if (ndl > TTH[0]){
        color *= TBL[0]
    }
    else if ( ndl > TTH[1] ){
        color *= TBL[1]
    }
    else if (ndl > TTH[2]){
        color *= TBL[2]
    }
    else if (ndl > TTH[3]){
        color *= TBL[3]
    }
    else {
        color *= TBL[4]
    }

    gl_FragColor = vec4(color, 1.)
}
    """
    return ml.GLSL_V.translate( vert , **kw ) , ml.GLSL_F.translate( frag , **kw )




def phong_shading(vert='',frag='',**kw):
    kw['common']="""
// Varying
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUV;
    """

    vert="""//GLSL
void main(void) {
    gl_Position = ftransform()
    vUV = <uv>
    vPosition = vec3( <pos> )
    vNormal =  <norm>
}
"""

    frag="""//GLSL
#define MAX_LIGHTS 1
void main(void) {
    vec3 vLightPosition = vec3( gl_LightSource[0].position )

    // World values
    vec3 vPositionW = vec3( <world> * vec4(vPosition, 1.0));
    vec3 vNormalW = normalize(vec3( <world> * vec4(vNormal, 0.0)));
    vec3 viewDirectionW = normalize( <cam> - vPositionW);

    // Light
    vec3 lightVectorW = normalize(vLightPosition - vPositionW);
    vec3 color = texture2D(textureSampler, vUV).rgb;

    // diffuse
    float ndl = max(0., dot(vNormalW, lightVectorW));

    // Specular
    vec3 angleW = normalize(viewDirectionW + lightVectorW);
    float specComp = max(0., dot(vNormalW, angleW));
    specComp = pow(specComp, max(1., 64.)) * 2.;

    gl_FragColor = vec4(color * ndl + vec3(specComp), 1.);
}
    """
    return ml.GLSL_V.translate( vert , **kw ) , ml.GLSL_F.translate( frag , **kw )





def shadowed_phong(vert='',frag='',**kw):
    kw['common']="""
//common
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUV;
    """

    vert="""//GLSL
void main(void) {
    gl_Position = ftransform()
    vUV = <uv>
    vPosition = vec3( <pos> )
    vNormal =  <norm>
}
"""

    """

// Custom light shader input, works on all light types except AmbientLight
uniform gl_LightSourceParameters customLight;

uniform struct {
  // Sum of all ambient lights
  vec4 ambient;
} p3d_LightModel;

uniform struct {
  vec4 ambient;
  vec4 diffuse;
  vec3 specular;
  float shininess;
} p3d_Material;

void mainlight() {
  gl_FragColor = p3d_LightModel.ambient * p3d_Material.ambient;
  vec3 diff = customLight.position.xyz - vpos * customLight.position.w;
  vec3 L = normalize(diff);
  vec3 E = normalize(-vpos);
  vec3 R = normalize(-reflect(L, norm));
  vec4 diffuse = clamp(p3d_Material.diffuse * customLight.diffuse * max(dot(norm, L), 0), 0, 1);
  vec4 specular = vec4(p3d_Material.specular, 1) * customLight.specular * pow(max(dot(R, E), 0), gl_FrontMaterial.shininess);
  float spotEffect = dot(normalize(customLight.spotDirection), -L);
  if (spotEffect > customLight.spotCosCutoff) {
    gl_FragColor += (diffuse + specular) / (customLight.constantAttenuation + customLight.linearAttenuation * length(diff) + customLight.quadraticAttenuation * length(diff) * length(diff));
  }
}
"""



    frag="""
#define MAX_LIGHTS 1

uniform struct {
  vec4 position
  vec4 diffuse
} customLight;


//uniform p3d_LightSourceParameters customLight;

void main(void) {
    vec3 vLightPosition = vec3( gl_LightSource[0].position )

    // World values
    vec3 vPositionW = vec3( <world> * vec4(vPosition, 1.0));
    vec3 vNormalW = normalize(vec3( <world> * vec4(vNormal, 0.0)));
    vec3 viewDirectionW = normalize( <cam> - vPositionW);

    // Light
    vec3 lightVectorW = normalize(vLightPosition - vPositionW);
    vec3 color = texture2D(textureSampler, vUV).rgb;

    // diffuse
    float ndl = max(0., dot(vNormalW, lightVectorW));

    // Specular
    vec3 angleW = normalize(viewDirectionW + lightVectorW);
    float specComp = max(0., dot(vNormalW, angleW));
    specComp = pow(specComp, max(1., 64.)) * 2.;

    gl_FragColor = vec4(color * ndl + vec3(specComp), 1.);
}
    """

    return ml.GLSL_V.translate( vert , **kw ) , ml.GLSL_F.translate( frag , **kw )

class movingPanda:

    def __init__(self):
        self.pandaAxis = render.attachNewNode('panda axis')
        #self.model = loader.load_model('panda-model')
        self.model = Actor.Actor('panda-model', {'walk': 'panda-walk4'})
        self.model.reparentTo(self.pandaAxis)
        self.model.setPos(9, 0, 0)
        self.model.setScale(0.01)

        if isinstance(self.model,Actor.Actor):
            self.pandaWalk = self.model.actorInterval('walk', playRate=1.8)
            self.pandaWalk.loop()
            self.pandaMovement = self.pandaAxis.hprInterval(
                20.0, LPoint3(-360, 0, 0), startHpr=LPoint3(0, 0, 0))

            self.pandaMovement.loop()



if 1: # not hasattr(self,'pdelay'):

    pdelay = 3800
    self.pandas = []

    ml = use('models.loader')

    def preload():
        Actor.Actor('panda-model', {'walk': 'panda-walk4'})
        loader.loadModel('teapot')
        setTimeout(panda, pdelay*2)

    def panda():
        m= movingPanda()
        self.pandas.append( m)

        setTimeout(panda_bw, pdelay)

    def panda_bw():
        m= movingPanda()
        ml.set_texture(m.model, 'rsr/tex/amiga.jpg')
        sha = ml.GLSL.make( use.get_source_line() , *black_white() )
        m.model.setShader( sha )
        self.pandas.append( m)

        setTimeout(panda_cell, pdelay)


    def panda_cell():
        m= movingPanda()
        ml.set_texture(m.model, 'rsr/tex/amiga.jpg')
        sha = ml.GLSL.make( use.get_source_line() , *cell_shading() )
        m.model.setShader( sha )
        self.pandas.append( m)

        setTimeout(panda_phong, pdelay)


    def panda_phong():
        m= movingPanda()
        ml.set_texture(m.model, 'rsr/tex/amiga.jpg')
        sha = ml.GLSL.make( use.get_source_line() , *phong_shading() )
        m.model.setShader( sha )
        self.pandas.append( m)


        setTimeout( panda_fresnel, pdelay)


    def panda_fresnel():
        m= movingPanda()
        ml.set_texture(m.model, 'rsr/tex/amiga.jpg')
        sha = ml.GLSL.make( use.get_source_line() , *fresnel() )
        m.model.setShader( sha )
        self.pandas.append( m)



    self.teapot = loader.loadModel('teapot')
    self.teapot.reparentTo(render)
    self.teapot.setPos(0, 10, 10)
    self.teapot.setShaderInput("texDisable", 1, 1, 1, 1)
    self.teapotMovement = self.teapot.hprInterval(50, LPoint3(0, 360, 360))
    self.teapotMovement.loop()

    ml.set_texture(self.teapot, 'rsr/tex/amiga.jpg')



    light = render.attachNewNode( PointLight('pointLight') )
    light.setColor( Vec4(3,3,3,1) ) #Vec4(1.9, 1.8, 1.8, 1) )
    light.setPos( 0,10,10)

    sha = ml.GLSL.make( use.get_source_line() , *shadowed_phong() )
    render.setShader(sha)
    render.setShaderInput( "customLight", light )
    render.setLight(light )
    light.reparentTo( self.teapot )



    setTimeout(panda, pdelay)









    if 0:
        self.light = render.attachNewNode(Spotlight("Spot"))
        self.light.node().setScene(render)
        self.light.node().setShadowCaster(True)
        self.light.node().showFrustum()
        self.light.node().getLens().setFov(40)
        self.light.node().getLens().setNearFar(10, 100)
        render.setLight(self.light)

        self.alight = render.attachNewNode(AmbientLight("Ambient"))
        self.alight.node().setColor(LVector4(0.2, 0.2, 0.2, 1))
        render.setLight(self.alight)


    def incrementCameraPosition(self, n):
        self.cameraSelection = (self.cameraSelection + n) % 6
        if (self.cameraSelection == 0):
            base.cam.reparentTo(render)
            base.cam.setPos(30, -45, 26)
            base.cam.lookAt(0, 0, 0)
            self.light.node().hideFrustum()
        if (self.cameraSelection == 1):
            base.cam.reparentTo(self.model)
            base.cam.setPos(7, -3, 9)
            base.cam.lookAt(0, 0, 0)
            self.light.node().hideFrustum()
        if (self.cameraSelection == 2):
            base.cam.reparentTo(self.model)
            base.cam.setPos(-7, -3, 9)
            base.cam.lookAt(0, 0, 0)
            self.light.node().hideFrustum()
        if (self.cameraSelection == 3):
            base.cam.reparentTo(render)
            base.cam.setPos(7, -23, 12)
            base.cam.lookAt(self.teapot)
            self.light.node().hideFrustum()
        if (self.cameraSelection == 4):
            base.cam.reparentTo(render)
            base.cam.setPos(-7, -23, 12)
            base.cam.lookAt(self.teapot)
            self.light.node().hideFrustum()
        if (self.cameraSelection == 5):
            base.cam.reparentTo(render)
            base.cam.setPos(1000, 0, 195)
            base.cam.lookAt(0, 0, 0)
            self.light.node().showFrustum()

    def incrementLightPosition(self, n):
        self.lightSelection = (self.lightSelection + n) % 2
        if (self.lightSelection == 0):
            self.light.setPos(0, -40, 25)
            self.light.lookAt(0, -10, 0)
            self.light.node().getLens().setNearFar(10, 100)
        if (self.lightSelection == 1):
            self.light.setPos(0, -600, 200)
            self.light.lookAt(0, -10, 0)
            self.light.node().getLens().setNearFar(10, 1000)



    # Important! Enable the shader generator.
    #render.setShaderAuto()

    # default values
    self.cameraSelection = 0
    self.lightSelection = 0

    incrementCameraPosition(self,0)
    #incrementLightPosition(self,0)

    cam.setMode('third')
    base.cam.reparentTo(render)
    base.cam.setPos(0, -25, 10)
