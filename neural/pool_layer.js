/**
 * Created by mika on 29.03.2017.
 */

var PoolLayer = function( id, renderer, sx, input_layer, stride, pad ) {

    var filterDepth, input_texture, input_texture_size;

    var _this = this;

    this.sx = sx; // filter size. Should be odd if possible, it's cleaner.
    this.sy = sx;
    //this.in_depth = 3;
    this.in_sx = undefined;
    this.in_sy = undefined;

    this.activationsTexture = undefined;

    var activationsTexture, activationsMesh;
    var scene, camera;

    var displayViewRatio = 1.0;

    this.displayFrame = {
        left: 0.0,
        right: 0.0,
        spaceRight: 20
    }

    this.out_depth = input_layer.out_depth;


    this.init = function() {


            filterDepth = input_layer.out_depth;

            input_texture = input_layer.activationsTexture.texture;

            input_texture_size = input_layer.out_sx;


        this.Nfilters = input_layer.out_depth;


        this.in_sx = input_texture_size;
        this.in_sy = input_texture_size;

        // optional
        //this.sy = typeof opt.sy !== 'undefined' ? opt.sy : this.sx;
        this.stride = typeof stride !== 'undefined' ? stride : 1; // stride at which we apply filters to input volume
        this.pad = typeof pad !== 'undefined' ? pad : 0; // amount of 0 padding to add around borders of input volume

        // output texture size
        this.out_sx = Math.floor((this.in_sx + this.pad * 2 - this.sx) / this.stride + 1);
        this.out_sy = Math.floor((this.in_sy + this.pad * 2 - this.sy) / this.stride + 1);

        console.log("pool out dim:", this.out_sx, '  filterDepth:', filterDepth );

        this.displayFrame.left = input_layer.displayFrame.right;
        this.displayFrame.right = this.displayFrame.left + this.out_sx * displayViewRatio
         + this.displayFrame.spaceRight;



        // Create the texture that will store our result

        activationsTexture = new THREE.WebGLRenderTarget( this.out_sx, this.out_sy * filterDepth
            ,{  minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                format: THREE.RGBAFormat, type: THREE.FloatType}
        );

        this.activationsTexture = activationsTexture;

        //makePoolMesh( res, in_texture );
        activationsMesh = makePoolMesh( new THREE.Vector2( this.out_sx, this.out_sy * filterDepth ), input_texture );


        camera = new THREE.OrthographicCamera(
            this.out_sx  / - 2,
            this.out_sx  / 2,
            this.out_sy * filterDepth / 2,
            this.out_sy * filterDepth / - 2,
            0, 1 );
        scene = new THREE.Scene();

        scene.add( activationsMesh );

        scene.viewport = {
            x: this.displayFrame.left,
            y: renderer.getSize().height - this.out_sy * filterDepth * displayViewRatio * 1.0,
            w: this.out_sx * displayViewRatio,
            h: this.out_sy * filterDepth * displayViewRatio * 1.0
        };



    }

    var renderToTexture = function() {

        renderer.render( scene, camera, activationsTexture );

    }

    function renderToScreen(){

        renderer.setScissorTest( true );
        renderer.setViewport( scene.viewport.x, scene.viewport.y, scene.viewport.w, scene.viewport.h );
        renderer.setScissor( scene.viewport.x, scene.viewport.y, scene.viewport.w, scene.viewport.h );

        renderer.render( scene, camera );

        renderer.setScissorTest( false );

    }

    this.forward = function() {

        renderToTexture();

        renderTextureToScreen( activationsTexture.texture, scene.viewport );

    }

    this.backward = function() {

        input_layer.dw = this.dw;

    }

    this.updateFilter = function(){};


    var vertex_shader = [
        'precision highp float;',
        'precision highp int;',
        'uniform mat4 modelMatrix;',
        'uniform mat4 modelViewMatrix;',
        'uniform mat4 projectionMatrix;',
        'uniform mat4 viewMatrix;',
        'uniform mat3 normalMatrix;',
        'uniform vec3 cameraPosition;',
        'attribute vec3 position;',
        'attribute vec3 normal;',
        'attribute vec2 uv;',
        //'attribute float filter_size;',
        //'varying float vFilter_size;',
        'varying vec2 vUv;',
        'void main()	{',
        '    vUv = uv;',
        //'    vFilter_size = filter_size;',
        '    gl_Position = vec4( position, 1.0 );',
        '}'
    ].join('\n');

    var fragment_shader = [
        'precision highp float;',
        'precision highp int;',

        'uniform vec2 resolution;',
        //'uniform vec2 num_filters;',
        //'uniform float mode_test;',

        //'uniform float filter_size;',
        'uniform float mode;',
        'uniform sampler2D in_texture;  //inputs (x)',

        'uniform sampler2D back_texture; // w deltas',
        'varying vec2 vUv;',
        //'varying float vFilter_size;',

        'vec4 Maxpool( in sampler2D texture ) {',

            'vec4 res = vec4(-100.0);',

            'float vFilter_size = 2.0;',

            'for (float i=0.0; i < 2.0; i++) {',

                'float lookupDeltaY = ( i - 1.0 ) / resolution.y * 1.0;',

                'for (float j=0.0; j < 2.0; j++) {',

                '   float lookupDeltaX = ( j - 1.0 ) / resolution.x * 1.0;',

                '   vec4 inp = texture2D( texture, vUv + vec2( lookupDeltaX, lookupDeltaY ) );',

                '   if ( res.x < inp.x ) res.x = inp.x;',
                '   if ( res.y < inp.y ) res.y = inp.y;',
                '   if ( res.z < inp.z ) res.z = inp.z;',

                '}',
            '}',

            //'res = res + vec4(0.5);',

            //'if (mode_test>0.0) return texture2D( texture, coord );',
            //'else;',

            //'return clamp( res/denom, 0.0, 1.0 );',
            'return vec4( res.xyz, 1.0 );',

        '}',

        'void main()	{',

        // Tiled coords
        //'vec2 phase_tiles_coord = fract( vUv * vec2(1.0, num_filters.y ) );',
        //for tiling test
        //'vec4 outColorTiled = texture2D(in_texture, phase);',

        '    if (mode==0.0){  //forward',

        // Convolve( in vec2 coord, in sampler2D kernel, in sampler2D in_texture,', 'in float denom)

        '       vec4 Max = Maxpool( in_texture );',

        '       gl_FragColor = vec4( Max.x, Max.y, Max.z, 1.0 );',
        //'       gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );',

        // interlace
        //'vec2 p= vec2(floor(vUv.x*resolution.x), floor(vUv.y*resolution.y) );',
        //'if (mod(p.y, 2.0)==0.0)        gl_FragColor = vec4( Max.xyz ,1.0);',
        //'else        gl_FragColor = vec4(0.0,0.0,0.0 ,1.0);',

        '   }',
        //'    else{  //backward',

        //'        float w = texture2D( texture, vUv ).x;',
        //'        float dw = texture2D( back_texture, vUv ).z;',

        //'        float newWeight = w + 0.02 * dw;',

        //'        gl_FragColor = vec4( newWeight, texture2D( texture, vUv ).yz, 1.0 );',

        //'    }',
        '}'

    ].join('\n');


    function makePoolMesh( res, in_texture ){

        var geometry = new THREE.PlaneBufferGeometry( 2, 2 );
        var material, mesh;

        //geometry.addAttribute( 'filter_size', new THREE.BufferAttribute( [sx], 1 ) );

        material = new THREE.RawShaderMaterial( {
            uniforms: {
                in_texture: {value: in_texture},
                //w_texture: {value: w_texture},
                back_texture: {value: null},
                mode: {value: 0.0},  // forward: 0.0, backprop: 1.0
                resolution: {value: res},
                //num_filters: {value: new THREE.Vector2( 1.0, Nfilters )},
                //filter_size: {value: sx},
                //mode_test: {value: id}
            },
            vertexShader: vertex_shader,
            fragmentShader: fragment_shader
        } );

        mesh = new THREE.Mesh( geometry, material );

        return mesh;
    }


}