function main() {

  var modelsDir = "http://127.0.0.1:8887/Drone/Assets/";
  var shaderDir = "http://127.0.0.1:8887/Drone/shaders/";
  var program = null;
  
  var lastUpdateTime = (new Date).getTime();
  //Camera parameters
  var cx = 1.5;
  var cy = 0.0;
  var cz = 3.0;
  var elevation = 0.0;
  var angle = -30.0;

  var observerPosition = [cx, cy, cz];

  //Cube parameters
  var cubeTz = -1.0;
  var cubeRx = 0.0;
  var cubeRy = 0.0;
  var cubeRz = 0.0;
  var terrainModel;

  //define directional light
  var dirLightAlpha = -utils.degToRad(0);
  var dirLightBeta  = -utils.degToRad(120);

  var directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
              Math.sin(dirLightAlpha),
              Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
              ];
  var directionalLightColor = [1.0, 1.0, 1.0];
  var materialColor = [0.5, 0.5, 0.5];
  var specularColor = [1.0, 1.0, 1.0];         
  var specularPower = 50.0;

  var canvas=document.getElementById("my-canvas");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    document.write("GL context not opened");
    return;
  }

  utils.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.85, 0.85, 0.85, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
      var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
      var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
      program = utils.createProgram(gl, vertexShader, fragmentShader);

    });
  gl.useProgram(program);

  utils.get_json(modelsDir + 'Terrain.json',function(loadedModel){terrainModel = loadedModel;});

  //
 var terrainVertices = terrainModel.meshes[0].vertices;
 var terrainIndices = [].concat.apply([], terrainModel.meshes[0].faces);
 var terrainTexCoords = terrainModel.meshes[0].texturecoords[0];
 var terrainNormal = terrainModel.meshes[0].normals;  
 var meshMatIndex2 = terrainModel.meshes[0].materialindex;

  
  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "in_pos");  
  var uvAttributeLocation = gl.getAttribLocation(program, "in_uv");   
  var normalAttributeLocation = gl.getAttribLocation(program, "in_norm");  
  var matrixLocation = gl.getUniformLocation(program, "wvpMatrix");  
  var textLocation = gl.getUniformLocation(program, "u_texture");
  //var materialDiffColorHandle = gl.getUniformLocation(program, 'mDiffColor');
  //var lightDirectionHandle = gl.getUniformLocation(program, 'lightDirection');
 // var lightColorHandle = gl.getUniformLocation(program, 'lightColor');
  var normalMatrixPositionHandle = gl.getUniformLocation(program, 'nMatrix');
  var vertexMatrixPositionHandle = gl.getUniformLocation(program, 'pMatrix');
  //var materialDiffColorHandle = gl.getUniformLocation(program, 'mDiffColor');
  //var materialSpecColorHandle = gl.getUniformLocation(program, 'mSpecColor');
  //var materialSpecPowerHandle = gl.getUniformLocation(program, 'mSpecPower');
 // var eyePositionHandle = gl.getUniformLocation(program, 'eyePosition');

  var perspectiveMatrix = utils.MakePerspective(90, gl.canvas.width/gl.canvas.height, 0.1, 100.0);
  var viewMatrix = utils.MakeView(cx, cy, cz, elevation, angle);
    
  var vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terrainIndices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  var uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terrainTexCoords), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(uvAttributeLocation);
  gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terrainNormal), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(normalAttributeLocation);
  gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(terrainIndices), gl.STATIC_DRAW); 


  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  var image = new Image();
  requestCORSIfNotSameOrigin(image, modelsDir+"/PaloDuroPark1.jpg.001.jpg")
  image.src = modelsDir+"/PaloDuroPark1.jpg.001.jpg";
  image.onload= function() {
    // Now that the image has loaded make copy it to the texture.
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
  };

  drawScene();
   
  function animate(){
    var currentTime = (new Date).getTime();
    if(lastUpdateTime){
      var deltaC = (30 * (currentTime - lastUpdateTime)) / 1000.0;
      cubeRx += deltaC;
      cubeRy -= deltaC;
      cubeRz += deltaC;    
    }
    worldMatrix = utils.MakeWorld(0.0, 0.0, 0.0, 0, 0, 0, 1.0);
    lastUpdateTime = currentTime;               
  }


  function drawScene() {
    animate();

    gl.clearColor(0.85, 0.85, 0.85, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    var vwmatrix = utils.multiplyMatrices(viewMatrix, worldMatrix);
    var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, vwmatrix);
    var normalMatrix = utils.invertMatrix(utils.transposeMatrix(vwmatrix));

    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));
    gl.uniformMatrix4fv(vertexMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(worldMatrix));
    gl.uniformMatrix4fv(normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(normalMatrix));
    //gl.uniform3fv(materialDiffColorHandle, materialColor);
    //gl.uniform3fv(lightColorHandle,  directionalLightColor);
    //gl.uniform3fv(lightDirectionHandle,  directionalLight);
    //gl.uniform3fv(materialSpecColorHandle, specularColor);
    //gl.uniform1f(materialSpecPowerHandle, specularPower);    
    //gl.uniform3fv(eyePositionHandle, observerPosition); 
    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix)); 

    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(textLocation, texture);

    gl.bindVertexArray(vao);
    gl.drawElements(gl.TRIANGLES, terrainIndices.length, gl.UNSIGNED_SHORT, 0 );
    
    window.requestAnimationFrame(drawScene);
  }
}

function requestCORSIfNotSameOrigin(img, url) {
  if ((new URL(url)).origin !== window.location.origin) {
    img.crossOrigin = "";
  }
}
main();

