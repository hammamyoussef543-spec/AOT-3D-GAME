import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js";

// ============================================================
// TROST-INSPIRED 3D CITY
// Designed for high FPS on phones
// ============================================================

// ---------- Renderer ----------
const renderer = new THREE.WebGLRenderer({
    antialias: false,
    powerPreference: "high-performance"
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;

document.body.appendChild(renderer.domElement);

// ---------- Scene ----------
const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87a8bd);

scene.fog = new THREE.Fog(
    0x87a8bd,
    180,
    520
);

// ---------- Camera ----------
const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.5,
    700
);

camera.position.set(0, 35, 85);

// ---------- Lighting ----------
const ambient = new THREE.HemisphereLight(
    0xcfe6ff,
    0x665544,
    1.8
);

scene.add(ambient);

const sun = new THREE.DirectionalLight(
    0xfff1d0,
    1.4
);

sun.position.set(-100, 180, 80);
scene.add(sun);

// ============================================================
// MATERIALS
// ============================================================

const groundMaterial = new THREE.MeshLambertMaterial({
    color: 0x756f63
});

const roadMaterial = new THREE.MeshLambertMaterial({
    color: 0x3f3d39
});

const roadEdgeMaterial = new THREE.MeshLambertMaterial({
    color: 0x69645b
});

const wallMaterial = new THREE.MeshLambertMaterial({
    color: 0xc9bda4
});

const wallTopMaterial = new THREE.MeshLambertMaterial({
    color: 0xa79a83
});

const castleMaterial = new THREE.MeshLambertMaterial({
    color: 0x8c8070
});

const roofMaterial = new THREE.MeshLambertMaterial({
    color: 0x554c45
});

const windowMaterial = new THREE.MeshLambertMaterial({
    color: 0x28333a
});

const towerMaterial = new THREE.MeshLambertMaterial({
    color: 0x70675c
});

// ============================================================
// REUSABLE GEOMETRY
// Reusing geometry/materials saves memory and draw preparation.
// ============================================================

const buildingGeometries = [
    new THREE.BoxGeometry(10, 22, 10),
    new THREE.BoxGeometry(12, 28, 10),
    new THREE.BoxGeometry(8, 18, 12),
    new THREE.BoxGeometry(14, 24, 12)
];

const roofGeometry = new THREE.ConeGeometry(
    1,
    1,
    4
);

const smallTowerGeometry = new THREE.CylinderGeometry(
    4,
    5,
    24,
    8
);

// ============================================================
// GROUND
// ============================================================

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(650, 650),
    groundMaterial
);

ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// ============================================================
// ROAD HELPERS
// ============================================================

function createRoad(x, z, width, length, rotation = 0) {

    const road = new THREE.Mesh(
        new THREE.PlaneGeometry(width, length),
        roadMaterial
    );

    road.rotation.x = -Math.PI / 2;
    road.rotation.z = rotation;

    road.position.set(x, 0.025, z);

    scene.add(road);
}

function createRingRoad(radius, width) {

    const geometry = new THREE.RingGeometry(
        radius - width / 2,
        radius + width / 2,
        96
    );

    const road = new THREE.Mesh(
        geometry,
        roadMaterial
    );

    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.03;

    scene.add(road);
}

// ============================================================
// CENTRAL PLAZA
// ============================================================

const plaza = new THREE.Mesh(
    new THREE.CircleGeometry(48, 64),
    new THREE.MeshLambertMaterial({
        color: 0x81796d
    })
);

plaza.rotation.x = -Math.PI / 2;
plaza.position.y = 0.04;

scene.add(plaza);

// ============================================================
// ROADS
// ============================================================

// Central roads
createRoad(0, 0, 18, 520, 0);
createRoad(0, 0, 18, 520, Math.PI / 2);

// Diagonal roads
createRoad(0, 0, 13, 480, Math.PI / 4);
createRoad(0, 0, 13, 480, -Math.PI / 4);

// Ring roads
createRingRoad(85, 12);
createRingRoad(145, 11);
createRingRoad(220, 12);

// ============================================================
// BUILDING FUNCTION
// ============================================================

function createBuilding(x, z, scale = 1, rotation = 0) {

    const index =
        Math.floor(Math.random() * buildingGeometries.length);

    const geometry = buildingGeometries[index];

    const building = new THREE.Mesh(
        geometry,
        wallMaterial
    );

    building.position.set(
        x,
        geometry.parameters.height / 2 * scale,
        z
    );

    building.rotation.y = rotation;

    building.scale.set(
        scale,
        scale,
        scale
    );

    scene.add(building);

    // Roof
    const roof = new THREE.Mesh(
        roofGeometry,
        roofMaterial
    );

    roof.scale.set(
        geometry.parameters.width * scale * 0.72,
        8 * scale,
        geometry.parameters.depth * scale * 0.72
    );

    roof.position.set(
        x,
        geometry.parameters.height * scale + 4 * scale,
        z
    );

    roof.rotation.y = Math.PI / 4;

    scene.add(roof);
}

// ============================================================
// CITY GENERATION
// ============================================================

function generateCity() {

    const rings = [
        { min: 55, max: 105, count: 70 },
        { min: 105, max: 165, count: 100 },
        { min: 165, max: 230, count: 130 },
        { min: 230, max: 285, count: 100 }
    ];

    for (const ring of rings) {

        for (let i = 0; i < ring.count; i++) {

            const angle =
                Math.random() * Math.PI * 2;

            const radius =
                ring.min +
                Math.random() *
                (ring.max - ring.min);

            let x = Math.cos(angle) * radius;
            let z = Math.sin(angle) * radius;

            // Avoid the main radial roads.
            const roadCheck =
                Math.min(
                    Math.abs(x),
                    Math.abs(z),
                    Math.abs(x - z),
                    Math.abs(x + z)
                );

            if (roadCheck < 12) continue;

            const scale =
                0.75 +
                Math.random() * 0.65;

            const rotation =
                Math.floor(Math.random() * 4) *
                Math.PI / 2;

            createBuilding(
                x,
                z,
                scale,
                rotation
            );
        }
    }
}

generateCity();

// ============================================================
// CENTRAL CASTLE / FORTRESS
// ============================================================

function createCastle() {

    // Main fortress
    const main = new THREE.Mesh(
        new THREE.BoxGeometry(65, 30, 65),
        castleMaterial
    );

    main.position.y = 15;

    scene.add(main);

    // Inner keep
    const keep = new THREE.Mesh(
        new THREE.BoxGeometry(32, 48, 32),
        castleMaterial
    );

    keep.position.y = 39;

    scene.add(keep);

    // Four corner towers
    const positions = [
        [-34, -34],
        [34, -34],
        [-34, 34],
        [34, 34]
    ];

    for (const [x, z] of positions) {

        const tower = new THREE.Mesh(
            smallTowerGeometry,
            towerMaterial
        );

        tower.position.set(
            x,
            22,
            z
        );

        scene.add(tower);

        const roof = new THREE.Mesh(
            new THREE.ConeGeometry(5.5, 8, 8),
            roofMaterial
        );

        roof.position.set(
            x,
            38,
            z
        );

        scene.add(roof);
    }

    // Castle gate
    const gate = new THREE.Mesh(
        new THREE.BoxGeometry(18, 17, 8),
        towerMaterial
    );

    gate.position.set(
        0,
        8.5,
        36
    );

    scene.add(gate);

    // Main gate roof
    const gateRoof = new THREE.Mesh(
        new THREE.ConeGeometry(13, 8, 4),
        roofMaterial
    );

    gateRoof.position.set(
        0,
        20,
        36
    );

    gateRoof.rotation.y = Math.PI / 4;

    scene.add(gateRoof);
}

createCastle();

// ============================================================
// OUTER WALL
// ============================================================

function createOuterWall() {

    const radius = 310;
    const segments = 96;

    for (let i = 0; i < segments; i++) {

        const angle =
            (i / segments) * Math.PI * 2;

        const x =
            Math.cos(angle) * radius;

        const z =
            Math.sin(angle) * radius;

        const block = new THREE.Mesh(
            new THREE.BoxGeometry(
                22,
                38,
                18
            ),
            wallMaterial
        );

        block.position.set(
            x,
            19,
            z
        );

        block.rotation.y =
            -angle;

        scene.add(block);
    }

    // Wall towers
    for (let i = 0; i < 16; i++) {

        const angle =
            (i / 16) *
            Math.PI * 2;

        const x =
            Math.cos(angle) *
            radius;

        const z =
            Math.sin(angle) *
            radius;

        const tower = new THREE.Mesh(
            new THREE.CylinderGeometry(
                10,
                12,
                55,
                8
            ),
            towerMaterial
        );

        tower.position.set(
            x,
            27,
            z
        );

        scene.add(tower);
    }

    // Main gate opening represented by a large gate structure
    const gateTowerLeft = new THREE.Mesh(
        new THREE.BoxGeometry(24, 55, 30),
        wallMaterial
    );

    gateTowerLeft.position.set(
        -28,
        27.5,
        radius
    );

    scene.add(gateTowerLeft);

    const gateTowerRight = gateTowerLeft.clone();

    gateTowerRight.position.x = 28;

    scene.add(gateTowerRight);

    const gateTop = new THREE.Mesh(
        new THREE.BoxGeometry(80, 20, 30),
        wallMaterial
    );

    gateTop.position.set(
        0,
        45,
        radius
    );

    scene.add(gateTop);
}

createOuterWall();

// ============================================================
// CAMERA CONTROLS
// Simple touch controls for now.
// We'll replace these with player controls later.
// ============================================================

let targetX = 0;
let targetZ = 0;

let cameraAngle = 0;
let cameraDistance = 85;

let dragging = false;
let lastX = 0;
let lastY = 0;

renderer.domElement.addEventListener(
    "pointerdown",
    (event) => {

        dragging = true;

        lastX = event.clientX;
        lastY = event.clientY;
    }
);

renderer.domElement.addEventListener(
    "pointermove",
    (event) => {

        if (!dragging) return;

        const dx =
            event.clientX - lastX;

        const dy =
            event.clientY - lastY;

        cameraAngle -= dx * 0.005;

        cameraDistance += dy * 0.25;

        cameraDistance =
            Math.max(
                30,
                Math.min(
                    180,
                    cameraDistance
                )
            );

        lastX = event.clientX;
        lastY = event.clientY;
    }
);

renderer.domElement.addEventListener(
    "pointerup",
    () => {
        dragging = false;
    }
);

renderer.domElement.addEventListener(
    "pointercancel",
    () => {
        dragging = false;
    }
);

// ============================================================
// ANIMATION
// ============================================================

function animate() {

    requestAnimationFrame(animate);

    const horizontal =
        Math.sin(cameraAngle) *
        cameraDistance;

    const depth =
        Math.cos(cameraAngle) *
        cameraDistance;

    camera.position.x =
        targetX + horizontal;

    camera.position.z =
        targetZ + depth;

    camera.position.y =
        35 + cameraDistance * 0.12;

    camera.lookAt(
        targetX,
        15,
        targetZ
    );

    renderer.render(
        scene,
        camera
    );
}

animate();

// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                1.5
            )
        );
    }
);
