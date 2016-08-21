/*
 * Cloth Simulation using a relaxed constrains solver
 */

function Flag( w, h, windStrengthIn ) {

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
    var windStrength = 2;
    var windForce = new THREE.Vector3(0, 0, 0);
    var ballPosition = new THREE.Vector3(0, 0, 0);
    var ballSize = 60; //40
    var tmpForce = new THREE.Vector3();
    var lastTime;
    var raycaster = new THREE.Raycaster(), intersects;

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
        ballPosition.z = -Math.sin(Date.now() / 600) * 90; //+ 40;
        ballPosition.x = Math.cos(Date.now() / 400) * 70;

        var amp = 8;

        if ( addMotion) {

            for (particles = cloth.particles, i = 0, il = particles.length; i < il; i++) {

                particle = particles[i];
                pos = particle.position;
                diff.subVectors(pos, ballPosition);
                var length = diff.length();
                if (length < ballSize) {
                    // collided
                    diff.normalize().multiplyScalar(ballSize);
                    pos.copy(ballPosition).add(diff);
                }
                if (intersects) {
                    if (intersects.length>0) {
                        pos.x += affectVec.x * 40;
                        pos.y += affectVec.y * 40;
                    }
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

    var pinsFormation = [];
    for (var pins = [], j = 0; j <= cloth.w; j++)
        pins.push(cloth.index(j, cloth.h));
    pinsFormation.push(pins);

    if (!Detector.webgl) Detector.addGetWebGLMessage();
    var container, stats;
    var camera, scene, renderer;
    var clothGeometry, clothTexture;
    var sphere;
    var object;
    var mouse = new THREE.Vector2(), prevMouse = new THREE.Vector2(), affectVec = new THREE.Vector2(),
        interacting = false,
        INTERSECTED;

    init();
    animate();

    function init() {

        container = document.getElementById('logo');
        var width = container.clientWidth;
        var height = container.clientHeight;

        // scene
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );

        // camera
        camera = new THREE.PerspectiveCamera(30, width / height, 1, 10000);
        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = 600;
        scene.add(camera);

        this.camera = camera;

        // lights
        var light, materials;
        //scene.add(new THREE.AmbientLight(0x666666));
        light = new THREE.DirectionalLight(0xdfebff, 1.75);
        light.position.set(50, 200, 100);
        light.position.multiplyScalar(1.3);
        //scene.add(light);

        // cloth material
        var loader = new THREE.TextureLoader();
        clothTexture = loader.load('images/logo.png');
        //clothTexture.wrapS = clothTexture.wrapT = THREE.RepeatWrapping;
        //clothTexture.anisotropy = 16;

        //var clothMaterial = new THREE.MeshLambertMaterial({
        var clothMaterial = new THREE.MeshBasicMaterial({
            map: clothTexture,
            side: THREE.DoubleSide
        });

        // cloth geometry
        clothGeometry = new THREE.ParametricGeometry( clothFunction, cloth.w, cloth.h );
        clothGeometry.dynamic = true;

        // cloth mesh

        object = new THREE.Mesh(clothGeometry, clothMaterial);
        object.position.set(0, -170, 0);
        object.scale.x = 1.1;
        object.scale.y = 0.8;

        object.scale.multiplyScalar(0.70);
        object.castShadow = true;
        scene.add(object);

        // sphere
        var ballGeo = new THREE.SphereGeometry(ballSize, 20, 20);
        var ballMaterial = new THREE.MeshPhongMaterial({color: 0xaaaaaa});
        sphere = new THREE.Mesh(ballGeo, ballMaterial);
        scene.add(sphere);
        sphere.visible = false;

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

    }

    function onMouseMove(event) {
        event.preventDefault();
        mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
        mouse.y = -( event.clientY / renderer.domElement.height ) * 2 + 1;
        affectVec.subVectors( mouse, prevMouse );
        prevMouse.copy( mouse );

        if (interacting) {
            raycaster.setFromCamera( mouse, camera );
            intersects = raycaster.intersectObjects( [ object ] );
        }
    }

    function onMouseDown(event) {
        event.preventDefault();
        interacting = true;
    }
    function onMouseUp(event) {
        event.preventDefault();
        interacting = false;
        intersects = undefined;
    }

    function animate() {

        requestAnimationFrame(animate);
        var time = Date.now();
        windStrength = windStrengthIn;
        var dirX = 0.1 * Math.sin(time / 2E3);// + affectVec.x*10;
        var dirY = -Math.abs(0.3 * Math.cos(time / 3E2));// + affectVec.y*10;
        var dirZ = 1 * Math.cos(time / 2E2);
        windForce.set(dirX, dirY, dirZ).normalize().multiplyScalar(windStrength);

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