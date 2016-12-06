/**
 * Created by mika on 29.11.2016.
 */

var materialTest1 = new THREE.ShaderMaterial( {

    uniforms: THREE.UniformsUtils.merge( [
        THREE.UniformsUtils.clone( THREE.ShaderLib.physical.uniforms ),
        {
            "resolution": { value: new THREE.Vector2(1) },
            "lookupRadius": { value: 1.0 }
        }
        ]
    ),

    //defines: { PHYSICAL: "" },

    vertexShader: [

        "#define PHYSICAL",

        "varying vec3 vViewPosition;",

        "#ifndef FLAT_SHADED",

        "varying vec3 vNormal;",

        "#endif",

        THREE.ShaderChunk[ "common" ],
        THREE.ShaderChunk[ "uv_pars_vertex" ],
        THREE.ShaderChunk[ "uv2_pars_vertex" ],
        THREE.ShaderChunk[ "displacementmap_pars_vertex" ],
        THREE.ShaderChunk[ "color_pars_vertex" ],
        //THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
        //THREE.ShaderChunk[ "skinning_pars_vertex" ],
        //THREE.ShaderChunk[ "shadowmap_pars_vertex" ],
        THREE.ShaderChunk[ "specularmap_pars_fragment" ],
        //THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],
        //THREE.ShaderChunk[ "clipping_planes_pars_vertex" ],
        "varying float drawMode;",
        "uniform vec2 resolution;",
        "uniform float lookupRadius;",

        "void main() {",

            THREE.ShaderChunk[ "uv_vertex" ],
            THREE.ShaderChunk[ "uv2_vertex" ],
            THREE.ShaderChunk[ "color_vertex" ],

            THREE.ShaderChunk[ "beginnormal_vertex" ],
            THREE.ShaderChunk[ "morphnormal_vertex" ],
            //THREE.ShaderChunk[ "skinbase_vertex" ],
            //THREE.ShaderChunk[ "skinnormal_vertex" ],
            THREE.ShaderChunk[ "defaultnormal_vertex" ],

            "#ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED",

            "vNormal = normalize( transformedNormal );",

            "#endif",

            THREE.ShaderChunk[ "begin_vertex" ],
            THREE.ShaderChunk[ "displacementmap_vertex" ],
            //THREE.ShaderChunk[ "morphtarget_vertex" ],
            //THREE.ShaderChunk[ "skinning_vertex" ],
            THREE.ShaderChunk[ "project_vertex" ],
            //THREE.ShaderChunk[ "logdepthbuf_vertex" ],
            //THREE.ShaderChunk[ "clipping_planes_vertex" ],

            "vViewPosition = - mvPosition.xyz;",
            THREE.ShaderChunk[ "worldpos_vertex" ],
            //THREE.ShaderChunk[ "shadowmap_vertex" ],

            "float aspect = resolution.x/resolution.y;",
            "float dx = lookupRadius / resolution.x;",
            "float dy = dx * aspect;",

            "vec4 dy1 = texture2D( displacementMap, uv + vec2( 0.0, dy ) );",
            "vec4 dy2 = texture2D( displacementMap, uv + vec2( 0.0, -dy ) );",

            "vec4 dx1 = texture2D( displacementMap, uv + vec2( dx, 0.0 ) );",
            "vec4 dx2 = texture2D( displacementMap, uv + vec2( -dx, 0.0 ) );",

            "float difX = dx1.x - dx2.x;",
            "float difY = dy1.y - dy2.y;",

            //cut off background plane
            "if ( texture2D( displacementMap, uv ).x < 0.01 ) drawMode = 0.0;",
            "else drawMode = 1.0;",
            //additional cut off
            "if (dx1.x == 0.0 || dx2.x==0.0 || dy1.x==0.0 || dy2.x==0.0) drawMode = 0.0;",

        "}"
    ].join( "\n" ),

    fragmentShader: [

        "#define PHYSICAL",

        "uniform vec3 diffuse;",
        "uniform vec3 emissive;",
        "uniform float roughness;",
        "uniform float metalness;",
        "uniform float opacity;",

        "#ifndef STANDARD",
        "uniform float clearCoat;",
        "uniform float clearCoatRoughness;",
        "#endif",

        "uniform float envMapIntensity; // temporary",

        "varying vec3 vViewPosition;",

        "#ifndef FLAT_SHADED",

        "varying vec3 vNormal;",

        "#endif",

        THREE.ShaderChunk[ "common" ],
        THREE.ShaderChunk[ "packing" ],
        THREE.ShaderChunk[ "color_pars_fragment" ],
        THREE.ShaderChunk[ "uv_pars_fragment" ],
        THREE.ShaderChunk[ "uv2_pars_fragment" ],
        THREE.ShaderChunk[ "map_pars_fragment" ],
        //THREE.ShaderChunk[ "alphamap_pars_fragment" ],
        //THREE.ShaderChunk[ "aomap_pars_fragment" ],
        THREE.ShaderChunk[ "lightmap_pars_fragment" ],
        THREE.ShaderChunk[ "emissivemap_pars_fragment" ],

        //"vec4 envMapTexelToLinear( vec4 value ) { return LinearToLinear( value ); }",

        THREE.ShaderChunk[ "envmap_pars_fragment" ],
        //THREE.ShaderChunk[ "fog_pars_fragment" ],
        THREE.ShaderChunk[ "bsdfs" ],
        THREE.ShaderChunk[ "cube_uv_reflection_fragment" ],
        THREE.ShaderChunk[ "lights_pars" ],
        THREE.ShaderChunk[ "lights_physical_pars_fragment" ],
        //THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
        //THREE.ShaderChunk[ "bumpmap_pars_fragment" ],
        //THREE.ShaderChunk[ "normalmap_pars_fragment" ],
        THREE.ShaderChunk[ "roughnessmap_pars_fragment" ],
        THREE.ShaderChunk[ "metalnessmap_pars_fragment" ],
        //THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],
        //THREE.ShaderChunk[ "clipping_planes_pars_fragment" ],



        "varying float drawMode;",

        "void main() {",

            //THREE.ShaderChunk[ "clipping_planes_fragment" ],

            "vec4 diffuseColor = vec4( diffuse, opacity );",
            "ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );",
            "vec3 totalEmissiveRadiance = emissive;",

            //THREE.ShaderChunk[ "logdepthbuf_fragment" ],
            THREE.ShaderChunk[ "map_fragment" ],
            THREE.ShaderChunk[ "color_fragment" ],
            //THREE.ShaderChunk[ "alphamap_fragment" ],
            THREE.ShaderChunk[ "alphatest_fragment" ],
            THREE.ShaderChunk[ "specularmap_fragment" ],
            THREE.ShaderChunk[ "roughnessmap_fragment" ],
            THREE.ShaderChunk[ "metalnessmap_fragment" ],
            THREE.ShaderChunk[ "normal_flip" ],
            THREE.ShaderChunk[ "normal_fragment" ],
            THREE.ShaderChunk[ "emissivemap_fragment" ],

                        // accumulation
            THREE.ShaderChunk[ "lights_physical_fragment" ],
            THREE.ShaderChunk[ "lights_template" ],

                        // modulation
            //THREE.ShaderChunk[ "aomap_fragment" ],

            "vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;",

            "gl_FragColor = vec4( outgoingLight, diffuseColor.a );",

            THREE.ShaderChunk[ "premultiplied_alpha_fragment" ],
            //THREE.ShaderChunk[ "tonemapping_fragment" ],
            THREE.ShaderChunk[ "encodings_fragment" ],
            //THREE.ShaderChunk[ "fog_fragment" ],

            "if (drawMode == 0.0) gl_FragColor.a = 0.0;",


        "}"
        ].join( "\n" ),

    //wireframe: false,
    lights: true

} );

materialTest1.extensions.derivatives = true;

//materialTest1.color = new THREE.Color( 0x0000ff ); // diffuse
// materialTest1.roughness = 0.5;
// materialTest1.metalness = 0.5;
//
// materialTest1.map = null;
//
// materialTest1.lightMap = null;
// materialTest1.lightMapIntensity = 1.0;
//
// materialTest1.aoMap = null;
// materialTest1.aoMapIntensity = 1.0;
//
//materialTest1.emissive = new THREE.Color( 0x000000 );
// materialTest1.emissiveIntensity = 1.0;
// materialTest1.emissiveMap = null;
//
// materialTest1.bumpMap = null;
// materialTest1.bumpScale = 1;
//
// materialTest1.normalMap = null;
// materialTest1.normalScale = new THREE.Vector2( 1, 1 );
//
// materialTest1.displacementMap = null;
// materialTest1.displacementScale = 1;
// materialTest1.displacementBias = 0;
//
// materialTest1.roughnessMap = null;
//
// materialTest1.metalnessMap = null;
//
// materialTest1.alphaMap = null;
//
// materialTest1.envMap = null;
// materialTest1.envMapIntensity = 1.0;
//
// materialTest1.refractionRatio = 0.98;
//
// materialTest1.wireframe = false;
// materialTest1.wireframeLinewidth = 1;
// materialTest1.wireframeLinecap = 'round';
// materialTest1.wireframeLinejoin = 'round';
//
// materialTest1.skinning = false;
// materialTest1.morphTargets = false;
// materialTest1.morphNormals = false;