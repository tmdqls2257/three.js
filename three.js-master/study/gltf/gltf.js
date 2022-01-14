import * as THREE from "../../build/three.module.js";
import { OrbitControls } from "../../examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "../../examples/jsm/loaders/GLTFLoader.js";

class App {
	constructor() {
		const divContainer = document.querySelector(".webgl-container");
		// 다른 method에서 참조할 수 있게 하기 위해서 field로 정의
		this._divContainer = divContainer;

		// Renderer를 생성하는 코드
		const renderer = new THREE.WebGLRenderer({ antialias: true });
		// 디스플레이의 배율을 유동적으로 따라가기 위한 코드
		// 만약 디스플레이 배율이 150%이면 1.5의 값을 가진다.
		renderer.setPixelRatio(window.devicePixelRatio);
		// 이 renderer를 div의 자식으로 추가
		// renderer.domElement 캔버스 타입의 dom 객체입니다.
		divContainer.appendChild(renderer.domElement);
		this._renderer = renderer;

		const scene = new THREE.Scene();
		this._scene = scene;

		// 카메라를 구성하는 객체
		this._setupCamera();
		// 광원을 설정하는 함수
		this._setupLight();
		// 3차원 모델을 설정하는 함수
		this._setupModel();
		this._setupControls();

		// renderer난 camera는 창 크기가 변경될 때마다 그 크기에 맞게 속성 값을
		// 재설정 해줘야 하기 때문
		// bind를 쓰는 이유는 resize method안에서 this가 가르키는 객체가
		// 이벤트 객체가 아닌 이 App클래스의 객체가 되도록 하기 위함
		window.onresize = this.resize.bind(this);
		// renderer난 camera의 창 크기에 맞게 설정해주게 됩니다.
		this.resize();

		// render method는 3차원 그래픽 장면을 만들어주는 method
		// 이 method를 넘겨줌으로써 최대한 빠르게 render됩니다.
		requestAnimationFrame(this.render.bind(this));
	}

	_setupControls() {
		// OrbitControls객체는 카메라 객체와 먀우스 이벤트를 받는 DOM요소가 필요합니다.
		new OrbitControls(this._camera, this._divContainer);
	}

	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		// 카메라 객체 생성
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
		camera.position.z = 4;
		this._camera = camera;
		this._scene.add(this._camera);
	}

	_setupLight() {
		// 광원의 색상
		const color = 0xffffff;
		// 광원의 세기
		const intensity = 1;
		// 광원을 생성하는 함수
		const light = new THREE.DirectionalLight(color, intensity);
		// 광원의 위치
		light.position.set(-1, 2, 4);
		// this._scene.add(light);
		this._camera.add(light);
	}

	// 파란색 계열의 정육면체를 생성하는 함수
	_setupModel() {
		const gltfLoader = new GLTFLoader();
		const url = "../data/adamHead/adamHead/adamHead.gltf";
		gltfLoader.load(url, (gltf) => {
			const root = gltf.scene;
			this._scene.add(root);
			// 3차원 모델이 로딩 완료되는 시점
			this._zoomFit(root, this._camera);
		});
	}

	_zoomFit(object3D, camera) {
		// 모델의 경계 박스
		const box = new THREE.Box3().setFromObject(object3D);
		// 모델의 경계 박스 대각 길이
		const sizeBox = box.getSize(new THREE.Vector3()).length();
		// 모델의 경계 박스, 중심 위치
		const centerBox = box.getCenter(new THREE.Vector3());
		// 모델 크기의 절반값
		const halfSizeModel = sizeBox * 0.5;
		// 카메라의 fov의 절반값
		const halfFov = THREE.Math.degToRad(camera.fov * 0.5);
		// 모델을 화면에 꽉 채우기 위한 적당한 거리
		const distance = halfSizeModel / Math.tan(halfFov);
		// 모델 중심에서 카메라 위치로 향하는 방향 단위 벡터 계산
		const direction = new THREE.Vector3()
			.subVectors(camera.position, centerBox)
			.normalize();
		// 단위 방향 벡터 방향으로 모델 중심 위치에서 distance 거리에 대한 위치
		const position = direction.multiplyScalar(distance).add(centerBox);
		camera.position.copy(position);
		// 모델의 크기에 맞춰 카메라의 near, far 값을 대략적으로 조정
		camera.near = sizeBox / 100;
		camera.far = sizeBox * 100;
		// 카메라 기본 속성 변경에 따른 투영행렬 업데이트
		camera.updateProjectionMatrix();
		// 카메라가 모델의 중심을 바라보도록 함
		camera.lookAt(centerBox.x, centerBox.y, centerBox.z);
	}

	resize() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;

		this._camera.aspect = width / height;
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(width, height);
	}

	render(time) {
		// renderer가 scene을 카메라의 시점으로 렌더링하는 코드
		this._renderer.render(this._scene, this._camera);
		// update method에서는 어떤 속성값을 변경합니다.
		// 속성값을 변경함으로써 애니메이션 효과를 발생시킵니다.
		this.update(time);
		// render method가 반복해서 호출됩니다.
		requestAnimationFrame(this.render.bind(this));
	}

	update(time) {
		time *= 0.001;
		// 시간에 따라 큐브가 회전하게 됩니다.
		// 여기서 time은 requestAnimationFrame에서 전달해줍니다.
		// this._cube.rotation.x = time;
		// this._cube.rotation.y = time;
	}
}

window.onload = function () {
	new App();
};
