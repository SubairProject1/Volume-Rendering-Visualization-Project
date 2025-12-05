/**
 * @property {{scene: Scene, target:renderTarget} } frontData
 * @property {{scene: Scene, target:renderTarget} } backData
 * @property {{scene:raycastScene, shader:raycastingShader}} quadData
 */
class TwoPassRaycaster {
  /**
   * @param {{width:number, height:number}} viewDim
   * @param {{width:number, height:number, depth:numbe}} volumeSize
   * @param {Texture3D} volumeData
   * @param {number} stepSize
   * @param { {color: TransfareFunctionPicker, alpha: TransfareFunctionPicker}} tfPicker
   */
  static async create(viewDim, volumeSize, volumeData, stepSize, tfPicker) {
    const twoPassRaycaster = new TwoPassRaycaster();

    const r = await Promise.all([
      twoPassRaycaster.createCubeScene(viewDim, volumeSize, true),
      twoPassRaycaster.createCubeScene(viewDim, volumeSize, false),
      twoPassRaycaster.createFullScreenQuadScene(
        volumeSize,
        volumeData,
        stepSize
      ),
    ]);
    twoPassRaycaster.frontData = r[0];
    twoPassRaycaster.backData = r[1];
    twoPassRaycaster.quadData = r[2];
    twoPassRaycaster.tfPicker = tfPicker;

    return twoPassRaycaster;
  }

  /**
   * Creates a Scenen with a cube of the size of the volume bounding box and the correct shader
   * used to calulate the values in the first pass
   * @param {{width:number, height:number}} viewDim
   * @param {{width:number, height:number, depth:numbe}} volume
   * @param {boolean} front render cube front or back
   * @returns { {scene: Scene, target:renderTarget}}
   */
  async createCubeScene(viewDim, volume, front) {
    const renderTarget = new THREE.WebGLRenderTarget(
      viewDim.width,
      viewDim.height
    );

    //init scene with only cube and correct shader
    const scene = new THREE.Scene();
    const shader = new ScreenPositionShader(front, volume);
    await shader.load();
    const faceMaterial = shader.material;
    const boxGeometry = new THREE.BoxGeometry(
      volume.width,
      volume.height,
      volume.depth
    );
    const cube = new THREE.Mesh(boxGeometry, faceMaterial);
    scene.add(cube);

    return { scene: scene, target: renderTarget };
  }

  /**
   * Creates a Scene with a quad that goes over the complete Screen used to display the result of
   * the second pass
   * @param {{width:number, height:number, depth:numbe}} volumeSize
   * @param {Texture3D} volumeData
   * @param {number} stepSize
   * @returns {{scene:raycastScene, shader:raycastingShader}}
   */
  async createFullScreenQuadScene(volumeSize, volumeData, stepSize) {
    const quadGeometry = new THREE.PlaneGeometry(2, 2);

    const raycastingShader = new RaycastingShader(
      volumeSize,
      volumeData,
      stepSize
    );

    await raycastingShader.load();
    const raycastingMaterial = raycastingShader.material;

    const quad = new THREE.Mesh(quadGeometry, raycastingMaterial);
    const raycastScene = new THREE.Scene();
    raycastScene.add(quad);

    return { scene: raycastScene, shader: raycastingShader };
  }

  /**
   *
   * @param {Rednerer} renderer
   * 1. Calcualtes Front and Back Testures
   * 2. Performs Raycasting
   */
  render(renderer, camera) {
    renderer.setRenderTarget(this.frontData.target);
    renderer.render(this.frontData.scene, camera);

    renderer.setRenderTarget(this.backData.target);
    renderer.render(this.backData.scene, camera);

    this.quadData.shader.setPositionTextures(
      this.frontData.target.texture,
      this.backData.target.texture
    );

    const tf = this._tfTexture(255);
    this.quadData.shader.setTransfareFunction(tf);

    renderer.setRenderTarget(null);
    renderer.render(this.quadData.scene, camera);
  }

  _tfTexture(resolution) {
    const color = this.tfPicker.color.getRawColors();
    const alpha = this.tfPicker.alpha.getRawColors();

    const colorScale = d3
      .scaleLinear()
      .domain(color.map((s) => s.pos))
      .range(color.map((s) => s.col))
      .interpolate(d3.interpolateRgb);

    const alphaScale = d3
      .scaleLinear()
      .domain(alpha.map((s) => s.pos))
      .range(
        alpha.map((s) => {
          const c = d3.color(s.col);
          return (c.r + c.g + c.b) / 3 / 255;
        })
      );

    const tfData = new Uint8Array(resolution * 4);
    for (let i = 0; i < resolution; i++) {
      const pos = i / (resolution - 1);
      const c = d3.color(colorScale(pos));
      const alpha = alphaScale(pos);

      tfData.set([c.r, c.g, c.b, Math.round(alpha * 255)], i * 4);
    }
    const tex = new THREE.DataTexture(tfData, resolution, 1, THREE.RGBAFormat);
    tex.needsUpdate = true;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;

    return tex;
  }

  setShading(shading){
    this.quadData.shader.setShading(shading)
}

  setMIP(mip){
    this.quadData.shader.setMIP(mip)
  }
}
