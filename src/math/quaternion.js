/*global
    Matrix4   :  false,
    TempVars  :  false,
    Vector3   :  false
*/

/**
 * @class
 * Orientation represented as a vector and an angle.
 *
 * @constructor
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @param {Number} theta
 */
function Quaternion( x, z, y, a ) {
    this.data = new Float32Array( 4 );
    if ( x ) {
        if ( x.data ) {
            this.data.set( x.data );
        }
        else if ( Array.isArray( x ) ){
            this.data.set( x );
        }
        else {
            this.data[ 0 ] = x;
            this.data[ 1 ] = y;
            this.data[ 2 ] = z;
            this.data[ 3 ] = a;
        }
    }
    else {
        this.data[ 3 ] = 1;
    }
}

Quaternion.prototype = {
    constructor: Quaternion,
    set: function( data ) {
        if ( data instanceof Array ) {
            throw 'error';
        }
        this.data.set( data.data );
        return this;
    },
    copyTo: function( dest ) {
        if ( dest instanceof Array ) {
            throw 'error';
        }
        dest.data.set( this.data );
        return dest;
    },
    setEuler: function( yaw, pitch, roll ) {
        var a = this.data;
        yaw *= 0.5;
        pitch *= 0.5;
        roll *= 0.5;
        var cos = Math.cos;
        var sin = Math.sin;
        var cosYaw = cos( yaw );
        var sinYaw = sin( yaw );
        var cosPitch = cos( pitch );
        var sinPitch = sin( pitch );
        var cosRoll = cos( roll );
        var sinRoll = sin( roll );
        a[ 0 ] = cosRoll * sinPitch * cosYaw + sinRoll * cosPitch * sinYaw;
        a[ 1 ] = cosRoll * cosPitch * sinYaw - sinRoll * sinPitch * cosYaw;
        a[ 2 ] = sinRoll * cosPitch * cosYaw - cosRoll * sinPitch * sinYaw;
        a[ 3 ] = cosRoll * cosPitch * cosYaw + sinRoll * sinPitch * sinYaw;
        return this;
    },
    setAxisAngle: function( axis, angle ) {
        angle *= 0.5;
        TempVars.lock();
        var a = this.data,
            temp = TempVars.getVector3();
        temp.set( axis ).normalize().scale( Math.sin( angle ) );
        a[ 0 ] = temp.data[ 0 ];
        a[ 1 ] = temp.data[ 1 ];
        a[ 2 ] = temp.data[ 2 ];
        a[ 3 ] = Math.cos( angle );
        TempVars.release();
        return this;
    },
    getAngle: function() {
        var a = this.data;
        if ( a[ 0 ] || a[ 1 ] || a[ 2 ] ) {
            var acos = Math.acos( a[ 3 ] );
            if ( acos < -1 ) {
                return 2 * Math.PI;
            }
            else if ( acos > 1 ) {
                return 0;
            }
            return 2 * Math.acos( acos );
        }
        return 0;
    },
    getAxis: function( dest ) {
        var a = this.data;
        if ( !dest ) {
            dest = new Vector3();
        }
        if ( a[ 0 ] || a[ 1 ] || a[ 2 ] ) {
            dest.data[ 0 ] = a[ 0 ];
            dest.data[ 1 ] = a[ 1 ];
            dest.data[ 2 ] = a[ 2 ];
            dest.normalize();
        }
        else {
            dest.data[ 0 ] = 0;
            dest.data[ 1 ] = 0;
            dest.data[ 2 ] = 1;
        }
        return dest;
    },
    getAxisAngle: function( dest ) {
        var d = this.data;
        if ( !dest ) {
            dest = new Vector3();
        }
        dest.data[ 0 ] = Math.atan2( 2 * ( d[ 3 ] * d[ 0 ] + d[ 1 ] * d[ 2 ] ), 1 - 2 * (d[ 0 ]*d[ 0 ] + d[ 1 ] * d[ 1 ] ) );
        dest.data[ 1 ] = Math.asin( 2 * ( d[ 3 ] * d[ 1 ] - d[ 2 ] * d[ 0 ] ) );
        dest.data[ 2 ] = Math.atan2( 2 * ( d[ 3 ] * d[ 2 ] + d[ 0 ] * d[ 1 ] ), 1 - 2 * ( d[ 1 ] * d[ 1 ] + d[ 2 ] * d[ 2 ] ) );
        return dest;
    },
    inverse: function() {
        var a = this.data;
        a[ 0 ] = -a[ 0 ];
        a[ 1 ] = -a[ 1 ];
        a[ 2 ] = -a[ 2 ];
        return this;
    },
    multiply: function( quaternion ) {
        var a = this.data,
            b = quaternion.data;
        var qax = a[ 0 ], qay = a[ 1 ], qaz = a[ 2 ], qaw = a[ 3 ];
        var qbx = b[ 0 ], qby = b[ 1 ], qbz = b[ 2 ], qbw = b[ 3 ];

        a[ 0 ] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
        a[ 1 ] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
        a[ 2 ] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
        a[ 3 ] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

        return this;
    },
    preMultiply: function( quaternion ) {
        var a = this.data,
            b = quaternion.data;
        var qbx = a[ 0 ], qby = a[ 1 ], qbz = a[ 2 ], qbw = a[ 3 ];
        var qax = b[ 0 ], qay = b[ 1 ], qaz = b[ 2 ], qaw = b[ 3 ];

        a[ 0 ] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
        a[ 1 ] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
        a[ 2 ] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
        a[ 3 ] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

        return this;
    },
    multiplyVector3: function( vector ) {
        var a = this.data,
            b = vector.data,

            x = b[ 0 ], y = b[ 1 ], z = b[ 2 ],
            qx = a[ 0 ], qy = a[ 1 ], qz = a[ 2 ], qw = a[ 3 ];

        // calculate this * vector
        var ix = qw * x + qy * z - qz * y,
            iy = qw * y + qz * x - qx * z,
            iz = qw * z + qx * y - qy * x,
            iw = -qx * x - qy * y - qz * z;

        // calculate result * inverse this
        b[ 0 ] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        b[ 1 ] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        b[ 2 ] = iz * qw + iw * -qz + ix * -qy - iy * -qx;

        return vector;
    },
    fromMatrix3: function( matrix ) {
        var a = this.data,
            b = matrix.data;

        var s, t = b[ 0 ] + b[ 4 ] + b[ 8 ];
        // we protect the division by s by ensuring that s>=1
        if ( t >= 0 ) { // |w| >= .5
            s = Math.sqrt( t + 1 ); // |s|>=1 ...
            a[ 3 ] = 0.5 * s;
            s = 0.5 / s;                 // so this division isn't bad
            a[ 0 ] = ( b[ 5 ] - b[ 7 ] ) * s;
            a[ 1 ] = ( b[ 6 ] - b[ 2 ] ) * s;
            a[ 2 ] = ( b[ 1 ] - b[ 3 ] ) * s;
        } else if ( ( b[ 0 ] > b[ 4 ] ) && ( b[ 0 ] > b[ 8 ] ) ) {
            s = Math.sqrt( 1 + b[ 0 ] - b[ 4 ] - b[ 8 ] ); // |s|>=1
            a[ 0 ] = s * 0.5; // |x| >= .5
            s = 0.5 / s;
            a[ 1 ] = ( b[ 1 ] + b[ 3 ] ) * s;
            a[ 2 ] = ( b[ 6 ] + b[ 2 ] ) * s;
            a[ 3 ] = ( b[ 5 ] - b[ 7 ] ) * s;
        } else if ( b[ 4 ] > b[ 8 ] ) {
            s = Math.sqrt( 1 + b[ 4 ] - b[ 0 ] - b[ 8 ] ); // |s|>=1
            a[ 1 ] = s * 0.5; // |y| >= .5
            s = 0.5 / s;
            a[ 0 ] = ( b[ 1 ] + b[ 3 ] ) * s;
            a[ 2 ] = ( b[ 5 ] + b[ 7 ] ) * s;
            a[ 3 ] = ( b[ 6 ] - b[ 2 ] ) * s;
        } else {
            s = Math.sqrt( 1 + b[ 8 ] - b[ 0 ] - b[ 4 ] ); // |s|>=1
            a[ 2 ] = s * 0.5; // |z| >= .5
            s = 0.5 / s;
            a[ 0 ] = ( b[ 6 ] + b[ 2 ] ) * s;
            a[ 1 ] = ( b[ 5 ] + b[ 7 ] ) * s;
            a[ 3 ] = ( b[ 1 ] - b[ 3 ] ) * s;
        }
        return this;
    },
    toMatrix4: function( dest ) {
        if ( !dest ) {
            dest = new Matrix4();
        }
        var a = this.data,
            b = dest.data;

        var x = a[ 0 ], y = a[ 1 ], z = a[ 2 ], w = a[ 3 ];

        var x2 = x + x,
            y2 = y + y,
            z2 = z + z,

            xx = x * x2,
            xy = x * y2,
            xz = x * z2,

            yy = y * y2,
            yz = y * z2,
            zz = z * z2,

            wx = w * x2,
            wy = w * y2,
            wz = w * z2;

        b[ 0 ] = 1 - ( yy + zz );
        b[ 1 ] = xy + wz;
        b[ 2 ] = xz - wy;
        b[ 3 ] = 0;

        b[ 4 ] = xy - wz;
        b[ 5 ] = 1 - ( xx + zz );
        b[ 6 ] = yz + wx;
        b[ 7 ] = 0;

        b[ 8 ] = xz + wy;
        b[ 9 ] = yz - wx;
        b[ 10 ] = 1 - ( xx + yy );
        b[ 11 ] = 0;

        b[ 12 ] = 0;
        b[ 13 ] = 0;
        b[ 14 ] = 0;
        b[ 15 ] = 1;

        return dest;
    },
    dot: function( quaternion ) {
        return this.data[ 0 ] * quaternion.data[ 0 ] +
               this.data[ 1 ] * quaternion.data[ 1 ] +
               this.data[ 2 ] * quaternion.data[ 2 ] +
               this.data[ 3 ] * quaternion.data[ 3 ];
    },
    slerp: function( to, by ) {
        if ( this.data[ 0 ] == to.data[ 0 ] && this.data[ 1 ] == to.data[ 1 ] && this.data[ 2 ] == to.data[ 2 ] && this.data[ 3 ] == to.data[ 3 ] ) {
            return this;
        }

        var dot = this.dot( to );

        if ( dot < 0 ) {
            to = new Quaternion( [ -to.data[ 0 ], -to.data[ 1 ], -to.data[ 2 ], -to.data[ 3 ] ] );
            dot = -dot;
        }

        if ( 1 - dot < 0.001 ) { // too close
            return this;
        }

        var scale0 = 1 - by;
        var scale1 = by;

        if ( ( 1 - dot ) > 0.1 ) {
            var theta = Math.acos( dot );
            var invSinTheta = 1 / Math.sin( theta );

            scale0 = Math.sin( ( 1 - by ) * theta ) * invSinTheta;
            scale1 = Math.sin( ( by * theta ) ) * invSinTheta;
        }

        this.data[ 0 ] = ( scale0 * this.data[ 0 ] ) + ( scale1 * to.data[ 0 ] );
        this.data[ 1 ] = ( scale0 * this.data[ 1 ] ) + ( scale1 * to.data[ 1 ] );
        this.data[ 2 ] = ( scale0 * this.data[ 2 ] ) + ( scale1 * to.data[ 2 ] );
        this.data[ 3 ] = ( scale0 * this.data[ 3 ] ) + ( scale1 * to.data[ 3 ] );

        return this;
    },
    clone: function() {
        return new Quaternion( this );
    },
    get x () {
        return this.data[ 0 ];
    },
    set x ( value ) {
        this.data[ 0 ] = value;
    },
    get y () {
        return this.data[ 1 ];
    },
    set y ( value ) {
        this.data[ 1 ] = value;
    },
    get z () {
        return this.data[ 2 ];
    },
    set z ( value ) {
        this.data[ 2 ] = value;
    },
    get w () {
        return this.data[ 3 ];
    },
    set w ( value ) {
        this.data[ 3 ] = value;
    },
    toString: function() {
        return '[' + [ this.data[ 0 ], this.data[ 1 ], this.data[ 2 ], this.data[ 3 ] ] + ']';
    }
};
