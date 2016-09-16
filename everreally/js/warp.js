/**
 * Created by mika on 16.09.2016.
 */
if (!Detector.webgl) Detector.addGetWebGLMessage();
var container;
var camera, scene, renderer;
var object;

var loader = new THREE.TextureLoader();
var texture = loader.load( 'images/unwarped_transparent.png', init );
//var texture = loader.load( 'images/logo2.png', init );
//init();


function drawText() {

    var canvas = document.createElement( 'canvas' );
    canvas.width = 720;
    canvas.height = 495;

    var ctx = canvas.getContext( '2d' );

    //ctx.rect(0, 0, canvas.width, canvas.height);
    //ctx.fillStyle = "#334CFF";
    //ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.font = "normal 160px Alte Haas Grotesk Bold";

    ctx.save();
    ctx.textBaseline = "bottom";
    ctx.fillText("Ever", 70, 260);
    ctx.textBaseline = "top";
    ctx.fillText("Really", 70, 200);
    ctx.restore();

    return canvas;
}

function drawTextAsImage() {
    var canvas = document.createElement( 'canvas' );
    canvas.width = 720;
    canvas.height = 495;
    var ctx = canvas.getContext( '2d' );
    ctx.drawImage( img, 0, 0 );
    return canvas;
}

function init() {

    container = document.getElementById('logo');
    var width = container.clientWidth;
    var height = container.clientHeight;

    // scene
    scene = new THREE.Scene();

    // camera
    camera = new THREE.PerspectiveCamera( 30, width / height, 1, 10000 );
    camera.position.z = 1;
    scene.add( camera );

    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    //var texture = new THREE.Texture( drawTextAsImage() );
    //texture.needsUpdate = true;

    var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

    var uniforms = THREE.UniformsUtils.clone( WarpShader.uniforms );

    var w = 495, h = 720;

    uniforms[ "tDiffuse" ].value = texture;
    uniforms[ "radius" ].value = 300;
    uniforms[ "angle" ].value = 4.0 * (0.5 - Math.random());
    uniforms[ "center" ].value = new THREE.Vector2(
        w / 2 + w / 4 * (0.5 - Math.random()),
        h / 2 + h / 4 * (0.5 - Math.random())
    );
    uniforms[ "texSize" ].value = new THREE.Vector2( w, h );
    uniforms[ "strength" ].value = 0.65;

    var warp_material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: WarpShader.vertexShader,
        fragmentShader: WarpShader.fragmentShader
    } );


    object = new THREE.Mesh( geometry, warp_material );
    scene.add( object );

    // renderer
    renderer = new THREE.WebGLRenderer( {antialias: true, alpha: true} );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( width, height );
    container.appendChild( renderer.domElement );

    render();
}

function render() {

    renderer.render( scene, camera );

}