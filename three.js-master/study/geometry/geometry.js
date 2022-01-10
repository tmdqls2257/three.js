import * as THREE from "../../build/three.module.js";
import { OrbitControls } from "../../examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "../../examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "../../examples/jsm/geometries/TextGeometry.js";

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
		camera.position.x = -20;
		camera.position.y = 20;
		camera.position.z = 30;
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
		const fontLoader = new FontLoader();
		async function loadFont(that) {
			const url = "../../examples/fonts/helvetiker_regular.typeface.json";
			const font = await new Promise((resolve, reject) => {
				fontLoader.load(url, resolve, undefined, reject);
			});

			const geometry = new TextGeometry("GIS", {
				font: font,
				size: 5,
				height: 1.5,
				// 하나의 커브를 구성하는 정점의 개수
				curveSegments: 8,
				bevelEnabled: true,
				bevelThickness: 0.7,
				// 외각선으로부터 얼마나 멀리 베벨링 할 것인지에 대한 거리 값
				bevelSize: 0.7,
				bevelOffset: 0,
				bevelSegments: 2,
			});

			const fillMaterial = new THREE.MeshPhongMaterial({ color: 0x515151 });
			const cube = new THREE.Mesh(geometry, fillMaterial);

			const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
			const line = new THREE.LineSegments(
				new THREE.WireframeGeometry(geometry),
				lineMaterial
			);

			const group = new THREE.Group();
			group.add(cube);
			group.add(line);

			that._scene.add(group);
			that._cube = group;
		}
		loadFont(this);
	}

	// _setupModel() {
	// 	class CustomSinCurve extends THREE.Curve {
	// 		constructor(scale) {
	// 			super();
	// 			this.scale = scale;
	// 		}
	// 		getPoint(t) {
	// 			const tx = t * 3 - 1.5;
	// 			const ty = Math.sin(2 * Math.PI * t);
	// 			const tz = 0;
	// 			return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
	// 		}
	// 	}
	// 	const path = new CustomSinCurve(4);
	// 	const geometry = new THREE.BufferGeometry();
	// 	const points = path.getPoints(50);
	// 	geometry.setFromPoints(points);

	// 	const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
	// 	const line = new THREE.Line(geometry, material);
	// 	this._scene.add(line);
	// }

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
