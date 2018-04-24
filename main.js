"use strict";

var canvas, gl, program;

var modelViewMatrix, modelViewMatrixLoc, normalLoc;

var position = []
var color = []
var normals = []


const X_OFFSET_OBJ_1 = -3;

var theta = {
    "body" : 45 ,
    "head" : 45,
    "leg"  : 0,
    "hand_lower" : 0,
    "hand_upper" : 0
}

var size = {
    "body": [2.0, 5.0, 2.0],
    "head": [3.0, 3.0, 3.0],
    "leg" : [1.0, 3.0, 0.2],
    "hand_lower" : [2.0, 1.0, 0.2],
    "hand_upper" :  [1.5, 1.0, 0.2],
}

var vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];


function quad(a, b, c, d) {
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);

    position.push(vertices[a]);
    normals.push(normal);
    position.push(vertices[b]);
    normals.push(normal);
    position.push(vertices[c]);
    normals.push(normal);
    position.push(vertices[a]);
    normals.push(normal);
    position.push(vertices[c]);
    normals.push(normal);
    position.push(vertices[d]);
    normals.push(normal);
}

function setCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);

    setCube();

    //Insert position to vertex shader
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(position), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    //Insert normal to vNormal
    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    //Get Normal Matrix Location
    normalLoc = gl.getUniformLocation(program, "normalMatrix");

    //Get Model View Matrix Location
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");


    //Projection Matrix SetUp
    var projectionMatrix = ortho(-10, 10, -10, 10, -10, 10);
    var projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix")
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    render();

}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    resetModelViewMatrix()

    body();
    // head();
    // leg1();
    // leg2();
    //
    // drawHand();
    requestAnimationFrame(render);
}

function drawHand(){
  handLowerLeft();
  handLowerRight();
  handUpperLeft();
  // handLowerRight();
}

function resetModelViewMatrix(){
  modelViewMatrix = rotate(theta.body, 0, 1, 0);
}

function body() {
    var s = scalem(size.body[0], size.body[1], size.body[2]);
    var instanceMatrix = mult( translate( X_OFFSET_OBJ_1, 0, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
    var normalMatrix = inverse(modelViewMatrix);
    gl.uniformMatrix4fv(normalLoc, false, flatten(normalMatrix));
    gl.drawArrays( gl.TRIANGLES, 0, 36 );
}

function head() {
    modelViewMatrix = scalem(size.head[0], size.head[1], size.head[2]);
    modelViewMatrix = mult(modelViewMatrix, translate(0.65 * X_OFFSET_OBJ_1, 0.25*size.body[1], 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta.body, 0, 1, 0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    var normalMatrix = inverse(modelViewMatrix);
    gl.uniformMatrix4fv(normalLoc, false, flatten(normalMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}

function leg1() {
    modelViewMatrix = scalem(size.leg[0], size.leg[1], size.leg[2]);
    modelViewMatrix = mult(modelViewMatrix, translate(-0.3*size.body[0] + 2 * X_OFFSET_OBJ_1, -0.25*size.body[1], 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta.body, 0, 1, 0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    var normalMatrix = inverse(modelViewMatrix);
    gl.uniformMatrix4fv(normalLoc, false, flatten(normalMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}

function leg2() {
    modelViewMatrix = scalem(size.leg[0], size.leg[1], size.leg[2]);
    modelViewMatrix = mult(modelViewMatrix, translate(0.3*size.body[0] + 2 * X_OFFSET_OBJ_1, -0.25*size.body[1], 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta.body, 0, 1, 0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    var normalMatrix = inverse(modelViewMatrix);
    gl.uniformMatrix4fv(normalLoc, false, flatten(normalMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}

function handLowerLeft() {
    modelViewMatrix = scalem(size.hand_lower[0], size.hand_lower[1], size.hand_lower[2]);
    modelViewMatrix = mult(modelViewMatrix, translate(2 * X_OFFSET_OBJ_1 + size.hand_lower[0], 0.0, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta.body, 1, 0, 0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    var normalMatrix = inverse(modelViewMatrix);
    gl.uniformMatrix4fv(normalLoc, false, flatten(normalMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}

function handLowerRight() {
    modelViewMatrix = scalem(size.hand_lower[0], size.hand_lower[1], size.hand_lower[2]);
    modelViewMatrix = mult(modelViewMatrix, translate(X_OFFSET_OBJ_1 + 0.5 * size.hand_lower[0], 0.0, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta.body, 1, 0, 0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    var normalMatrix = inverse(modelViewMatrix);
    gl.uniformMatrix4fv(normalLoc, false, flatten(normalMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}

function handUpperLeft() {
    modelViewMatrix = scalem(size.hand_upper[0], size.hand_upper[1], size.hand_upper[2]);
    modelViewMatrix = mult(modelViewMatrix, translate(0.5 * X_OFFSET_OBJ_1, 0.0, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta.body, 1, 0, 0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    var normalMatrix = inverse(modelViewMatrix);
    gl.uniformMatrix4fv(normalLoc, false, flatten(normalMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}


function handUpperRight() {
    modelViewMatrix = scalem(size.hand_upper[0], size.hand_upper[1], size.hand_upper[2]);
    modelViewMatrix = mult(modelViewMatrix, translate(X_OFFSET_OBJ_1 + size.body[0], 0.0, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta.body, 1, 0, 0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    var normalMatrix = inverse(modelViewMatrix);
    gl.uniformMatrix4fv(normalLoc, false, flatten(normalMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}
