/**
 * Created by mika on 19.05.2017.
 */

'use strict';

var WWOBJLoader2Example = (function () {

    var Validator = THREE.OBJLoader2.prototype._getValidator();

    function WWOBJLoader2Example( elementToBindTo ) {
        this.renderer = null;
        this.canvas = elementToBindTo;
        this.aspectRatio = 1;
        this.recalcAspectRatio();

        this.scene = null;
        this.cameraDefaults = {
            posCamera: new THREE.Vector3( 0.0, 120.0, 150.0 ),
            posCameraTarget: new THREE.Vector3( 0, 0, 0 ),
            near: 0.1,
            far: 10000,
            fov: 45
        };
        this.camera = null;
        this.cameraTarget = this.cameraDefaults.posCameraTarget;

        this.controls = null;

        this.smoothShading = true;
        this.doubleSide = true;
        this.streamMeshes = true;

        this.fogColor = 0x376fbe;

        //this.cube = null;
        this.pivot = null;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.wwObjLoader2 = new THREE.OBJLoader2.WWOBJLoader2();
        this.wwObjLoader2.setCrossOrigin( 'anonymous' );

        // Check for the various File API support.
        this.fileApiAvailable = true;
        if ( window.File && window.FileReader && window.FileList && window.Blob ) {

            console.log( 'File API is supported! Enabling all features.' );

        } else {

            this.fileApiAvailable = false;
            console.warn( 'File API is not supported! Disabling file loading.' );

        }
    }

    WWOBJLoader2Example.prototype.initGL = function () {
        this.renderer = new THREE.WebGLRenderer( {
            canvas: this.canvas,
            antialias: true,
            autoClear: true,
        } );

        this.renderer.setClearColor( 0x537899 );

        this.renderer.toneMapping = THREE.Uncharted2ToneMapping;

        this.scene = new THREE.Scene();
        //this.scene.fog = new THREE.FogExp2( 0x2d2b59, 0.0009 );
        this.scene.fog = new THREE.Fog( 0x7398b9, 15, 3000 );

        this.camera = new THREE.PerspectiveCamera( this.cameraDefaults.fov, this.aspectRatio, this.cameraDefaults.near, this.cameraDefaults.far );
        this.resetCamera();
        //this.controls = new THREE.TrackballControls( this.camera, this.renderer.domElement );

        this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
        this.controls.target.set( 0, 0, 0 );

        this.controls.update();

        var ambientLight = new THREE.AmbientLight( 0x606060 );
        var directionalLight1 = new THREE.DirectionalLight( 0xC0C090, 0.5 );
        var directionalLight2 = new THREE.DirectionalLight( 0xC0C090, 0.5 );
        var hemisphereLight = new THREE.HemisphereLight( 0xaa6622, 0x222222, 0.2 );
        var pointLight1 = new THREE.PointLight( 0xe2fc67, 0.2 );

        directionalLight1.position.set( -100, 100, 100 );
        directionalLight2.position.set( 100, 500, -100 );
        pointLight1.position.set( 100, 600, 0 );

        this.scene.add( directionalLight1 );
        this.scene.add( directionalLight2 );
        this.scene.add( ambientLight );
        this.scene.add( hemisphereLight );
        this.scene.add( pointLight1 );

        //var helper = new THREE.GridHelper( 1200, 60, 0xFF4444, 0x404040 );
        //this.scene.add( helper );


        this.createPivot();
    };

    WWOBJLoader2Example.prototype.createPivot = function () {
        this.pivot = new THREE.Object3D();
        this.pivot.name = 'Pivot';

        this.scene.add( this.pivot );
    };

    WWOBJLoader2Example.prototype.setFogColor = function (color) {

        this.scene.fog.color.set( color );

    };

    WWOBJLoader2Example.prototype.initPostGL = function () {

        var scope = this;

        var reportProgress = function ( content ) {
            console.log( 'Progress: ' + content );
        };
        var materialsLoaded = function ( materials ) {
            var count = Validator.isValid( materials ) ? materials.length : 0;
            console.log( 'Loaded #' + count + ' materials.' );
        };
        var meshLoaded = function ( name, bufferGeometry, material ) {
            console.log( 'Loaded mesh: ' + name + ' Material name: ' + material.name );
        };
        var completedLoading = function () {
            console.log( 'Loading complete!' );

            scope.setMaterials();

        };
        this.wwObjLoader2.registerCallbackProgress( reportProgress );
        this.wwObjLoader2.registerCallbackCompletedLoading( completedLoading );
        this.wwObjLoader2.registerCallbackMaterialsLoaded( materialsLoaded );
        this.wwObjLoader2.registerCallbackMeshLoaded( meshLoaded );

        return true;
    };

    WWOBJLoader2Example.prototype.loadFiles = function ( prepData ) {
        prepData.setSceneGraphBaseNode( this.pivot );
        prepData.setStreamMeshes( this.streamMeshes );
        this.wwObjLoader2.prepareRun( prepData );
        this.wwObjLoader2.run();
    };

    WWOBJLoader2Example.prototype._handleFileSelect = function ( event, pathTexture ) {
        var fileObj = null;
        var fileMtl = null;
        var files = event.target.files;

        for ( var i = 0, file; file = files[ i ]; i++) {

            if ( file.name.indexOf( '\.obj' ) > 0 && fileObj === null ) {
                fileObj = file;
            }

            if ( file.name.indexOf( '\.mtl' ) > 0 && fileMtl === null ) {
                fileMtl = file;
            }

        }

        if ( ! Validator.isValid( fileObj ) ) {
            alert( 'Unable to load OBJ file from given files.' );
        }

        var fileReader = new FileReader();
        fileReader.onload = function( fileDataObj ) {

            var uint8Array = new Uint8Array( fileDataObj.target.result );
            if ( fileMtl === null ) {

                app.loadFilesUser({
                    name: 'userObj',
                    objAsArrayBuffer: uint8Array,
                    pathTexture: pathTexture,
                    mtlAsString: null
                })

            } else {

                fileReader.onload = function( fileDataMtl ) {

                    app.loadFilesUser({
                        name: 'userObj',
                        objAsArrayBuffer: uint8Array,
                        pathTexture: pathTexture,
                        mtlAsString: fileDataMtl.target.result
                    })
                };
                fileReader.readAsText( fileMtl );

            }

        };
        fileReader.readAsArrayBuffer( fileObj );

    };

    WWOBJLoader2Example.prototype.loadFilesUser = function ( objDef ) {
        var prepData = new THREE.OBJLoader2.WWOBJLoader2.PrepDataArrayBuffer(
            objDef.name, objDef.objAsArrayBuffer, objDef.pathTexture, objDef.mtlAsString
        );
        prepData.setSceneGraphBaseNode( this.pivot );
        prepData.setStreamMeshes( this.streamMeshes );
        this.wwObjLoader2.prepareRun( prepData );
        this.wwObjLoader2.run();
    };

    WWOBJLoader2Example.prototype.resizeDisplayGL = function () {

        //this.controls.handleResize();

        this.recalcAspectRatio();
        this.renderer.setSize( this.canvas.offsetWidth, this.canvas.offsetHeight, false );

        this.updateCamera();
    };

    WWOBJLoader2Example.prototype.recalcAspectRatio = function () {
        this.aspectRatio = ( this.canvas.offsetHeight === 0 ) ? 1 : this.canvas.offsetWidth / this.canvas.offsetHeight;
    };

    WWOBJLoader2Example.prototype.resetCamera = function () {
        this.camera.position.copy( this.cameraDefaults.posCamera );
        this.cameraTarget.copy( this.cameraDefaults.posCameraTarget );

        this.updateCamera();
    };

    WWOBJLoader2Example.prototype.updateCamera = function () {
        this.camera.aspect = this.aspectRatio;
        this.camera.lookAt( this.cameraTarget );
        this.camera.updateProjectionMatrix();
    };

    WWOBJLoader2Example.prototype.render = function () {

        if ( ! this.renderer.autoClear ) this.renderer.clear();

        this.controls.update();

        this.renderer.render( this.scene, this.camera );
    };

    WWOBJLoader2Example.prototype.alterSmoothShading = function () {

        var scope = this;
        scope.smoothShading = ! scope.smoothShading;
        console.log( scope.smoothShading ? 'Enabling SmoothShading' : 'Enabling FlatShading');

        scope.traversalFunction = function ( material ) {
            material.shading = scope.smoothShading ? THREE.SmoothShading : THREE.FlatShading;
            material.needsUpdate = true;
        };
        var scopeTraverse = function ( object3d ) {
            scope.traverseScene( object3d );
        };
        scope.pivot.traverse( scopeTraverse );
    };

    WWOBJLoader2Example.prototype.alterDouble = function () {

        var scope = this;
        scope.doubleSide = ! scope.doubleSide;
        console.log( scope.doubleSide ? 'Enabling DoubleSide materials' : 'Enabling FrontSide materials');

        scope.traversalFunction  = function ( material ) {
            material.side = scope.doubleSide ? THREE.DoubleSide : THREE.FrontSide;
        };

        var scopeTraverse = function ( object3d ) {
            scope.traverseScene( object3d );
        };
        scope.pivot.traverse( scopeTraverse );
    };

    WWOBJLoader2Example.prototype.setMaterialProperty = function ( property, material_alias, value ) {

        var scope = this;
        //scope.doubleSide = ! scope.doubleSide;
        //console.log( scope.doubleSide ? 'Enabling DoubleSide materials' : 'Enabling FrontSide materials');

        scope.traversalFunction  = function ( material ) {

            if ( material.name === undefined ) return;

            var index = material.name.indexOf( material_alias );

            if ( index !== -1 ) {

                material[ property ] = value;

                material.needsUpdate = true;

                console.log( 'Material changed: ', material );

            }

        };

        var scopeTraverse = function ( object3d ) {
            scope.traverseScene( object3d );
        };
        scope.pivot.traverse( scopeTraverse );
    };

    WWOBJLoader2Example.prototype.setMaterial = function ( material_alias, value ) {

        var scope = this;
        //scope.doubleSide = ! scope.doubleSide;
        //console.log( scope.doubleSide ? 'Enabling DoubleSide materials' : 'Enabling FrontSide materials');

        scope.traversalFunction  = function ( mesh ) {

            if ( mesh.material.name === undefined ) return;

            var index = mesh.material.name.indexOf( material_alias );

            if ( index !== -1 ) {

                mesh.material = value;

                //material.needsUpdate = true;

                console.log( 'Material new assigned: ', mesh.material );

            }

        };

        var scopeTraverse = function ( object3d ) {
            scope.traverseSceneMesh( object3d );
        };
        scope.pivot.traverse( scopeTraverse );
    };

    WWOBJLoader2Example.prototype.getMaterialByMeshId = function ( mesh_id ) {

        var scope = this;
        var material;

        scope.traversalFunction  = function ( mesh ) {

            if ( mesh.name === undefined ) return;

            //var index = mesh.name.indexOf( mesh_id );

            if ( mesh.name === mesh_id ) {

                material = mesh.material;
            }

        };

        var scopeTraverse = function ( object3d ) {
            scope.traverseSceneMesh( object3d );
        };
        scope.pivot.traverse( scopeTraverse );

        return material;
    };

    WWOBJLoader2Example.prototype.splitMaterials = function () {

        var scope = this;
        //scope.doubleSide = ! scope.doubleSide;
        //console.log( scope.doubleSide ? 'Enabling DoubleSide materials' : 'Enabling FrontSide materials');

        scope.traversalFunction  = function ( mesh ) {

            if ( mesh.material.name === undefined ) return;

            mesh.material = mesh.material.clone();

            console.log( 'Material cloned: ', mesh.material );



        };

        var scopeTraverse = function ( object3d ) {
            scope.traverseSceneMesh( object3d );
        };
        scope.pivot.traverse( scopeTraverse );
    };

    WWOBJLoader2Example.prototype.traverseScene = function ( object3d ) {

        if ( object3d.material instanceof THREE.MultiMaterial ) {

            var materials = object3d.material.materials;
            for ( var name in materials ) {

                if ( materials.hasOwnProperty( name ) )	this.traversalFunction( materials[ name ] );

            }

        } else if ( object3d.material ) {

            this.traversalFunction( object3d.material );

        }

    };

    WWOBJLoader2Example.prototype.traverseSceneMesh = function ( object3d ) {

        if ( object3d instanceof THREE.Mesh ) {

            this.traversalFunction( object3d );

        }

    };

    WWOBJLoader2Example.prototype.clearAllAssests = function () {
        var scope = this;
        var remover = function ( object3d ) {

            if ( object3d === scope.pivot ) {
                return;
            }
            console.log( 'Removing: ' + object3d.name );
            scope.scene.remove( object3d );

            if ( object3d.hasOwnProperty( 'geometry' ) ) {
                object3d.geometry.dispose();
            }
            if ( object3d.hasOwnProperty( 'material' ) ) {

                var mat = object3d.material;
                if ( mat.hasOwnProperty( 'materials' ) ) {

                    var materials = mat.materials;
                    for ( var name in materials ) {

                        if ( materials.hasOwnProperty( name ) ) materials[ name ].dispose();

                    }
                }
            }
            if ( object3d.hasOwnProperty( 'texture' ) ) {
                object3d.texture.dispose();
            }
        };

        scope.scene.remove( scope.pivot );
        scope.pivot.traverse( remover );
        scope.createPivot();
    };

    var INTERSECTED;

    WWOBJLoader2Example.prototype.getIntersected = function() {
        return INTERSECTED;
    }

    WWOBJLoader2Example.prototype.checkIntercestions = function () {

        this.raycaster.setFromCamera( this.mouse, this.camera );
        var intersects = this.raycaster.intersectObjects( this.pivot.children );
        if ( intersects.length > 0 ) {

            var newIntersected = intersects[ 0 ].object;

            if ( INTERSECTED != newIntersected ) {

                if ( newIntersected === undefined ) return;
                if ( newIntersected.material === undefined ) return;
                if ( newIntersected.material.emissive === undefined ) return;

                //if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
                INTERSECTED = newIntersected;
                //INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                //INTERSECTED.material.emissive.setHex( 0xff0000 );
            }
        } else {

            INTERSECTED = undefined;

            if ( newIntersected === undefined ) return;
            if ( newIntersected.material === undefined ) return;
            if ( newIntersected.material.emissive === undefined ) return;

            //if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

        }

    }

    return WWOBJLoader2Example;

})();

var container = document.getElementById( 'glFullscreen' );

var renderCanvas = document.getElementById( 'example' );

var hud_mesh_data = document.getElementById( 'mesh_data' );
var hud_material_data = document.getElementById( 'material_data' );

var app = new WWOBJLoader2Example( renderCanvas );

var stats = new Stats();
container.appendChild( stats.dom );

// Init dat.gui and controls
var elemFileInput = document.getElementById( 'fileUploadInput' );
var WWOBJLoader2Control = function() {
    this.smoothShading = app.smoothShading;
    this.doubleSide = app.doubleSide;
    this.streamMeshes = app.streamMeshes;
    this.fogColor = app.fogColor;
};
var wwObjLoader2Control = new WWOBJLoader2Control();

var gui = new dat.GUI( {
    autoPlace: false,
    width: 320
} );

var menuDiv = document.getElementById( 'dat' );
menuDiv.appendChild(gui.domElement);
var folderOptions = gui.addFolder( 'Options' );
var controlSmooth = folderOptions.add( wwObjLoader2Control, 'smoothShading' ).name( 'Smooth Shading' );
controlSmooth.onChange( function( value ) {
    console.log( 'Setting smoothShading to: ' + value );
    app.alterSmoothShading();
});

var controlDouble = folderOptions.add( wwObjLoader2Control, 'doubleSide' ).name( 'Double Side Materials' );
controlDouble.onChange( function( value ) {
    console.log( 'Setting doubleSide to: ' + value );
    app.alterDouble();
});

var controlStreamMeshes = folderOptions.add( wwObjLoader2Control, 'streamMeshes' ).name( 'Stream Meshes' );
controlStreamMeshes.onChange( function( value ) {
    console.log( 'Setting streamMeshes to: ' + value );
    app.streamMeshes = value;
});

if ( app.fileApiAvailable ) {

    wwObjLoader2Control.pathTexture = '';
    var controlPathTexture = folderOptions.add( wwObjLoader2Control, 'pathTexture' ).name( 'Relative path to textures' );
    controlPathTexture.onChange( function( value ) {
        console.log( 'Setting pathTexture to: ' + value );
        app.pathTexture = value + '/';
    });

    wwObjLoader2Control.loadObjFile = function () {
        elemFileInput.click();
    };
    folderOptions.add( wwObjLoader2Control, 'loadObjFile' ).name( 'Load OBJ/MTL Files' );

    var handleFileSelect = function ( object3d ) {
        app._handleFileSelect( object3d, wwObjLoader2Control.pathTexture );
    };
    elemFileInput.addEventListener( 'change' , handleFileSelect, false );

    wwObjLoader2Control.clearAllAssests = function () {
        app.clearAllAssests();
    };
    folderOptions.add( wwObjLoader2Control, 'clearAllAssests' ).name( 'Clear Scene' );

    // added by mika
    var controlFogColor = folderOptions.addColor( wwObjLoader2Control, 'fogColor' ).name( 'Fog color' );
    controlFogColor.onChange( function( value ) {
        console.log( 'Setting fog color to: ' + value );
        app.setFogColor(value);
    });

}
folderOptions.close();


// init three.js example application
var resizeWindow = function () {
    app.resizeDisplayGL();
};

var render = function () {

    requestAnimationFrame( render );
    app.render();

    app.checkIntercestions();

    stats.update();
};


window.addEventListener( 'resize', resizeWindow, false );

renderCanvas.addEventListener( 'mousemove', onDocumentMouseMove, false );

renderCanvas.addEventListener( 'click', onClick, false );

function onDocumentMouseMove( event ) {
    event.preventDefault();
    app.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    app.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onClick( event ) {
    event.preventDefault();

    var part = app.getIntersected();

    if ( part !== null && part !== undefined ) {

        if (app.lastIntersected !== part) {


            if (app.lastIntersected !== null && app.lastIntersected !== undefined) {

                app.lastIntersected.material.emissive.setHex(0x000000);
                //resetMeshHighlightGroup( app.lastIntersected.name );

            }

            part.material.emissive.setHex(0x0000aa);
            //setMeshHighlightGroup( part.name );
        }

        hud_mesh_data.innerHTML = 'Mesh' + '<br />';

        hud_mesh_data.innerHTML += 'name: ' + part.name + '<br/>';
        hud_mesh_data.innerHTML += 'vertices: ' + part.geometry.attributes.position.count + '<br/>';
        hud_mesh_data.innerHTML += '<br />';

        hud_material_data.innerHTML = 'Material' + '<br />';
        hud_material_data.innerHTML += 'name: ' + part.material.name + '<br />';
        hud_material_data.innerHTML += 'color: ' + part.material.color.r + ' ' + part.material.color.g + ' ' + part.material.color.b + '<br />';
        hud_material_data.innerHTML += 'envMap: ' + part.material.envMap + '<br />';
        hud_material_data.innerHTML += 'opacity: ' + part.material.opacity + '<br />';
        hud_material_data.innerHTML += 'side: ' + part.material.side + '<br />';
        hud_material_data.innerHTML += 'reflectivity: ' + part.material.reflectivity + '<br />';
        hud_material_data.innerHTML += 'shininess: ' + part.material.shininess + '<br />';
        hud_material_data.innerHTML += 'specular: ' + part.material.specular.r + ' ' + part.material.specular.g + ' ' + part.material.specular.b + '<br />';
        hud_material_data.innerHTML += 'type: ' + part.material.type + '<br />';

        app.lastIntersected = part;

        invokePopup( part.name );

    } else {

        if (app.lastIntersected !== undefined) {
            app.lastIntersected.material.emissive.setHex(0x000000);
            //resetMeshHighlightGroup( app.lastIntersected.name );
            app.lastIntersected = undefined;
        }

        hidePopup();

    }

}

app.highlightedSelectionList = [];

function setMeshHighlightGroup( mesh_id ) {

    var meshIDList = getMeshGroupByMeshId( mesh_id );

    for ( var i = 0; i < meshIDList.length; i++ ) {

        var material = app.getMaterialByMeshId( meshIDList[i] );
        material.emissive.setHex( 0x0000aa );

    }
}

function resetMeshHighlightGroup( mesh_id ) {

    var meshIDList = getMeshGroupByMeshId( mesh_id );
    for ( var i = 0; i < meshIDList.length; i++ ) {

        var material = app.getMaterialByMeshId( meshIDList[i] );
        material.emissive.setHex( 0x000000 );

    }
}

function setSelection( array ) {

    for ( var i = 0; i < array.length; i++ ) {

        var material = app.getMaterialByMeshId( array[i] );
        material.emissive.setHex( 0x0000aa );

    }

    app.highlightedSelectionList = array;
}

function resetSelection( array ) {

    for ( var i = 0; i < array.length; i++ ) {

        var material = app.getMaterialByMeshId( array[i] );
        material.emissive.setHex( 0x000000 );

    }

    app.highlightedSelectionList = [];

    if (app.lastIntersected !== undefined) {
        app.lastIntersected.material.emissive.setHex(0x000000);
        //resetMeshHighlightGroup( app.lastIntersected.name );
        app.lastIntersected = undefined;
    }
}

function invokePopup( mesh_id ) {

    var brick_popup = document.getElementById("brick_popup");

    //var uri = getURIbyMeshId( mesh_id );
    var uri = brick_map[mesh_id];

    if ( uri !== undefined ) {
        brick_popup.innerHTML = '<object type="text/html" data="bricks/' + uri + '.html" ></object>';
    } else {
        //TODO 'not found error' page
        brick_popup.innerHTML = '<object type="text/html" data="bricks/' + '404' + '.html" ></object>';
    }

    brick_popup.style.visibility = 'visible';

}

function invokePopupWithURI( uri ) {

    var brick_popup = document.getElementById("brick_popup");

    if ( uri !== "" ) {
        brick_popup.innerHTML = '<object type="text/html" data="bricks/' + uri + '" ></object>';
    } else {
        //TODO 'not found error' page
        brick_popup.innerHTML = '<object type="text/html" data="bricks/' + '404' + '.html" ></object>';
    }

    brick_popup.style.visibility = 'visible';

}

function hidePopup() {

    var brick_popup = document.getElementById("brick_popup");
    brick_popup.style.visibility = 'hidden';

}

function handleLoadButtonClick(){

    reloadHighlightFile();

    resetSelection(app.highlightedSelectionList);

    setSelection(highlight[0].mesh_id);

    invokePopupWithURI(highlight[0].uri);
}


console.log( 'Starting initialisation phase...' );
app.initGL();
app.resizeDisplayGL();
app.initPostGL();

//function ( modelName, pathObj, fileObj, pathTexture, fileMtl )
var prepData = new THREE.OBJLoader2.WWOBJLoader2.PrepDataFile(
    'lego',
    'model/RedThunder/',
    'RedThunder.obj',
    'model/RedThunder/',
    'RedThunder.mtl'
);
app.loadFiles( prepData );

adjustModel.call( app );

function adjustModel(){

    var modelscale = 1.0;
    this.pivot.scale.set( modelscale, modelscale, modelscale );
    this.pivot.rotation.y = -Math.PI/4;

}

//addWorld.call( app );
// function addWorld(){
//
//     var scope = this;
//     var scene = this.scene;
//
//     var tLoader = new THREE.TextureLoader();
//     tLoader.load( "image/bg1_sm.jpg",
//         function(textureSphere){
//
//             var sphere = new THREE.Mesh( new THREE.SphereGeometry( 600, 60, 60 ),
//                 new THREE.MeshBasicMaterial( { map: textureSphere } ) );
//             sphere.scale.x = -1;
//             sphere.doubleSided = true;
//             sphere.position.y = 200;
//             scene.add( sphere );
//
//             scope.textureSphere = textureSphere;
//
//         });
//
//
//     var floor_geom = new THREE.PlaneBufferGeometry(1000,1000);
//     var floor_material = new THREE.MeshLambertMaterial({
//         color: 0x555555
//     })
//     var floor_mesh = new THREE.Mesh( floor_geom, floor_material );
//     floor_mesh.rotation.x = -Math.PI/2;
//
//     //scene.add( floor_mesh );
//
//     //textureSphere.mapping = THREE.SphericalReflectionMapping;
//     //textureSphere.mapping = THREE.EquirectangularRefractionMapping;
//
// }


app.setMaterials = function() {

    //return;

    this.splitMaterials();

    var params = {

        color: new THREE.Color(0xbebebe),
        roughness: 0.20,
        metalness: 0.40,
        opacity: 1.00,
        //lightIntensity: 0.50,
        refraction: false,
        refractionRatio: 0.98,

    }

    // var loader = new THREE.TextureLoader();
    //
    // loader.load( "model/building/TexturesCom_Skies0303_M_Sky.jpg",
    //     function( textureSphere ){
    //
    //         //textureSphere.mapping = THREE.EquirectangularRefractionMapping;
    //         textureSphere.mapping = THREE.SphericalReflectionMapping;
    //
    //         app.setMaterialProperty( 'envMap', 'water', textureSphere );
    //
    //         //app.setMaterialProperty( 'opacity', 'Win', 0.3 );
    //
    //         //app.setMaterial( 'default', app.materials.car[0] );
    //         //app.setMaterialProperty( 'color', 'wire_153228184', new THREE.Color(0xff0000) );
    //
    //
    //     } );

}

// automate highlight.js file reload
//setInterval( reloadHighlightFile, 1000 );

// kick render loop
render();