import * as THREE from "../../build/three.module.js";
import { OrbitControls } from "../../examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "../../examples/jsm/loaders/GLTFLoader.js";

function dumpObject(obj, lines = [], isLast = true, prefix = "") {
	const localPrefix = isLast ? "└─" : "├─";
	lines.push(
		`${prefix}${prefix ? localPrefix : ""}${obj.name || "*no-name*"} [${
			obj.type
		}]`
	);
	const newPrefix = prefix + (isLast ? "  " : "│ ");
	const lastNdx = obj.children.length - 1;
	obj.children.forEach((child, ndx) => {
		const isLast = ndx === lastNdx;
		dumpObject(child, lines, isLast, newPrefix);
	});
	return lines;
}

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

		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		this._renderer = renderer;

		const scene = new THREE.Scene();
		this._scene = scene;

		// 카메라를 구성하는 객체
		this._setupCamera();
		// 광원을 설정하는 함수
		this._setupLight();
		// 3차원 모델을 설정하는 함수
		this._setupModel();
		this._setupControl();
		this._setupPicking();

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

	_setupControl() {
		this._controls = new OrbitControls(this._camera, this._divContainer);
	}

	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		// 카메라 객체 생성
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
		camera.position.z = 2;
		this._camera = camera;
	}

	_setupPicking() {
		const raycaster = new THREE.Raycaster();
		this._divContainer.addEventListener("dblclick", this._onDbClick.bind(this));
		this._raycaster = raycaster;
	}

	_onDbClick(event) {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		const xy = {
			x: (event.offsetX / width) * 2 - 1,
			y: -(event.offsetY / height) * 2 + 1,
		};
		this._raycaster.setFromCamera(xy, this._camera);

		// 장면에서 이름이 카인 오브젝트만을 담는 카스라는 배열을 정의합니다.
		const cars = [];
		this._scene.traverse((obj3d) => {
			if (obj3d.name === "car") {
				cars.push(obj3d);
			}
		});

		// 카스 배열에 저장된 요소에 대해서 피킹 검사를 수행합니다.
		for (let i = 0; i < cars.length; i++) {
			const car = cars[i];
			const targets = this._raycaster.intersectObject(car);
			if (targets.length > 0) {
				// 더블클릭된 차 확대 코드
				this._zoomFit(car, 70);
				this._controls.enabled = true;
				return;
			}
		}
		// 더블 클릭이 차에 대해서 이루어지지 않는 경우
		const box = this._scene.getObjectByName("box");
		this._zoomFit(box, 45);
	}

	_zoomFit(object3d, viewAngle) {
		// 박스는 모델 xyz측의 정렬된 최소 바운딩
		const box = new THREE.Box3().setFromObject(object3d);
		// 박스를 통해 얻을 수 있는 가장 긴 모서리 사이의 거리
		const sizeBox = box.getSize(new THREE.Vector3()).length();
		// 박스의 중심점
		const centerBox = box.getCenter(new THREE.Vector3());

		const direction = new THREE.Vector3(0, 1, 0);
		// x축으로 q앵글 만큼 회전한 단위벡터
		// 그림에서의 디렉션은 0 1 0을 가리키는 단위벡터
		direction.applyAxisAngle(
			new THREE.Vector3(1, 0, 0),
			THREE.Math.degToRad(viewAngle)
		);

		// 이 사이즈 박스의 반 값입니다.
		const halfSizeModel = sizeBox * 0.5;
		// 헬프 포부는 카메라 포부의 반 값
		const halfFov = THREE.Math.degToRad(this._camera.fov * 0.5);
		// 모델을 확대 했을 떄의 거리값
		const distance = halfSizeModel / Math.tan(halfFov);

		// 카메라의 새 위치
		const newPosition = new THREE.Vector3().copy(
			direction.multiplyScalar(distance).add(centerBox)
		);

		//this._camera.position.copy(newPosition);
		// 카메라의 위치를 0.5초동안 새로운 위치로 단계적으로 변경
		// newPosition을 카메라의 최종 위치로 잡고 센터 박스를 카메라가 바라보는 최종
		// 위치로 잡으면 모델을 화면에 가득 채워서 확대할 수 있게 된다.
		gsap.to(this._camera.position, {
			duration: 0.5,
			x: newPosition.x,
			y: newPosition.y,
			z: newPosition.z,
		});

		//this._controls.target.copy(centerBox);
		gsap.to(this._controls.target, {
			duration: 0.5,
			x: centerBox.x,
			y: centerBox.y,
			z: centerBox.z,
			onUpdate: () => {
				// 매 프레임마다 컨트롤의 4개의 위치를 카메라가 바라보게 합니다.
				// 깜박거림을 막기 위한 조치
				this._camera.lookAt(
					this._controls.target.x,
					this._controls.target.y,
					this._controls.target.z
				);
			},
		});
	}

	_setupLight() {
		const ambientLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
		this._scene.add(ambientLight);

		const color = 0xffffff;
		const intensity = 1.5;
		const light1 = new THREE.DirectionalLight(color, intensity);
		light1.position.set(-1, 2, 0);
		this._scene.add(light1);

		const light2 = new THREE.DirectionalLight(color, intensity);
		light2.position.set(1, 4, 0);
		light2.castShadow = true;
		// 그림자의 설정 값
		light2.shadow.mapSize.width = light2.shadow.mapSize.height = 1024 * 10;
		light2.shadow.radius = 4;
		light2.shadow.bias = 0.0001;
		this._scene.add(light2);
	}

	// 파란색 계열의 정육면체를 생성하는 함수
	_setupModel() {
		const loader = new GLTFLoader();

		const items = [
			{
				url: "../data/free_porsche_911_carrera_4s/scene.gltf",
				removed: "Plane",
			},
			{ url: "../data/mazda_rx8/scene.gltf", removed: "Object_9" },
		];

		items.forEach((item, idx) => {
			loader.load(item.url, (gltf) => {
				const obj3d = gltf.scene;

				const removedObj3d = obj3d.getObjectByName(item.removed);
				removedObj3d.removeFromParent();

				const box = new THREE.Box3().setFromObject(obj3d);
				const sizeBox = box.max.z - box.min.z;
				const scale = 1 / sizeBox;
				const tx = idx / (items.length - 1) - 0.5;
				obj3d.scale.set(scale, scale, scale);
				obj3d.position.set(tx, -box.min.y * scale, 0);

				this._scene.add(obj3d);
				obj3d.name = "car";

				// this._scene.add(new THREE.BoxHelper(obj3d));
				// console.log(dumpObject(obj3d).join("\n"));

				obj3d.traverse((child) => {
					// 차도 그림자를 줄 수 있고 받을 수 있다.
					child.castShadow = true;
					child.receiveShadow = true;
				});
			});
		});

		const boxGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.1, 64);
		const boxmaterial = new THREE.MeshStandardMaterial({
			color: 0x454545,
			metalness: 0.5,
			roughness: 0.5,
		});
		const box = new THREE.Mesh(boxGeometry, boxmaterial);
		// 그라운드는 그림자를 받기만 한다.
		box.receiveShadow = true;
		box.name = "box";

		box.position.y = -0.05;
		this._scene.add(box);
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
		this._controls.update();
	}
}

window.onload = function () {
	new App();
};
