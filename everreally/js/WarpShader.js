/**
 * Created by mika on 16.09.2016.
 */

var WarpShader = {

    uniforms : {

        "tDiffuse":       { value: null },
        "radius":    { value: 10 },
        "angle":   { value: 0.5 },
        "center": { value: new THREE.Vector2() },
        "texSize":     { value: new THREE.Vector2() },
        "strength": { value: 1.0 }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
            "//gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
            "gl_Position = vec4( position, 1.0 );",

        "}"

    ].join( "\n" ),

    fragmentShader: [

        "uniform float radius;",
        "uniform float angle;",
        "uniform vec2 center;",
        "uniform vec2 texSize;",
        "uniform float strength;",

        "uniform sampler2D tDiffuse;",

        "varying vec2 vUv;",

        "float random(vec3 scale, float seed) {",
            "return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed); }",

        "void main() {",

            "vec2 coord = vUv * texSize;",

            "coord -= center;",
            "float distance = length(coord);",
            "if (distance < radius) {",
            "    float percent = (radius - distance) / radius;",
            "    float theta = percent * percent * angle;",
            "    float s = sin(theta);",
            "    float c = cos(theta);",
            "    coord = vec2(",
            "       coord.x * c - coord.y * s,",
            "       coord.x * s + coord.y * c",
            "    );",

            "float percent_zoom = distance / radius;",
            "if (strength > 0.0) {",
            "    coord *= mix(1.0, smoothstep(0.0, radius / distance, percent_zoom), strength * 0.75); }",

            "}",

            "coord += center;",

            "gl_FragColor = texture2D(tDiffuse, coord / texSize);",
            "if ( gl_FragColor.a < 0.5 ) discard;",

        "}"


    ].join( "\n" )
};
