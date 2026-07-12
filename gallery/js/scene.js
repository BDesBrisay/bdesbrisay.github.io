import * as THREE from 'three';
import { createInfoTexture, createLinksTexture } from './poster.js';
import { clamp, darken } from './utils.js';

function createFrameGroup(texture, config) {
  const { width: fw, height: fh, depth: fd } = config.poster;
  const group = new THREE.Group();

  const shadowGeo = new THREE.PlaneGeometry(fw + 0.16, fh + 0.16);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x0d0d0d });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.position.z = -0.005;
  group.add(shadow);

  const frameGeo = new THREE.BoxGeometry(fw + 0.12, fh + 0.12, fd);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, metalness: 0.2, roughness: 0.6 });
  group.add(new THREE.Mesh(frameGeo, frameMat));

  const matGeo = new THREE.PlaneGeometry(fw + 0.04, fh + 0.04);
  const matMat = new THREE.MeshStandardMaterial({ color: 0xd9d9d9 });
  const mat = new THREE.Mesh(matGeo, matMat);
  mat.position.z = fd * 0.51;
  group.add(mat);

  const artGeo = new THREE.PlaneGeometry(fw, fh);
  const artMat = new THREE.MeshStandardMaterial({ map: texture });
  const art = new THREE.Mesh(artGeo, artMat);
  art.position.z = fd * 0.52;
  group.add(art);

  return { group, artworkMesh: art };
}

function buildCorridor(scene, corridorDepth, config) {
  const { width: rw, height: rh } = config.room;
  const totalLen = corridorDepth + rw;
  const centerZ = corridorDepth / 2;

  const floorMat = new THREE.MeshStandardMaterial({ color: '#567' });
  const floorGeo = new THREE.PlaneGeometry(rw, totalLen);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, centerZ);
  scene.add(floor);

  const ceilMat = new THREE.MeshStandardMaterial({ color: '#234' });
  const ceilGeo = new THREE.PlaneGeometry(rw, totalLen);
  const ceil = new THREE.Mesh(ceilGeo, ceilMat);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, rh, centerZ);
  scene.add(ceil);

  const wallMat = new THREE.MeshStandardMaterial({ color: '#345' });
  const wallGeo = new THREE.BoxGeometry(0.2, rh, totalLen);
  const leftWall = new THREE.Mesh(wallGeo, wallMat);
  leftWall.position.set(-rw / 2, rh / 2, centerZ);
  scene.add(leftWall);

  const rightWall = new THREE.Mesh(wallGeo, wallMat);
  rightWall.position.set(rw / 2, rh / 2, centerZ);
  scene.add(rightWall);

  const capGeo = new THREE.BoxGeometry(rw, rh, 0.2);
  const backWall = new THREE.Mesh(capGeo, wallMat);
  backWall.position.set(0, rh / 2, -rw / 2);
  scene.add(backWall);

  const endWall = new THREE.Mesh(capGeo, wallMat);
  endWall.position.set(0, rh / 2, corridorDepth + rw / 2);
  scene.add(endWall);

  return { floorMat, ceilMat, wallMat };
}

function addLighting(scene, rooms, config) {
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  const halfW = config.room.width / 2;
  for (const room of rooms) {
    const zMid = (room.zStart + room.zEnd) / 2;
    const leftLight = new THREE.PointLight(0xfff5e6, 1.2, 18);
    leftLight.position.set((-halfW + 0.1) * 0.5, config.room.height - 0.3, zMid);
    scene.add(leftLight);

    const rightLight = new THREE.PointLight(0xfff5e6, 1.2, 18);
    rightLight.position.set((halfW - 0.1) * 0.5, config.room.height - 0.3, zMid);
    scene.add(rightLight);
  }
}

async function mountPosters(scene, exhibits, rooms, config) {
  const exhibitMap = new Map(exhibits.map(e => [e.id, e]));
  const halfW = config.room.width / 2;
  const infoLeft = config.poster.infoWall === 'left';
  const linkMeshes = [];

  const jobs = rooms.map(async (room) => {
    const exhibit = exhibitMap.get(room.exhibitId);
    if (!exhibit) return;

    const zMid = (room.zStart + room.zEnd) / 2;

    // Info poster
    const infoTex = await createInfoTexture(exhibit);
    const info = createFrameGroup(infoTex, config);
    const infoX = infoLeft ? -halfW + 0.11 : halfW - 0.11;
    const infoRotY = infoLeft ? Math.PI / 2 : -Math.PI / 2;
    info.group.position.set(infoX, config.poster.centerY, zMid);
    info.group.rotation.y = infoRotY;
    scene.add(info.group);

    // Links poster
    const { texture: linksTex, linkZones } = createLinksTexture(exhibit);
    const links = createFrameGroup(linksTex, config);
    const linksX = infoLeft ? halfW - 0.11 : -halfW + 0.11;
    const linksRotY = infoLeft ? -Math.PI / 2 : Math.PI / 2;
    links.group.position.set(linksX, config.poster.centerY, zMid);
    links.group.rotation.y = linksRotY;
    scene.add(links.group);

    if (linkZones.length) {
      links.artworkMesh.userData = { linkZones, exhibitId: exhibit.id };
      linkMeshes.push(links.artworkMesh);
    }
  });

  await Promise.all(jobs);
  return linkMeshes;
}

export async function initScene(container, exhibits, rooms, corridorDepth, config) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x141414);

  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 200);
  camera.position.set(config.spawn.x, config.spawn.y, config.spawn.z);
  camera.rotation.order = 'YXZ';
  camera.rotation.y = config.spawn.yaw;

  const roomMats = buildCorridor(scene, corridorDepth, config);
  addLighting(scene, rooms, config);
  const linkMeshes = await mountPosters(scene, exhibits, rooms, config);

  // Raycaster for link hover
  const raycaster = new THREE.Raycaster();
  raycaster.far = 12;
  const screenCenter = new THREE.Vector2(0, 0);
  let hoveredLink = null;
  const crosshairEl = document.getElementById('crosshair');

  const halfW = config.room.width / 2;
  const minX = -halfW + 0.5;
  const maxX = halfW - 0.5;
  const minZ = 0.5;
  const maxZ = corridorDepth - 0.5;

  const segLen = config.room.segmentLength;
  const targetFloorColor = new THREE.Color();
  const targetCeilColor = new THREE.Color();
  const targetWallColor = new THREE.Color();
  const targetBgColor = new THREE.Color();

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  function update(cam, dt) {
    // Collision
    cam.position.x = clamp(cam.position.x, minX, maxX);
    cam.position.z = clamp(cam.position.z, minZ, maxZ);
    cam.position.y = config.spawn.y;

    // Zone color lerp
    const zoneIdx = clamp(Math.floor(cam.position.z / segLen), 0, rooms.length - 1);
    const zoneColors = rooms[zoneIdx].colors;
    const bg = zoneColors.background;
    targetFloorColor.set(darken(bg, 0.35));
    targetCeilColor.set(darken(bg, 0.25));
    targetWallColor.set(darken(bg, 0.2));
    targetBgColor.set(darken(bg, 0.55));

    const t = 1 - Math.exp(-3 * dt);
    roomMats.floorMat.color.lerp(targetFloorColor, t);
    roomMats.ceilMat.color.lerp(targetCeilColor, t);
    roomMats.wallMat.color.lerp(targetWallColor, t);
    scene.background.lerp(targetBgColor, t);

    // Raycast for link hover
    raycaster.setFromCamera(screenCenter, cam);
    const hits = raycaster.intersectObjects(linkMeshes);
    hoveredLink = null;

    if (hits.length > 0) {
      const hit = hits[0];
      const uv = hit.uv;
      if (uv) {
        const zones = hit.object.userData.linkZones;
        for (const zone of zones) {
          if (uv.y >= zone.uvY1 && uv.y <= zone.uvY2) {
            hoveredLink = { label: zone.label, url: zone.url };
            break;
          }
        }
      }
    }

    if (crosshairEl) {
      crosshairEl.classList.toggle('active', !!hoveredLink);
    }

    renderer.render(scene, cam);
  }

  function getHoveredLink() {
    return hoveredLink;
  }

  return { camera, renderer, update, getHoveredLink };
}
