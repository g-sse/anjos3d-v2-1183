import * as THREE from "three";

// Original, illustrative toolpath. Not machine G-code or a catalog product.
const TAU = Math.PI * 2;
export function createPrintScene(canvas: HTMLCanvasElement) {
  const mobile = window.matchMedia("(max-width: 650px)").matches;
  const layers = mobile ? 112 : 144;
  const segments = mobile ? 96 : 128;
  const height = 3.15;
  const step = height / layers;
  const filamentRadius = step * 0.57;
  const sides = 6;
  const renderer = new THREE.WebGLRenderer({
    canvas, alpha: true, antialias: true, powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1 : 1.5));
  renderer.setClearColor(0x080b0d, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
  camera.position.set(6.1, 4.9, 7.4);
  camera.lookAt(0, 1.7, 0);
  scene.add(new THREE.HemisphereLight(0xc3ddeb, 0x332016, 2.1));
  const key = new THREE.DirectionalLight(0xffddbc, 4.5);
  key.position.set(-3, 6, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x6dacc9, 3.5);
  rim.position.set(3, 4, -3);
  scene.add(rim);
  const fill = new THREE.PointLight(0xf37942, 15, 7, 2);
  fill.position.set(-2, 1.7, 1);
  scene.add(fill);

  const graphite = new THREE.MeshStandardMaterial({ color: 0x202b30, metalness: 0.75, roughness: 0.38 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x10171a, metalness: 0.45, roughness: 0.65 });
  const silver = new THREE.MeshStandardMaterial({ color: 0x849397, metalness: 0.82, roughness: 0.3 });
  const orange = new THREE.MeshStandardMaterial({ color: 0xf37942, metalness: 0.25, roughness: 0.4 });
  const ceramic = new THREE.MeshStandardMaterial({ color: 0xc3bbaa, metalness: 0.02, roughness: 0.75, side: THREE.DoubleSide });
  const hot = new THREE.MeshStandardMaterial({ color: 0xffa36f, emissive: 0xee6425, emissiveIntensity: 0.28, roughness: 0.55 });

  function box(w: number, h: number, d: number, material: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = scene) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }
  box(4.3, 0.16, 3.8, graphite, 0, -0.13, 0);
  box(3.96, 0.025, 3.46, dark, 0, -0.036, 0);
  box(4.3, 0.018, 0.018, orange, 0, -0.07, 1.91);
  // Fine build-plate grid, no textures or external model downloads.
  const grid = new THREE.GridHelper(3.4, 17, 0x627379, 0x35454a);
  grid.position.y = -0.02;
  const gridMaterial = grid.material as THREE.Material;
  gridMaterial.transparent = true;
  gridMaterial.opacity = 0.38;
  scene.add(grid);
  for (const x of [-1.98, 1.98]) {
    box(0.14, 4.45, 0.16, graphite, x, 2.08, -1.35);
    box(0.028, 4.15, 0.032, silver, x + (x > 0 ? -0.09 : 0.09), 2.04, -1.25);
    box(0.4, 0.12, 0.5, dark, x, -0.28, -1.35);
  }
  box(4.15, 0.16, 0.19, graphite, 0, 4.27, -1.35);
  const gantry = new THREE.Group();
  scene.add(gantry);
  box(4.1, 0.1, 0.12, graphite, 0, 0.78, -1.21, gantry);
  box(3.96, 0.022, 0.025, silver, 0, 0.82, -1.13, gantry);

  // A fluted, gently twisted vessel: each contour is a printable horizontal path.
  function point(layer: number, t: number) {
    const u = layer / (layers - 1);
    const a = t * TAU;
    const profile = 0.67 + 0.4 * Math.sin(u * Math.PI * 0.88) - 0.14 * u;
    const flute = 1 + 0.085 * Math.cos(a * 12 - u * 3.8);
    const radius = profile * flute;
    return new THREE.Vector3(Math.cos(a) * radius, layer * step + filamentRadius, Math.sin(a) * radius);
  }
  // Closed, shallow base under the deposited perimeter layers.
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, step * 1.2, 64), ceramic);
  base.position.y = step * 0.6;
  scene.add(base);
  const segmentGeometry = new THREE.CylinderGeometry(1, 1, 1, sides, 1, true);
  const deposit = new THREE.InstancedMesh(segmentGeometry, ceramic, layers * segments);
  const dummy = new THREE.Object3D();
  const up = new THREE.Vector3(0, 1, 0);
  const direction = new THREE.Vector3();
  for (let l = 0; l < layers; l++) {
    for (let s = 0; s < segments; s++) {
      const a = point(l, s / segments);
      const b = point(l, (s + 1) / segments);
      direction.subVectors(b, a);
      dummy.position.copy(a).add(b).multiplyScalar(0.5);
      dummy.quaternion.setFromUnitVectors(up, direction.clone().normalize());
      dummy.scale.set(filamentRadius, direction.length() + filamentRadius * 0.35, filamentRadius);
      dummy.updateMatrix();
      deposit.setMatrixAt(l * segments + s, dummy.matrix);
    }
  }
  deposit.instanceMatrix.needsUpdate = true;
  deposit.frustumCulled = false;
  deposit.visible = false;
  scene.add(deposit);

  // Production-only smooth continuous wall with tiny layer ridges, not wire-like cylinders.
  const wallPositions: number[] = [];
  const wallIndices: number[] = [];
  for (let l = 0; l < layers; l++) {
    for (let ring = 0; ring < 3; ring++) {
      for (let s = 0; s <= segments; s++) {
        const fraction = ring / 2;
        const p = point(Math.min(l + fraction, layers - 1), s / segments);
        const ridge = ring === 1 ? 1.005 : 0.999;
        wallPositions.push(p.x * ridge, l * step + fraction * step, p.z * ridge);
      }
    }
    const start = l * 3 * (segments + 1);
    for (let ring = 0; ring < 2; ring++) {
      for (let s = 0; s < segments; s++) {
        const a = start + ring * (segments + 1) + s;
        const b = a + segments + 1;
        wallIndices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  const wallGeometry = new THREE.BufferGeometry();
  wallGeometry.setAttribute("position", new THREE.Float32BufferAttribute(wallPositions, 3));
  wallGeometry.setIndex(wallIndices);
  wallGeometry.computeVertexNormals();
  const wall = new THREE.Mesh(wallGeometry, ceramic);
  wall.frustumCulled = false;
  scene.add(wall);

  // Only the active layer uses a partial tube. Its geometry changes once per layer.
  const activeGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array((segments + 1) * (sides + 1) * 3);
  const normals = new Float32Array(positions.length);
  const indices: number[] = [];
  for (let s = 0; s < segments; s++) {
    for (let k = 0; k < sides; k++) {
      const a = s * (sides + 1) + k;
      const b = a + sides + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  activeGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  activeGeometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  activeGeometry.setIndex(indices);
  const active = new THREE.Mesh(activeGeometry, hot);
  active.frustumCulled = false;
  scene.add(active);
  let previousLayer = -1;
  function updateActive(layer: number) {
    if (layer === previousLayer) return;
    previousLayer = layer;
    for (let s = 0; s <= segments; s++) {
      const p = point(layer, s / segments);
      const radial = new THREE.Vector3(p.x, 0, p.z).normalize();
      for (let k = 0; k <= sides; k++) {
        const angle = (k / sides) * TAU;
        const normal = radial.clone().multiplyScalar(Math.cos(angle)).addScaledVector(up, Math.sin(angle));
        const index = (s * (sides + 1) + k) * 3;
        positions[index] = p.x + normal.x * filamentRadius;
        positions[index + 1] = p.y + normal.y * filamentRadius;
        positions[index + 2] = p.z + normal.z * filamentRadius;
        normal.toArray(normals, index);
      }
    }
    activeGeometry.attributes.position.needsUpdate = true;
    activeGeometry.attributes.normal.needsUpdate = true;
  }

  const head = new THREE.Group();
  scene.add(head);
  box(0.46, 0.43, 0.38, dark, 0, 0.52, 0, head);
  box(0.32, 0.3, 0.035, orange, 0, 0.53, 0.21, head);
  for (let i = 0; i < 5; i++) box(0.3, 0.026, 0.28, silver, 0, 0.2 + i * 0.045, 0, head);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.16, 12), orange);
  tip.rotation.z = Math.PI;
  tip.position.y = 0.095;
  head.add(tip);
  const lamp = new THREE.PointLight(0xffb07a, 0.6, 0.8);
  lamp.position.y = 0.12;
  head.add(lamp);

  let progress = 0;
  function setProgress(value: number) {
    progress = THREE.MathUtils.clamp(value, 0, 1);
    // Reserve the last 6% for lifting the nozzle away from the finished piece.
    const deposition = Math.min(progress / 0.94, 1);
    const position = deposition * layers;
    const completed = Math.min(Math.floor(position), layers);
    const fraction = completed === layers ? 0 : position - completed;
    deposit.count = completed * segments;
    wallGeometry.setDrawRange(0, completed * segments * 12);
    base.scale.setScalar(Math.min(1, deposition * 60));
    active.visible = completed < layers;
    if (active.visible) {
      updateActive(completed);
      activeGeometry.setDrawRange(0, Math.floor(fraction * segments) * sides * 6);
    }
    const nozzlePosition = point(Math.min(completed, layers - 1), fraction);
    const lift = Math.max(0, (progress - 0.94) / 0.06);
    head.position.copy(nozzlePosition);
    head.position.x += lift * 0.6;
    head.position.y += 0.015 + lift * 0.35;
    gantry.position.y = head.position.y;
    canvas.dataset.progress = progress.toFixed(4);
    canvas.dataset.layers = String(completed);
    canvas.dataset.activeSegments = String(Math.floor(fraction * segments));
    canvas.dataset.nozzle = head.position.toArray().map(n => n.toFixed(3)).join(",");
  }
  function render() {
    renderer.render(scene, camera);
    canvas.dataset.renderedFrames = String(renderer.info.render.frame);
    canvas.dataset.drawCalls = String(renderer.info.render.calls);
    canvas.dataset.triangles = String(renderer.info.render.triangles);
  }
  function resize(width: number, h: number) {
    if (width < 1 || h < 1) return;
    renderer.setSize(width, h, false);
    camera.aspect = width / h;
    // A slightly wider lens in portrait retains the machine and build plate.
    camera.fov = camera.aspect < 0.85 ? 45 : 35;
    camera.updateProjectionMatrix();
  }
  function dispose() {
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    scene.traverse(object => {
      if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
        geometries.add(object.geometry);
        const list = Array.isArray(object.material) ? object.material : [object.material];
        list.forEach(m => materials.add(m));
      }
    });
    geometries.forEach(g => g.dispose());
    materials.forEach(m => m.dispose());
    renderer.dispose();
  }
  setProgress(0);
  return { setProgress, render, resize, dispose };
}