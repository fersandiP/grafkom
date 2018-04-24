"use strict";

var canvas, gl, program;

var modelViewMatrixLoc, normalLoc;
var modelViewMatrix = [];

var position = []
var color = []
var normals = []

var offset_hand_angle = 5;
var offset_hand_upper_angle = 0;

const STATE_HAND_LOWER_UP = 0;
const STATE_HAND_LOWER_DOWN = 3;
const STATE_HAND_UPPER_UP = 1;
const STATE_HAND_UPPER_DOWN = 2;
var hand_state = STATE_HAND_LOWER_UP;

var theta = {
    "body" : 45 ,
    "head" : -90,
    "leg"  : 0 ,
    "hand_lower" : 0,
    "hand_upper" : 0,
    "hat" : 0,
    "antenna" : 0,
    "train": 0,
    "train_body" : [0,0,0,0,0,0,0,0]
}

var size = {
    "body": [2.0, 5.0, 2.0],
    "head": [3.0, 3.0, 3.0],
    "leg" : [1.0, 3.0, 0.2],
    "hand_lower" : [2.0, 1.0, 0.2],
    "hand_upper" :  [1.5, 1.0, 0.2],
    "hat" : [1, 0.5, 0.5],
    "antenna" : [3, 0.5, 0.5],
    "car_head":[3.0, 3.0, 3.0],
    "car_body": [2.0, 2.0, 2.0],
    "car_tail": [1.0, 1.0, 1.0]
}

var pos = {
    "car_head":[2.5, -2.5, 0.0]
}

var trainSlider = ["slider1", "slider2", "slider3", "slider4", "slider5", "slider6", "slider7", "slider8"]

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

function setBall(gl, r, x, y){
  var center = vec2(x, y);

  position.push(center);
  for (var i = 0; i <= 100; i++){
    position.push(vec4(
        r*Math.cos(2*Math.PI*i/100.0) + x,
        r*Math.sin(2*Math.PI*i/100.0) + y,
        1,
        1
    ));

    }
}

function setCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function initCallbackFunction(){
    document.getElementById("sliderBody").onchange = function(event) {
        theta.body = event.target.value;
    };
    document.getElementById("sliderLeg").onchange = function(event) {
         theta.leg = event.target.value;
    };
    document.getElementById("sliderHead").onchange = function(event) {
         theta.head =  event.target.value;
    };

    for(var i=0;i<8;i++) (function(i){
      document.getElementById(trainSlider[i]).onchange = function(event) {
        theta.train_body[i] = event.target.value;
      }
    })(i);
}

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    gl.clearColor(0.7, 0.7, 0.7, 1.0);
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

    initCallbackFunction();
    render();

}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    resetModelViewMatrix()

    body();
    leg1();
    leg2();
    drawHand();
    drawTop();
    popMatrix();

    train();
    changeState();
    requestAnimationFrame(render);
}

function changeState(){
  if (hand_state == STATE_HAND_LOWER_UP && theta.hand_lower >= 75){
    offset_hand_angle = 0;
    offset_hand_upper_angle = 5;
    hand_state = STATE_HAND_UPPER_UP;
  } else if (hand_state == STATE_HAND_UPPER_UP && theta.hand_upper >= 75){
    offset_hand_angle = 0;
    offset_hand_upper_angle = -5;
    hand_state = STATE_HAND_UPPER_DOWN;
  } else if (hand_state == STATE_HAND_UPPER_DOWN && theta.hand_upper <= -75){
    offset_hand_angle = -5;
    offset_hand_upper_angle = 0;
    hand_state = STATE_HAND_LOWER_DOWN;
  } else if (hand_state == STATE_HAND_LOWER_DOWN && theta.hand_lower <= -75){
    offset_hand_angle = 5;
    offset_hand_upper_angle = 0;
    hand_state = STATE_HAND_LOWER_UP;
  }
}

function drawHand(){
  theta.hand_lower += offset_hand_angle;
  theta.hand_upper += offset_hand_upper_angle;

  handLowerLeft();
  handUpperLeft();
  popMatrix();
  handLowerRight();
  handUpperRight();
  popMatrix();
}

function drawTop(){
  head();
  hat();
  antenna();
  popMatrix();
  popMatrix();
}

function resetModelViewMatrix(){
  modelViewMatrix = [rotate(theta.body, 0, 1, 0)];
}

function currentMatrix(){
  return modelViewMatrix[modelViewMatrix.length-1];
}

//Change modelViewMatrix state
function popMatrix(){
  return modelViewMatrix.pop();
}

function body() {
    var s = scalem(size.body[0], size.body[1], size.body[2]);
    var instanceMatrix = mult( translate(0, 0, 0.0 ), s);
    var t = mult(currentMatrix(), instanceMatrix);

    draw(t);
}

function head() {
    var newModelViewMatrix = mult(currentMatrix(), translate(0, 0.5*size.body[1], 0.0));
    newModelViewMatrix = mult(newModelViewMatrix, rotate(theta.head, 0, 1, 0 ));

    modelViewMatrix.push(newModelViewMatrix)

    var s = scalem(size.head[0], size.head[1], size.head[2]);
    var instanceMatrix = mult(currentMatrix(), translate(0.0, 0.0, 0.0));
    instanceMatrix = mult(instanceMatrix, s)

    draw(instanceMatrix);
}

function hat() {
    var newModelViewMatrix = mult(currentMatrix(), translate(0.7*size.head[1], 0.0, 0.0));
    newModelViewMatrix = mult(newModelViewMatrix, rotate(theta.hat, 0, 0, 1 ));

    modelViewMatrix.push(newModelViewMatrix)

    var s = scalem(size.hat[0], size.hat[1], size.hat[2]);
    var instanceMatrix = mult(currentMatrix(), translate(0.0, 0.0, 0.0));
    instanceMatrix = mult(instanceMatrix, s);

    draw(instanceMatrix);
}

function antenna(){
  theta.antenna += 5;
  var s = scalem(size.antenna[0], size.antenna[1], size.antenna[2]);
  var instanceMatrix = mult(currentMatrix(), translate(0.5*size.antenna[0], 0.0, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(theta.antenna, 1, 1, 1))
  instanceMatrix = mult(instanceMatrix, s)

  draw(instanceMatrix);
}

function leg1() {
    var s = scalem(size.leg[0], size.leg[1], size.leg[2]);
    var instanceMatrix = mult(currentMatrix(), translate(-0.7*size.body[0], -0.7*size.body[1], 0.0));
    instanceMatrix = mult(instanceMatrix, rotate(theta.leg, 0, 0, 1))
    instanceMatrix = mult(instanceMatrix, s)

    draw(instanceMatrix);
}

function leg2() {
    var s = scalem(size.leg[0], size.leg[1], size.leg[2]);
    var instanceMatrix = mult(currentMatrix(), translate(0.7*size.body[0], -0.7*size.body[1], 0.0));
    instanceMatrix = mult(instanceMatrix, rotate(theta.leg, 0, 0, 1))
    instanceMatrix = mult(instanceMatrix, s)

  draw(instanceMatrix);
}

function handLowerLeft() {
    var newModelViewMatrix = mult(currentMatrix(), translate(-size.body[0], 0.0, 0.0));
    newModelViewMatrix = mult(newModelViewMatrix, rotate(theta.hand_lower, 0, 0, 1 ));

    modelViewMatrix.push(newModelViewMatrix)

    var s = scalem(size.hand_lower[0], size.hand_lower[1], size.hand_lower[2]);

    var instanceMatrix = mult(currentMatrix(), translate(-0.5*size.hand_lower[0], 0.0, 0.0));
    instanceMatrix = mult(instanceMatrix, s)

    draw(instanceMatrix);
}

function handLowerRight() {
    var newModelViewMatrix = mult(currentMatrix(), translate(size.body[0], 0.0, 0.0));
    newModelViewMatrix = mult(newModelViewMatrix, rotate(theta.hand_lower, 0, 0, 1 ));

    modelViewMatrix.push(newModelViewMatrix)

    var s = scalem(size.hand_lower[0], size.hand_lower[1], size.hand_lower[2]);

    var instanceMatrix = mult(currentMatrix(), translate(0.5*size.hand_lower[0], 0.0, 0.0));
    instanceMatrix = mult(instanceMatrix, s)

    draw(instanceMatrix);
}

function handUpperLeft() {
    var s = scalem(size.hand_upper[0], size.hand_upper[1], size.hand_upper[2]);
    var instanceMatrix = mult(currentMatrix(), translate(-2*size.hand_upper[0], 0.0, 0.0));
    instanceMatrix = mult(instanceMatrix, rotate(theta.hand_upper, 0, 0, 1))
    instanceMatrix = mult(instanceMatrix, s)

    draw(instanceMatrix);
}


function handUpperRight() {
    var s = scalem(size.hand_upper[0], size.hand_upper[1], size.hand_upper[2]);
    var instanceMatrix = mult(currentMatrix(), translate(2*size.hand_upper[0], 0.0, 0.0));
    instanceMatrix = mult(instanceMatrix, rotate(theta.hand_upper, 0, 0, 1))
    instanceMatrix = mult(instanceMatrix, s)

  draw(instanceMatrix);
}


function train() {
    theta.train++;
    carHead();
    carBody();

}

function carHead() {
    modelViewMatrix = [translate(pos.car_head[0], pos.car_head[1], 0.0)];
    var s = scalem(size.car_head[0], size.car_head[1], size.car_head[2]);
    var instanceMatrix = mult(s, currentMatrix());
    instanceMatrix = mult(instanceMatrix, rotate(theta.train, 1, 0, 0));
    draw(instanceMatrix);
}

function carBody() {
    for(var i=0;i<8;i++) {
        carSingle(i);
    }
}

function carSingle(x) {
    if (x == 0){
      var newModelViewMatrix = mult(currentMatrix(), translate(pos.car_head[0], pos.car_head[1]-2.5, 0.0));
    } else if (x == 7){
      var newModelViewMatrix = mult(currentMatrix(), translate(-1.5, 0 , 0.0));
    } else {
      var newModelViewMatrix = mult(currentMatrix(), translate(-2, 0 , 0.0));
    }
    newModelViewMatrix = mult(newModelViewMatrix, rotate(theta.train_body[x], 0,0,1));

    modelViewMatrix.push(newModelViewMatrix);

    if (x == 7){
      var s = scalem(size.car_tail[0], size.car_tail[1], size.car_tail[2]);
    } else {
      var s = scalem(size.car_body[0], size.car_body[1], size.car_body[2]);
    }
    var instanceMatrix = mult(currentMatrix(), rotate(theta.train+x*20, 1, 0, 0));
    instanceMatrix = mult(instanceMatrix, s);
    draw(instanceMatrix);
}


function draw(matrix) {
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(matrix));
    var normalMatrix = inverse(matrix);
    gl.uniformMatrix4fv(normalLoc, false, flatten(normalMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}
