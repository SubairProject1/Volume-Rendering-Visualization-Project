# Visualization Project – Direct Volume Rendering

This project was developed as part of the Visualization course and implemented in a group of three. The goal was to build an interactive, browser-based 3D volume rendering system using WebGL (via three.js) and d3.js.

The core of the assignment was to implement GPU-based raycasting to visualize 3D medical volume data, alongside a set of interactive tools for exploration and analysis.
All project requirements are based on the official assignment document.

## Features Implemented
### 1. Direct Volume Rendering (Raycasting)

Implemented single-pass or two-pass raycasting on the GPU.

Visualizes volumetric data using Maximum Intensity Projection (MIP).

Handles sampling, bounding-box intersection, and compositing.

### 2. Density Histogram

Displays the density distribution of the currently loaded dataset.

Updates automatically when data changes.

Built using d3.js with animated transitions for readability.

### 3. Cutting Plane Integration

Adds an interactively movable cutting plane to reveal internal structures.

Raycasting dynamically respects the plane’s position and orientation.

### 4. Interactive Editor

Real-time controls to translate and rotate the cutting plane.

Toggle between rendering above/below the plane.

Color selection for the volume (10–20 colors).

Histogram dynamically adjusts to show only densities of visible voxels.

### 5. Transfer Function (not fully finished)

Supports at least two isosurfaces.

Adjust iso-value, color, and transparency per surface.

Enables material-based visualization (e.g., bone vs. tissue).
