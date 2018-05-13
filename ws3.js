var program;
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialOption = {
    "gold": {
        "ambient": vec4(0.24725, 0.1995, 0.0745, 1.0),
        "diffuse": vec4(0.75164, 0.60648, 0.22648, 1.0),
        "specular": vec4(0.628281, 0.555802, 0.366065, 1.0),
        "shine": 51.2
    },
    "emerald": {
        "diffuse": vec4(0.0215, 0.1745, 0.0215, 0.55),
        "ambient": vec4(0.07568, 0.61424, 0.07568, 0.55),
        "specular": vec4(0.633, 0.727811, 0.633, 0.55),
        "shine": 76.8
    },
    "obsidian": {
        "ambient": vec4(0.05375, 0.05, 0.06625, 0.82),
        "diffuse": vec4(0.18275, 0.17, 0.22525, 0.82),
        "specular": vec4(0.332741, 0.328634, 0.346435, 0.82),
        "shine": 38.4
    },
    "perl": {
        "ambient": vec4(0.25, 0.20725, 0.20725, 0.922),
        "diffuse": vec4(1.0, 0.829, 0.829, 0.922),
        "specular": vec4(0.296648, 0.296648, 0.296648, 0.922),
        "shine": 12.264
    }
}

function main() {
    var canvas = document.getElementById("webgl");
    var gl = canvas.getContext("webgl");

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var u_MvpMatrix = gl.getUniformLocation(program, 'u_MvpMatrix');
    var u_NormalMatrix = gl.getUniformLocation(program, 'u_NormalMatrix');

    //Clear Color
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    var n = initVertexBuffers(gl);
    var viewProjMatrix = new Matrix4();

    viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0);
    viewProjMatrix.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

    //Set light position
    var lightPositionLocation = gl.getUniformLocation(program, 'lightPosition');
    var lightPos = new Vector4([0.5, 0.5, 0.5, 0.0]);
    gl.uniform4fv(lightPositionLocation, lightPos.elements);

    setMaterial(gl, materialOption["gold"]);


    document.onkeydown = function (ev) { keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix); };
    document.getElementById("materialSelector").onchange = function(ev){
        setMaterial(gl, materialOption[ev.target.value]);
    }
    
    render(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}

function render(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
    draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
    requestAnimFrame(function() {
        render(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
    });
}

var ANGLE_STEP = 3.0;    // The increments of rotation angle (degrees)
var g_arm1Angle = -90.0; // The rotation angle of arm1 (degrees)
var g_joint1Angle = 0.0; // The rotation angle of joint1 (degrees)

function keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
    switch (ev.keyCode) {
        case 38: // Up arrow key -> the positive rotation of joint1 around the z-axis
            if (g_joint1Angle < 135.0) g_joint1Angle += ANGLE_STEP;
            break;
        case 40: // Down arrow key -> the negative rotation of joint1 around the z-axis
            if (g_joint1Angle > -135.0) g_joint1Angle -= ANGLE_STEP;
            break;
        case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
            g_arm1Angle = (g_arm1Angle + ANGLE_STEP) % 360;
            break;
        case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
            g_arm1Angle = (g_arm1Angle - ANGLE_STEP) % 360;
            break;
        default: return; // Skip drawing at no effective action
    }
    draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

}
function initVertexBuffers(gl) {
    // Vertex coordinates（a cuboid 3.0 in width, 10.0 in height, and 3.0 in length with its origin at the center of its bottom)
    var vertices = new Float32Array([
        1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5, 0.0, 1.5, 1.5, 0.0, 1.5, // v0-v1-v2-v3 front
        1.5, 10.0, 1.5, 1.5, 0.0, 1.5, 1.5, 0.0, -1.5, 1.5, 10.0, -1.5, // v0-v3-v4-v5 right
        1.5, 10.0, 1.5, 1.5, 10.0, -1.5, -1.5, 10.0, -1.5, -1.5, 10.0, 1.5, // v0-v5-v6-v1 up
        -1.5, 10.0, 1.5, -1.5, 10.0, -1.5, -1.5, 0.0, -1.5, -1.5, 0.0, 1.5, // v1-v6-v7-v2 left
        -1.5, 0.0, -1.5, 1.5, 0.0, -1.5, 1.5, 0.0, 1.5, -1.5, 0.0, 1.5, // v7-v4-v3-v2 down
        1.5, 0.0, -1.5, -1.5, 0.0, -1.5, -1.5, 10.0, -1.5, 1.5, 10.0, -1.5  // v4-v7-v6-v5 back
    ]);

    // Normal
    var normals = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, // v0-v1-v2-v3 front
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, // v0-v3-v4-v5 right
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // v0-v5-v6-v1 up
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, // v7-v4-v3-v2 down
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0  // v4-v7-v6-v5 back
    ]);

    // Indices of the vertices
    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // right
        8, 9, 10, 8, 10, 11,    // up
        12, 13, 14, 12, 14, 15,    // left
        16, 17, 18, 16, 18, 19,    // down
        20, 21, 22, 20, 22, 23     // back
    ]);

    // Write the vertex property to buffers (coordinates and normals)
    if (!initArrayBuffer(gl, 'a_Position', vertices, gl.FLOAT, 3)) return -1;
    if (!initArrayBuffer(gl, 'a_Normal', normals, gl.FLOAT, 3)) return -1;

    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Write the indices to the buffer object
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuffer(gl, attribute, data, type, num) {
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return false;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    // Assign the buffer object to the attribute variable
    var a_attribute = gl.getAttribLocation(program, attribute);
    if (a_attribute < 0) {
        console.log('Failed to get the storage location of ' + attribute);
        return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // Enable the assignment of the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_attribute);

    return true;
}

var g_modelMatrix = new Matrix4(), g_mvpMatrix = new Matrix4();
var safeMatrix = [];

function draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Arm1
    var arm1Length = 10.0; // Length of arm1
    g_modelMatrix.setTranslate(0.0, -12.0, 0.0);
    g_modelMatrix.rotate(g_arm1Angle, 0.0, 1.0, 0.0);    // Rotate around the y-axis
    drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix); // Draw

    // Arm2
    g_modelMatrix.translate(0.0, arm1Length, 0.0); 　　　// Move to joint1
    g_modelMatrix.rotate(g_joint1Angle, 0.0, 0.0, 1.0);  // Rotate around the z-axis
    g_modelMatrix.scale(1.3, 0.5, 1.3); // Make it a little thicker
    drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix); // Draw

    // Arm2
    g_modelMatrix.translate(0.0, arm1Length / 2, 0.0);
    g_modelMatrix.scale(1.3, 1.0, 2.0);
    drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix); // Draw¸
}

var g_normalMatrix = new Matrix4(); // Coordinate transformation matrix for normals

// Draw the cube
function drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
    // Calculate the model view project matrix and pass it to u_MvpMatrix
    g_mvpMatrix.set(viewProjMatrix);
    g_mvpMatrix.multiply(g_modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);
    // Calculate the normal transformation matrix and pass it to u_NormalMatrix
    g_normalMatrix.setInverseOf(g_modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);
    // Draw
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function setMaterial(gl, opt) {
    let ambientProduct = mult(lightAmbient, opt["ambient"]);
    let diffuseProduct = mult(lightDiffuse, opt["diffuse"]);
    let specularProduct = mult(lightSpecular, opt["specular"]);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
        flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
        flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
        flatten(specularProduct));

    gl.uniform1f(gl.getUniformLocation(program,
        "shininess"), opt["shine"]);
}