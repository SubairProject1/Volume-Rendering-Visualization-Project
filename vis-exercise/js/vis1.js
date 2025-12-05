/**
 * Vis 1 Task 1 Framework
 * Copyright (C) TU Wien
 *   Institute of Visual Computing and Human-Centered Technology
 *   Research Unit of Computer Graphics
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are not permitted.
 *
 * Main script for Vis1 exercise. Loads the volume, initializes the scene, and contains the paint function.
 *
 * @author Manuela Waldner
 * @author Laura Luidolt
 * @author Diana Schalko
 */
let renderer, camera, scene, orbitCamera;
let canvasWidth,
  canvasHeight = 0;
let container = null;
let volume = null;
let fileInput = null;
let testShader = null;
let twoPassRaycaster = null;
let histogram = null;
let transfareFunctionPicker
let transfareFunctionAlphaPicker
this.renderAbove = true;
this.renderPlaneHeight = 50;
this.renderPlaneY = 90;
this.renderPlaneX = 90;
this.renderPlaneColor = "#ffffff";

// Cutting plane parameters
let cuttingPlane = null;
let extraPlaneScene = null;
let cutEnabled = true;

/**
 * Render the scene and update all necessary shader information.
 */
function paint() {
  if (volume) {
    
    // Update cutting plane and pass correct uniforms before rendering
    cuttingPlane.planeMesh.updateMatrixWorld();

    twoPassRaycaster.quadData.shader.setUniform("u_enableCut", cutEnabled);

    if (cutEnabled) {
      const origin = new THREE.Vector3();
      cuttingPlane.planeMesh.getWorldPosition(origin);

      const normal = new THREE.Vector3(0, 0, 1);
      normal.applyQuaternion(cuttingPlane.planeMesh.quaternion).normalize();

      twoPassRaycaster.quadData.shader.setUniform("u_planeOrigin", origin);
      twoPassRaycaster.quadData.shader.setUniform("u_planeNormal", normal);
    }

    twoPassRaycaster.render(renderer, camera);

    renderer.autoClear = false; // DON'T wipe the image from raycaster
    renderer.render(extraPlaneScene, camera); // render your plane
    renderer.autoClear = true;
  }
}

/**
 * Load all data and initialize UI here.
 */
function init() {
  // volume viewer
  container = document.getElementById("viewContainer");
  canvasWidth = window.innerWidth * 0.6;
  canvasHeight = window.innerHeight * 0.6;

  // WebGL renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(canvasWidth, canvasHeight);
  container.appendChild(renderer.domElement);

  // read and parse volume file
  fileInput = document.getElementById("upload");
  fileInput.addEventListener("change", readFile);

  // dummy shader gets a color as input
  testShader = new TestShader([255.0, 255.0, 0.0]);

  //initialize histogram
  histContainer = document.getElementById("histContainer");
  histogram = new Histogram(600, 400);
  histContainer.appendChild(histogram.createChart())

  //setup transfare function Input
  transfareFunctionPicker = new TransfareFunctionPicker("transfareFunctionPicker", paint)
  transfareFunctionAlphaPicker  = new TransfareFunctionPicker("transfareFunctionPicker2", paint) 
}

/**
 * Handles the file reader. No need to change anything here.
 */
function readFile() {
  let reader = new FileReader();
  reader.onloadend = function () {
    console.log("data loaded: ");

    let data = new Uint16Array(reader.result);
    volume = new Volume(data);

    resetVis();
  };
  reader.readAsArrayBuffer(fileInput.files[0]);
}

/**
 * Construct the THREE.js scene and update histogram when a new volume is loaded by the user.
 *
 * Currently renders the bounding box of the volume.
 */
async function resetVis() {

  // create new empty scene and perspective camera
  camera = new THREE.PerspectiveCamera(
    75,
    canvasWidth / canvasHeight,
    0.5,
    1000
  );

  twoPassRaycaster = await TwoPassRaycaster.create(
    {
      width: canvasWidth,
      height: canvasHeight,
    },
    volume,
    volume.to3dTexture(),
    0.2,
    {
      color:transfareFunctionPicker,
      alpha:transfareFunctionAlphaPicker
    }
  );
  document.getElementById("mip").addEventListener("change",(e)=>{
      const v = e.target.checked;
      twoPassRaycaster.setMIP(v)
      paint();

  })
  document.getElementById("shading").checked = true
  document.getElementById("shading").addEventListener("change",(e)=>{
    const v = e.target.checked;
    twoPassRaycaster.setShading(v)
    paint();
  })

  // Create cutting plane and a scene for it
  extraPlaneScene = new THREE.Scene();
  cuttingPlane = new CuttingPlane();
  iEditorValueChanged();
  extraPlaneScene.add(cuttingPlane.planeMesh);

  // our camera orbits around an object centered at (0,0,0)
  orbitCamera = new OrbitCamera(
    camera,
    new THREE.Vector3(0, 0, 0),
    2 * volume.max,
    renderer.domElement
  );
  
  histogram.replaceData(volume.getHistogramData())
  requestAnimationFrame(paint);
}

function togglePlaneVisibility() {
  const showPlane = document.getElementById("iEditorShowPlane").checked;
  cuttingPlane.planeMesh.visible = showPlane;
  paint(); // re-render
}

function toggleVolumeCut() {
  cutEnabled = document.getElementById("iEditorEnableCut").checked;
  paint(); // re-render
}

function iEditorValueChanged() {

  this.renderPlaneColor = document.getElementById("iEditorColor").value;
  this.renderPlaneY = document.getElementById("iEditorYRotate").value;
  this.renderPlaneX = document.getElementById("iEditorXRotate").value;
  this.renderPlaneHeight = document.getElementById("iEditorHeight").value;
  
  if(cuttingPlane)
    cuttingPlane.update(this.renderPlaneHeight, this.renderPlaneX, this.renderPlaneY, this.renderPlaneColor, this.renderAbove);
  
  update();
}

function flipRenderPlane() {

  this.renderAbove = !this.renderAbove;
  this.renderPlaneY = document.getElementById("iEditorYRotate").value;
  this.renderPlaneX = document.getElementById("iEditorXRotate").value;

  if(cuttingPlane)
    cuttingPlane.updateFlip();

  update();
}

function update(){
  console.log(this.renderPlaneHeight, this.renderPlaneX, this.renderPlaneY, this.renderPlaneColor, this.renderAbove)
}