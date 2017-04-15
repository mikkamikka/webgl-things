/**
 * Created by mika on 01.04.2017.
 */

var SoftmaxLayer = function( id, renderer, input_layer ) {

    var _this = this;

    this.in_sx = undefined;
    this.in_sy = undefined;

    this.maxAct = { x:0.5, y:0.5, z:0.5 };

    this.es = [];

    this.esum = 0.0;

    this.out_act = [];


    function toFloat( byte ) {
        return ( byte / 255.0 ) - 0.5;
    }

    this.init = function(){};


    this.forward = function( ) {

        this.in_act = input_layer.out_act;

        //Compute max activation

        //Compute exponentials

        var act = { x: toFloat(this.in_act[0][0]), y: toFloat(this.in_act[0][1]), z: toFloat(this.in_act[0][2]) };

        this.es[0] = { x: Math.exp( act.x - this.maxAct.x ), y: Math.exp( act.y - this.maxAct.y ), z: Math.exp( act.z - this.maxAct.z ) };

        //Normalize

        this.es[0].x /= 5.0;
        this.es[0].y /= 5.0;
        this.es[0].z /= 5.0;

        this.out_act.push( this.es[0] );



    }

    this.backward = function( ) {

        //var mul = -(indicator - this.es[i]);
        //x.dw[i] = mul;
        var mul = {};
        mul.x = -( 1.0 - this.es[0].x );
        mul.y = -( 1.0 - this.es[0].y );
        mul.z = -( 1.0 - this.es[0].z );

        input_layer.dw.push( mul );

        console.log( 'dw gradient: ', input_layer.dw );

        var loss = { x: - Math.log(this.es[0].x),
            y: - Math.log(this.es[0].y),
            z: - Math.log(this.es[0].z)
        }


        console.log( 'cost_loss: ', loss );

    }



}