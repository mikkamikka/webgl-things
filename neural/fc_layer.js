/**
 * Created by mika on 25.03.2017.
 */
//layer_defs.push({type:'conv', sx:5, filters:16, stride:1, pad:2, activation:'relu'});

var FCLayer = function( id, renderer, out_depth, input_layer ) {

    var filterDepth, input_texture, input_texture_size;

    var _this = this;

    //this.sx = sx; // filter size. Should be odd if possible, it's cleaner.
    //this.sy = sx;
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
    var displayViewRatio = 10.0;

    this.displayFrame = {
        left: 0.0,
        right: 0.0,
        weightsWidth: 10
    }

    this.out_act = [];

    this.dw = [];


    // for the first layer
    this.setInputTexture = function( texture, size ) {

        input_texture = texture;

        input_texture_size = size;

    }

    var subs = 1;
    var lastResX = undefined;
    var lastResY = undefined;

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

            this.Nfilters = input_layer.out_depth;

            console.log("FC input filters: ", this.Nfilters);


            this.in_sx = input_texture_size;
            this.in_sy = input_texture_size;

            this.displayFrame.left = input_layer.displayFrame.right;

        }

        this.displayFrame.right = this.displayFrame.left + this.in_sx + this.displayFrame.weightsWidth;


        // output texture size
        this.out_sx = 1;
        this.out_sy = out_depth;


        this.out_depth = out_depth;

        this.weightsTexture = genWeights( input_layer.out_sx, input_layer.out_sx, filterDepth );

        var filters_viewport = {
            x: _this.displayFrame.left,
            y: renderer.getSize().height - input_layer.out_sx * filterDepth * _this.displayFrame.weightsWidth,
            w: _this.displayFrame.weightsWidth,
            h: input_layer.out_sx * filterDepth * _this.displayFrame.weightsWidth
        };

        renderTextureToScreen( this.weightsTexture, filters_viewport );

        // Create the texture that will store our result
        activationsTexture = new THREE.WebGLRenderTarget( this.out_sx * 6.0, this.out_sx * 6.0 * 128.0
            ,{  //minFilter: THREE.LinearFilter ,
                //magFilter: THREE.LinearFilter,
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                format: THREE.RGBAFormat, type: THREE.FloatType
            }
        );
        this.activationsTexture = activationsTexture;

        gradientsTexture = new THREE.WebGLRenderTarget( input_layer.out_sx, input_layer.out_sx * input_layer.out_sx * input_layer.Nfilters
            ,{
                //minFilter: THREE.NearestFilter,
                //magFilter: THREE.NearestFilter,
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat, type: THREE.FloatType
            }
        );
        this.gradientsTexture = gradientsTexture;

        inputLayerGradientsTexture = new THREE.WebGLRenderTarget( input_layer.out_sx, input_layer.out_sx * input_layer.out_sx * input_layer.Nfilters
            ,{
                //minFilter: THREE.NearestFilter,
                //magFilter: THREE.NearestFilter,
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat, type: THREE.FloatType
            }
        );

        //makeConvMesh( res, in_texture, w_texture );
        activationsMesh = makeFCMesh( new THREE.Vector2( this.out_sx, this.out_sy ), input_texture, this.weightsTexture );

        camera = new THREE.OrthographicCamera(
            this.out_sx  / - 2,
            this.out_sx  / 2,
            this.out_sy / 2,
            this.out_sy / - 2,
            0, 1 );
        scene = new THREE.Scene();

        scene.add( activationsMesh );

        scene.viewport = {
            x: this.displayFrame.left + this.displayFrame.weightsWidth * 2.0,
            y: renderer.getSize().height - this.out_sy * displayViewRatio,
            w: this.out_sx * displayViewRatio,
            h: this.out_sy * displayViewRatio
        };

    }

    function renderToScreen(){

        renderer.setScissorTest( true );
        renderer.setViewport( scene.viewport.x, scene.viewport.y, scene.viewport.w, scene.viewport.h );
        renderer.setScissor( scene.viewport.x, scene.viewport.y, scene.viewport.w, scene.viewport.h );

        renderer.render( scene, camera );

        renderer.setScissorTest( false );

    }

    var renderToTextureAndSubsample = function() {

        renderer.render( scene, camera, activationsTexture );


        lastResX =  _this.out_sx * 6.0;

        lastResY =  _this.out_sx * 6 * 128;

        var subsampled, prevSubsampled;

        prevSubsampled = activationsTexture;

        while ( lastResY > 24 ) {

            if ( lastResX > 3.0 ) lastResX = lastResX / 2.0;

            if ( lastResY > 24.0 ) lastResY = lastResY / 2.0;


            subsampled = subsampleToTexture( prevSubsampled.texture, lastResX, lastResY );

            prevSubsampled = subsampled;

        }

        subs = 1;

        return subsampled;

    }


    function renderSumAvg( texture ) {

        _this.out_act = [];

        var sum_material = new THREE.RawShaderMaterial( {
            uniforms: {
                in_texture: {value: texture},
            },
            vertexShader: vertex_shader,
            fragmentShader: fragment_shader_summa
        } );

        var sum_mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry(1,1), sum_material );
        var sum_camera = new THREE.OrthographicCamera(
            1 / - 2,
            1 / 2,
            1 / 2,
            1 / - 2, 0, 1 );
        var sum_scene = new THREE.Scene();
        sum_scene.add( sum_mesh );

        var sumTexture = new THREE.WebGLRenderTarget( 1, 1
            ,{  //minFilter: THREE.LinearFilter ,
                //magFilter: THREE.LinearFilter,
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                format: THREE.RGBAFormat, type: THREE.FloatType
            }
        );

        renderer.render( sum_scene, sum_camera, sumTexture );

        //create buffer for reading single pixel
        //var pixelBuffer = new Uint8Array( 4 );
        var pixelBuffer = new Float32Array( 4 );
        //read the pixel under the mouse from the texture
        renderer.readRenderTargetPixels(sumTexture, 0.0, 0.0, 1, 1, pixelBuffer);


        var sum_scr_scene_viewport = {
            x: _this.displayFrame.left + _this.displayFrame.weightsWidth + 100,
            y: renderer.getSize().height - 2 * displayViewRatio,
            w: 2 * displayViewRatio,
            h: 2 * displayViewRatio
        };

        renderTextureToScreen( sumTexture.texture, sum_scr_scene_viewport, false );

        return pixelBuffer;

    }

    function subsampleToTexture( texture, subResX, subResY ) {

        //texture.minFilter = THREE.LinearFilter;
        //texture.magFilter = THREE.LinearFilter;

        var sub_mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry(1,1), new THREE.MeshBasicMaterial({
            map: texture
        }) );
        var sub_camera = new THREE.OrthographicCamera(
            1 / - 2,
            1 / 2,
            1 / 2,
            1 / - 2, 0, 1 );
        var sub_scene = new THREE.Scene();
        sub_scene.add( sub_mesh );

        //var subResX =  _this.out_sx *12.0 / subs;

        //var subResY = _this.out_sx *120.0 / (subs * 2.0);

        console.log( 'subResX: ', subResX, '   subResY: ', subResY );

        var subTexture = new THREE.WebGLRenderTarget( subResX, subResY
            ,{  minFilter: THREE.LinearFilter ,
                magFilter: THREE.LinearFilter,
                //minFilter: THREE.NearestFilter,
                //magFilter: THREE.NearestFilter
                format: THREE.RGBAFormat, type: THREE.FloatType
            }
        );

        renderer.render( sub_scene, sub_camera, subTexture );

        //renderSubsampleToScreen( subTexture.texture, 12 * subs );

        subTexture.texture.minFilter = THREE.LinearFilter;
        subTexture.texture.magFilter = THREE.LinearFilter;

        var subsample_scene_viewport = {
            x: _this.displayFrame.left + _this.displayFrame.weightsWidth * 2.0 + 12 * subs,
            y: renderer.getSize().height - _this.out_sy * displayViewRatio,
            w: _this.out_sx * displayViewRatio,
            h: _this.out_sy * displayViewRatio
        };

        renderTextureToScreen( subTexture.texture, subsample_scene_viewport, false );

        subs ++;

        return subTexture;

    }


    this.forward = function() {

        renderToScreen();

        var subsampled = renderToTextureAndSubsample();

        var result = renderSumAvg( subsampled.texture );

        console.log('readPixel: ', result);

        this.out_act.push( result );


    }

    // compute filter gradients
    this.backward = function() {

        gradientsMesh = makeGradientsMesh( new THREE.Vector2( this.out_sx, this.out_sy ), input_texture );

        var grad_camera = new THREE.OrthographicCamera(
            this.out_sx  / - 2,
            this.out_sx  / 2,
            this.out_sy / 2,
            this.out_sy / - 2,
            0, 1 );
        var grad_scene = new THREE.Scene();

        grad_scene.add( gradientsMesh );

        //var l_rate = 0.1;

        gradientsMesh.material.uniforms.gradient.value.x = this.dw[0].x;
        gradientsMesh.material.uniforms.gradient.value.y = this.dw[0].y;
        gradientsMesh.material.uniforms.gradient.value.z = this.dw[0].z;

        renderer.render( grad_scene, grad_camera, gradientsTexture );

        grad_scene.viewport = {
            x: _this.displayFrame.left + _this.displayFrame.weightsWidth,
            y: renderer.getSize().height - _this.in_sx * _this.Nfilters * _this.displayFrame.weightsWidth,
            w: _this.displayFrame.weightsWidth,
            h: _this.in_sx * _this.Nfilters * _this.displayFrame.weightsWidth
        };

        renderTextureToScreen( gradientsTexture.texture, grad_scene.viewport );

        this.buildInputLayerGradients();

    }

    this.buildInputLayerGradients = function() {

        inputLayerGradientsMesh = makeInputLayerGradientsMesh( _this.weightsTexture, new THREE.Vector3(this.dw[0].x, this.dw[0].y, this.dw[0].z) );

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

    // update filter weights
    this.updateFilter = function() {

        var size = input_layer.out_sx;
        var Nfilters = input_layer.out_sx;
        var filterDepth = input_layer.out_depth;

        var texture = new THREE.WebGLRenderTarget( size, size * Nfilters * filterDepth
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
                w_texture: { value: _this.weightsTexture },
                learning_rate: { value: learning_rate },
                l2_decay: { value: l2_decay }
            },

            //uniforms: { rand_c: { value: new THREE.Vector2( 0.5, 0.5 ) } },
            vertexShader: vertex_shader,
            fragmentShader: fragment_shader_updateFilter
        } );

        mesh = new THREE.Mesh( geometry, material );

        weights_scene = new THREE.Scene();
        weights_camera = new THREE.OrthographicCamera(
            size / - 2,
            size / 2,
            size * Nfilters * filterDepth / 2,
            size * Nfilters * filterDepth / - 2, 0, 1 );

        weights_scene.add( mesh );

        renderer.render( weights_scene, weights_camera, texture );

        _this.weightsTexture = texture.texture;

        activationsMesh.material.uniforms.w_texture.value = texture.texture;   // For next forward pass

        weights_scene.viewport = {
            x: _this.displayFrame.left,
            y: renderer.getSize().height - Nfilters * filterDepth * _this.displayFrame.weightsWidth,
            w: _this.displayFrame.weightsWidth,
            h: Nfilters * filterDepth * _this.displayFrame.weightsWidth
        };

        renderTextureToScreen( texture.texture, weights_scene.viewport );

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
        'uniform sampler2D in_texture;  //inputs (x)',
        'varying vec2 vUv;',
        'void main()	{',
        '    vUv = uv;',
        '    gl_Position = vec4( position, 1.0 );',
        '}'
    ].join('\n');

    var fragment_shader = [

        'precision highp float;',
        'precision highp int;',

        'uniform vec2 resolution;',
        'uniform vec2 num_filters;',
        'uniform float mode_test;',

        'uniform float mode;',
        'uniform sampler2D in_texture;  //inputs (x)',
        'uniform sampler2D w_texture;     //weights and biases',
        'uniform sampler2D back_texture; // w deltas',
        'varying vec2 vUv;',

        'void main()	{',

        '    if (mode==0.0){  //forward',

        '       vec4 mul =  ( texture2D(in_texture, vUv) - vec4(0.0) ) * ( texture2D(w_texture, vUv) - vec4(0.0) );',

        // ReLU
        //'        vec4 adapted = clamp( mul, 0.0, 10.0 );',

        '        gl_FragColor = vec4( mul.xyz, 1.0 );',


        '   }',

        '}'

    ].join('\n');

    var fragment_shader_summa = [

        'precision highp float;',
        'precision highp int;',
        'uniform vec2 resolution;',
        'uniform vec2 num_filters;',
        'uniform sampler2D in_texture;  //inputs (x)',
        'varying vec2 vUv;',

        'vec4 Summa( in vec2 coord, in sampler2D texture )',
        '{',

            'vec4 sum = vec4(0.0);',

            'float offsetY = 1.0/48.0;',
            'float offsetX = 1.0/6.0;',

            'for (float i=0.0; i < 24.0; i++) {',

                'float lookupDeltaY = i / 24.0;',

                'for (float j=0.0; j < 3.0; j++) {',

                '   float lookupDeltaX = j / 3.0;',

                '   vec4 inp = texture2D( texture, vec2( lookupDeltaX + offsetX, lookupDeltaY + offsetY ) );',

                '   sum += inp;',

                '}',
            '}',

            //'sum = sum + vec4(0.5);',
            //'return clamp( sum / 4.0, 0.0, 1.0 );',
            'return vec4( sum.xyz / 4.0, 1.0 );',
        '}',

        'void main()	{',

        // Tiled coords
        //'vec2 phase_tiles_coord = fract( vUv * vec2(1.0, num_filters.y ) );',

        //for tiling test
        //'vec4 outColorTiled = texture2D(in_texture, phase);',

        '   vec4 summa =  Summa( vec2(0.0), in_texture );',

        //'   vec4 adapted = mul * 2.0 + vec4(0.0);',

        '   gl_FragColor = vec4( summa.xyz, 1.0 );',

        '}'

    ].join('\n');

    var fragment_shader_backward = [

        'precision highp float;',
        'precision highp int;',
        'uniform sampler2D input_texture;',
        'uniform vec3 gradient;',
        'varying vec2 vUv;',

        'void main() {',

        '   vec4 in_act = texture2D( input_texture, vUv );',
        //'   vec4 filter = texture2D( w_texture, vUv );',

        '   vec4 filter_dw = - in_act * vec4( gradient, 1.0 );',

        '   gl_FragColor = vec4( filter_dw.xyz, 1.0 );',
        //'   gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );',

        '}'

    ].join('\n');

    var fragment_shader_backward_build_input_gradients = [

        'precision highp float;',
        'precision highp int;',
        //'uniform vec2 resolution;',
        //'uniform vec2 num_filters;',
        'uniform sampler2D filter_texture;',
        //'uniform sampler2D w_texture;',
        //'uniform sampler2D gradients_texture;',
        'uniform vec3 gradient;',
        'varying vec2 vUv;',

        'void main() {',

        '   vec4 filter = texture2D( filter_texture, vUv );',
        //'   vec4 filter = texture2D( w_texture, vUv );',

        '   vec4 in_act_dw = filter * vec4( gradient, 1.0 );',

        '   gl_FragColor = vec4( in_act_dw.xyz, 1.0 );',
        //'   gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );',

        '}'

    ].join('\n');

    var fragment_shader_updateFilter = [

        'precision highp float;',
        'precision highp int;',
        'uniform vec2 resolution;',
        'uniform vec2 num_filters;',
        'uniform float learning_rate;',
        'uniform float l2_decay;',

        'uniform sampler2D grad_texture;',
        'uniform sampler2D w_texture;',

        //'uniform vec3 gradient;',
        'varying vec2 vUv;',

        'void main() {',

        '   vec4 filter_dw = texture2D( grad_texture, vUv );',
        '   vec4 filter_w = texture2D( w_texture, vUv );',

        //'   float l2_decay = 0.001;',
        '   vec4 l2grad = l2_decay * filter_w;',
        //'   vec4 l1grad = vec4(1.0);',
        //'   if (filter.x < 0.0) l1grad.x = -1.0;',
        //'   if (filter.y < 0.0) l1grad.y = -1.0;',
        //'   if (filter.z < 0.0) l1grad.z = -1.0;',
        '   vec4 gij = l2grad + filter_dw;',

        '   vec4 new_filter = filter_w + learning_rate * ( filter_dw ) ;',

        '   gl_FragColor = vec4( new_filter.xyz, 1.0 );',
        //'   gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );',

        '}'

    ].join('\n');

    function genWeights( size, Nfilters, filterDepth ){

        var texture = new THREE.WebGLRenderTarget( size, size * Nfilters * filterDepth
            ,{ minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter,
                // ,wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping
                format: THREE.RGBAFormat, type: THREE.FloatType
            }
        );

        if ( true ) {

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

    function makeFCMesh( res, in_texture, w_texture ){

        var geometry = new THREE.PlaneBufferGeometry( 2, 2 );
        var material, mesh;

        //geometry.addAttribute( 'filter_size', new THREE.BufferAttribute( [sx], 1 ) );

        material = new THREE.RawShaderMaterial( {
            uniforms: {
                in_texture: {value: in_texture},
                w_texture: {value: w_texture},
                back_texture: {value: null},
                mode: {value: 0.0},  // forward: 0.0, backprop: 1.0
                resolution: {value: res},
                num_filters: {value: new THREE.Vector2( 1.0, out_depth )},
                //filter_size: {value: sx},
                //mode_test: {value: id}
            },
            vertexShader: vertex_shader,
            fragmentShader: fragment_shader
        } );

        mesh = new THREE.Mesh( geometry, material );

        return mesh;
    }

    function makeGradientsMesh( res, input_texture ){

        var geometry = new THREE.PlaneBufferGeometry( 2, 2 );
        var material, mesh;

        //geometry.addAttribute( 'filter_size', new THREE.BufferAttribute( [sx], 1 ) );

        material = new THREE.RawShaderMaterial( {
            uniforms: {
                input_texture: {value: input_texture},
                //w_texture: {value: w_texture},
                //grad_texture: {value: null},
                gradient: {value: new THREE.Vector3(0.0)},
                //update_filters: {value: 0.0},
                num_filters: {value: new THREE.Vector2( 1.0, out_depth )},
            },
            vertexShader: vertex_shader,
            fragmentShader: fragment_shader_backward
        } );

        mesh = new THREE.Mesh( geometry, material );

        return mesh;
    }

    function makeInputLayerGradientsMesh( filter_texture, gradient ){

        var geometry = new THREE.PlaneBufferGeometry( 2, 2 );
        var material, mesh;

        //geometry.addAttribute( 'filter_size', new THREE.BufferAttribute( [sx], 1 ) );

        material = new THREE.RawShaderMaterial( {
            uniforms: {
                input_texture: {value: filter_texture},
                //w_texture: {value: w_texture},
                //grad_texture: {value: null},
                gradient: {value: gradient},
                //update_filters: {value: 0.0},
                num_filters: {value: new THREE.Vector2( 1.0, out_depth )},
            },
            vertexShader: vertex_shader,
            fragmentShader: fragment_shader_backward_build_input_gradients
        } );

        mesh = new THREE.Mesh( geometry, material );

        return mesh;
    }

}