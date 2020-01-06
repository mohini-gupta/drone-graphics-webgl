var modelsDir = "http://127.0.0.1:8887/Drone/Assets/";
var shaderDir = "http://127.0.0.1:8887/Drone/shaders/";
var vertices = [	// Vertex #:
1.0, 1.0,-1.0, //  0
1.0,-1.0,-1.0,  //  1
-1.0, 1.0,-1.0,  //  2
1.0, 1.0, 1.0,  //  3
-1.0, 1.0, 1.0,  //  4
1.0,-1.0, 1.0,  //  5
1.0, 1.0,-1.0,  //  6
1.0, 1.0, 1.0,  //  7
1.0,-1.0,-1.0,  //  8
1.0,-1.0,-1.0,  //  9
1.0,-1.0, 1.0,  // 10
-1.0,-1.0,-1.0,  // 11
-1.0,-1.0,-1.0,  // 12
-1.0,-1.0, 1.0,  // 13
-1.0, 1.0,-1.0,  // 14
1.0, 1.0, 1.0,  // 15
1.0, 1.0,-1.0,  // 16
-1.0, 1.0, 1.0,  // 17
-1.0,-1.0,-1.0,  // 18
-1.0,-1.0, 1.0,  // 19
1.0,-1.0, 1.0,  // 20
-1.0,-1.0, 1.0,  // 21
-1.0, 1.0, 1.0,  // 22
-1.0, 1.0,-1.0   // 23
];
var indices = [ // Face #:
 0,  1,  2,	//  0
 1, 18,  2,    //  1
 3,  4,  5,    //  2
 4, 19,  5,    //  3
 6,  7,  8,    //  4
 7, 20,  8,    //  5
 9, 10, 11,    //  6
10, 21, 11,    //  7
12, 13, 14,    //  8
13, 22, 14,    //  9
15, 16, 17,    // 10
16, 23, 17     // 11
];

var program = null;
var gl = null;
var canvas;

//Load Model Variables
//Terrain
var terrainModel;
var terrainVertices;
var terrainIndices  ;
var terrainTexCoords ;
var terrainNormal;  
var meshMatIndex2;
var min_z,max_z;
var terrainHeight;
//Drone
var droneModel;
var droneVertices ;
var droneIndices ;
var droneNormal ;
var meshMatIndex1;

//Load Shader variables
var vertexPositionAttribute = null ;
var vertexNormalAttribute = null;
var textureCoordAttribute = null;
var PmatrixUniform = null;
var NmatrixUniform = null;
var WVPmatrixUniform =  null;
var lightDir =  null;
var lightPos = null;
var lightDirHandle = null;
var lightColor = null;
var diffuseColor;
var specularColor ;
var diffuseColor_d;
var specularColor_d;
var textureUniform = null;
var texture;
var texture_d;
//var diffuseTexture;

//Shader BindBuffer Variables
var positionBuffer;
var normalBuffer;
var textureBuffer;
var indexBuffer;
var positionBuffer_d; 
var normalBuffer_d;
var indexBuffer_d;
var vao = null;

//Matrix variables
var perspectiveMatrix;
var worldMatrix;
var viewMatrix;
//Terrain
var terrainWorldMatrix;
var worldViewMatrix;
var projectionMatrix;
var normalMatrix;
var lightDirectionMatrix;
var lightPositionMatrix;
//Drone
var droneWorldMatrix;
var worldViewMatrix_d;
var projectionMatrix_d;
var normalMatrix_d;
var lightDirectionMatrix_d;
var lightPositionMatrix_d;
//var gLightDir;
//var terrainM;
	
//Parameters for light definition (Directional light)
var dirLightAlpha = -utils.degToRad(60);
var dirLightBeta  = -utils.degToRad(120);
var lightDirection = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
					  Math.sin(dirLightAlpha),
					  Math.cos(dirLightAlpha) * Math.sin(dirLightBeta),];
var lightColorMatrix = new Float32Array([1.0, 1.0, 1.0, 1.0]);
var objectSpecularPower = 10.0;
	
//View Parameters
var cx = 16;
var cy = 3;
var cz = 16;
var elevation =10;
var angle = 0.01;
var roll = 0.01;
var delta = 0.5;

//Drone Parameters
var droneTx = 16;
var droneTy = 2;
var droneTz = 8;
var droneRx = 0.0;
var droneRy = 40.0;
var droneRz = 0.0;
var droneAngle = 0;

var cam=[cx,cy,cz];
var drone=[droneTx,droneTy,droneTz];
var u=[0,1,0];

var w,h;
var aspectRatio;

//Keyboard Event Handler
var keys = [];
var vz = 0.0;
var rvy = 0.0;

var keyFunctionDown =function(e) {
  if(!keys[e.keyCode]) {
  	keys[e.keyCode] = true;
	switch(e.keyCode) {
	  case 37:
console.log("KeyUp   - Dir LEFT");
		rvy = rvy + 1.0;
		break;
	  case 39:
console.log("KeyUp   - Dir RIGHT");
		rvy = rvy - 1.0;
		break;
	  case 38:
console.log("KeyUp   - Dir UP");
		vz = vz - 1.0;
		break;
	  case 40:
console.log("KeyUp   - Dir DOWN");
		vz = vz + 1.0;
		break;
	}
  }
}
var keyFunctionUp =function(e) {
  if(keys[e.keyCode]) {
  	keys[e.keyCode] = false;
	switch(e.keyCode) {
	  case 37:
//console.log("KeyDown  - Dir LEFT");
		rvy = rvy - 1.0;
		break;
	  case 39:
//console.log("KeyDown - Dir RIGHT");
		rvy = rvy + 1.0;
		break;
	  case 38:
//console.log("KeyDown - Dir UP");
		vz = vz + 1.0;
		break;
	  case 40:
//console.log("KeyDown - Dir DOWN");
		vz = vz - 1.0;
		break;
	}
  }
}

//App begins
function main(){
	
	canvas=document.getElementById("my-canvas");
	gl = canvas.getContext("webgl2");
	canvas.width  = window.innerWidth-16;
	canvas.height = window.innerHeight-120;
	w  = gl.canvas.width;
	h =  gl.canvas.height;
	utils.resizeCanvasToDisplaySize(gl.canvas);
	gl.viewport(0, 0, w, h);
	gl.clearColor(0, 0, 0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	perspectiveMatrix = utils.MakePerspective(60, w/h, 0.1, 1000.0);
	
	window.addEventListener("keyup", keyFunctionUp, false);
	window.addEventListener("keydown", keyFunctionDown, false);	
	
	if(gl){		
	/* ********** */
	/* Load Model */
	/* ********** */
	utils.get_json(modelsDir + 'drone.json',function(loadedModel){droneModel = loadedModel;});	
	utils.get_json(modelsDir + 'Terrain.json',function(loadedModel){terrainModel = loadedModel;});	
	diffuseColor = [1.0, 1.0, 1.0];
	specularColor = [1.0, 1.0, 1.0];
	diffuseColor_d = [1.0, 1.0, 1.0];
	specularColor_d = [1.0, 1.0, 1.0];

	//Terrain Objects
	terrainVertices = terrainModel.meshes[0].vertices;
	terrainIndices = [].concat.apply([], terrainModel.meshes[0].faces);
    terrainTexCoords = terrainModel.meshes[0].texturecoords[0];
    terrainNormal = terrainModel.meshes[0].normals;  
	meshMatIndex2 = terrainModel.meshes[0].materialindex;
	terrainWorldMatrix = terrainModel.rootnode.children[0].transformation;
	
	var UVFileNamePropertyIndex = -1;
	var diffuseColorPropertyIndex = -1;
	var specularColorPropertyIndex = -1;	
	for (n = 0; n < terrainModel.materials[meshMatIndex2].properties.length; n++){
		if(terrainModel.materials[meshMatIndex2].properties[n].key =="$tex.file") 
			UVFileNamePropertyIndex = n;
		if(terrainModel.materials[meshMatIndex2].properties[n].key =="$clr.diffuse") 
			diffuseColorPropertyIndex = n;
		if(terrainModel.materials[meshMatIndex2].properties[n].key =="$clr.specular") 
			specularColorPropertyIndex = n;
	}
	diffuseColor = terrainModel.materials[meshMatIndex2].properties[diffuseColorPropertyIndex].value; //diffuse value
	diffuseColor.push(1.0);													// Alpha value added
	specularColor = terrainModel.materials[meshMatIndex2].properties[specularColorPropertyIndex].value;
	
	//Store the height of the vertices of Terrain
	max_z = terrainModel.meshes[0].vertices[2];
	min_z = terrainModel.meshes[0].vertices[2];
	terrainHeight=[[terrainModel.meshes[0].vertices[2]]];
	for (var i = 5; i < (terrainModel.meshes[0].vertices.length)-3; i = i+3) {
		if (terrainModel.meshes[0].vertices[i+2] > max_z) 
			max_z = terrainModel.meshes[0].vertices[i];
		if (terrainModel.meshes[0].vertices[i+2] < min_z) 
			min_z = terrainModel.meshes[0].vertices[i];
		terrainHeight.push(terrainModel.meshes[0].vertices[i]);
	}

	
	//Drone Objects
	droneVertices = droneModel.meshes[0].vertices;
	droneIndices = [].concat.apply([],droneModel.meshes[0].faces);
	droneNormal = droneModel.meshes[0].normals;
	meshMatIndex1 = droneModel.meshes[0].materialindex;
	droneWorldMatrix = droneModel.rootnode.children[0].transformation;

	var diffuseColorPropertyIndex_d = -1;
	var specularColorPropertyIndex_d = -1;	
	var UVFileNamePropertyIndex_d = -1;
	for (n = 0; n < droneModel.materials[meshMatIndex1].properties.length; n++){
		if(droneModel.materials[meshMatIndex1].properties[n].key =="$tex.file") 
			UVFileNamePropertyIndex_d = n;
		if(droneModel.materials[meshMatIndex1].properties[n].key =="$clr.diffuse") 
			diffuseColorPropertyIndex_d  = n;
		if(droneModel.materials[meshMatIndex1].properties[n].key =="$clr.specular") 
			specularColorPropertyIndex_d  = n;
	}
	diffuseColor_d = droneModel.materials[meshMatIndex1].properties[diffuseColorPropertyIndex_d].value; //diffuse value
	diffuseColor.push(1.0);													// Alpha value added
	specularColor_d = droneModel.materials[meshMatIndex1].properties[specularColorPropertyIndex_d].value;
	
	
	/* ************ */
	/* Load Shaders */
	/* *********** */
	utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
    program = utils.createProgram(gl, vertexShader, fragmentShader);
    });	
	gl.useProgram(program);
	
	vertexPositionAttribute = gl.getAttribLocation(program, "in_pos");
	vertexNormalAttribute = gl.getAttribLocation(program, "in_norm");
	textureCoordAttribute = gl.getAttribLocation(program, "in_uv");
	
	PmatrixUniform = gl.getUniformLocation(program, "pMatrix");
	NmatrixUniform = gl.getUniformLocation(program, "nMatrix");
	WVPmatrixUniform = gl.getUniformLocation(program, "wvpMatrix");
	
	lightDir = gl.getUniformLocation(program, "lightDirMatrix");
	lightPos = gl.getUniformLocation(program, "lightPosMatrix");
	lightDirHandle = gl.getUniformLocation(program, "lightDir");
	lightColor = gl.getUniformLocation(program, "lightColor");
	
	diffColor = gl.getUniformLocation(program, "mDiffColor");	
	specColor = gl.getUniformLocation(program, "mSpecColor");
	specPower = gl.getUniformLocation(program, "mSpecPower");	
	
	textureUniform = gl.getUniformLocation(program, "u_texture");
	
	/* *************** */
	/* Terrain Texture */
	/* ************** */
	
	var imageName = terrainModel.materials[meshMatIndex2].properties[UVFileNamePropertyIndex].value;	
	var image = new Image();
	//image.webglTexture=false;
	image.onload= function() {
		texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.activeTexture(gl.TEXTURE0);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);		
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
		//image.webglTexture=texture;
		//console.log("Image " + image.src + " is not power of 2!");
		//console.log("Image w=" + image.width + " Image h=" + image.height);
	};
	//requestCORSIfNotSameOrigin(image, modelsDir + imageName);
	image.src = modelsDir + imageName;
	
	
	/* *************** */
	/* Drone Texture */
	/* ************** */
	
	var imageName_d = droneModel.materials[meshMatIndex1].properties[UVFileNamePropertyIndex_d].value;	
	var image_d = new Image();
	//image_d.webglTexture=false;
	image_d.onload= function() {
		texture_d = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture_d);
		gl.activeTexture(gl.TEXTURE0);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image_d);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);		
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
		//image_d.webglTexture=texture;
		//console.log("Image " + image.src + " is not power of 2!");
		//console.log("Image w=" + image.width + " Image h=" + image.height);
	};
	requestCORSIfNotSameOrigin(image_d, modelsDir + imageName_d);
	image_d.src = modelsDir + imageName_d;
	
	vao = gl.createVertexArray();
	gl.bindVertexArray(vao);
	
	/* Keyboard Interaction */
	utils.initInteraction();
	
	/* Setup Matrices and Move Drone */
	drawScene();
}
else{
	alert("Error: Your browser does not appear to support WebGL.");
	}
}

  var lastUpdateTime = (new Date).getTime();
  var flag = 0;

function animate(){
    var currentTime = (new Date).getTime();
    if(lastUpdateTime){
      var deltaT = (4* (currentTime - lastUpdateTime)) / 1000.0;
		droneRx += deltaT;
	}
    droneWorldMatrix = utils.MakeWorld( droneTx, droneTy, droneTz, droneRx, droneRy, droneRz, 1);    
    lastUpdateTime = currentTime;               
  }

function drawScene() {
	animate();
	gl.clearColor(0, 0, 0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	gl.bindVertexArray(vao);
	
	//Formula to check the collision/intersection	
	var z = droneTz-min_z/max_z-min_z;
	
	//cameraMatrix = utils.MakeLookAt(cam,drone,u);	
	viewMatrix = utils.MakeView(cx, cy, cz, elevation, angle);
	//viewMatrix = utils.invertMatrix(cameraMatrix);
	
	/* ******* */
	/* Terrain */
	/* ******* */	
	//terrainWorldMatrix = utils.multiplyMatrices(terrainWorldMatrix,utils.MakeScaleMatrix(-200.0));
	//terrainWorldMatrix = utils.MakeWorld( 0.0, 0.0, 0.0, 60, -60, 0, 5);
	//worldViewMatrix = utils.multiplyMatrices(viewMatrix, terrainWorldMatrix);
    projectionMatrix = utils.multiplyMatrices(perspectiveMatrix,viewMatrix);
	normalMatrix = utils.invertMatrix(utils.transposeMatrix(viewMatrix));
	lightDirectionMatrix = utils.invertMatrix(utils.transposeMatrix(viewMatrix));		
	lightPositionMatrix = utils.invertMatrix((viewMatrix));
	
	positionBuffer = gl.createBuffer();	
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);//ARRAY_BUFFER=positionBuffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terrainVertices), gl.STATIC_DRAW);//Data placed inside buffer
	gl.enableVertexAttribArray(vertexPositionAttribute);//Interaction of client and server
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, gl.FALSE, 4*3, 0);
    
	normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terrainNormal), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(vertexNormalAttribute);
	gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, gl.FALSE, 4*3, 0);
	
	textureBuffer = gl.createBuffer();	
	gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terrainTexCoords), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(textureCoordAttribute);
	gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, gl.FALSE, 4*2, 0);
	
	indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(terrainIndices), gl.STATIC_DRAW);
	
	WVPmatrix = utils.multiplyMatrices(projectionMatrix,utils.MakeRotateXMatrix(-40.0));
	WVPmatrix = utils.multiplyMatrices(WVPmatrix,utils.MakeTranslateMatrix(-1,-12,1));
	gl.uniformMatrix4fv(NmatrixUniform, gl.FALSE,utils.transposeMatrix(normalMatrix));	
	gl.uniformMatrix4fv(WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));

	//gl.uniform4f(lightDir, gLightDir[0], gLightDir[1], gLightDir[2], 1.0);
	gl.uniformMatrix4fv(lightDir, gl.FALSE, utils.transposeMatrix(lightDirectionMatrix));	
	gl.uniformMatrix4fv(lightPos, gl.FALSE, utils.transposeMatrix(lightPositionMatrix));
	gl.uniform3fv(lightDirHandle,  lightDirection);
	//gl.uniform4f(lightColor, lightColorMatrix[0], lightColorMatrix[1], lightColorMatrix[2], lightColorMatrix[3]);
	
	gl.uniform4f(diffColor, diffuseColor[0], diffuseColor[1], diffuseColor[2], diffuseColor[3]);
	gl.uniform4f(specColor, specularColor[0], specularColor[1], specularColor[2], specularColor[3]);
	gl.uniform1f(specPower, objectSpecularPower);	
	
	
	/* *************** */
	/* Terrain Texture */
	/* *************** */
	
	//gl.uniform1i(program.textureUniform, 2);
	//gl.drawElements(gl.TRIANGLES, terrainIndices.length, gl.UNSIGNED_SHORT, 12);		
	gl.uniform1i(textureUniform, 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	
	gl.drawElements(gl.TRIANGLES, terrainIndices.length, gl.UNSIGNED_SHORT, 0);
	
	/* ***** */
	/* Drone */	
	/* ***** */
	//droneWorldMatrix = utils.MakeWorld(droneX,0,droneZ,0,droneAngle,0,1);
	//droneWorldMatrix = utils.multiplyMatrices(droneWorldMatrix,utils.MakeRotateZMatrix(20));
	worldViewMatrix_d = utils.multiplyMatrices(viewMatrix, droneWorldMatrix);
    projectionMatrix_d = utils.multiplyMatrices(perspectiveMatrix,worldViewMatrix_d);
	normalMatrix_d = utils.invertMatrix(utils.transposeMatrix(worldViewMatrix_d));
	lightDirectionMatrix_d = utils.invertMatrix(utils.transposeMatrix(viewMatrix));		
	lightPositionMatrix_d = utils.invertMatrix((viewMatrix));
	
	positionBuffer_d = gl.createBuffer();//create buffer- vbo
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer_d);//ARRAY_BUFFER=positionBuffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(droneVertices), gl.STATIC_DRAW);//Data placed inside buffer
	gl.enableVertexAttribArray(vertexPositionAttribute);
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, gl.FALSE, 0, 0);
	
    normalBuffer_d = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer_d);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(droneNormal), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(vertexNormalAttribute);
	gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, gl.FALSE, 0, 0);
	
	indexBuffer_d = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_d);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(droneIndices), gl.STATIC_DRAW); 
	
	//WVPmatrix = utils.multiplyMatrices(projectionMatrix, utils.MakeScaleMatrix(2.0));
	//gl.uniformMatrix4fv(PmatrixUniform, gl.FALSE, utils.transposeMatrix(droneWorldMatrix));
	gl.uniformMatrix4fv(WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(projectionMatrix_d));	
	gl.uniformMatrix4fv(NmatrixUniform, gl.FALSE, utils.transposeMatrix(normalMatrix_d));
	
	gl.uniformMatrix4fv(lightDir, gl.FALSE, utils.transposeMatrix(lightDirectionMatrix_d));	
	gl.uniformMatrix4fv(lightPos, gl.FALSE, utils.transposeMatrix(lightPositionMatrix_d));	
	gl.uniform3fv(lightDirHandle,  lightDirection);
	gl.uniform4f(lightColor, lightColorMatrix[0], lightColorMatrix[1], lightColorMatrix[2], lightColorMatrix[3]);
	//gl.uniform4f(lightDir, gLightDir[0], gLightDir[1], gLightDir[2], 0.2);
	
	gl.uniform4f(diffColor, diffuseColor_d[0], diffuseColor_d[1], diffuseColor_d[2], diffuseColor_d[3]);
	gl.uniform4f(specColor, specularColor_d[0], specularColor_d[1], specularColor_d[2], specularColor_d[3]);
	gl.uniform1f(specPower, objectSpecularPower);
	
	/* ************* */
	/* Drone Texture */
	/* ************* */
	
	//gl.uniform1i(program.textureUniform, 2);
	//gl.drawElements(gl.TRIANGLES, droneIndices.length, gl.UNSIGNED_SHORT, 12);		
	gl.uniform1i(textureUniform, 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture_d);
	
    gl.drawElements(gl.TRIANGLES, droneIndices.length, gl.UNSIGNED_SHORT, 0 );
	
	/* *************************** */
	/* Invisible Cube Around Drone */	
	/* *************************** */	
	positionBuffer_c = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(vertexPositionAttribute);
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	
	indexBuffer_c = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_c);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

	cubeMatrix = utils.multiplyMatrices(projectionMatrix_d, utils.MakeScaleMatrix(2.2));
	
	gl.uniformMatrix4fv(WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(cubeMatrix));	
	gl.colorMask(gl.FALSE, gl.FALSE, gl.FALSE, gl.FALSE);
	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0 );
	gl.colorMask(true, true, true, true);		
	if(z<-2.4){	
		droneTz = 8;
	}
		gl.bindVertexArray(vao);
    window.requestAnimationFrame(drawScene);
}
function requestCORSIfNotSameOrigin(img, url) {
  if ((new URL(url)).origin !== window.location.origin) {
    img.crossOrigin = "";
  }
}
main();
