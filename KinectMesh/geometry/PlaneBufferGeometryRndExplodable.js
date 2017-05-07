function PlaneBufferGeometryRnd(width, height, widthSegments, heightSegments, XYrandomness, Zrandomness ) {

    THREE.BufferGeometry.call( this );

    this.type = 'PlaneBufferGeometryRnd';

    this.parameters = {
        width: width,
        height: height,
        widthSegments: widthSegments,
        heightSegments: heightSegments,
        XYrandomness: XYrandomness === undefined ? 0.5 : XYrandomness,
        Zrandomness: Zrandomness === undefined ? 0.5 : Zrandomness,
    };

    var width_half = width / 2;
    var height_half = height / 2;

    var gridX = Math.floor( widthSegments ) || 1;
    var gridY = Math.floor( heightSegments ) || 1;

    var gridX1 = gridX + 1;
    var gridY1 = gridY + 1;

    var segment_width = width / gridX;
    var segment_height = height / gridY;

    var vertices = new Float32Array( gridX1 * gridY1 * 3 * 2 );
    var normals = new Float32Array( gridX1 * gridY1 * 3 * 2 );
    var uvs = new Float32Array( gridX1 * gridY1 * 2 * 2 );

    var offset = 0;
    var offset2 = 0;

    for ( var k = 0; k < 2; k++ ) {

        //offset += k * gridX1 * 3;

        for (var iy = 0; iy < gridY1; iy++) {

            var y = iy * segment_height - height_half;

            for (var ix = 0; ix < gridX1; ix++) {

                var rndX = (0.5 - Math.random()) * segment_width * this.parameters.XYrandomness * 2 - width_half;

                var x = ix * segment_width + rndX;

                // if ( iy%2 == 1 ) {
                //     x = ix * segment_width + segment_width/2 - width_half;
                // } else {
                //     x = ix * segment_width - width_half;
                // }

                var rndY = (0.5 - Math.random()) * segment_height * this.parameters.XYrandomness * 2;
                var rndZ = (0.5 - Math.random()) * segment_width * this.parameters.Zrandomness * 2;

                vertices[offset] = x;
                vertices[offset + 1] = -y + rndY;
                vertices[offset + 2] = rndZ;

                normals[offset + 2] = 1;

                uvs[offset2] = ix / gridX;
                uvs[offset2 + 1] = 1 - ( iy / gridY );

                // if ( iy > 0 && iy < gridY1 - 1 ) {
                //
                //     vertices[ offset + 3 ] = x;
                //     vertices[ offset + 4 ] = - y + rndY;
                //     vertices[ offset + 5 ] = rndZ;
                //
                //     normals[ offset + 5 ] = 1;
                //
                //     uvs[ offset2 + 2 ] = ix / gridX;
                //     uvs[ offset2 + 3 ] = 1 - ( iy / gridY );
                //
                //     offset += 6;
                //     offset2 += 4;
                //
                //
                // } else {

                offset += 3;
                offset2 += 2;

                // }


            }

        }
    }

    offset = 0;

    var verticesNumber = ( vertices.length / 3 ) / 2;

    var indices = new ( ( vertices.length / 3 ) < 65535 ? Uint32Array : Uint16Array )( gridX * gridY * 6 );

    for ( var iy = 0; iy < gridY; iy ++ ) {

        for ( var ix = 0; ix < gridX; ix ++ ) {

            var a = ix + gridX1 * iy + verticesNumber;

            var b = ix + gridX1 * ( iy + 1 );
            //var bb = ix + gridX1 * ( iy + 2 );

            var c = ( ix + 1 ) + gridX1 * ( iy + 1 );
            //var c = ( ix + 1 ) + gridX1 * ( iy + 2 );


            var d = ( ix + 1 ) + gridX1 * iy + verticesNumber;

            // if ( iy%2 == 0 ) {
            //
            //     indices[offset] = a;
            //     indices[offset + 1] = b;
            //     indices[offset + 2] = d;
            //
            //     indices[offset + 3] = b;
            //     indices[offset + 4] = c;
            //     indices[offset + 5] = d;
            //
            // } else
                {

                indices[offset] = a;
                indices[offset + 1] = b;
                indices[offset + 2] = c;

                indices[offset + 3] = c;
                indices[offset + 4] = d;
                indices[offset + 5] = a;

            }

            offset += 6;

        }

    }

    this.setIndex( new THREE.BufferAttribute( indices, 1 ) );
    this.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    this.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
    this.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

}

PlaneBufferGeometryRnd.prototype = Object.create( THREE.BufferGeometry.prototype );
PlaneBufferGeometryRnd.prototype.constructor = PlaneBufferGeometryRnd;
