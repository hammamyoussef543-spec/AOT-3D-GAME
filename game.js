import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js";


// ==============================
// BASIC SETUP
// ==============================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x9fb9c8);

scene.fog = new THREE.Fog(
    0x9fb9c8,
    180,
    450
);


// CAMERA

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(
    0,
    80,
    140
);


// RENDERER

const renderer = new THREE.WebGLRenderer({
    antialias: false,
    powerPreference: "high-performance"
});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 1.5)
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

document
    .getElementById("game")
    .appendChild(renderer.domElement);


// ==============================
// LIGHTING
// ==============================

const ambientLight =
    new THREE.HemisphereLight(
        0xdceeff,
        0x554d42,
        2
    );

scene.add(ambientLight);


const sun =
    new THREE.DirectionalLight(
        0xffe8c0,
        2
    );

sun.position.set(
    -100,
    180,
    100
);

scene.add(sun);


// ==============================
// MATERIALS
// ==============================

const groundMaterial =
    new THREE.MeshLambertMaterial({
        color: 0x756f63
    });


const roadMaterial =
    new THREE.MeshLambertMaterial({
        color: 0x454545
    });


const wallMaterial =
    new THREE.MeshLambertMaterial({
        color: 0x9a9485
    });


const buildingMaterials = [

    new THREE.MeshLambertMaterial({
        color: 0xc4b18c
    }),

    new THREE.MeshLambertMaterial({
        color: 0xb39d7a
    }),

    new THREE.MeshLambertMaterial({
        color: 0xd0bd98
    })

];


// ==============================
// GROUND
// ==============================

const ground =
    new THREE.Mesh(
        new THREE.PlaneGeometry(
            500,
            500
        ),
        groundMaterial
    );

ground.rotation.x =
    -Math.PI / 2;

scene.add(ground);


// ==============================
// HELPER FUNCTIONS
// ==============================

function createBuilding(
    x,
    z,
    width,
    depth,
    height
) {

    const material =
        buildingMaterials[
            Math.floor(
                Math.random() *
                buildingMaterials.length
            )
        ];

    const building =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                height,
                depth
            ),
            material
        );

    building.position.set(
        x,
        height / 2,
        z
    );

    scene.add(building);
}


function createRoad(
    x,
    z,
    width,
    depth
) {

    const road =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                0.15,
                depth
            ),
            roadMaterial
        );

    road.position.set(
        x,
        0.08,
        z
    );

    scene.add(road);
}


// ==============================
// CITY ROADS
// ==============================

// Main horizontal road

createRoad(
    0,
    0,
    380,
    12
);


// Main vertical road

createRoad(
    0,
    0,
    12,
    380
);


// Inner roads

createRoad(
    0,
    70,
    280,
    8
);

createRoad(
    0,
    -70,
    280,
    8
);

createRoad(
    70,
    0,
    8,
    280
);

createRoad(
    -70,
    0,
    8,
    280
);


// ==============================
// BUILDINGS
// ==============================

for (let i = 0; i < 130; i++) {

    const x =
        (Math.random() - 0.5) *
        300;

    const z =
        (Math.random() - 0.5) *
        300;


    // Keep buildings away from main roads

    if (
        Math.abs(x) < 15 ||
        Math.abs(z) < 15
    ) {
        continue;
    }


    const width =
        7 + Math.random() * 8;

    const depth =
        7 + Math.random() * 8;

    const height =
        7 + Math.random() * 15;


    createBuilding(
        x,
        z,
        width,
        depth,
        height
    );
}


// ==============================
// OUTER WALL
// ==============================

const wallSize = 390;


// North wall

createRoad(
    0,
    -195,
    wallSize,
    10
);


// South wall

createRoad(
    0,
    195,
    wallSize,
    10
);


// East wall

createRoad(
    195,
    0,
    10,
    wallSize
);


// West wall

createRoad(
    -195,
    0,
    10,
    wallSize
);


// ==============================
// CENTRAL PLAZA
// ==============================

const plaza =
    new THREE.Mesh(
        new THREE.CylinderGeometry(
            32,
            32,
            0.5,
            32
        ),
        wallMaterial
    );

plaza.position.y = 0.25;

scene.add(plaza);


// ==============================
// MOBILE CAMERA
// ==============================

let rotationX = 0;
let rotationY = 0;

let distance = 150;

let touching = false;

let lastX = 0;
let lastY = 0;


renderer.domElement.addEventListener(
    "pointerdown",
    event => {

        touching = true;

        lastX = event.clientX;
        lastY = event.clientY;

    }
);


renderer.domElement.addEventListener(
    "pointermove",
    event => {

        if (!touching)
            return;


        const dx =
            event.clientX - lastX;

        const dy =
            event.clientY - lastY;


        rotationX -= dx * 0.005;

        rotationY -= dy * 0.005;


        rotationY =
            Math.max(
                -1.2,
                Math.min(
                    1.2,
                    rotationY
                )
            );


        lastX =
            event.clientX;

        lastY =
            event.clientY;

    }
);


renderer.domElement.addEventListener(
    "pointerup",
    () => {

        touching = false;

    }
);


// ==============================
// GAME LOOP
// ==============================

function animate() {

    requestAnimationFrame(
        animate
    );


    const horizontal =
        Math.cos(rotationY) *
        distance;


    camera.position.x =
        Math.sin(rotationX) *
        horizontal;


    camera.position.z =
        Math.cos(rotationX) *
        horizontal;


    camera.position.y =
        70 +
        Math.sin(rotationY) *
        distance;


    camera.lookAt(
        0,
        10,
        0
    );


    renderer.render(
        scene,
        camera
    );

}


animate();


// ==============================
// RESIZE
// ==============================

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

    }
);


// ==============================
// FINISHED
// ==============================

document.getElementById(
    "loading"
).style.display = "none";
