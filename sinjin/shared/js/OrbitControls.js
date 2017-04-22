THREE.OrbitControls = function ( object ) {

	var scope = this;

	var phi = Math.PI / 2, theta = 0;
	var EPS = 0.000001;
	var mouse = new THREE.Vector2();

	this.enabled = true;

	this.phiMin = 10;
	this.phiMax = 1000;

	this.thetaMin = 10;
	this.thetaMax = 1000;

	this.scaleX = 1;
	this.scaleY = 1;
	this.scaleZ = 1;

	this.speed = 3;

	this.radius = 300;
	this.center = new THREE.Vector3();

	this.update = function () {

		if ( this.enabled === false ) return;

		phi += mouse.y * Math.PI / 180;
		theta += mouse.x  * Math.PI / 180;

		phi = Math.max( scope.phiMin + EPS, Math.min( scope.phiMax - EPS, phi ) );
		theta = Math.max( scope.thetaMin, Math.min( scope.thetaMax, theta ) );

		object.position.x = scope.radius * Math.sin( phi ) * Math.sin( theta ) * scope.scaleX;
		object.position.y = scope.radius * Math.cos( phi ) * scope.scaleY;
		object.position.z = scope.radius * Math.sin( phi ) * Math.cos( theta ) * scope.scaleZ;

		object.lookAt( scope.center );

	};

	var onDocumentMouseMove = function ( event ) {

		mouse.x = ( ( event.clientX / window.innerWidth ) - 0.5 ) * scope.speed;
		mouse.y = ( ( event.clientY / window.innerHeight ) - 0.5 ) * scope.speed;



		// mouse.x = ( event.clientX - window.innerWidth / 2 ) * 8;
		// mouse.y = ( event.clientY - window.innerHeight / 2 ) * 8;

		unMappedMouseX = (event.clientX );
		unMappedMouseY = (event.clientY );
		mouseX = map(unMappedMouseX, window.innerWidth, -1.0,1.0);
		mouseY = map(unMappedMouseY, window.innerHeight, -1.0,1.0);
			    

	};

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

};
