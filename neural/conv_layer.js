/**
 * Created by mika on 25.03.2017.
 */
//layer_defs.push({type:'conv', sx:5, filters:16, stride:1, pad:2, activation:'relu'});

var ConvLayer = function( id, renderer, sx, Nfilters, input_layer, stride, pad, noise_texture ) {

    var filterDepth, input_texture, input_texture_size;

    var _this = this;

    this.sx = sx; // filter size. Should be odd if possible, it's cleaner.
    this.sy = sx;
    //this.in_depth = 3;
    this.in_sx = undefined;
    this.in_sy = undefined;

    this.weightsTexture = undefined;
    this.activationsTexture = undefined;

    var activationsTexture, activationsMesh;

    var gradientsTexture, gradientsMesh;
    var inputLayerGradientsTexture, inputLayerGradientsMesh;

    var scene, camera;
    var weights_scene, weights_camera;
    var displayViewRatio = 1.0;

    this.displayFrame = {
        left: 0.0,
        right: 0.0,
        weightsWidth: 10,
        spaceRight: 1
    }


    // for the first layer
    this.setInputTexture = function( texture, size ) {

        input_texture = texture;

        input_texture_size = size;

    }

    this.init = function() {

        if (input_layer === undefined) {

            filterDepth = 1;

            this.displayFrame.left = 0;
            //this.displayFrame.right = input_texture_size * displayViewRatio;

            this.in_sx = input_texture_size;
            this.in_sy = input_texture_size;

        } else {

            filterDepth = input_layer.out_depth;

            input_texture = input_layer.activationsTexture.texture;

            input_texture_size = input_layer.out_sx;


            this.in_sx = input_texture_size;
            this.in_sy = input_texture_size;

            this.displayFrame.left = input_layer.displayFrame.right;

        }

        this.displayFrame.right = this.displayFrame.left + this.in_sx + this.displayFrame.weightsWidth
         + this.displayFrame.spaceRight;


        // optional
        //this.sy = typeof opt.sy !== 'undefined' ? opt.sy : this.sx;
        this.stride = typeof stride !== 'undefined' ? stride : 1; // stride at which we apply filters to input volume
        this.pad = typeof pad !== 'undefined' ? pad : 0; // amount of 0 padding to add around borders of input volume
        this.l1_decay_mul = typeof l1_decay_mul !== 'undefined' ? l1_decay_mul : 0.0;
        this.l2_decay_mul = typeof l2_decay_mul !== 'undefined' ? l2_decay_mul : 1.0;

        // output texture size
        this.out_sx = Math.floor((this.in_sx + this.pad * 2 - this.sx) / this.stride + 1);
        this.out_sy = Math.floor((this.in_sy + this.pad * 2 - this.sy) / this.stride + 1);



        this.out_depth = Nfilters * filterDepth;

        this.Nfilters = Nfilters;

        this.weightsTexture = genWeights( sx, Nfilters, filterDepth );

        // Create the texture that will store our result

        activationsTexture = new THREE.WebGLRenderTarget( this.out_sx, this.out_sy * Nfilters * filterDepth
            ,{
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                format: THREE.RGBAFormat, type: THREE.FloatType
        }
        );

        this.activationsTexture = activationsTexture;


        gradientsTexture = new THREE.WebGLRenderTarget( this.in_sx, this.in_sx * Nfilters
            ,{
                //minFilter: THREE.NearestFilter,
                //magFilter: THREE.NearestFilter,
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat, type: THREE.FloatType
            }
        );
        this.gradientsTexture = gradientsTexture;

        inputLayerGradientsTexture = new THREE.WebGLRenderTarget( this.in_sx, this.in_sx * Nfilters
            ,{
                //minFilter: THREE.NearestFilter,
                //magFilter: THREE.NearestFilter,
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat, type: THREE.FloatType
            }
        );


        //makeConvMesh( res, in_texture, w_texture );
        activationsMesh = makeConvMesh( new THREE.Vector2( this.out_sx, this.out_sy * Nfilters * filterDepth ), input_texture, this.weightsTexture );



        camera = new THREE.OrthographicCamera(
            this.out_sx  / - 2,
            this.out_sx  / 2,
            this.out_sy * Nfilters * filterDepth / 2,
            this.out_sy * Nfilters * filterDepth / - 2,
            0, 1 );
        scene = new THREE.Scene();

        scene.add( activationsMesh );


        scene.viewport = {
            x: this.displayFrame.left + this.displayFrame.weightsWidth,
            y: renderer.getSize().height - this.in_sy * Nfilters * filterDepth * displayViewRatio,
            w: this.in_sx * displayViewRatio,
            h: this.in_sy * Nfilters * filterDepth * displayViewRatio
        };



    }


    this.renderToTexture = function() {

        if ( id == 0 ) {
            activationsMesh.material.uniforms.inputimage_normalizeK.value = 0.0;
        } else {
            activationsMesh.material.uniforms.inputimage_normalizeK.value = 0.0;
        }

        renderer.render( scene, camera, activationsTexture );

    }

    this.renderToScreen = renderToScreen;

    function renderToScreen(){

        renderer.setScissorTest( true );
        renderer.setViewport( scene.viewport.x, scene.viewport.y, scene.viewport.w, scene.viewport.h );
        renderer.setScissor( scene.viewport.x, scene.viewport.y, scene.viewport.w, scene.viewport.h );

        renderer.render( scene, camera );

        renderer.setScissorTest( false );

    }


    this.backward = function() {

        gradientsMesh = makeGradientsMesh( input_texture, _this.dw );

        var grad_camera = new THREE.OrthographicCamera(
            this.out_sx  / - 2,
            this.out_sx  / 2,
            this.out_sy / 2,
            this.out_sy / - 2,
            0, 1 );
        var grad_scene = new THREE.Scene();

        grad_scene.add( gradientsMesh );

        renderer.render( grad_scene, grad_camera, gradientsTexture );

        if ( id > 0 ) this.buildInputLayerGradients();


        renderToScreen();

        function renderToScreen(){

            var grad_mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry(1,1), new THREE.MeshBasicMaterial({
                map: gradientsTexture.texture
            }) );
            var grad_camera = new THREE.OrthographicCamera(
                1 / - 2,
                1 / 2,
                1 / 2,
                1 / - 2, 0, 1 );
            var grad_scene = new THREE.Scene();
            grad_scene.add( grad_mesh );

            grad_scene.viewport = {
                x: _this.displayFrame.left + _this.displayFrame.weightsWidth,
                y: renderer.getSize().height - _this.in_sx * _this.Nfilters,
                w: _this.displayFrame.weightsWidth,
                h: _this.in_sx * _this.Nfilters
            };

            renderer.setScissorTest( true );
            renderer.setViewport( grad_scene.viewport.x, grad_scene.viewport.y, grad_scene.viewport.w, grad_scene.viewport.h );
            renderer.setScissor( grad_scene.viewport.x, grad_scene.viewport.y, grad_scene.viewport.w, grad_scene.viewport.h );

            renderer.render( grad_scene, grad_camera );

            renderer.setScissorTest( false );

        }

    }

    this.buildInputLayerGradients = function() {

        inputLayerGradientsMesh = makeInputLayerGradientsMesh( _this.weightsTexture, _this.dw );

        var grad_camera = new THREE.OrthographicCamera(
            this.out_sx  / - 2,
            this.out_sx  / 2,
            this.out_sy / 2,
            this.out_sy / - 2,
            0, 1 );
        var grad_scene = new THREE.Scene();

        grad_scene.add( inputLayerGradientsMesh );

        renderer.render( grad_scene, grad_camera, inputLayerGradientsTexture );

        input_layer.dw = inputLayerGradientsTexture.texture;

    }

    this.updateFilter = function() {

        //var size = input_layer.out_sx;
        //var Nfilters = input_layer.out_sx;
        //var filterDepth = input_layer.Nfilters;

        var texture = new THREE.WebGLRenderTarget( sx, sx * Nfilters * filterDepth
            ,{
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                // ,wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping
                format: THREE.RGBAFormat, type: THREE.FloatType
            }
        );

        var geometry = new THREE.PlaneBufferGeometry( 2, 2 );
        var material, mesh;

        material = new THREE.RawShaderMaterial( {
            uniforms: {
                grad_texture: { value: gradientsTexture.texture },
                w_texture: { value: _this.weightsTexture }
            },

            //uniforms: { rand_c: { value: new THREE.Vector2( 0.5, 0.5 ) } },
            vertexShader: vertex_shader,
            fragmentShader: fragment_shader_updateFilter
        } );

        mesh = new THREE.Mesh( geometry, material );

        weights_scene = new THREE.Scene();
        weights_camera = new THREE.OrthographicCamera(
            sx / - 2,
            sx / 2,
            sx * Nfilters * filterDepth / 2,
            sx * Nfilters * filterDepth / - 2, 0, 1 );

        weights_scene.add( mesh );

        renderer.render( weights_scene, weights_camera, texture );

        _this.weightsTexture = texture.texture;

        activationsMesh.material.uniforms.w_texture.value = texture.texture;   // For next forward pass

        renderToScreen( texture );

        function renderToScreen( texture ){

            var noise_mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry(1,1), new THREE.MeshBasicMaterial({
                map: texture.texture
            }) );
            weights_camera = new THREE.OrthographicCamera(
                1 / - 2,
                1 / 2,
                1 / 2,
                1 / - 2, 0, 1 );
            weights_scene = new THREE.Scene();
            weights_scene.add( noise_mesh );

            weights_scene.viewport = {
                x: _this.displayFrame.left,
                y: renderer.getSize().height - Nfilters * filterDepth * _this.displayFrame.weightsWidth,
                w: _this.displayFrame.weightsWidth,
                h: Nfilters * filterDepth * _this.displayFrame.weightsWidth
            };

            renderer.setScissorTest( true );
            renderer.setViewport( weights_scene.viewport.x, weights_scene.viewport.y, weights_scene.viewport.w, weights_scene.viewport.h );
            renderer.setScissor( weights_scene.viewport.x, weights_scene.viewport.y, weights_scene.viewport.w, weights_scene.viewport.h );

            renderer.render( weights_scene, weights_camera );

            renderer.setScissorTest( false );

        }


    }



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
        'uniform vec2 num_filters;',
        'uniform float mode_test;',

        //'uniform float filter_size;',
        'uniform float inputimage_normalizeK;',
        'uniform sampler2D in_texture;  //inputs (x)',
        'uniform sampler2D w_texture;     //weights and biases',
        //'uniform sampler2D back_texture; // w deltas',
        'varying vec2 vUv;',
        //'varying float vFilter_size;',

        'vec4 get_pixel(in vec2 coords, in vec2 dvec) {',
        '   return texture2D(in_texture, coords + dvec);',
        '}',

        'vec4 Convolve( in vec2 coord, in sampler2D kernel, in sampler2D texture,',
        'in float denom) {',

            'vec4 res = vec4(0.0);',

            'float vFilter_size = 3.0;',

            //'float normalizeK = 0.0;',

            //'if (mode_inputimage == 1) normalizeK = 0.5;',

            'for (float i=0.0; i < 3.0; i++) {',

                'float lookupDeltaY = ( i - 1.0 ) / resolution.y / 1.0;',

                'for (float j=0.0; j < 3.0; j++) {',

                '   float lookupDeltaX = ( j - 1.0 ) / resolution.x;',


                //'   float liftH = floor( vUv.x * num_filters.x );',
                '   float liftW = floor( vUv.y * num_filters.y );',

                '   float stepDeltaX = 1.0 / vFilter_size;',
                '   float offsetDeltaX = stepDeltaX / 2.0;',
                '   float wDeltaX = ( 1.0 ) * ( j * stepDeltaX ) + offsetDeltaX;',

                '   float stepDeltaY = 1.0 / vFilter_size / num_filters.y;',
                '   float offsetDeltaY = stepDeltaY / 2.0;',
                '   float wDeltaY = ( liftW * 3.0 + i ) * stepDeltaY + offsetDeltaY;',  //???

                '   vec4 w = texture2D( kernel, vec2( wDeltaX, wDeltaY ) );',
                '   vec4 inp = texture2D( texture, coord + vec2( lookupDeltaX, lookupDeltaY ) );',



                '   res += ( inp - vec4( inputimage_normalizeK ) ) * ( ( w - vec4( 0.0 ) ) * 1.0 );',

                '}',
            '}',

            //'float nom = (res.x+res.y+res.z)/3.0;',

            'float threshold = 0.0;',
            //'if ( nom < threshold ) res = vec4( vec3(0.0), 1.0); else ',
            //    'res = vec4(nom, nom, nom, 1.0);',

            'if ( res.x < threshold ) res.x = 0.0;',
            'if ( res.y < threshold ) res.y = 0.0;',
            'if ( res.z < threshold ) res.z = 0.0;',

            'res = res + vec4(0.0);',

            //'if (mode_test>0.0) return texture2D( texture, coord );',
            //'else;',

            //'return clamp( res/denom, 0.0, 1.0 );',
            'return vec4( res.xyz, 1.0 );',
        '}',

        'void main()	{',

        // Tiled coords
        'vec2 phase_tiles_coord = fract( vUv * vec2(1.0, num_filters.y ) );',
        //'vec2 phase_tiles_coord = fract( vUv * vec2(1.0, 1.0 ) );',
        //for tiling test
        //'vec4 outColorTiled = texture2D(in_texture, phase);',

        //'    if (mode==0.0){  //forward',

        // Convolve( in vec2 coord, in sampler2D kernel, in sampler2D in_texture,', 'in float denom)

        '       vec4 convolution = Convolve( phase_tiles_coord, w_texture, in_texture, 1.0 );',

        '       gl_FragColor = vec4( convolution.x, convolution.y, convolution.z, 1.0 );',

        //'   }',
        //'    else{  //backward',

        //'        float w = texture2D( texture, vUv ).x;',
        //'        float dw = texture2D( back_texture, vUv ).z;',

        //'        float newWeight = w + 0.02 * dw;',

        //'        gl_FragColor = vec4( newWeight, texture2D( texture, vUv ).yz, 1.0 );',

        //'    }',
        '}'

    ].join('\n');

    var fragment_shader_backward = [    // update weights gradients

        'precision highp float;',
        'precision highp int;',
        //'uniform vec2 resolution;',
        //'uniform vec2 num_filters;',
        'uniform sampler2D input_texture;',
        //'uniform sampler2D w_texture;',
        'uniform sampler2D gradients_texture;',
        //'uniform vec3 gradient;',
        'varying vec2 vUv;',

        'void main() {',

        '   vec4 in_act = texture2D( input_texture, vUv );',
        '   vec4 gradient = texture2D( gradients_texture, vUv );',

        '   vec4 filter_dw =  in_act * gradient;',

        '   gl_FragColor = vec4( filter_dw.xyz, 1.0 );',
        //'   gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );',

        '}'

    ].join('\n');

    var fragment_shader_backward_build_input_gradients = [      // update input layer activation gradients

        'precision highp float;',
        'precision highp int;',
        //'uniform vec2 resolution;',
        //'uniform vec2 num_filters;',
        'uniform sampler2D filter_texture;',
        //'uniform sampler2D w_texture;',
        'uniform sampler2D gradients_texture;',
        //'uniform vec3 gradient;',
        'varying vec2 vUv;',

        'void main() {',

        '   vec4 filter = texture2D( filter_texture, vUv );',
        '   vec4 gradient = texture2D( gradients_texture, vUv );',

        '   vec4 in_act_dw = filter * gradient;',

        '   gl_FragColor = vec4( in_act_dw.xyz, 1.0 );',
        //'   gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );',

        '}'

    ].join('\n');

    var fragment_shader_updateFilter = [        //update weights

        'precision highp float;',
        'precision highp int;',
        'uniform vec2 resolution;',
        'uniform vec2 num_filters;',

        'uniform sampler2D grad_texture;',
        'uniform sampler2D w_texture;',

        //'uniform vec3 gradient;',
        'varying vec2 vUv;',

        'void main() {',

        '   vec4 filter_dw = texture2D( grad_texture, vUv );',
        '   vec4 filter = texture2D( w_texture, vUv );',

        '   float l2_decay = 0.001;',
        '   vec4 l2grad = l2_decay * filter;',
        '   vec4 gij = l2grad + filter_dw;',

        '   vec4 new_filter = filter + 0.001 * ( filter_dw ) ;',

        '   gl_FragColor = vec4( new_filter.xyz, 1.0 );',
        //'   gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );',

        '}'

    ].join('\n');



    function genWeights( size, Nfilters, filterDepth ){

        var texture = new THREE.WebGLRenderTarget( size, size * Nfilters * filterDepth
            ,{ minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter,
                // ,wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping
                format: THREE.RGBAFormat, type: THREE.FloatType
            } );

        if ( noise_texture === false ) {

            var mesh = makeWeightsMesh( size );

            weights_scene = new THREE.Scene();
            weights_camera = new THREE.OrthographicCamera(
                size / - 2,
                size / 2,
                size * Nfilters * filterDepth / 2,
                size * Nfilters * filterDepth / - 2, 0, 1 );

            weights_scene.add( mesh );

            renderer.render( weights_scene, weights_camera, texture );

        } else {

            texture.texture = textures[1];

        }

        renderToScreen(  );

        function renderToScreen(  ){

            var noise_mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry(1,1), new THREE.MeshBasicMaterial({
                map: texture.texture
            }) );
            var noise_camera = new THREE.OrthographicCamera(
                1 / - 2,
                1 / 2,
                1 / 2,
                1 / - 2, 0, 1 );
            var noise_scene = new THREE.Scene();
            noise_scene.add( noise_mesh );

            noise_scene.viewport = {
                x: _this.displayFrame.left,
                y: renderer.getSize().height - Nfilters * filterDepth * _this.displayFrame.weightsWidth,
                w: _this.displayFrame.weightsWidth,
                h: Nfilters * filterDepth * _this.displayFrame.weightsWidth
            };

            renderer.setScissorTest( true );
            renderer.setViewport( noise_scene.viewport.x, noise_scene.viewport.y, noise_scene.viewport.w, noise_scene.viewport.h );
            renderer.setScissor( noise_scene.viewport.x, noise_scene.viewport.y, noise_scene.viewport.w, noise_scene.viewport.h );

            renderer.render( noise_scene, noise_camera );

            renderer.setScissorTest( false );

        }

        return texture.texture;

    }


    function makeWeightsMesh(){

        var geometry = new THREE.PlaneBufferGeometry( 2, 2 );
        var material, mesh;

        material = new THREE.RawShaderMaterial( {
            uniforms: {
                rand_c: { value: new THREE.Vector2( Math.random(), Math.random() ) },
                mode: { value: 0.0 }
            },

            //uniforms: { rand_c: { value: new THREE.Vector2( 0.5, 0.5 ) } },
            vertexShader: document.getElementById( 'vertexShader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentShader_noise' ).textContent
        } );

        mesh = new THREE.Mesh( geometry, material );

        return mesh;
    }

    function makeConvMesh( res, in_texture, w_texture ){

        var geometry = new THREE.PlaneBufferGeometry( 2, 2 );
        var material, mesh;

        //geometry.addAttribute( 'filter_size', new THREE.BufferAttribute( [sx], 1 ) );

        material = new THREE.RawShaderMaterial( {
            uniforms: {
                in_texture: {value: in_texture},
                w_texture: {value: w_texture},
                //back_texture: {value: null},
                inputimage_normalizeK: {value: 0.0},
                resolution: {value: res},
                num_filters: {value: new THREE.Vector2( 1.0, Nfilters )},
                //filter_size: {value: sx},
                //mode_test: {value: id}
            },
            vertexShader: vertex_shader,
            fragmentShader: fragment_shader
        } );

        mesh = new THREE.Mesh( geometry, material );

        return mesh;
    }



    function makeGradientsMesh( input_texture, gradient_texture ){

        var geometry = new THREE.PlaneBufferGeometry( 2, 2 );
        var material, mesh;

        //geometry.addAttribute( 'filter_size', new THREE.BufferAttribute( [sx], 1 ) );

        material = new THREE.RawShaderMaterial( {
            uniforms: {
                input_texture: {value: input_texture},
                //w_texture: {value: w_texture},
                gradient_texture: {value: gradient_texture},
                //gradient: {value: new THREE.Vector3(0.0)},
                //update_filters: {value: 0.0},
                //num_filters: {value: new THREE.Vector2( 1.0, out_depth )},
            },
            vertexShader: vertex_shader,
            fragmentShader: fragment_shader_backward
        } );

        mesh = new THREE.Mesh( geometry, material );

        return mesh;
    }

    function makeInputLayerGradientsMesh( filter_texture, gradient_texture ){

        var geometry = new THREE.PlaneBufferGeometry( 2, 2 );
        var material, mesh;

        //geometry.addAttribute( 'filter_size', new THREE.BufferAttribute( [sx], 1 ) );

        material = new THREE.RawShaderMaterial( {
            uniforms: {
                input_texture: {value: filter_texture},
                //w_texture: {value: w_texture},
                gradient_texture: {value: gradient_texture},
                //gradient: {value: gradient},
                //update_filters: {value: 0.0},
                //num_filters: {value: new THREE.Vector2( 1.0, out_depth )},
            },
            vertexShader: vertex_shader,
            fragmentShader: fragment_shader_backward_build_input_gradients
        } );

        mesh = new THREE.Mesh( geometry, material );

        return mesh;
    }




}