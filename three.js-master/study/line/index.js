import * as THREE from "../../build/three.module.js";

window.onload = function () {
	const divContainer = document.querySelector(".webgl-container");
	const renderer = new THREE.WebGLRenderer();
	const width = divContainer.clientWidth;
	const height = divContainer.clientHeight;
	renderer.setSize(width, height);
	divContainer.appendChild(renderer.domElement);

	const camera = new THREE.PerspectiveCamera(45, width / height, 1, 500);
	camera.position.set(0, 0, 30);
	camera.lookAt(0, 0, 0);

	const scene = new THREE.Scene();
	// 라인의 색상을 정해준다.
	const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
	const points = [];
	// vector3는 3차원에서의 벡터를 의미한다.
	// vector2는 2차원에서의 벡터를 의미한다.
	points.push(new THREE.Vector3(-10, 0, 0));
	points.push(new THREE.Vector3(0, 10, 0));
	points.push(new THREE.Vector3(10, 0, 0));

	// 꼭짓점에 대한 기하학을 정의
	const geometry = new THREE.BufferGeometry().setFromPoints(points);

	const line = new THREE.Line(geometry, material);

	scene.add(line);
	renderer.render(scene, camera);
};
