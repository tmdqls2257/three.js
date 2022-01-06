import * as THREE from "../../build/three.module.js";
import { OrbitControls } from "../../examples/jsm/controls/OrbitControls.js";

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
		// 마우스로 컨트롤하기 위한 함수
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

	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		// 카메라 객체 생성
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
		camera.position.z = 2;
		this._camera = camera;
	}

	_setupControls() {
		// OrbitControls객체는 카메라 객체와 먀우스 이벤트를 받는 DOM요소가 필요합니다.
		new OrbitControls(this._camera, this._divContainer);
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
		this._scene.add(light);
	}

	// 파란색 계열의 정육면체를 생성하는 함수
	_setupModel() {
		// 가로 세로 높이가 1인 지오메트리
		const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
		const fillMaterial = new THREE.MeshPhongMaterial({ color: 0x515151 });
		const cube = new THREE.Mesh(geometry, fillMaterial);

		// 선의 색을 노란색으로 정해 놓습니다.
		const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
		// 지오메트리를 이용해 line 오브젝트를 만들어줍니다.
		const line = new THREE.LineSegments(
			// WireframeGeometry를 사용하지 않으면 모델의 모든 외각선이 그려지지 않습니다.
			new THREE.WireframeGeometry(geometry),
			lineMaterial
		);

		// mesh 오브젝트와 line 오브젝트를 하나의 오브젝트로 다루기 위해 그룹화 해줍니다.
		const group = new THREE.Group();
		group.add(cube);
		group.add(line);

		// 그룹을 scene에 추가 합니다.
		this._scene.add(group);
		this._cube = group;
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
