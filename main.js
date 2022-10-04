import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import gsap from "gsap";

import "./style.css";

const canvas = document.querySelector("canvas.webgl");

let scene, camera, renderer;

// Debug
const gui = new dat.GUI();

const world = {
  plane: { width: 20, height: 20, widthSegment: 30, heightSegment: 30 },
};

gui
  .add(world.plane, "width")
  .min(1)
  .max(20)
  .onChange(() => {
    generatePlane();
  });

gui
  .add(world.plane, "height")
  .min(1)
  .max(20)
  .onChange(() => {
    generatePlane();
  });

gui
  .add(world.plane, "widthSegment")
  .min(1)
  .max(30)
  .onChange(() => {
    generatePlane();
  });

gui
  .add(world.plane, "heightSegment")
  .min(1)
  .max(30)
  .onChange(() => {
    generatePlane();
  });

const generatePlane = () => {
  mesh.geometry.dispose();
  mesh.geometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegment,
    world.plane.heightSegment
  );
  const { array } = mesh.geometry.attributes.position;

  for (let i = 0; i < array.length; i += 3) {
    const x = array[i];
    const y = array[i + 1];
    const z = array[i + 2];

    array[i + 2] = z + Math.random();
  }

  const colors = [];
  for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
    colors.push(0, 0, 0.4);
  }
  mesh.geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(colors), 3)
  );
};

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster();

/**
 * Scene
 */
scene = new THREE.Scene();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// renderer
renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.z = 5;
camera.position.x = 1;
scene.add(camera);

/**
 * Controls
 */

const controls = new OrbitControls(camera, canvas);

/**
 * Plane
 */
const planeGeometry = new THREE.PlaneGeometry(20, 20, 30, 30);
const material = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide,
  flatShading: true,
  vertexColors: true,
});

const mesh = new THREE.Mesh(planeGeometry, material);
scene.add(mesh);

const { array } = mesh.geometry.attributes.position;

for (let i = 0; i < array.length; i += 3) {
  const x = array[i];
  const y = array[i + 1];
  const z = array[i + 2];

  array[i + 2] = z + Math.random();
}

const colors = [];

for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
  colors.push(0, 0, 0.4);
}
mesh.geometry.setAttribute(
  "color",
  new THREE.BufferAttribute(new Float32Array(colors), 3)
);

// lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 0, 1);
scene.add(directionalLight);

const backLight = new THREE.DirectionalLight(0xffffff, 1);
backLight.position.set(0, 0, -1);
scene.add(backLight);

let mouse = {
  x: undefined,
  y: undefined,
};

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // update controls
  controls.update();
  // Render
  renderer.render(scene, camera);
  // mesh.rotation.x += 0.01;
  // mesh.rotation.y += 0.01;
  // mesh.rotation.z += 0.01;

  raycaster.setFromCamera(mouse, camera);
  const intersectObject = raycaster.intersectObject(mesh);

  if (intersectObject.length > 0) {
    const { color } = intersectObject[0].object.geometry.attributes;

    // vertices 1
    color.setX(intersectObject[0].face.a, 0.1);
    color.setY(intersectObject[0].face.a, 0.5);
    color.setZ(intersectObject[0].face.a, 1);

    // vertices 2
    color.setX(intersectObject[0].face.b, 0.1);
    color.setY(intersectObject[0].face.b, 0.5);
    color.setZ(intersectObject[0].face.b, 1);

    // vertices 3
    color.setX(intersectObject[0].face.c, 0.1);
    color.setY(intersectObject[0].face.c, 0.5);
    color.setZ(intersectObject[0].face.c, 1);

    color.needsUpdate = true;

    const initialColor = {
      r: 0,
      g: 0,
      b: 0.4,
    };

    const hoverColor = {
      r: 0.1,
      g: 0.5,
      b: 1,
    };

    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      onUpdate: () => {
        // vertices 1
        color.setX(intersectObject[0].face.a, hoverColor.r);
        color.setY(intersectObject[0].face.a, hoverColor.g);
        color.setZ(intersectObject[0].face.a, hoverColor.b);

        // vertices 2
        color.setX(intersectObject[0].face.b, hoverColor.r);
        color.setY(intersectObject[0].face.b, hoverColor.g);
        color.setZ(intersectObject[0].face.b, hoverColor.b);

        // vertices 3
        color.setX(intersectObject[0].face.c, hoverColor.r);
        color.setY(intersectObject[0].face.c, hoverColor.g);
        color.setZ(intersectObject[0].face.c, hoverColor.b);

        color.needsUpdate = true;
      },
    });
  }

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / sizes.width) * 2 - 1;
  mouse.y = -(e.clientY / sizes.height) * 2 + 1;
});
