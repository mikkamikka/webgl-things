/**
 * Created by mika on 01.04.2017.
 */

var RegressionLayer = function( id, renderer, input_layer ) {

    var _this = this;

    this.in_sx = undefined;
    this.in_sy = undefined;

    this.maxAct = { x:0.5, y:1.0, z:1.0 };

    this.es = [];

    this.esum = 0.0;




    function toFloat( byte ) {
        return ( byte / 255.0 );
    }

    this.init = function(){};


    this.forward = function( ) {

        this.in_act = input_layer.out_act;

        this.out_act = [];

        //Compute max activation

        //Compute exponentials

        //var act = { x: toFloat(this.in_act[0][0]), y: toFloat(this.in_act[0][1]), z: toFloat(this.in_act[0][2]) };

        var act = { x: this.in_act[0][0], y: this.in_act[0][1], z: this.in_act[0][2] };

        console.log( 'activations: ', act.x, act.y, act.z );

        // this.es[0] = {
        //     x: Math.pow( act.x - this.maxAct.x, 2 ) / 2,
        //     y: Math.pow( act.y - this.maxAct.y, 2 ) / 2,
        //     z: Math.pow( act.z - this.maxAct.z, 2 ) / 2};

        //Normalize

        //this.es[0].x /= 5.0;
        //this.es[0].y /= 5.0;
        //this.es[0].z /= 5.0;

        this.out_act.push( act );



    }

    this.backward = function( ) {

        input_layer.dw = [];

        //var mul = -(indicator - this.es[i]);
        //x.dw[i] = mul;
        var dy = {};
        dy.x = this.out_act[0].x - this.maxAct.x;
        dy.y = this.out_act[0].y - this.maxAct.y;
        dy.z = this.out_act[0].z - this.maxAct.z;

        input_layer.dw.push( dy );

        console.log( 'dw gradient: ', input_layer.dw[0].x, input_layer.dw[0].y, input_layer.dw[0].z );

        var loss = {
            x: Math.pow( dy.x, 2 ) / 2,
            y: Math.pow( dy.y, 2 ) / 2,
            z: Math.pow( dy.z, 2 ) / 2
        }


        console.log( 'cost_loss: ', loss );

        return loss;

    }



}