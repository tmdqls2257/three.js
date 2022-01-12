import * as THREE from "../../build/three.module.js";
import { OrbitControls } from "../../examples/jsm/controls/OrbitControls.js";
// mesh에 법선벡터를 시각화 하기 위해
import { VertexNormalsHelper } from "../../examples/jsm/helpers/VertexNormalsHelper.js";

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
		new OrbitControls(this._camera, this._divContainer);
	}

	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		// 카메라 객체 생성
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
		camera.position.z = 7;
		this._camera = camera;
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
		// 라인에 대한 좌표
		const rawPositions = [-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0];

		// 법선 벡터에 대한 배열 데이터
		// mesh의 면을 봤을때 수직인 벡터가 모두 (0,0,1)이기 때문입니다.
		const rawNormals = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];

		// 각 정점에 대한 색상값 지정을 위한 다름 배열 객체를 추가
		const rawColors = [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0];

		// uv좌표를 담고 있는 배열 객체
		const rawUVs = [0, 0, 1, 0, 0, 1, 1, 1];

		const positions = new Float32Array(rawPositions);
		const normal = new Float32Array(rawNormals);
		const color = new Float32Array(rawColors);
		const uv = new Float32Array(rawUVs);

		const geometry = new THREE.BufferGeometry();

		// 3은 하나의 정점이 3개의 항목으로 구성된다는 의미
		geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
		// 법선벡터를 지오메트리에 지정
		geometry.setAttribute("normal", new THREE.BufferAttribute(normal, 3));
		geometry.setAttribute("color", new THREE.BufferAttribute(color, 3));
		geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));

		// vertex index는 삼각형 면을 정의합니다.
		// 이 사각형은 2개의 삼각형으로 구성(1,2,3),(3,2,4)
		// 삼각형을 구성하는 정점의 배치 순서가 반시계 방향이여야 한다.
		// 반시계 방향인 면이 바로 앞면이기 때문
		geometry.setIndex([0, 1, 2, 2, 1, 3]);

		// 정점에 대한 법선벡터(광원이 mesh의 표면에 비치는 입사각과 반사각을 계산하여 재질과 함께 표면의 색상을 결정 하는데 사용)
		// geometry.computeVertexNormals();

		const textureLoader = new THREE.TextureLoader();
		const map = textureLoader.load(
			"../../examples/textures/uv_grid_opengl.jpg"
		);

		// mesh를 만들기 위해선 geometry와 material이 필요
		const material = new THREE.MeshPhongMaterial({
			color: 0xffffff,
			vertexColors: true,
			map,
		});

		const box = new THREE.Mesh(geometry, material);
		this._scene.add(box);

		const helper = new VertexNormalsHelper(box, 0.1, 0xffff00);
		this._scene.add(helper);
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
	}
}

window.onload = function () {
	new App();
};
