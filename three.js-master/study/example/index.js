import * as THREE from "../../build/three.module.js";

window.onload = function () {
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(
		//  field of view(시야각) FOV(시야각)는 해당 시점의 화면이 보여지는 정도를 나타냅니다.
		75,
		// aspect ratio(종횡비)
		window.innerWidth / window.innerHeight,
		// near
		0.1,
		// far
		// far 값 보다 멀리 있는 요소나 near 값보다 가까이 있는 오브젝트는 렌더링 되지 않는다는 뜻입니다.
		1000
	);

	const geometry = new THREE.BoxGeometry();
	// 면을 색칠 해주기 위한 함수
	const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
	// mesh는 기하학을 받아 재질을 적용하고 우리가 화면 안에 삽입하고 자유롭게 움직일 수 있게 해 줍니다.
	const cube = new THREE.Mesh(geometry, material);
	// 추가된 모든 것들은 (0,0,0) 속성을 가집니다.
	scene.add(cube);

	// 이렇게 되면 카메라와 큐브가 동일한 위치에 겹치게 되겠죠.
	// 이를 피하기 위해, 카메라를 약간 움직여 두었습니다.
	camera.position.z = 5;

	// 오래된 브라우저 혹은 모종의 사유로 WebGL을 지원 안할때의 대비용으로 사용하는 것
	const renderer = new THREE.WebGLRenderer();

	// 렌더링 할 곳의 크기를 설정
	// 낮은 해상도로 렌더링하고 싶을 경우
	// setSize의 updateStyle (세 번째 인자)를 false로 불러오면 됩니다.
	// setSize(window.innerWidth/2, window.innerHeight/2, false)처럼 사용하면
	// <canvas>가 100%의 높이, 너비로 되어있다는 기준 하에 절반의 해상도로 렌더링 될 것
	renderer.setSize(window.innerWidth, window.innerHeight);

	// renderer 엘리먼트를 HTML 문서 안에 넣는다.
	document.body.appendChild(renderer.domElement);

	// 렌더링하는 함수
	function animate() {
		requestAnimationFrame(animate);
		cube.rotation.x += 0.01;
		cube.rotation.y += 0.01;
		renderer.render(scene, camera);
	}
	animate();
};
