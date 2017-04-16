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

    this.out_depth = Nfilters;

    if (input_layer === undefined) {
        filterDepth = 1;
    } else {
        filterDepth = input_layer.out_depth;
    }


    // for the first layer
    this.setInputTexture = function( texture, size ) {

        input_texture = texture;

        input_texture_size = size;

    }

    this.init = function() {

        if (input_layer === undefined) {

            this.displayFrame.left = 0;
            //this.displayFrame.right = input_texture_size * displayViewRatio;

            this.in_sx = input_texture_size;
            this.in_sy = input_texture_size;


        } else {

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

        this.weightsTexture = genWeights( sx, Nfilters, filterDepth );

        var filters_viewport = {
            x: this.displayFrame.left,
            y: renderer.getSize().height - Nfilters * filterDepth * this.displayFrame.weightsWidth,
            w: this.displayFrame.weightsWidth,
            h: Nfilters * filterDepth * this.displayFrame.weightsWidth
        };

        renderTextureToScreen( this.weightsTexture, filters_viewport );

        // Create the texture that will store our result
        activationsTexture = new THREE.WebGLRenderTarget( this.out_sx, this.out_sy * Nfilters
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
        activationsMesh = makeConvMesh(
            new THREE.Vector2( this.out_sx, this.out_sy * Nfilters * filterDepth ),
            input_texture,
            this.weightsTexture );

        camera = new THREE.OrthographicCamera(
            this.out_sx  / - 2,
            this.out_sx  / 2,
            this.out_sy * Nfilters / 2,
            this.out_sy * Nfilters / - 2,
            0, 1 );
        scene = new THREE.Scene();

        scene.add( activationsMesh );

        scene.viewport = {
            x: this.displayFrame.left + this.displayFrame.weightsWidth,
            y: renderer.getSize().height - this.in_sy * Nfilters * displayViewRatio,
            w: this.in_sx * displayViewRatio,
            h: this.in_sy * Nfilters * displayViewRatio
        };

    }


    var renderToTexture = function() {

        if ( id == 0 ) {
            activationsMesh.material.uniforms.inputimage_normalizeK.value = 0.5;
        } else {
            activationsMesh.material.uniforms.inputimage_normalizeK.value = 0.0;
        }

        renderer.render( scene, camera, activationsTexture );

    }


    this.forward = function() {

        renderToTexture();

        //renderToScreen( scene, camera, scene.viewport );

        renderTextureToScreen( activationsTexture.texture, scene.viewport );
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

        var viewport_grad = {
                x: _this.displayFrame.left + _this.displayFrame.weightsWidth,
                y: renderer.getSize().height - _this.in_sx * _this.Nfilters,
                w: _this.displayFrame.weightsWidth,
                h: _this.in_sx * _this.Nfilters
            };

        renderTextureToScreen( gradientsTexture.texture, viewport_grad );

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

        var updated_filter_weights_texture = new THREE.WebGLRenderTarget( sx, sx * Nfilters * filterDepth
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
            sx / - 2,
            sx / 2,
            sx * Nfilters * filterDepth / 2,
            sx * Nfilters * filterDepth / - 2, 0, 1 );

        weights_scene.add( mesh );

        renderer.render( weights_scene, weights_camera, updated_filter_weights_texture );

        this.weightsTexture = updated_filter_weights_texture.texture;

        activationsMesh.material.uniforms.w_texture.value = updated_filter_weights_texture.texture;   // For next forward pass

        weights_scene.viewport = {
            x: _this.displayFrame.left,
            y: renderer.getSize().height - Nfilters * filterDepth * _this.displayFrame.weightsWidth,
            w: _this.displayFrame.weightsWidth,
            h: Nfilters * filterDepth * _this.displayFrame.weightsWidth
        };

        renderTextureToScreen( updated_filter_weights_texture.texture, weights_scene.viewport );

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
        'uniform float mode;',

        //'uniform float filter_size;',
        'uniform float inputimage_normalizeK;',
        'uniform sampler2D in_texture;  //inputs (x)',
        'uniform sampler2D w_texture;     //weights and biases',
        //'uniform sampler2D back_texture; // w deltas',
        'varying vec2 vUv;',
        //'varying float vFilter_size;',

        'float Convolve( in vec2 coord, in sampler2D kernel, in sampler2D texture,',
        'in float denom) {',

            'float res = 0.0;',

            'float vFilter_size = 3.0;',

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
                '   vec4 in_act = texture2D( texture, coord + vec2( lookupDeltaX, lookupDeltaY ) );',


                //'   res += ( in_act - vec4( inputimage_normalizeK ) ) * ( ( w - vec4( 0.0 ) ) * 1.0 );',
                '   res += ( in_act.x - inputimage_normalizeK ) * w.x;',
                '   res += ( in_act.y - inputimage_normalizeK ) * w.y;',
                '   res += ( in_act.z - inputimage_normalizeK ) * w.z;',

                '}',
            '}',

            'return res;',
        '}',

        'float ConvolveMul( in vec2 coord, in sampler2D kernel, in sampler2D texture,',
        'in float denom) {',

            'float res = 0.0;',

            'float vFilter_size = 3.0;',

            'for (float i=0.0; i < 3.0; i++) {',

            '   float lookupDeltaY = ( i - 1.0 ) / resolution.y / 1.0;',

            '   for (float j=0.0; j < 3.0; j++) {',

            '       float lookupDeltaX = ( j - 1.0 ) / resolution.x;',

            //'   float liftH = floor( vUv.x * num_filters.x );',
            '       float liftW = floor( vUv.y * num_filters.y );',

            '       float stepDeltaX = 1.0 / vFilter_size;',
            '       float offsetDeltaX = stepDeltaX / 2.0;',
            '       float wDeltaX = j * stepDeltaX + offsetDeltaX;',

            '       float stepDeltaY = 1.0 / vFilter_size / num_filters.y;',
            '       float offsetDeltaY = stepDeltaY / 2.0;',
            '       float wDeltaY = ( liftW * 3.0 + i ) * stepDeltaY + offsetDeltaY;',  //???

            '       vec4 w = texture2D( kernel, vec2( wDeltaX, wDeltaY ) );',
            '       vec4 in_act = texture2D( texture, coord + vec2( lookupDeltaX, lookupDeltaY ) );',

            //'       res += ( in_act.x - inputimage_normalizeK ) * w.x;',
            //'       res += in_act.x * ( i + j - 2.0 ) / 1.0;',  //check
            '       res += in_act.x * w.x;',

            '   }',
            '}',

            'return res;',
        '}',

        'void main()	{',

        // Tiled coords
        '   vec2 phase_tiles_coord = fract( vUv * vec2(1.0, num_filters.y ) );',

        '   float convolution = 0.0;',

        '    if (mode == 0.0) {  // first conv layer',

        //      Convolve( in vec2 coord, in sampler2D kernel, in sampler2D in_texture,', 'in float denom)
        '       convolution = Convolve( phase_tiles_coord, w_texture, in_texture, 1.0 );',

        '   }',

        '    else {  // not first conv layer',

        '       const float depth = ' + filterDepth.toPrecision(4) + ';',

        '       for (float i=0.0; i < depth; i++) {',

        '           float liftW = floor( vUv.y * depth );',

        '           float stepDeltaY = 1.0 / depth;',
        //'         float offsetDeltaY = stepDeltaY / 2.0;',
        '           float wDeltaY = ( liftW * depth + i ) * stepDeltaY;',

        '           vec2 phase_tiles_coord2 = fract( vUv * vec2(1.0, num_filters.y ) );',
        '           vec2 sub_coord = vec2( vUv.x, phase_tiles_coord2.y / depth + i / depth );',

        '           convolution += ConvolveMul( sub_coord, w_texture, in_texture, 1.0 );',

        //'           pix_sum += texture2D( in_texture, sub_coord ).x;',
        //'           convolution = 0.0;',

        '       };',
        //'       convolution = pix_sum;',

        '    }',

        //ReLU
        '       float threshold = 0.0;',

        '       if ( convolution < threshold ) convolution = 0.0;',

        '       convolution /= sqrt(' + filterDepth.toPrecision(4) + ');',

        '       gl_FragColor = vec4( convolution, convolution, convolution, 1.0 );',


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
        var mode = id == 0? 0 : 1;

        material = new THREE.RawShaderMaterial( {
            uniforms: {
                in_texture: {value: in_texture},
                w_texture: {value: w_texture},
                //back_texture: {value: null},
                inputimage_normalizeK: {value: 0.0},
                resolution: {value: res},
                num_filters: {value: new THREE.Vector2( 1.0, Nfilters )},
                //filter_size: {value: sx},
                mode: {value: mode}
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