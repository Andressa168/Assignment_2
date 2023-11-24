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
var delta = 165 / 60;// delta added


var lightPosition2 = vec4(100.0, 100.0, 100.0, 1.0 );
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0 );
var lightPosition3 = vec4(0.0, 0.0, 0.0, 1.0 );

var lightAmbient = vec4(1, 1, 1, 1.0 );
var lightDiffuse = vec4( 2.0, 2.0, 2.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 0.4, 0.4, 1, 1.0 );
var materialShininess = 1.0;


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
    loadFileTexture(textureArray[textureArray.length-1],"timberhouses00.jpg");
    
    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"road.jpg") ;

    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"purple.jpg") ;

    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"card3.jpg") ;

    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"school.png") ;
    //https://creazilla.com/nodes/63211-school-clipart

    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"backpack.png") ;
    //https://www.freepik.com/icon/backpack_9440672#fromView=search&term=school+bag&page=1&position=0&track=ais
    
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
var sceneLengths = [8, 11, 10.8, 6.1, -1]; //set scene length, -1 will stop the scene
var timeDiff = 0;
var sceneTime = 0;
var frameRateTime = 0;
var frameCount = 0;


function render() {//start 
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    at = vec3(at[0], at[1], at[2]);
    eye = vec3(eye[0], eye[1], eye[2]);
    eye[1] = eye[1] + 0;
   
    // set the projection matrix
    // projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    projectionMatrix = perspective(90, 1, near, far);
    
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
    if(animFlag){
   
        curTime = (new Date()).getTime() /1000 ;
        if( resetTimerFlag ) {
            prevTime = curTime ;
            resetTimerFlag = false ;
        }
        TIME = TIME + curTime - prevTime;
        timeDiff = curTime - prevTime;
        currentTime += timeDiff;
        prevTime = curTime;
    }

     if (sceneLengths[sceneNum] <= sceneTime && sceneLengths[sceneNum] !== -1) { // setting scene happen time;
         sceneNum++;
         sceneTime = 0;
     }

     switch (sceneNum) { // scene happen with the time goes;
         case 0:
            scene0(sceneTime);
             break;
      /*   case 1:
             scene1(sceneTime);
             break;
         case 2:
             scene2(sceneTime);
            break;
         case 3:
             scene3(sceneTime);
             break;
         case 4:
             scene4(sceneTime);
             break;*/
     }

    sceneTime += timeDiff;
    frameRateTime += timeDiff;
    drawBackground();

    frameCount++;
    if (frameRateTime >= 2.0) {
        console.log("FPS: " + (frameCount / frameRateTime).toFixed(1));
        frameRateTime = 0;
        frameCount = 0;
    }

    if( animFlag )
        window.requestAnimFrame(render);

}

    // frameCount++;
    // if (frameRateTime >= 2.0) {
    //     console.log("FPS: " + (frameCount / frameRateTime).toFixed(1));
    //     frameRateTime = 0;
    //     frameCount = 0;
    // }
    // window.requestAnimFrame(render);
    
    // gl.activeTexture(gl.TEXTURE0);
    // gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
    // gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
    
    
    // gTranslate(-4,0,0) ;
    // gPush() ;
    // {
    //     gRotate(TIME*180/3.14159,0,1,0) ;
    //     setColor(vec4(1.0,0.0,0.0,1.0)) ;
    //     drawSphere() ;
    // }
    // gPop() ;
    
    // gPush() ;
    // {
    //     gTranslate(3,0,0) ;
    //     setColor(vec4(0.0,1.0,0.0,1.0)) ;
    //     gRotate(TIME*180/3.14159,0,1,0) ;
    //     drawCube() ;
    // }
    // gPop() ;
    
   
    
    // gPush() ;
    // {
    //     gTranslate(5,0,0) ;
    //     setColor(vec4(0.0,1.0,1.0,1.0)) ;
    //     gRotate(TIME*180/3.14159,0,1,0) ;
    //     drawCylinder() ;
    // }
    // gPop() ;
    
    
    
    // gPush() ;
    // {
    //     gTranslate(7,0,0) ;
    //     setColor(vec4(1.0,1.0,0.0,1.0)) ;
    //     gRotate(TIME*180/3.14159,0,1,0) ;
    //     drawCone() ;
    // }
    // gPop() ;

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
        
            gTranslate(this.position.x, this.position.y, this.position.z);
            gRotate(this.rotation.x, 1, 0, 0);
            gRotate(this.rotation.y, 0, 1, 0);
            gRotate(this.rotation.z, 0, 0, 1);

            setColor(vec4(1.0,0.5,1.0,1.0)) ;

            gPush();
            {
                    
                gPush();//Head
                {
                    gTranslate(0, 0, -20);
                    gScale(0.6, 0.6, 0.6);
                    drawSphere();
                }
                gPop();

                gPush();//Hat
                {
                    gTranslate(0, 0.8, -20);
                    gScale(0.5, 0.6, 0.5);
                    gRotate(270, 1, 0, 0);
                    drawCone();
                }
                gPop();

                gPush();//Body
                {
                    gTranslate(0,-1.5, -20);
                    gScale(0.8, 1, 0.8);
                    drawCube();
                }
                gPop();
            }
            gPop();

            gPush();//Arms
            {
                    
                gPush();//Left Arms
                {
                    gTranslate(-0.8, -1, -19.5);
                    gRotate(95,1,0,0);
                    gScale(0.2, 0.9, 0.2);
                    drawCube();
                }
                gPop();

                gPush();//Right Arms
                {
                    gTranslate(0.8, -1, -19.5);
                    gRotate(95,1,0,0);
                    gScale(0.2, 0.9, 0.2);
                    drawCube();
                }
                gPop();

            }
            gPop();

            gPush();//Legs
            {
                    
                gPush();//Left Leg
                {
                    gRotate((Math.sin(TIME) * 1.5), 1, 0, 0);
                    gRotate((Math.cos(TIME) * 1.5), 0, 0, 1);
                    gTranslate(-0.5, -3, -20);
                    gScale(0.2, 1, 0.2);
                    drawCube();
                }
                gPop();

                gPush();//Right Leg
                {
                    
                    gTranslate(0.5, -3, -20);
                    gScale(0.2, 1, 0.2);
                    drawCube();
                }
                gPop();

            }
            gPop();

            gPush();
            {

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, textureArray[5].textureWebGL);
                gl.uniform1i(gl.getUniformLocation(program, "texture5"), 5);

                gTranslate(0 , -1, -21);
                gScale(0.6, 0.7, 0.6);
                drawCube();
            }
            gPop();

        }
        gPop();
    }
}

var electricScooter = {

    position: new Vector(),
    rotation: new Vector(),
    rotateSpeed: 90,

    renderElectricScooter: function() {

        gPush();
        {
            gTranslate(this.position.x, this.position.y, this.position.z - 1.2);
            gRotate(this.rotation.x, 1, 0, 0);
            gRotate(this.rotation.y, 0, 1, 0);
            gRotate(this.rotation.z, 0, 0, 1);

            setColor(vec4(1.0,0.5,1.0,1.0));

            gPush();
            {
                gTranslate(-20, -3, -17);
                gRotate(-10, 1, 0, 0);
                gScale(0.2, 1.3, 0.2);
                drawCube();
            }
            gPop();

            gPush();//board
            {
                gTranslate(-20, -4.5, -18.5);
                gRotate(90, 1, 0, 0);
                gScale(0.45, 2, 0.2);
                drawCube();
            }
            gPop();

            gPush();//hand hold;
            {
                gTranslate(-20, -1.5, -17.3);
                gRotate(90, 0, 0, -1);
                gScale(0.2, 1.5, 0.2);
                drawCube();
            }
            gPop();

            gPush();//Whell
            {   
                setColor(vec4(0.5, 0.5, 0.5, 1.0));

                gPush();//Front
                {
                    gTranslate(-19.5, -4.2, -16.8);
                    gRotate(TIME * this.rotateSpeed, 1, 0, 0);
                    gRotate(90, 0, 1, 0);
                    gScale(0.8, 0.8, 0.3);
                    drawCone()
                }
                gPop();

                gPush();
                {
                    gTranslate(-20.5, -4.2, -16.8);
                    gRotate(TIME * this.rotateSpeed, 1, 0, 0);
                    gRotate(90, 0, -1, 0);
                    gScale(0.8, 0.8, 0.3);
                    drawCone()
                }
                gPop();

                gPush();//Back
                {
                    gTranslate(-19.5, -4.2, -20);
                    gRotate(TIME * this.rotateSpeed, 1, 0, 0);
                    gRotate(90, 0, 1, 0);
                    gScale(0.8, 0.8, 0.3);
                    drawCone()
                }
                gPop();

                gPush();
                {
                    gTranslate(-20.5, -4.2, -20);
                    gRotate(TIME * this.rotateSpeed, 1, 0, 0);
                    gRotate(90, 0, -1, 0);
                    gScale(0.8, 0.8, 0.3);
                    drawCone()
                }
                gPop();

            }gPop();
        }
        gPop();
    }
}

// draw cars
var tank = {
    position: new Vector(),
    rotation: new Vector(),
    turretRotation: new Vector(),
    shotScale: 0,
    rotateSpeed: 300,
    isRed: 0,
    turretGunRotation: new Vector(),

    renderTank: function () {

        gPush();
        {
            gTranslate(this.position.x, this.position.y, this.position.z);
            gRotate(this.rotation.x, 1, 0, 0);
            gRotate(this.rotation.y, 0, 1, 0);
            gRotate(this.rotation.z, 0, 0, 1);

            //Tank Body
            gPush();
            {
                if (this.isRed === 1) {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, textureArray[2].textureWebGL);
                    gl.uniform1i(gl.getUniformLocation(program, "texture1"), 1);
        
                } else {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, textureArray[2].textureWebGL);
                    gl.uniform1i(gl.getUniformLocation(program, "texture2"), 2);
                }

                gScale(2.0, 1, 3.5);
                drawCube();
            }
            gPop();

            // car lights
            toggleTextures();
            gPush();
            {
                gTranslate(1.4,-0.1,3.2);
                    lightPosition3 = vec4(1.4, -0.1, 3.2, 1.0);
                    gScale(0.5, 0.3, 0.5);
                    setColor(vec4(1, 0.7, 0, 0));
                    drawCube();

            }
            gPop();
            gPush();
            {
                gTranslate(-1.4,-0.1,3.2);
                    lightPosition = vec4(-1.4, -0.1, 3.2, 1.0);
                    gScale(0.5, 0.3, 0.5);
                    setColor(vec4(1, 0.7, 0, 0));
                    drawCube();

            }
            gPop();
            toggleTextures();

            // Car (top part)
            gPush();
            {       //add texture for car (top part)
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, textureArray[2].textureWebGL);
                    gl.uniform1i(gl.getUniformLocation(program, "texture2"), 2);
        
                setColor(vec4(0.5, 0.5, 0.5, 1));
                gRotate(this.turretRotation.x, 1, 0, 0);
                gRotate(this.turretRotation.y, 0, 1, 0);
                gRotate(this.turretRotation.z, 0, 0, 1);

                gTranslate(0, 1.5, 0);
                gPush();
                {
                    gScale(2.0, 0.55, 2);
                    drawCube();
                }
                gPop();

                // Turret Cylinder
                gPush();
                {
                    gRotate(this.turretGunRotation.x, 1, 0, 0);
                    gRotate(this.turretGunRotation.y, 0, 1, 0);
                    gRotate(this.turretGunRotation.z, 0, 0, 1);

                    gPush();
                    {
                        gTranslate(0, 0.2, 1);
                        gPush();
                        {
                            gScale(0.5, 0.5, 3);
                            drawCylinder();
                        }
                        gPop();

                        if (this.isShooting === 1) {
                            gPush();
                            {
                                gTranslate(0.1, 0.1, 2);

                                gScale(this.shotScale, this.shotScale, this.shotScale);
                                setColor(vec4(1, 0, 0, 0));
                                drawSphere();
                            }
                            gPop();

                            if (this.shotScale > 1) {
                                this.shotScale = 0;
                                this.isShooting = 0;
                            } else {
                                this.shotScale += 0.05 * delta;
                            }
                        }
                    }
                    gPop();
                }
                gPop();
            }
            gPop();
            

            // Tank Wheels
            toggleTextures();
            gPush();
            {
                gTranslate(2.4, -1, 2);
                gRotate(TIME * this.rotateSpeed, 1, 0, 0);
                gRotate(90, 0, 1, 0);
                gScale(1, 1, 0.3);
                setColor(vec4(0.5, 0.5, 0.5, 1.0));
                drawCone()
            }
            gPop();
            gPush();
            {
                gTranslate(2.4, -1, -2);
                gRotate(TIME * this.rotateSpeed, 1, 0, 0);
                gRotate(90, 0, 1, 0);
                gScale(1, 1, 0.3);
                setColor(vec4(0.5, 0.5, 0.5, 1.0));
                drawCone()
            }
            gPop();
            gPush();
            {
                gTranslate(-2.4, -1, 2);
                gRotate(TIME * this.rotateSpeed, 1, 0, 0);
                gRotate(90, 0, -1, 0);
                gScale(1, 1, 0.3);
                setColor(vec4(0.5, 0.5, 0.5, 1.0));
                drawCone()
            }
            gPop();
            gPush();
            {
                gTranslate(-2.4, -1, -2);
                gRotate(TIME * this.rotateSpeed, 1, 0, 0);
                gRotate(90, 0, -1, 0);
                gScale(1, 1, 0.3);
                setColor(vec4(0.5, 0.5, 0.5, 1.0));
                drawCone()
            }
            gPop();
            toggleTextures();
        }
        gPop();
    },
    shoot: function () {
        this.isShooting = 1;
    }

}

//another car
var car2 = {
    position: new Vector(),
    rotation: new Vector(),
    turretRotation: new Vector(),
    shotScale: 0,
    rotateSpeed: 300,
    isRed: 0,
    turretGunRotation: new Vector(),

    renderCar2: function () {

        gPush();
        {
            gTranslate(this.position.x, this.position.y, this.position.z);
            gRotate(this.rotation.x, 1, 0, 0);
            gRotate(this.rotation.y, 0, 1, 0);
            gRotate(this.rotation.z, 0, 0, 1);

            //Car2 Body
            gPush();
            {
                if (this.isRed === 1) {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
                    gl.uniform1i(gl.getUniformLocation(program, "texture1"), 1);
        
                } else {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
                    gl.uniform1i(gl.getUniformLocation(program, "texture2"), 2);
                }

                gScale(2.0, 1, 3.5);
                drawCube();
            }
            gPop();

            // car lights
            toggleTextures();
            gPush();
            {
                gTranslate(1.4,-0.1,3.2);
                    lightPosition3 = vec4(1.4, -0.1, 3.2, 1.0);
                    gScale(0.5, 0.5, 0.5);
                    setColor(vec4(1, 0.1, 0.1, 0));
                    drawCube();

            }
            gPop();
            gPush();
            {
                gTranslate(-1.4,-0.1,3.2);
                    lightPosition = vec4(-1.4, -0.1, 3.2, 1.0);
                    gScale(0.5, 0.5, 0.5);
                    setColor(vec4(1, 0.1, 0.1, 0));
                    drawCube();

            }
            gPop();
            gPush();
            {
                gTranslate(-0.1,2.4,0.7);
                    lightPosition = vec4(-1.4, -0.1, 3.2, 1.0);
                    gScale(1.5, 0.3, 0.5);
                    setColor(vec4(1, 0.1, 0.1, 0));
                    drawCube();

            }
            gPop();
            toggleTextures();

            // Car (top part)
            gPush();
            {       //add texture for car (top part)
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
                    gl.uniform1i(gl.getUniformLocation(program, "texture2"), 2);
        
                setColor(vec4(0.5, 0.5, 0.5, 1));
                gRotate(this.turretRotation.x, 1, 0, 0);
                gRotate(this.turretRotation.y, 0, 1, 0);
                gRotate(this.turretRotation.z, 0, 0, 1);

                gTranslate(0, 2, -1);
                gPush();
                {
                    gScale(2.0, 1, 2);
                    drawCube();
                }
                gPop();

                // Turret Cylinder
                gPush();
                {
                    gRotate(this.turretGunRotation.x, 1, 0, 0);
                    gRotate(this.turretGunRotation.y, 0, 1, 0);
                    gRotate(this.turretGunRotation.z, 0, 0, 1);

                    gPush();
                    {
                        gTranslate(0, 0.2, 1);
                        gPush();
                        {
                            gScale(0.5, 0.5, 3);
                            drawCylinder();
                        }
                        gPop();

                        if (this.isShooting === 1) {
                            gPush();
                            {
                                gTranslate(0.1, 0.1, 2);

                                gScale(this.shotScale, this.shotScale, this.shotScale);
                                setColor(vec4(1, 0, 0, 0));
                                drawSphere();
                            }
                            gPop();

                            if (this.shotScale > 1) {
                                this.shotScale = 0;
                                this.isShooting = 0;
                            } else {
                                this.shotScale += 0.05 * delta;
                            }
                        }
                    }
                    gPop();
                }
                gPop();
            }
            gPop();
            

            // Tank Wheels
            toggleTextures();
            gPush();
            {
                gTranslate(2.4, -1, 2);
                gRotate(TIME * this.rotateSpeed, 1, 0, 0);
                gRotate(90, 0, 1, 0);
                gScale(1, 1, 0.3);
                setColor(vec4(0, 0, 0, 1.0)); //black
                drawCone()
            }
            gPop();
            gPush();
            {
                gTranslate(2.4, -1, -2);
                gRotate(TIME * this.rotateSpeed, 1, 0, 0);
                gRotate(90, 0, 1, 0);
                gScale(1, 1, 0.3);
                setColor(vec4(0, 0, 0, 1.0));
                drawCone()
            }
            gPop();
            gPush();
            {
                gTranslate(-2.4, -1, 2);
                gRotate(TIME * this.rotateSpeed, 1, 0, 0);
                gRotate(90, 0, -1, 0);
                gScale(1, 1, 0.3);
                setColor(vec4(0, 0, 0, 1.0));
                drawCone()
            }
            gPop();
            gPush();
            {
                gTranslate(-2.4, -1, -2);
                gRotate(TIME * this.rotateSpeed, 1, 0, 0);
                gRotate(90, 0, -1, 0);
                gScale(1, 1, 0.3);
                setColor(vec4(0, 0, 0, 1.0));
                drawCone()
            }
            gPop();
            toggleTextures();
        }
        gPop();
    },
    shoot: function () {
        this.isShooting = 1;
    }

}

function drawBackground() {

    gPush();//Plataform;
    {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureArray[1].textureWebGL);
        gl.uniform1i(gl.getUniformLocation(program, "texture2"), 1);
        gTranslate(0, -6, 0) ;
        gScale(80, 1, 80);
        drawCube();
    }
    gPop();

    gPush();//House;
    {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
        gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
        gTranslate(-42, 3, -43) ;
        gScale(17, 8, 17);
        drawCube() ;
    }
    gPop();

    gPush();//School;
    {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureArray[4].textureWebGL);
        gl.uniform1i(gl.getUniformLocation(program, "texture4"), 4);
        gTranslate(42, 3, 42) ;
        gScale(17, 8, 17);
        drawCube() ;
    }
    gPop();

}

function scene0(sceneTime) {
    // first scene last for 6 seconds
    if (sceneTime === 0) {
        // initial location placing of car
        tank.position.x = -5;
        tank.position.y = -2.4;
        tank.position.z = -45;

        people.position.x = -21;
        people.position.y = -0.5;
        people.position.z = -2;

        electricScooter.position.x = -0.5;
        electricScooter.position.y = 0;
        electricScooter.position.z = -3.5;

        car2.position.x = 5;
        car2.position.y = -2.4;
        car2.position.z = -45;

        at = vec3(people.position.x, people.position.y, people.position.z - 8);
        eye = vec3(people.position.x, 10, people.position.z + 10);
        eye[0] = -10; //-20人物的正面；

    } 
    else if (sceneTime <= 4) {

        at = vec3(people.position.x, people.position.y, people.position.z - 8);
        eye = vec3(people.position.x + 6 * Math.sin(sceneTime) , people.position.y + 15, people.position.z + 6 * Math.cos(sceneTime));
        //eye = vec3(people.position.x + 6 * Math.sin(sceneTime) , people.position.y + 4.5 * currentTime, people.position.z + 6 * Math.cos(sceneTime));
        // eye[0] = -5 * currentTime;
    }
    else if (sceneTime <= 8) {

        at = vec3(people.position.x, people.position.y, people.position.z - 8);
        eye = vec3(people.position.x + 6 * Math.sin(sceneTime) , people.position.y + 15, people.position.z + 6 * Math.cos(sceneTime));
        //eye = vec3(people.position.x + 6 * Math.sin(sceneTime) , people.position.y + 4.5 * currentTime, people.position.z + 6 * Math.cos(sceneTime));
        eye[0] = -5 * currentTime;

    }
    
    electricScooter.position.z =+ 2.5 * currentTime; 
    people.position.z =+ 2.5 * currentTime;


    //tank.turretRotation.y = 20 * Math.cos(currentTime * 1.5);
    //tank.turretGunRotation.x = -5 + 5 * Math.cos(currentTime * 4);
    tank.renderTank();
    people.renderPeople();
    electricScooter.renderElectricScooter();
    car2.renderCar2();
    
    
   
}

function scene1(sceneTime){
    //for car number 2
    if (sceneTime ==0){

    }

}

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
