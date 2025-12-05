
class ScreenPositionShader extends Shader{
    /**
     * @param {boolean} frontSide 
     * 
     */
    constructor(frontSide, size){
        super("TwoPass/screen_position_vert", "TwoPass/screen_position_frag");
        this.material.side = frontSide == false?THREE.BackSide :THREE.FrontSide 
        this.material.flatShading = false;
        this.setUniform("size", new THREE.Vector3(size.width, size.height, size.depth))
    }
}