/**
 * Created by mika on 09.04.2017.
 */

var shared_mesh, shared_scene, shared_camera, shared_material;
//
// shared_camera = new THREE.OrthographicCamera(
//     1 / - 2,
//     1 / 2,
//     1 / 2,
//     1 / - 2, 0, 1 );

function renderToScreen( scene, camera, viewport ){

    renderer.setScissorTest( true );

    renderer.setViewport( viewport.x, viewport.y, viewport.w, viewport.h );
    renderer.setScissor( viewport.x, viewport.y, viewport.w, viewport.h );

    renderer.render( scene, camera );

    renderer.setScissorTest( false );

}

// function renderTextureToScreen( texture, viewport ){
//
//     shared_mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry(1,1), new THREE.MeshBasicMaterial({
//         map: texture
//     }) );
//
//     shared_scene = new THREE.Scene();
//     shared_scene.add( shared_mesh );
//
//     renderer.setScissorTest( true );
//     renderer.setViewport( viewport.x, viewport.y, viewport.w, viewport.h );
//     renderer.setScissor( viewport.x, viewport.y, viewport.w, viewport.h );
//
//     renderer.render( shared_scene, shared_camera );
//
//     renderer.setScissorTest( false );
//
// }

function renderTextureToScreen( texture, viewport, shiftLevels ){

    var displayFragShader;

    if ( shiftLevels == undefined || shiftLevels == true ) {
        displayFragShader = document.getElementById( 'fragmentShader_display' ).textContent;
    } else {
        displayFragShader = document.getElementById( 'fragmentShader' ).textContent;
    }

    shared_material = new THREE.RawShaderMaterial( {
        uniforms: {
            texture: {value: texture},
        },
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: displayFragShader
    } );

    shared_mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry(2,2), shared_material );

    shared_scene = new THREE.Scene();
    shared_scene.add( shared_mesh );

    shared_camera = new THREE.OrthographicCamera(
        1 / - 2,
        1 / 2,
        1 / 2,
        1 / - 2, 0, 1 );

    renderer.setScissorTest( true );
    renderer.setViewport( viewport.x, viewport.y, viewport.w, viewport.h );
    renderer.setScissor( viewport.x, viewport.y, viewport.w, viewport.h );

    renderer.render( shared_scene, shared_camera );

    renderer.setScissorTest( false );

}