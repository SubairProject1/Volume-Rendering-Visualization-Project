/**
 * CuttingPlane class for rendering a cutting plane in 3D space.
 * This class creates a plane mesh and an arrow to represent the normal vector of the plane.
 * It allows for updating the plane's position, rotation, and color.
 * 
 * @author Subair
 */
class CuttingPlane {
    constructor() {
        // Plane transformation parameters
        this.planeTransZ = 0;  // Translation along Z-axis
        this.planeRotX = 0;     // Rotation around X-axis
        this.planeRotY = 0;     // Rotation around Y-axis
        this.planeColor = 0xffffff;  // Default color of the plane

        // Create a plane geometry (size 400x400)
        this.planeGeometry = new THREE.PlaneGeometry(400, 400);
        
        // Define material properties
        this.planeMaterial = new THREE.MeshBasicMaterial({
            color: this.planeColor,  // Initial plane color
            side: THREE.DoubleSide,  // Render both sides of the plane
            transparent: true,       // Enable transparency
            opacity: 0.5,            // Set transparency level
            depthTest: false,        // Ensure it's always visible
            depthWrite: false        // Prevent depth buffer writing
        });

        // Create the plane mesh using geometry and material
        this.planeMesh = new THREE.Mesh(this.planeGeometry, this.planeMaterial);

        // Create a normal vector arrow (initial direction along Z-axis)
        const origin = new THREE.Vector3(0, 0, 0);       // Arrow origin at center
        const direction = new THREE.Vector3(0, 0, 1).normalize(); // Initial pointing direction along Z-axis
        const length = 35;  // Arrow length
        const color = 0xff0000;  // Arrow color (red)

        // Create an ArrowHelper to represent the normal vector
        this.normalArrow = new THREE.ArrowHelper(direction, origin, length, color);
        this.normalArrow.setLength(35, 20, 10);  // Adjust arrow head and shaft sizes
        this.normalArrow.position.set(0, 0, 0);  // Position at the plane's center

        // Ensure arrow always renders on top by disabling depth tests
        this.normalArrow.line.material.depthTest = false;
        this.normalArrow.line.material.depthWrite = false;
        this.normalArrow.cone.material.depthTest = false;
        this.normalArrow.cone.material.depthWrite = false;

        // Attach the arrow to the plane mesh so it moves with the plane
        this.planeMesh.add(this.normalArrow);
    }

    /**
     * Update the plane's position, rotation, color, and rendering settings.
     * @param {number} planeHeight - Normalized plane height (0 to 1).
     * @param {number} planeRotX - Rotation around X-axis in degrees.
     * @param {number} planeRotY - Rotation around Y-axis in degrees.
     * @param {number} planeColor - New color for the plane.
     * @param {boolean} renderAbove - Whether to flip the plane (rotate 180° around Y).
     */
    update(planeHeight, planeRotX, planeRotY, planeColor, renderAbove) {
        // Convert rotations from degrees to radians
        const rotX = THREE.MathUtils.degToRad(planeRotX);
        const rotY = THREE.MathUtils.degToRad(planeRotY) + (renderAbove ? Math.PI : 0);  // Flip if renderAbove is true

        // Adjust plane height (mapping 0-1 range to Z-position)
        this.planeMesh.position.z = 200 - 400 * planeHeight;

        // Set plane rotation
        this.planeMesh.rotation.set(rotX, rotY, 0);

        // Update the plane's material color
        this.planeMaterial.color.set(planeColor);
    }

    /**
     * Flip the plane by rotating it 180° around the Y-axis.
     * This reverses its facing direction while maintaining the X and Z rotations.
     */
    updateFlip() {
        const rotX = this.planeMesh.rotation.x;
        const rotY = this.planeMesh.rotation.y + Math.PI;  // Add 180° rotation to Y
        this.planeMesh.rotation.set(rotX, rotY, 0);
    }
} 