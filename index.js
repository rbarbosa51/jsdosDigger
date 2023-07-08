import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import emulators from 'https://cdn.jsdelivr.net/npm/emulators@0.73.8/+esm';
import emulatorsUi from 'https://cdn.jsdelivr.net/npm/emulators-ui@0.73.9/+esm';

const img = document.createElement("canvas");
img.width = 320;
img.height = 200;

const ctx = img.getContext('2d');
const texture = new THREE.CanvasTexture(img);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xFFFFFF);

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );

document.getElementById("root").appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(2,2);
const material = new THREE.MeshBasicMaterial({
    map: texture,
});
const plane = new THREE.Mesh( geometry, material );

scene.add( plane );

camera.position.z = 2;

const animate = function () {
	requestAnimationFrame( animate );

	// cube.rotation.x += 0.01;
	// cube.rotation.y += 0.01;

	renderer.render( scene, camera );
};

animate();

async function runDigger() {
    stop();

    const bundle = await emulatorsUi.network.resolveBundle("https://cdn.dos.zone/original/2X/9/9ed7eb9c2c441f56656692ed4dc7ab28f58503ce.jsdos");
    const ciPromise = emulators.dosWorker(bundle);
    const rgba = new Uint8ClampedArray(320 * 200 * 4);
    ciPromise.then((ci) => {
        emulatorsUi.sound.audioNode(ci);

        ci.events().onFrame((rgb) => {
            for (let next = 0; next < 320 * 200; ++next) {
                rgba[next * 4 + 0] = rgb[next * 3 + 0];
                rgba[next * 4 + 1] = rgb[next * 3 + 1];
                rgba[next * 4 + 2] = rgb[next * 3 + 2];
                rgba[next * 4 + 3] = 255;
            }

            ctx?.putImageData(new ImageData(rgba, 320, 200), 0, 0);
            texture.needsUpdate = true;
        });


        window.addEventListener("keydown", (e) => {
            const keyCode = emulatorsUi.controls.domToKeyCode(e.keyCode);
            ci.sendKeyEvent(keyCode, true);
        });

        window.addEventListener("keyup", (e) => {
            const keyCode = emulatorsUi.controls.domToKeyCode(e.keyCode);
            ci.sendKeyEvent(keyCode, false);
        });
    });
}

runDigger();
       