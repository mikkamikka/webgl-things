/*
 * Cloth Simulation using a relaxed constrains solver
 */

function Flag( w, h, windStrengthIn, debug ) {

    var addMotion = true;
    var DAMPING = 0.03;
    var DRAG = 1 - DAMPING;
    var MASS = 0.1;
    var restDistance = 20;
    var xSegs = w;
    var ySegs = h;
    var clothFunction = plane(restDistance * xSegs, restDistance * ySegs);
    var cloth = new Cloth(xSegs, ySegs);
    var GRAVITY = 800;
    var gravity = new THREE.Vector3(0, -GRAVITY, 0).multiplyScalar(MASS);
    var TIMESTEP = 0.018;
    var TIMESTEP_SQ = TIMESTEP * TIMESTEP;
    var pins = [];
    var wind = true;
    var windStrength = windStrengthIn;
    this.windStrength = windStrength;
    var windForce = new THREE.Vector3();
    var ballPosition = new THREE.Vector3();
    var ballPositionAlias = new THREE.Vector3();
    var ballSize = 50; //40
    var tmpForce = new THREE.Vector3();
    var lastTime;
    var raycaster = new THREE.Raycaster(), intersects;
    var props = {
        windStrength: windStrength,
        freqX: 1000,
        freqY: 268,
        freqZ: 750,
        stillFactorM: 0.00,
        sensitivity: 1.0,
        ballVisible: false
    };

    function plane(width, height) {
        return function (u, v) {
            var x = ( u - 0.5 ) * width;
            var y = ( v + 0.5 ) * height;
            var z = 0;
            return new THREE.Vector3(x, y, z);
        };
    }

    function Particle(x, y, z, mass) {

        this.position = clothFunction(x, y); // position
        this.previous = clothFunction(x, y); // previous
        this.original = clothFunction(x, y);
        this.a = new THREE.Vector3(0, 0, 0); // acceleration
        this.mass = mass;
        this.invMass = 1 / mass;
        this.tmp = new THREE.Vector3();
        this.tmp2 = new THREE.Vector3();

    }

// Force -> Acceleration
    Particle.prototype.addForce = function (force) {

        this.a.add(
            this.tmp2.copy(force).multiplyScalar(this.invMass)
        );
    };

// Performs verlet integration
    Particle.prototype.integrate = function (timesq) {

        var newPos = this.tmp.subVectors(this.position, this.previous);
        newPos.multiplyScalar(DRAG).add(this.position);
        newPos.add(this.a.multiplyScalar(timesq));

        this.tmp = this.previous;
        this.previous = this.position;
        this.position = newPos;

        this.a.set(0, 0, 0);

    };

    var diff = new THREE.Vector3();

    function satisifyConstrains(p1, p2, distance) {

        diff.subVectors(p2.position, p1.position);
        var currentDist = diff.length();
        if (currentDist === 0) return; // prevents division by 0
        var correction = diff.multiplyScalar(1 - distance / currentDist);
        var correctionHalf = correction.multiplyScalar(0.5);
        p1.position.add(correctionHalf);
        p2.position.sub(correctionHalf);

    }

    function Cloth(w, h) {
        w = w || 10;
        h = h || 10;
        this.w = w;
        this.h = h;
        var particles = [];
        var constrains = [];
        this.particles = particles;
        var u, v;
        // Create particles
        for (v = 0; v <= h; v++) {
            for (u = 0; u <= w; u++) {
                particles.push( new Particle(u / w, v / h, 0, MASS) );
            }
        }
        // Structural
        for (v = 0; v < h; v++) {
            for (u = 0; u < w; u++) {
                constrains.push([
                    particles[index(u, v)],
                    particles[index(u, v + 1)],
                    restDistance
                ]);
                constrains.push([
                    particles[index(u, v)],
                    particles[index(u + 1, v)],
                    restDistance
                ]);
            }
        }
        for (u = w, v = 0; v < h; v++) {
            constrains.push([
                particles[index(u, v)],
                particles[index(u, v + 1)],
                restDistance
            ]);
        }
        for (v = h, u = 0; u < w; u++) {
            constrains.push([
                particles[index(u, v)],
                particles[index(u + 1, v)],
                restDistance
            ]);
        }

        this.particles = particles;
        this.constrains = constrains;
        function index(u, v) {
            return u + v * ( w + 1 );
        }
        this.index = index;
    }

    function simulate(time) {

        if (!lastTime) {
            lastTime = time;
            return;
        }
        var i, il, particles, particle, pt, constrains, constrain;

        // Aerodynamics forces
        if (wind) {
            var face, faces = clothGeometry.faces, normal;
            particles = cloth.particles;
            for (i = 0, il = faces.length; i < il; i++) {
                face = faces[i];
                normal = face.normal;
                tmpForce.copy(normal).normalize().multiplyScalar(normal.dot(windForce));
                particles[face.a].addForce(tmpForce);
                particles[face.b].addForce(tmpForce);
                particles[face.c].addForce(tmpForce);
            }
        }

        for (particles = cloth.particles, i = 0, il = particles.length; i < il; i++) {
            particle = particles[i];
            particle.addForce(gravity);
            particle.integrate(TIMESTEP_SQ);
        }

        // Start Constrains
        constrains = cloth.constrains;
        il = constrains.length;
        for (i = 0; i < il; i++) {
            constrain = constrains[i];
            satisifyConstrains(constrain[0], constrain[1], constrain[2]);
        }

        // Ball Constrains
        //ballPosition.z = -Math.sin(Date.now() / 600) * 90; //+ 40;
        //ballPosition.x = Math.cos(Date.now() / 400) * 70;

       // var amp = 8;

        if ( orientation.a !== null ) {
            var still = true, motionWeight = 0;
            for (var i = 0; i < stackSize; i++) {
                motionWeight += Math.abs(stillStack[i]);
            }
            if (( motionWeight / stackSize ) > props.stillFactorM) still = false;
        }

        if ( debug ) dbg_still.innerHTML = motionWeight / stackSize;

        if ( addMotion) {

            var vector = new THREE.Vector3();
            if ( orientation.a === null ) {
                vector.set(mouse.x, mouse.y, 0.5);
            } else {  // if on mobile

                var diffX = motion.x - prevMotion.x;
                //if ( Math.abs( diffX ) > 0.1 ) {
                if ( ! still ) {
                    var vecX = ( orientation.g / 60 ) * props.sensitivity;
                    var vecY = - ( orientation.b / 45 - 1.0 ) * props.sensitivity;
                    vector.set(vecX, vecY, 0.5);
                } else {
                    vector.set(-1, -1, -2);
                }
                prevMotion.x = motion.x;
            }



            vector.unproject( camera );
            var dir = vector.sub( camera.position ).normalize();
            var distance = - camera.position.z / dir.z;
            var posMouse = camera.position.clone().add( dir.multiplyScalar( distance ) );
            posMouse.z += 2;

            ballPosition.copy( posMouse );

            for (particles = cloth.particles, i = 0, il = particles.length; i < il; i++) {

                particle = particles[i];
                pos = particle.position;
                ballPositionAlias.copy( ballPosition );
                ballPositionAlias.y += 350;
                ballPositionAlias.z = pos.z / 2;// + ballSize / 2;
                diff.subVectors(pos, ballPositionAlias);
                var length = diff.length();

                if (length < ballSize) {
                    // collided
                    if ( ! still ) ballSize = 70;
                    diff.normalize().multiplyScalar(ballSize);
                    pos.copy(ballPositionAlias).add(diff);
                }
            }
        }

        // Pin Constrains
        for (i = 0, il = pins.length; i < il; i++) {
            var xy = pins[i];
            var p = particles[xy];
            p.position.copy(p.original);
            p.previous.copy(p.original);
        }
    }

// renderer
    var _this = this;
    var pinsFormation = [];
    for (var pins = [], j = 0; j <= cloth.w; j++)
       pins.push(cloth.index(j, cloth.h));
    // for (var pins = [], j = 0; j <= cloth.h; j++)
    //     pins.push(cloth.index(0, j));
    pinsFormation.push(pins);

    if (!Detector.webgl) Detector.addGetWebGLMessage();
    var container, stats;
    var camera, scene, renderer;
    var clothGeometry, clothTexture;
    var sphere;
    var object;
    this.object = object;
    var mouse = new THREE.Vector2(-2,-2), prevMouse = new THREE.Vector2(), affectVec = new THREE.Vector2(),
        interacting = false,
        INTERSECTED;
    var time, dirX, dirY, dirZ;
    var orientation = { a: null, b: null, g: null };
    var motion = { x: null, y: null, z: null };
    var prevMotion = { x: null, y: null, z: null };
    var stillStack = [], stillCount = 0, stackSize = 20;
    for ( var i = 0; i < stackSize; i++ ){
        stillStack.push( 0 );
    }

    var img = new Image();
    img.onload = init;
    img.src = 'images/logo2.png';

    //init();

    function drawText() {


        var canvas = document.createElement( 'canvas' );
        canvas.width = 720;
        canvas.height = 495;

        var ctx = canvas.getContext( '2d' );

        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "blue";
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        //ctx.strokeStyle = "#F00";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.font = "normal 200px Alte Haas Grotesk Bold";

        ctx.save();
        ctx.translate( canvas.width / 2, canvas.height / 2 );
        ctx.scale(1, 0.6);
        ctx.rotate( Math.PI / 2 );
        ctx.fillText("Ever", -350, 0);
        ctx.fillText("Really", -350, 200);
        ctx.restore();

        return canvas;
    }

    function init() {

        container = document.getElementById('logo');
        var width = container.clientWidth;
        var height = container.clientHeight;

        // scene
        scene = new THREE.Scene();

        // camera
        camera = new THREE.PerspectiveCamera(30, width / height, 1, 10000);
        camera.position.z = 600;
        scene.add(camera);

        this.camera = camera;

        // cloth material
        // var loader = new THREE.TextureLoader();
        // clothTexture = loader.load('images/logo_rect.png');
        // clothTexture.generateMipmaps = false;
        // clothTexture.minFilter = THREE.LinearFilter;
        // clothTexture.magFilter = THREE.LinearFilter;

        // rotate texture
        var imgWidth = img.width;
            imgHeight = img.height;
        var mapCanvas = document.createElement( 'canvas' );
        mapCanvas.width = imgHeight;
        mapCanvas.height = imgWidth;

        var ctx = mapCanvas.getContext( '2d' );
        ctx.save();
        ctx.translate( mapCanvas.width / 2, mapCanvas.height / 2 );
        ctx.rotate( Math.PI / 2 );
        ctx.drawImage( img, -imgWidth/2, -imgHeight/2 );
        ctx.restore();


        var texture = new THREE.Texture( mapCanvas );
        //var texture = new THREE.Texture( drawText() );
        texture.needsUpdate = true;

        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        var clothMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
        });

        // cloth geometry
        clothGeometry = new THREE.ParametricGeometry( clothFunction, cloth.w, cloth.h );
        clothGeometry.dynamic = true;

        // var uniforms = THREE.UniformsUtils.clone( WarpShader.uniforms );
        //
        // var w = 495, h = 720;
        //
        // uniforms[ "tDiffuse" ].value = texture;
        // uniforms[ "radius" ].value = 300;
        // uniforms[ "angle" ].value = 1.0;
        // uniforms[ "center" ].value = new THREE.Vector2( w * Math.random(), h * ( Math.random() * 0.5 + 0.4 ) );
        // uniforms[ "texSize" ].value = new THREE.Vector2( w, h );
        // uniforms[ "strength" ].value = 0.75;
        //
        // var warp_material = new THREE.ShaderMaterial( {
        //     uniforms: uniforms,
        //     vertexShader: WarpShader.vertexShader,
        //     fragmentShader: WarpShader.fragmentShader
        // } );

        // cloth mesh
        object = new THREE.Mesh(clothGeometry, clothMaterial);
        object.matrixAutoUpdate = false;
        //object.matrix.multiply( new THREE.Matrix4().makeRotationZ(-Math.PI/2) );
        object.matrix.multiply( new THREE.Matrix4().makeTranslation( 0, -230, 0 ) );
        var scale = 0.65;
        object.matrix.multiply( new THREE.Matrix4().makeScale( scale, scale, scale ) );

        object.scale.x = 1.0;
        object.scale.y = 1.0;

        scene.add(object);
        _this.object = object;

        // sphere
        var ballGeo = new THREE.SphereGeometry(ballSize, 20, 20);
        var ballMaterial = new THREE.MeshPhongMaterial({color: 0xaaaaaa, transparent: true, opacity: 0.3});
        sphere = new THREE.Mesh(ballGeo, ballMaterial);
        scene.add(sphere);
        sphere.visible = props.ballVisible;

        // renderer
        renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize( width, height );
        container.appendChild(renderer.domElement);

        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        //renderer.shadowMap.enabled = true;
        container.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mousedown', onMouseDown, false);
        document.addEventListener('mouseup', onMouseUp, false);
        container.addEventListener('mouseleave', onMouseLeave, false);
        window.addEventListener('deviceorientation', function(event) {

            if ( event.alpha !== null ) {
                orientation.a = Number(event.alpha);
                orientation.b = Number(event.beta);
                orientation.g = Number(event.gamma);
                if ( debug )
                    dbg.innerHTML = event.alpha.toFixed(0) + ' : ' + event.beta.toFixed(0) + ' : ' + event.gamma.toFixed(0);
            }
        });
        window.addEventListener('devicemotion', function(event) {
            //if ( event.alpha !== null ) {
               // orientation.a = Number(event.alpha);
                //orientation.b = Number(event.beta);
                //orientation.g = Number(event.gamma);
            // if ( debug )
            //     dbg_mo.innerHTML = event.accelerationIncludingGravity.x.toFixed(2) + ' : ' +
            //         event.accelerationIncludingGravity.y.toFixed(2) + ' : ' +
            //         event.accelerationIncludingGravity.z.toFixed(2);
            // //}
            // if ( event.accelerationIncludingGravity.x !== null ) {
            //
            //     motion.x = Number( event.accelerationIncludingGravity.x );
            //
            // }

            if ( event.acceleration.x !== null ) {

                if ( debug )
                    dbg_mo.innerHTML = event.acceleration.x.toFixed(2) + ' : ' +
                        event.acceleration.y.toFixed(2) + ' : ' +
                        event.acceleration.z.toFixed(2);

                motion.x = Number( event.acceleration.x );

                stillStack[stillCount] = ( motion.x + motion.y + motion.z ) / 3;
                if ( stillCount > stackSize - 1 ) {stillCount = 0;}
                else stillCount++;
            }

        });

        if ( debug ) {
            var gui = new dat.GUI();
            gui.add( props, 'windStrength', 0, 100 );
            gui.add( props, 'freqX', 10, 1000 );
            gui.add( props, 'freqY', 10, 1000 );
            gui.add( props, 'freqZ', 10, 1000 );
            gui.add( props, 'stillFactorM', 0.0, 0.1 );
            gui.add( props, 'sensitivity', 0.5, 3 );
            gui.add( props, 'ballVisible' ).onChange( function(val){ sphere.visible = val;});
        }

        animate();
    }

    function onMouseMove(event) {
        event.preventDefault();
        mouse.x = ( event.clientX / renderer.domElement.width * window.devicePixelRatio ) * 2 - 1;
        mouse.y = -( event.clientY / renderer.domElement.height * window.devicePixelRatio ) * 2 + 1;
        //affectVec.subVectors( mouse, prevMouse );
    }

    function onMouseDown(event) {
        event.preventDefault();
        //interacting = true;
    }
    function onMouseUp(event) {
        event.preventDefault();
        //interacting = false;
        intersects = undefined;
    }
    function onMouseLeave(event) {
        event.preventDefault();
        mouse.x = -2;
        mouse.y = -2;
    }

    function animate() {

        requestAnimationFrame(animate);
        time = Date.now();
        dirX = 1 * Math.sin(time / props.freqX);// + affectVec.x*10;
        dirY = -Math.abs(1.3 * Math.cos(time / props.freqY));// + affectVec.y*10;
        dirZ = 1 * Math.cos(time / props.freqZ);
        windForce.set(dirX, dirY, dirZ).normalize().multiplyScalar(props.windStrength);

        simulate(time);
        render();

    }

    function render() {

        var p = cloth.particles;

        for (var i = 0, il = p.length; i < il; i++) {
            clothGeometry.vertices[i].copy(p[i].position);
        }

        clothGeometry.computeFaceNormals();
        clothGeometry.computeVertexNormals();
        clothGeometry.normalsNeedUpdate = true;
        clothGeometry.verticesNeedUpdate = true;

        sphere.position.copy(ballPosition);

        camera.lookAt(scene.position);

        renderer.render(scene, camera);

    }
}