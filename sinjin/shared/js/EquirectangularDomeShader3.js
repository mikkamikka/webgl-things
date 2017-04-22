/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured equirectangular dome shader
 */

THREE.EquirectangularDomeShader = {

    uniforms: {

        "tEnvMap"	: { value: null },
        "tFlip"		: { value: -1 },

        "desaturationAmount" : { value: 1.0 },
        "brightness" 		 : { value: 1.0 }

    },

    vertexShader: [

        "varying vec2 vUv;",
        "varying vec3 vWorldPosition;",

        "void main() {",

        "vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
        "vWorldPosition = worldPosition.xyz;",

        "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
        "gl_Position = projectionMatrix * mvPosition;",

        "vUv = uv;",

        "}"

    ].join( "\n" ),

    fragmentShader: [

        "uniform sampler2D tEnvMap;",
        "uniform float tFlip;",

        "uniform float desaturationAmount;",
        "uniform float brightness;",

        "varying vec2 vUv;",
        "varying vec3 vWorldPosition;",

        "#define PI2 6.283185307179586476925286766559",
        "#define PI 3.1415926535897932384626433832795",

        "#define RECIPROCAL_PI2 0.15915494",
        "#define saturate(a) clamp( a, 0.0, 1.0 )",

        "vec2 mapCube2Equirect( vec3 cubeCoord ) {",

        //"return vec2( mod( -( atan( cubeCoord.z, cubeCoord.x ) / PI2 ) - 0.5, 1.0 ), 1.0 - acos( cubeCoord.y ) / PI );",
        "return vec2( mod( ( atan( cubeCoord.z, cubeCoord.x ) / PI2 ) + 0.5, 1.0 ), 1.0 - acos( cubeCoord.y ) / PI );",

        "}",

        "float nrand( vec2 n ) {",

        "return fract( sin( dot( n.xy, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 );",

        "}",

        "vec3 applyDithering( vec3 inColor, vec2 rndSeed ) {",

        "float rnd = nrand( rndSeed ) - 0.5;",
        "inColor.rgb += rnd/255.0;",

        "return inColor;",

        "}",

        "void main() {",

        "vec3 direction = normalize( vWorldPosition );",

        "vec2 sampleUV;",
        //"sampleUV.y = saturate( tFlip * direction.y * -0.5 + 0.5 );",
        //"sampleUV.x = atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.5;",

        "sampleUV = mapCube2Equirect( direction );",

        //"vec4 texel = texture2D( tEnvMap, sampleUV );",
        "vec4 texel = texture2D( tEnvMap, vUv );",

        "texel.rgb *= brightness;",

        "#ifdef USE_DITHERING",

        "texel.rgb = applyDithering( texel.rgb, vUv );",

        "#endif",

        "#ifdef USE_DESATURATION",

        "const vec3 LUMA = vec3( 0.2126, 0.7152, 0.0722 );",
        "float n = dot( LUMA, texel.rgb );",
        "vec4 mono = vec4( vec3( n ), texel.a );",

        "texel = mix( texel, mono, desaturationAmount );",

        "#endif",

        "gl_FragColor = texel;",

        "}"

    ].join( "\n" )

};
