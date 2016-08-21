/**
 * Created by mika on 05.07.2016.
 */
if ( !window.requestAnimationFrame ) {
    window.requestAnimationFrame = ( function() {
        return window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function ( callback, element ) {
                window.setTimeout( callback, 1000 / 60 );
            };
    } )();
}


var quality = 1, quality_levels = [ 0.5, 1, 2, 4, 8 ];
var canvas, gl, buffer, currentProgram, vertexPosition,
    parameters = { startTime: Date.now(), time: 0, mouseX: 0, mouseY: 0, screenWidth: 0, screenHeight: 0, random: 0.0 },
    frontTarget;

init();
animate();

function init() {

    var effect = document.createElement( 'div' );
    document.body.appendChild( effect );

    canvas = document.createElement( 'canvas' );
    effect.appendChild( canvas );

    // Initialise WebGL

    try {
        gl = canvas.getContext( 'experimental-webgl' );
    } catch( error ) { }

    if ( !gl ) {
        alert("WebGL not supported");
        throw "cannot create webgl context";
    }

    // Create vertex buffer (2 triangles)

    buffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( [ - 1.0, - 1.0, 1.0, - 1.0, - 1.0, 1.0, 1.0, - 1.0, 1.0, 1.0, - 1.0, 1.0 ] ), gl.STATIC_DRAW );

    document.addEventListener( 'mousemove', function ( event ) {
        parameters.mouseX = event.clientX / window.innerWidth;
        parameters.mouseY = 1 - event.clientY / window.innerHeight;
    }, false );


    compileScreenProgram();

}

function compileScreenProgram() {

    var program = gl.createProgram();
    var fragment = document.getElementById( 'fragmentShader' ).textContent;
    var vertex = document.getElementById( 'vertexShader' ).textContent;

    var vs = createShader( vertex, gl.VERTEX_SHADER );
    var fs = createShader( fragment, gl.FRAGMENT_SHADER );

    gl.attachShader( program, vs );
    gl.attachShader( program, fs );

    gl.deleteShader( vs );
    gl.deleteShader( fs );

    gl.linkProgram( program );

    if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) ) {
        console.error( 'VALIDATE_STATUS: ' + gl.getProgramParameter( program, gl.VALIDATE_STATUS ), 'ERROR: ' + gl.getError() );

        return;
    }

    screenProgram = program;

    cacheUniformLocation( program, 'texture' );

}

function cacheUniformLocation( program, label ) {

    if ( program.uniformsCache === undefined ) {
        program.uniformsCache = {};
    }
    program.uniformsCache[ label ] = gl.getUniformLocation( program, label );
}


function createFrontTarget(width, height ) {

    var target = {};
    target.framebuffer = gl.createFramebuffer();
    target.renderbuffer = gl.createRenderbuffer();
    target.texture = gl.createTexture();

    var image = new Image();
    image.crossOrigin = "";
    image.onload = function() {

        // set up framebuffer
        gl.bindTexture( gl.TEXTURE_2D, target.texture );
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image );

        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );

        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
        //gl.generateMipmap(gl.TEXTURE_2D);

        gl.bindFramebuffer( gl.FRAMEBUFFER, target.framebuffer );
        gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0 );

        // set up renderbuffer
        gl.bindRenderbuffer( gl.RENDERBUFFER, target.renderbuffer );

        gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height );
        gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, target.renderbuffer );

        // clean up
        gl.bindTexture( gl.TEXTURE_2D, null );
        gl.bindRenderbuffer( gl.RENDERBUFFER, null );
        gl.bindFramebuffer( gl.FRAMEBUFFER, null);
    };
    image.src = "images/logo.png";

    return target;
}




function createRenderTargets() {

    frontTarget = createFrontTarget(parameters.screenWidth, parameters.screenHeight );

}


function createShader( src, type ) {

    var shader = gl.createShader( type );

    gl.shaderSource( shader, src );
    gl.compileShader( shader );

    if ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
        var error = gl.getShaderInfoLog( shader );
        return null;
    }

    return shader;
}


function animate() {

    requestAnimationFrame( animate );
    render();
}

function render() {

    if ( !currentProgram ) return;

    parameters.time = Date.now() - parameters.startTime;

    // Set uniforms for custom shader

    gl.useProgram( currentProgram );

    gl.uniform1i( currentProgram.uniformsCache[ 'frontbuffer' ], 0 );

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, frontTarget.texture );

    // Render front buffer to screen

    gl.bindFramebuffer( gl.FRAMEBUFFER, null );

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, 6 );


}

