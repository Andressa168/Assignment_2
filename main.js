// Template code for A2 Fall 2021 -- DO NOT DELETE THIS LINE

var canvas;
var gl;

var program ;

var near = 1;
var far = 100;


var left = -6.0;
var right = 6.0;
var ytop =6.0;
var bottom = -6.0;

var delta = 165 / 60;///////

var lightPosition2 = vec4(100.0, 100.0, 100.0, 1.0 );
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0 );

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 0.4, 0.4, 0.4, 1.0 );
var materialShininess = 30.0;


var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix ;
var modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye = vec3(0, 0, 0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var RX = 0 ;
var RY = 0 ;
var RZ = 0 ;

var MS = [] ; // The modeling matrix stack
var TIME = 0.0 ; // Realtime
var TIME = 0.0 ; // Realtime
var resetTimerFlag = true ;
var animFlag = false ;
var prevTime = 0.0 ;
var useTextures = 1 ;

// ------------ Images for textures stuff --------------
var texSize = 64;

var image1 = new Array()
for (var i =0; i<texSize; i++)  image1[i] = new Array();
for (var i =0; i<texSize; i++)
for ( var j = 0; j < texSize; j++)
image1[i][j] = new Float32Array(4);
for (var i =0; i<texSize; i++) for (var j=0; j<texSize; j++) {
    var c = (((i & 0x8) == 0) ^ ((j & 0x8)  == 0));
    image1[i][j] = [c, c, c, 1];
}

// Convert floats to ubytes for texture

var image2 = new Uint8Array(4*texSize*texSize);

for ( var i = 0; i < texSize; i++ )
for ( var j = 0; j < texSize; j++ )
for(var k =0; k<4; k++)
image2[4*texSize*i+4*j+k] = 255*image1[i][j][k];


var textureArray = [] ;


function isLoaded(im) {
    if (im.complete) {
        console.log("loaded") ;
        return true ;
    }
    else {
        console.log("still not loaded!!!!") ;
        return false ;
    }
}

function loadFileTexture(tex, filename)
{
    tex.textureWebGL  = gl.createTexture();
    tex.image = new Image();
    tex.image.src = filename ;
    tex.isTextureReady = false ;
    tex.image.onload = function() { handleTextureLoaded(tex); }
    // The image is going to be loaded asyncronously (lazy) which could be
    // after the program continues to the next functions. OUCH!
}

function loadImageTexture(tex, image) {
    tex.textureWebGL  = gl.createTexture();
    tex.image = new Image();
    //tex.image.src = "CheckerBoard-from-Memory" ;
    
    gl.bindTexture( gl.TEXTURE_2D, tex.textureWebGL );
    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0,
                  gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                     gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);

    tex.isTextureReady = true ;

}

function initTextures() {//add texture;
    
    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"timberhouses00.jpg") ;
    
    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"road.jpg") ;

    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"school.png") ;
    
    textureArray.push({}) ;
    loadImageTexture(textureArray[textureArray.length-1],image2) ;
    
    
}


function handleTextureLoaded(textureObj) {
    gl.bindTexture(gl.TEXTURE_2D, textureObj.textureWebGL);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // otherwise the image would be flipped upsdide down
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureObj.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);
    console.log(textureObj.image.src) ;
    
    textureObj.isTextureReady = true ;
}

//----------------------------------------------------------------

function setColor(c)
{
    ambientProduct = mult(lightAmbient, c);
    diffuseProduct = mult(lightDiffuse, c);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
                                        "shininess"),materialShininess );
}

function toggleTextures() {
    useTextures = 1 - useTextures ;
    gl.uniform1i( gl.getUniformLocation(program,
                                         "useTextures"), useTextures );
}

function waitForTextures1(tex) {
    setTimeout( function() {
    console.log("Waiting for: "+ tex.image.src) ;
    wtime = (new Date()).getTime() ;
    if( !tex.isTextureReady )
    {
        console.log(wtime + " not ready yet") ;
        waitForTextures1(tex) ;
    }
    else
    {
        console.log("ready to render") ;
        window.requestAnimFrame(render);
    }
               },5) ;
    
}

// Takes an array of textures and calls render if the textures are created
function waitForTextures(texs) {
    setTimeout( function() {
               var n = 0 ;
               for ( var i = 0 ; i < texs.length ; i++ )
               {
                    console.log("boo"+texs[i].image.src) ;
                    n = n+texs[i].isTextureReady ;
               }
               wtime = (new Date()).getTime() ;
               if( n != texs.length )
               {
               console.log(wtime + " not ready yet") ;
               waitForTextures(texs) ;
               }
               else
               {
               console.log("ready to render") ;
               window.requestAnimFrame(render);
               }
               },5) ;
    
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
 
    // Load canonical objects and their attributes
    Cube.init(program);
    Cylinder.init(9,program);
    Cone.init(9,program) ;
    Sphere.init(36,program) ;

    gl.uniform1i( gl.getUniformLocation(program, "useTextures"), useTextures );

    // record the locations of the matrices that are used in the shaders
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    // set a default material
    setColor(materialDiffuse) ;
    
  
    
    // set the callbacks for the UI elements
    document.getElementById("sliderXi").oninput = function() {
        RX = this.value ;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderYi").oninput = function() {
        RY = this.value;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderZi").oninput = function() {
        RZ =  this.value;
        window.requestAnimFrame(render);
    };
    
    document.getElementById("animToggleButton").onclick = function() {
        if( animFlag ) {
            animFlag = false;
        }
        else {
            animFlag = true  ;
            resetTimerFlag = true ;
            window.requestAnimFrame(render);
        }
    };
    
    document.getElementById("textureToggleButton").onclick = function() {
        toggleTextures() ;
        window.requestAnimFrame(render);
    };

    var controller = new CameraController(canvas);
    controller.onchange = function(xRot,yRot) {
        RX = xRot ;
        RY = yRot ;
        window.requestAnimFrame(render); };
    
    // load and initialize the textures
    initTextures() ;
    
    // Recursive wait for the textures to load
    waitForTextures(textureArray) ;
    //setTimeout (render, 100) ;
    
}

// Sets the modelview and normal matrix in the shaders
function setMV() {
    modelViewMatrix = mult(viewMatrix,modelMatrix) ;
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    normalMatrix = inverseTranspose(modelViewMatrix) ;
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix) );
}

// Sets the projection, modelview and normal matrix in the shaders
function setAllMatrices() {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    setMV() ;
    
}

// Draws a 2x2x2 cube center at the origin
// Sets the modelview matrix and the normal matrix of the global program
function drawCube() {
    setMV() ;
    Cube.draw() ;
}

// Draws a sphere centered at the origin of radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawSphere() {
    setMV() ;
    Sphere.draw() ;
}
// Draws a cylinder along z of height 1 centered at the origin
// and radius 0.5.
// Sets the modelview matrix and the normal matrix of the global program
function drawCylinder() {
    setMV() ;
    Cylinder.draw() ;
}

// Draws a cone along z of height 1 centered at the origin
// and base radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawCone() {
    setMV() ;
    Cone.draw() ;
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modelview matrix with the result
function gTranslate(x,y,z) {
    modelMatrix = mult(modelMatrix,translate([x,y,z])) ;
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modelview matrix with the result
function gRotate(theta,x,y,z) {
    modelMatrix = mult(modelMatrix,rotate(theta,[x,y,z])) ;
}

// Post multiples the modelview matrix with a scaling matrix
// and replaces the modelview matrix with the result
function gScale(sx,sy,sz) {
    modelMatrix = mult(modelMatrix,scale(sx,sy,sz)) ;
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop() ;
}

// pushes the current modelMatrix in the stack MS
function gPush() {
    MS.push(modelMatrix) ;
}

var currentTime = 0;
var sceneNum = 0;
var sceneLengths = [6, 11, 10.8, 6.1, -1];
var timeDiff = 0;
var sceneTime = 0;
var frameRateTime = 0;
var frameCount = 0;

function render() {//start 
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    at = vec3(at[0], at[1], at[2]);
    // eye = vec3(eye[0], eye[1], eye[2]);
    eye = vec3(20, 0, 15);
    eye[1] = eye[1] + 0 ;
   
    // set the projection matrix
    // projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    projectionMatrix = perspective(45, 1, near, far);
    
    // set the camera matrix
    viewMatrix = lookAt(eye, at, up);
    
    // initialize the modeling matrix stack
    MS= [] ;
    modelMatrix = mat4() ;
    
    // apply the slider rotations
    gRotate(RZ,0,0,1) ;
    gRotate(RY,0,1,0) ;
    gRotate(RX,1,0,0) ;
    
    // send all the matrices to the shaders
    setAllMatrices() ;
    
    // get real time
    var curTime ;
    if( animFlag )
    {
        curTime = (new Date()).getTime() /1000 ;
        if( resetTimerFlag ) {
            prevTime = curTime ;
            resetTimerFlag = false ;
        }
        TIME = TIME + curTime - prevTime ;
        timeDiff = curTime - prevTime;
        currentTime += timeDiff;
        prevTime = curTime ;
    }

    // if (sceneLengths[sceneNum] <= sceneTime && sceneLengths[sceneNum] !== -1) { // setting scene happen time;
    //     sceneNum++;
    //     sceneTime = 0;
    // }

    // switch (sceneNum) { // scene happen with the time goes;
    //     case 0:
    //         scene0(sceneTime);
    //         break;
    // }
    // sceneTime += timeDiff;
    // frameRateTime += timeDiff;
    drawBackground();

    // frameCount++;
    // if (frameRateTime >= 2.0) {
    //     console.log("FPS: " + (frameCount / frameRateTime).toFixed(1));
    //     frameRateTime = 0;
    //     frameCount = 0;
    // }

    //Owner of the house;
    // gPush();
    // {
    //     // gTranslate(0, -1, 0);
    //     gTranslate(0, -1, TIME+=0.01);
    //     setColor(vec4(1.0,0.5,1.0,1.0)) ;
    //     gPush();
    //     {
    //         gPush();//Head
    //         {
    //             gTranslate(0,0,-5) ;
    //             gScale(0.5, 0.5, 0.5);
    //             drawSphere();
    //         }
    //         gPop();

    //         gPush();//Hat
    //         {
    //             gTranslate(0, 0.7, -5);
    //             gScale(0.3, 0.5, 0.3);
    //             gRotate(270, 1, 0, 0);
    //             drawCone();
    //         }
    //         gPop();
    //     }

    //     gPush();//Body
    //     {
    //         gTranslate(0,-1.5,-5) ;
    //         gScale(0.8, 1, 0.7);
    //         drawCube();
    //     }
    //     gPop();

    //     gPush();//Arms
    //     {
            
    //         gPush();//Left Arms
    //         {

    //             gTranslate(-1, -1.5, -5);
    //             gRotate(45,0,0,-1);
    //             gScale(0.2, 0.7, 0.2);
    //             drawCube();
    //         }
    //         gPop();

            
    //         gPush();//Right Arms
    //         {
  
    //             gTranslate(1, -1.5, -5);
    //             gRotate(45,0,0,1);
    //             gScale(0.2, 0.7, 0.2);
    //             drawCube();
    //         }
    //         gPop();
    //     }
    //     gPop();

    //     gPush();//Legs
    //     {

    //         gPush();//Left Leg
    //         {
    //             gTranslate(-0.35, -3, -5);
    //             gRotate(-(Math.sin(TIME) * 20) + 5, 1, 0, 0);
    //             gScale(0.2, 0.8, 0.2);
    //             drawCube();
    //         }
    //         gPop();

    //         gPush();//Right Leg
    //         {
    //             gTranslate(0.35, -3, -5);
    //             gRotate((Math.sin(TIME) * 20) + 5, 1, 0, 0);
    //             gScale(0.2, 0.8, 0.2);
    //             drawCube();
    //         }
    //         gPop();
    //     }
    //     gPop();
    // }
    // gPop();
    

    gPush(); 
    {
        // gTranslate(this.position.x, this.position.y, this.position.z);
        // gRotate(this.rotation.x, 1, 0, 0);
        // gRotate(this.rotation.y, 0, 1, 0);
        // gRotate(this.rotation.z, 0, 0, 1);
        //gTranslate(-20, -1, -10);

        gTranslate(-20, -2, -15 + (TIME+=0.001 * delta));
        setColor(vec4(1.0,0.5,1.0,1.0));
        gPush();
        {
                
            gPush();//Head
            {
                gTranslate(0, 1.5, 0);
                gScale(0.5, 0.5, 0.5);
                drawSphere();
            }
            gPop();

            gPush();//Hat
            {
                    gTranslate(0, 2.1, 0);
                    gScale(0.3, 0.5, 0.3);
                    gRotate(270, 1, 0, 0);
                    drawCone();
            }
            gPop();

            gPush();//Body
            {
                    gScale(0.8, 1, 0.7);
                    drawCube();
            }
            gPop();

        }
        gPop();

        gPush();//Arms
        {
                
            gPush();//Left Arms
            {
                gTranslate(-2, -0.5, 0);
                gRotate(45,0,0,-1);
                gScale(0.3, 1, 0.3);
                drawCube();
            }
            gPop();

            gPush();//Right Arms
            {
                    gTranslate(2, -0.5, 0);
                    gRotate(45,0,0,1);
                    gScale(0.3, 1, 0.3);
                    drawCube();
            }
            gPop();

        }
        gPop();

        gPush();//Legs
        {
                
            gPush();//Left Leg
            {
                gRotate((Math.sin(TIME) * 20) + 10 , 1, 0, 0);
                gTranslate(-0.5, -1.5, 0);
                gScale(0.3, 1, 0.3);
                drawCube();
            }
            gPop();

            gPush();//Right Leg
            {
                gRotate(-(Math.sin(TIME) * 20) + 10, 1, 0, 0);
                gTranslate(0.5, -1.5, 0);
                gScale(0.3, 1, 0.3);
                drawCube();
            }
            gPop();

        }
        gPop();

    }
    gPop();

    gPush(); 
    {

        gPush(); //Head
        {
            gTranslate(0, -1, 0);
            gScale(0.8, 0.8, 0.8);
            drawCube();

        }
        gPop();

        gPush();//Body
        {
            gTranslate(0, -2.5, 0);
            gScale(0.5, 0.5, 0.6);
            drawCube();
        }
        gPop();

        gPush();//Right arm
        {

            gTranslate(1.5, -2.5, 0);
            gScale(0.5, 0.3, 0.6);
            drawCube();
        }
        gPop();

        gPush();//Left arm
        {
            gTranslate(-1.5, -2.5, 0);
            gScale(0.5, 0.3, 0.6);
            drawCube();
        }
        gPop();

        gPush();// Right leg
        {
            
            gTranslate(1, -4, 0);
            gScale(0.5, 0.4, 0.7);
            drawCube();
        }
        gPop();

        gPush();//Left leg
        {

            gTranslate(-1, -4, 0);
            gScale(0.5, 0.4, 0.7);
            drawCube();
        }
        gPop();

    }
    gPop();

    
    if( animFlag )
        window.requestAnimFrame(render);
}

class Vector {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
}

var people = {

    position: new Vector(),
    rotation: new Vector(),

    renderPeople: function() {

        gPush(); 
        {
            // gTranslate(this.position.x, this.position.y, this.position.z);
            // gRotate(this.rotation.x, 1, 0, 0);
            // gRotate(this.rotation.y, 0, 1, 0);
            // gRotate(this.rotation.z, 0, 0, 1);

            setColor(vec4(1.0,0.5,1.0,1.0));
            gPush();
            {
                
                gPush();//Head
                {
                    gTranslate(0, 0, -5);
                    gScale(0.5, 0.5, 0.5);
                    drawSphere();
                }
                gPop();

                gPush();//Hat
                {
                    gTranslate(0, 0.7, -5);
                    gScale(0.3, 0.5, 0.3);
                    gRotate(270, 1, 0, 0);
                    drawCone();
                }
                gPop();
            }
            gPop();
                
            gPush();//Body
            {
                gTranslate(0,-1.5,-5);
                gScale(0.8, 1, 0.7);
                drawCube();
            }

            gPush();//Arms
            {

                gPush();//Left Arms
                {
                    gTranslate(-1, -1.5, -5);
                    gRotate(45,0,0,-1);
                    gScale(0.2, 0.7, 0.2);
                    drawCube();
                }
                gPop();

                gPush();//Right Arms
                {
                    gTranslate(1, -1.5, -5);
                    gRotate(45,0,0,1);
                    gScale(0.2, 0.7, 0.2);
                    drawCube();
                }
                gPop();
            }
            gPop();

            gPush();//Legs
            {

                gPush();//Left Leg
                {
                    gTranslate(-0.35, -3, -5);
                    gScale(0.2, 0.8, 0.2);
                    drawCube();
                }
                gPop();

                gPush();//Right Leg
                {
                    gTranslate(0.35, -3, -5);
                    gScale(0.2, 0.8, 0.2);
                    drawCube();
                }
                gPop();
            }
            gPop();
        }
        gPop();      
    },
};

function drawBackground() {

    gPush();//Plataform;
    {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureArray[1].textureWebGL);
        gl.uniform1i(gl.getUniformLocation(program, "texture2"), 2);
        gTranslate(0, -6, 0) ;
        gScale(60, 1, 60);
        drawCube();
    }
    gPop();

    gPush();//School;
    {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
        gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
        gTranslate(-35, 2, -35) ;
        gScale(15, 8, 12);
        drawCube() ;
    }
    gPop();
}

// function scene0(sceneTime) {

//     if (sceneTime === 0) {
//         // initial location placing
//         people.position.x = 5; // model 1;
//         people.position.y = 0;
//         people.position.z = -20;
//         at = vec3(people.position.x, people.position.y, people.position.z); // camera location;
//         eye = vec3(people.position.x - 3, 1, people.position.z + 1);
//         eye[2] = -20;
//     } else if (sceneTime <= 4) {
//         people.position.z += 0.01 * delta; // model movements in z axis;
//         at[2] += 0.01 * delta; // camera movements;
//         eye[1] += 0.0045 * delta;
//         eye[2] += 0.03 * delta;
//     } else if (sceneTime <= 6) {
//         people.position.z += 0.01 * delta;
//         at[2] += 0.01 * delta;
//         eye[1] += 0.03 * delta;
//         eye[2] += 0.05 * delta;
//     }
    
//     people.renderPeople();
// }

// A simple camera controller which uses an HTML element as the event
// source for constructing a view matrix. Assign an "onchange"
// function to the controller as follows to receive the updated X and
// Y angles for the camera:
//
//   var controller = new CameraController(canvas);
//   controller.onchange = function(xRot, yRot) { ... };
//
// The view matrix is computed elsewhere.
function CameraController(element) {
    var controller = this;
    this.onchange = null;
    this.xRot = 0;
    this.yRot = 0;
    this.scaleFactor = 3.0;
    this.dragging = false;
    this.curX = 0;
    this.curY = 0;
    
    // Assign a mouse down handler to the HTML element.
    element.onmousedown = function(ev) {
        controller.dragging = true;
        controller.curX = ev.clientX;
        controller.curY = ev.clientY;
    };
    
    // Assign a mouse up handler to the HTML element.
    element.onmouseup = function(ev) {
        controller.dragging = false;
    };
    
    // Assign a mouse move handler to the HTML element.
    element.onmousemove = function(ev) {
        if (controller.dragging) {
            // Determine how far we have moved since the last mouse move
            // event.
            var curX = ev.clientX;
            var curY = ev.clientY;
            var deltaX = (controller.curX - curX) / controller.scaleFactor;
            var deltaY = (controller.curY - curY) / controller.scaleFactor;
            controller.curX = curX;
            controller.curY = curY;
            // Update the X and Y rotation angles based on the mouse motion.
            controller.yRot = (controller.yRot + deltaX) % 360;
            controller.xRot = (controller.xRot + deltaY);
            // Clamp the X rotation to prevent the camera from going upside
            // down.
            if (controller.xRot < -90) {
                controller.xRot = -90;
            } else if (controller.xRot > 90) {
                controller.xRot = 90;
            }
            // Send the onchange event to any listener.
            if (controller.onchange != null) {
                controller.onchange(controller.xRot, controller.yRot);
            }
        }
    };
}
