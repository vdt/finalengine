/*global
    Buffer           :  false,
    Drawable         :  false,
    Mesh             :  false,
    VertexAttribute  :  false
*/

/**
 * @class
 * @extends Drawable
 *
 * A unit cube.
 *
 * @constructor
 */
function Cube() {
    Drawable.call( this );
    var vertices = [
        // right
        1, 0, 0,
        1, 1, 1,
        1, 0, 1,
        1, 1, 0,
        // left
        0, 1, 0,
        0, 0, 1,
        0, 1, 1,
        0, 0, 0,
        // top
        0, 1, 0,
        1, 1, 1,
        1, 1, 0,
        0, 1, 1,
        // bottom
        0, 0, 1,
        1, 0, 0,
        1, 0, 1,
        0, 0, 0,
        // front
        0, 0, 1,
        1, 1, 1,
        0, 1, 1,
        1, 0, 1,
        // back
        1, 0, 0,
        0, 1, 0,
        1, 1, 0,
        0, 0, 0
    ];
    var uvcoords = [
        0, 0,
        1, 1,
        0, 1,
        1, 0
    ];
    var normals = [
        1, 0, 0,
       -1, 0, 0,
        0, 1, 0,
        0,-1, 0,
        0, 0, 1,
        0, 0,-1
    ];
    var tangents = [
        0, 1, 0,
        0,-1, 0,
        0, 0, 1,
        0, 0,-1,
        1, 0, 0,
       -1, 0, 0
    ];

    // center unit cube around the origin
    for ( var i = 0; i < vertices.length; ++i ) {
        vertices[ i ] -= 0.5;
    }

    var ret = {
        vertices: [],
        indices: [],
        normals: [],
        tangents: [],
        uvcoords: []
    };

    for ( var face = 0; face < 6; ++face ) {
        for ( var vertex = 0; vertex < 6; ++vertex ) { // 6 vertices per face
            ret.normals.push(
                normals[ face * 3 ],
                normals[ face * 3 + 1 ],
                normals[ face * 3 + 2 ]
            );
            ret.tangents.push(
                tangents[ face * 3 ],
                tangents[ face * 3 + 1 ],
                tangents[ face * 3 + 2 ]
            );
            ret.indices.push( face * 6 + vertex );
        }
    }

    function addPoint( face, point ) {
        ret.vertices.push(
            vertices[ face * 3 * 4 + point * 3 ],
            vertices[ face * 3 * 4 + point * 3 + 1 ],
            vertices[ face * 3 * 4 + point * 3 + 2 ]
        );
        ret.uvcoords.push(
            uvcoords[ point * 2 ],
            uvcoords[ point * 2 + 1 ]
        );
    }

    for ( face = 0; face < 6; ++face ) {
        // top triangle
        addPoint( face, 0 );
        addPoint( face, 1 );
        addPoint( face, 2 );
        // bottom triangle
        addPoint( face, 0 );
        addPoint( face, 3 );
        addPoint( face, 1 );
    }

    vertices = new Buffer().setData( ret.vertices );
    uvcoords = new Buffer().setData( ret.uvcoords );
    normals = new Buffer().setData( ret.normals );

    vertices = new VertexAttribute( 'Position' ).setBuffer( vertices );
    uvcoords = new VertexAttribute( 'UVCoord' ).setBuffer( uvcoords ).setSize( 2 );
    normals = new VertexAttribute( 'Normal' ).setBuffer( normals );

    var indices = new Buffer( Buffer.ELEMENT_BUFFER ).setData( ret.indices );

    var m = new Mesh();
    m.setVertexAttribute( vertices );
    m.setVertexAttribute( normals );
    m.setVertexAttribute( uvcoords );
    m.setIndexBuffer( indices );

    this.mesh = m;
}

Cube.extend( Drawable );
