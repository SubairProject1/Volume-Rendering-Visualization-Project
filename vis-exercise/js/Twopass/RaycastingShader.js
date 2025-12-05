
class RaycastingShader extends Shader{
    /**
     * @param {Vector3} size

     * @param {Texture3D} volumeData
     * @param {number} stepSize
     * 
     */
    constructor( size, volumeData, stepSize){
        super("TwoPass/raycasting_vert", "TwoPass/raycasting_frag");
        this.setUniform("size", new THREE.Vector3(size.width, size.height, size.depth))
     
        this.setUniform("stepSize",stepSize)
        this.setUniform("volumeData",volumeData)
        this.setUniform("shading", true)
        this.setUniform("mip", false)

        // Cutting plane
        this.setUniform("u_planeOrigin", new THREE.Vector3(0, 0, 0));
        this.setUniform("u_planeNormal", new THREE.Vector3(0, 0, 1));
        this.setUniform("u_enableCut", true);
    }

    /**
     * set the Poisition Textures for Front Culled and back culled 
     * are used to compute current view an need to be update every frame
     * @param {Texture2D} frontTexture
     * @param {Texture2D} backTexture
     */
    setPositionTextures(frontTexture, backTexture){
        this.setUniform("tFront", frontTexture)
        this.setUniform("tBack",backTexture)
    }

    setTransfareFunction(transfareFunction){
        this.setUniform("transfareFunction", transfareFunction)
    }

    setShading(shading){
        this.setUniform("shading", shading)
    }

    setMIP(mip){
        this.setUniform("mip", mip)
    }
}