"use strict";

var canvas, gl, program;

var modelViewMatrix, modelViewMatrixLoc;

var position = []
var color = []

var theta = {
    "body" : 45,
    "head" : 45,
    "leg"  : 0,
}

var size = {
    "body": [2.0, 5.0, 2.0],
    "head": [3.0, 3.0, 3.0],
    "leg" : [1.0, 3.0, 0.2],
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
    position.push(vertices[a]);
    color.push(vec4(0.2, 0.0, 0.2, 1.0))
    position.push(vertices[b]);
    color.push(vec4(0.2, 0.0, 0.2, 1.0))
    position.push(vertices[c]);
    color.push(vec4(0.2, 1.0, 0.2, 1.0))
    position.push(vertices[a]);
    color.push(vec4(0.2, 0.0, 0.2, 1.0))
    position.push(vertices[c]);
    color.push(vec4(0.2, 1.0, 0.2, 1.0))
    position.push(vertices[d]);
    color.push(vec4(0.2, 1.0, 0.2, 1.0))
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


    //Insert color to fragment shader
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(color), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    //color using uniform type
    var colorLocation = gl.getUniformLocation(program, "uColor");
    gl.uniform4fv(colorLocation, [0.2, 1.0, 0.2, 1.0]);


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
    body();
    head();
    leg1();
    leg2();
    requestAnimationFrame(render);
}

function body() {
    modelViewMatrix = scalem(size.body[0], size.body[1], size.body[2]);
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.0, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta.head, 0, 1, 0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}

function head() {
    theta.head+=5;
    modelViewMatrix = scalem(size.head[0], size.head[1], size.head[2]);
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.25*size.body[1], 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta.head, 0, 1, 0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}

function leg1() {
    modelViewMatrix = scalem(size.leg[0], size.leg[1], size.leg[2]);
    modelViewMatrix = mult(modelViewMatrix, translate(-0.3*size.body[0], -0.25*size.body[1], 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta.head, 0, 1, 0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}

function leg2() {
    modelViewMatrix = scalem(size.leg[0], size.leg[1], size.leg[2]);
    modelViewMatrix = mult(modelViewMatrix, translate(0.3*size.body[0], -0.25*size.body[1], 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta.head, 0, 1, 0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}