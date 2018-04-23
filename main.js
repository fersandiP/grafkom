"use strict";

var canvas, gl, program;


window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport(0, 0, canvas.width, canvas.height);

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    
    gl.enable( gl.DEPTH_TEST );

}