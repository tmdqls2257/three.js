import * as THREE from "../../build/three.module.js";
import { OrbitControls } from "../../examples/jsm/controls/OrbitControls.js";
import { RectAreaLightUniformsLib } from "../../examples/jsm/lights/RectAreaLightUniformsLib.js";
import { RectAreaLightHelper } from "../../examples/jsm/helpers/RectAreaLightHelper.js";

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
		const camera = new THREE.PerspectiveCamera(75, width / height, 1, 19);
		// 카메라를 (7,7,0)으로 옮겨준다.
		camera.position.set(7, 7, 0);
		// (0,0,0)을 바라보게 합니다.
		camera.lookAt(0, 0, 0);
		this._camera = camera;
	}

	_setupLight() {
		RectAreaLightUniformsLib.init();

		const light = new THREE.RectAreaLight(0xffffff, 10, 3, 5);
		light.position.set(0, 5, 0);
		light.rotation.x = THREE.Math.degToRad(-90);

		const helper = new RectAreaLightHelper(light);
		light.add(helper);

		this._scene.add(light);
		this._light = light;
	}

	// 파란색 계열의 정육면체를 생성하는 함수
	_setupModel() {
		const groundGeometry = new THREE.PlaneGeometry(10, 10);
		const groundMaterial = new THREE.MeshStandardMaterial({
			color: "#2c3e50",
			roughness: 0.5,
			metalness: 0.5,
			side: THREE.DoubleSide,
		});

		const ground = new THREE.Mesh(groundGeometry, groundMaterial);
		ground.rotation.x = THREE.Math.degToRad(-90);
		this._scene.add(ground);

		const bigSphereGeometry = new THREE.SphereGeometry(1.5, 64, 64, 0, Math.PI);
		const bigSphereMaterial = new THREE.MeshStandardMaterial({
			color: "#ffffff",
			roughness: 0.1,
			metalness: 0.2,
		});

		const bigSphere = new THREE.Mesh(bigSphereGeometry, bigSphereMaterial);
		bigSphere.rotation.x = THREE.Math.degToRad(-90);
		this._scene.add(bigSphere);

		const torusGeometry = new THREE.TorusGeometry(0.4, 0.1, 32, 32);
		const torusMaterial = new THREE.MeshStandardMaterial({
			color: "#9b59b6",
			roughness: 0.5,
			metalness: 0.9,
		});

		for (let i = 0; i < 8; i++) {
			const torusPivot = new THREE.Object3D();
			const torus = new THREE.Mesh(torusGeometry, torusMaterial);
			torusPivot.rotation.y = THREE.Math.degToRad(45 * i);
			torus.position.set(3, 0.5, 0);
			torusPivot.add(torus);
			this._scene.add(torusPivot);
		}

		const smallSphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);
		const smallSphereMaterial = new THREE.MeshStandardMaterial({
			color: "#e74c3c",
			roughness: 0.2,
			metalness: 0.5,
		});
		const smallSpherePivot = new THREE.Object3D();
		const smallSphere = new THREE.Mesh(
			smallSphereGeometry,
			smallSphereMaterial
		);
		smallSpherePivot.add(smallSphere);
		// 이름을 부여해두면 smallSpherePivot 객체를 Scene을 통해 조회 가능
		smallSpherePivot.name = "smallSpherePivot";
		smallSphere.position.set(3, 0.5, 0);
		this._scene.add(smallSpherePivot);

		const targetPivot = new THREE.Object3D();
		// mesh와의 차이점은 화면상에 렌더링되지 않지만 scene의 구성요소로 자리잡습니다.
		const target = new THREE.Object3D();
		targetPivot.add(target);
		targetPivot.name = "targetPivot";
		target.position.set(3, 0.5, 0);
		this._scene.add(targetPivot);
	}

	resize() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		const aspect = width / height;

		if (this._camera instanceof THREE.PerspectiveCamera) {
			this._camera.aspect = aspect;
		} else {
			this._camera.left = -1 * aspect;
			this._camera.right = 1 * aspect;
		}
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
		// Object의 네임이 smallSpherePivot이 객체를 불러옵니다.
		const smallSpherePivot = this._scene.getObjectByName("smallSpherePivot");
		if (smallSpherePivot) {
			smallSpherePivot.rotation.y = THREE.Math.degToRad(time * 50);

			// 카메라의 위치가 빨간색 구의 위치로 업데이트 되고 있기 때문
			const smallSphere = smallSpherePivot.children[0];
			smallSphere.getWorldPosition(this._camera.position);

			const targetPivot = this._scene.getObjectByName("targetPivot");
			if (targetPivot) {
				// targetPivot의 자식인 target이 빨간색 구의 다음 위치에 놓이도록
				targetPivot.rotation.y = THREE.Math.degToRad(time * 50 + 10);

				const target = targetPivot.children[0];
				const pt = new THREE.Vector3();

				target.getWorldPosition(pt);
				this._camera.lookAt(pt);
			}

			// 광원에 대한 target의 위치가 회전하는 이 구의 위치를 추적하도록 하기 위한 코드
			if (this._light.target) {
				// smallSpherePivot의 첫번째 자식을 가져옴 즉 smallSphere를 가져옴
				const smallSphere = smallSpherePivot.children[0];
				// 작은 구의 월드 위치를 this._light.target.position로 바꿉니다.
				smallSphere.getWorldPosition(this._light.target.position);

				if (this._lightHelper) this._lightHelper.update();
			}
		}
	}
}

window.onload = function () {
	new App();
};
