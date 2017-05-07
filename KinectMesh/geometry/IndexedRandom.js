/**
 * Created by mika on 27.12.2016.
 */

function getRandomGeometry( triangles ) {

    //var triangles = 1000000;
    var geometry = new THREE.BufferGeometry();
    var indices = new Uint32Array( triangles * 3 );
    for ( var i = 0; i < indices.length; i ++ ) {
        indices[ i ] = i;
    }
    var positions = new Float32Array( triangles * 3 * 3 );
    var normals = new Int16Array( triangles * 3 * 3 );
    var colors = new Uint8Array( triangles * 3 * 3 );
    var color = new THREE.Color();
    //var uvs = new Float32Array( triangles * 2 * 2 );
    var n = 800, n2 = n/2;	// triangles spread in the cube
    var d = 12, d2 = d/2;	// individual triangle size
    var pA = new THREE.Vector3();
    var pB = new THREE.Vector3();
    var pC = new THREE.Vector3();
    var cb = new THREE.Vector3();
    var ab = new THREE.Vector3();
    for ( var i = 0; i < positions.length; i += 9 ) {
        // positions
        var x = Math.random() * n - n2;
        var y = Math.random() * n - n2;
        var z = Math.random() * n - n2;
        var ax = x + Math.random() * d - d2;
        var ay = y + Math.random() * d - d2;
        var az = z + Math.random() * d - d2;
        var bx = x + Math.random() * d - d2;
        var by = y + Math.random() * d - d2;
        var bz = z + Math.random() * d - d2;
        var cx = x + Math.random() * d - d2;
        var cy = y + Math.random() * d - d2;
        var cz = z + Math.random() * d - d2;
        positions[ i ]     = ax;
        positions[ i + 1 ] = ay;
        positions[ i + 2 ] = az;
        positions[ i + 3 ] = bx;
        positions[ i + 4 ] = by;
        positions[ i + 5 ] = bz;
        positions[ i + 6 ] = cx;
        positions[ i + 7 ] = cy;
        positions[ i + 8 ] = cz;
        // flat face normals
        pA.set( ax, ay, az );
        pB.set( bx, by, bz );
        pC.set( cx, cy, cz );
        cb.subVectors( pC, pB );
        ab.subVectors( pA, pB );
        cb.cross( ab );
        cb.normalize();
        var nx = cb.x;
        var ny = cb.y;
        var nz = cb.z;
        normals[ i ]     = nx * 32767;
        normals[ i + 1 ] = ny * 32767;
        normals[ i + 2 ] = nz * 32767;
        normals[ i + 3 ] = nx * 32767;
        normals[ i + 4 ] = ny * 32767;
        normals[ i + 5 ] = nz * 32767;
        normals[ i + 6 ] = nx * 32767;
        normals[ i + 7 ] = ny * 32767;
        normals[ i + 8 ] = nz * 32767;
        // colors
        var vx = ( x / n ) + 0.5;
        var vy = ( y / n ) + 0.5;
        var vz = ( z / n ) + 0.5;
        color.setRGB( vx, vy, vz );
        colors[ i ]     = color.r * 255;
        colors[ i + 1 ] = color.g * 255;
        colors[ i + 2 ] = color.b * 255;
        colors[ i + 3 ] = color.r * 255;
        colors[ i + 4 ] = color.g * 255;
        colors[ i + 5 ] = color.b * 255;
        colors[ i + 6 ] = color.r * 255;
        colors[ i + 7 ] = color.g * 255;
        colors[ i + 8 ] = color.b * 255;
    }
    geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );
    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3, true ) );
    geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3, true ) );
    //geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );
    geometry.computeBoundingSphere();

    return geometry;
}