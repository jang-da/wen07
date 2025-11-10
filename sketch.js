// 전역 변수 선언
let imgDesktop; // 데스크톱용 이미지
let imgMobile;  // 모바일용 이미지
let particles = [];
let ripples = []; // 마우스 클릭 시 생성될 파동을 저장할 배열

// --- 포스터 파티클 효과를 위한 전역 변수 추가 ---
let posterImg;
let posterParticles = [];
let isPosterExploded = false;
// ---

// setup() 전에 실행되어 이미지 등 미디어 파일을 미리 로드합니다.
function preload() {
  // 이미지 로딩 성공/실패를 확인하기 위해 콜백 함수를 추가합니다.
  imgDesktop = loadImage('mainimg/logo6.png',
    () => console.log('Desktop image loaded successfully.'),
    () => console.error('Failed to load desktop image. Check path: mainimg/logo6.png')
  );
  imgMobile = loadImage('logo5.png',
    () => console.log('Mobile image loaded successfully.'),
    () => console.error('Failed to load mobile image. Check path: logo5.png')
  );

  // 포스터 이미지 로드
  posterImg = loadImage('about/poster.png',
    () => console.log('Poster image loaded successfully.'),
    () => console.error('Failed to load poster image. Check path: about/poster.png')
  );
}

// p5.js 스케치가 처음 시작될 때 한 번 실행됩니다.
function setup() {
  // 캔버스 컨테이너 요소를 찾습니다.
  const canvasContainer = document.getElementById('canvas-container');
  if (!canvasContainer) {
    console.error("Error: Could not find an element with id 'canvas-container'.");
    return; // 'canvas-container'가 없으면 실행을 중단합니다.
  }
  // 컨테이너의 크기에 맞춰 캔버스를 생성합니다.
  const canvas = createCanvas(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
  // 생성된 캔버스를 컨테이너의 자식으로 만듭니다.
  canvas.parent('canvas-container');

  // 로드된 이미지를 기반으로 파티클을 초기화합니다.
  initializeParticles();

  // 2초(2000ms)마다 자동 파동을 2번 생성합니다.
  for (let i = 0; i < 2; i++) {
    setInterval(createAutoRipple, 2000 + i * 500); // 각 파동이 약간 다른 시간에 시작하도록 지연시간을 줌
  }

}

// 이미지의 픽셀을 분석하여 파티클을 생성하는 함수
function initializeParticles() {
  particles = []; // 기존 파티클 배열을 비웁니다.
  
  // 화면 너비가 768px 미만일 때만 모바일(세로) 모드로 간주합니다.
  const isMobile = width < 768; 

  // 이미지 로딩 실패 시를 대비한 방어 코드
  if ((isMobile && !imgMobile.width) || (!isMobile && !imgDesktop.width)) {
    console.error("Image not loaded, cannot initialize particles.");
    return; // 이미지가 없으면 파티클을 생성하지 않습니다.
  }

  // 모바일 여부에 따라 사용할 이미지를 선택합니다.
  let img = isMobile ? imgMobile : imgDesktop;

  // 선택된 이미지의 픽셀 데이터를 사용하기 위해 loadPixels()를 호출합니다.
  img.loadPixels();

  if (isMobile) {
    // --- 세로 모드: 글자를 쪼개서 수직으로 배열 ---id="defaultCanvas0"
    const letterWidth = img.width / 4;
    const letterHeight = img.height;
    const spacing = letterHeight * 0.2; // 글자 사이의 간격
    const totalHeight = (letterHeight * 4) + (spacing * 3);

    const scale = min((width * 0.8) / letterWidth, (height * 0.9) / totalHeight);
    const stepSize = 28; // 세로 모드 파티클 밀도 (값을 키우면 파티클 감소)

    for (let i = 0; i < 4; i++) { // 4개의 글자(C, O, D, E)를 순회
      const startX = (width - letterWidth * scale) / 2;
      const startY = (height - totalHeight * scale) / 2 + i * (letterHeight + spacing) * scale;

      for (let x = i * letterWidth; x < (i + 1) * letterWidth; x += stepSize) {
        for (let y = 0; y < letterHeight; y += stepSize) {
          if (brightness(img.get(x, y)) > 10) {
            const particleX = startX + (x - i * letterWidth) * scale;
            const particleY = startY + y * scale;
            particles.push(new Particle(particleX, particleY));
          }
        }
      }
    }
  } else {
    // --- 가로 모드: 기존 로직 유지 ---
    const scale = min((width * 0.8) / img.width, (height * 0.8) / img.height);
    const scaledWidth = img.width * scale;
    const stepSize = 20; // 가로 모드 파티클 밀도 (값을 키우면 파티클 감소)

    const startX = (width - scaledWidth) / 2;
    const startY = (height - img.height * scale) / 2;

    for (let x = 0; x < img.width; x += stepSize) {
      for (let y = 0; y < img.height; y += stepSize) {
        if (brightness(img.get(x, y)) > 10) {
          const particleX = startX + x * scale;
          const particleY = startY + y * scale;
          particles.push(new Particle(particleX, particleY));
        }
      }
    }
  }
}

// 1초에 약 60번 반복 실행되는 애니메이션 루프
function draw() {
  // 매 프레임마다 배경을 어둡게 칠해 잔상을 만듭니다. (0~255 사이)
  background(10, 10, 20, 100);

  // 모든 파동을 업데이트합니다.
  for (let i = ripples.length - 1; i >= 0; i--) {
    let r = ripples[i];
    r.radius += r.speed; // 파동의 반지름을 키웁니다.
    // 파동이 화면을 완전히 벗어나면 배열에서 제거합니다.
    if (r.radius > width + height) {
      ripples.splice(i, 1);
    }
  }

  // 모든 파티클을 순회하며 업데이트하고 화면에 그립니다.
  for (let p of particles) {
    p.update(); // 파티클 위치 업데이트
    p.show();
  }

  // --- 포스터 파티클 효과 처리 로직 추가 ---
  if (isPosterExploded) {
    for (let i = posterParticles.length - 1; i >= 0; i--) {
      posterParticles[i].update();
      posterParticles[i].display();
      if (posterParticles[i].isDead()) {
        posterParticles.splice(i, 1);
      }
    }
    // 모든 파티클이 사라지면 상태 초기화 (다시 클릭해서 폭발시킬 수 있도록)
    if (posterParticles.length === 0) {
      isPosterExploded = false;
      // posterImage.style.opacity = 1; // 이미지를 다시 보이게 하려면 이 줄의 주석을 해제하세요.
    }
  }
}

// 브라우저 창 크기가 변경될 때마다 실행되는 함수
function windowResized() {
  // 캔버스 크기를 다시 조정하고
  const canvasContainer = document.getElementById('canvas-container');
  if (canvasContainer) {
    resizeCanvas(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
  }

  // 파티클 위치를 새 캔버스 크기에 맞게 다시 계산합니다.
  initializeParticles();
}

// 마우스를 클릭할 때마다 실행되는 함수
function mousePressed() {
  // 클릭된 위치에 있는 HTML 요소가 body 또는 canvas 자체일 때만 파동을 생성합니다.
  // 이렇게 하면 섹션의 텍스트나 이미지를 클릭했을 때 파동이 생기지 않습니다.
  if (event.target.tagName !== 'BODY' && event.target.tagName !== 'CANVAS') {
    return;
  }

  // 성능 저하를 막기 위해 최대 파동 개수를 10개로 제한합니다.
  // 파동의 개수가 10개를 넘으면 가장 오래된 파동(배열의 첫 번째 요소)을 제거합니다.
  if (ripples.length > 10) {
    ripples.shift(); // 배열의 첫 번째 요소를 제거
  }

  // 클릭한 위치에 새로운 파동 객체를 생성하여 배열에 추가합니다.
  ripples.push({
    x: mouseX,
    y: mouseY,
    radius: 0,      // 시작 반지름
    speed: random(2, 8), // 2에서 8 사이의 랜덤한 속도
    rippleWidth: 20 // 파동의 두께 20px로 고정
  });
}

// 자동 파동을 생성하는 함수
function createAutoRipple() {
  // 성능 저하를 막기 위해 최대 파동 개수를 10개로 제한합니다.
  if (ripples.length > 10) {
    ripples.shift(); // 가장 오래된 파동을 제거합니다.
  }

  // 캔버스 내의 임의의 위치에 새로운 파동 객체를 생성하여 배열에 추가합니다.
  ripples.push({
    x: random(width),      // 캔버스 너비 내의 랜덤 x좌표
    y: random(height),     // 캔버스 높이 내의 랜덤 y좌표
    radius: 0,
    speed: random(2, 5),   // 자동 파동은 약간 느린 속도로 설정
    rippleWidth: 20
  });
}

// --- 포스터 파티클 효과를 위한 함수 및 클래스 추가 ---

// 포스터 파티클 클래스
class PosterParticle {
  constructor(x, y, col) {
    this.pos = createVector(x, y);
    // 폭발 효과를 위해 무작위 방향으로 초기 속도 설정
    this.vel = p5.Vector.random2D().mult(random(1, 5));
    this.acc = createVector(0, 0.05); // 중력 효과
    this.color = col;
    this.lifespan = 255; // 파티클 수명
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.lifespan -= 1.5;
  }

  display() {
    noStroke();
    fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.lifespan);
    ellipse(this.pos.x, this.pos.y, 4);
  }

  isDead() {
    return this.lifespan < 0;
  }
}

function explodePoster() {
  // 이미 폭발 중이거나 이미지가 로드되지 않았으면 실행하지 않음
  if (isPosterExploded || !posterImg) return;

  // index.html의 posterImage 요소를 다시 참조합니다.
  const posterElement = document.getElementById('poster-image');
  if (!posterElement) return;

  // 이미지의 화면상 위치와 크기 가져오기
  const rect = posterElement.getBoundingClientRect();
  const imgX = rect.left;
  const imgY = rect.top;
  const imgWidth = rect.width;
  const imgHeight = rect.height;

  // 이미지 숨기기
  posterElement.style.opacity = 0;
  isPosterExploded = true;
  posterParticles = []; // 파티클 배열 초기화

  posterImg.loadPixels();

  // 이미지의 특정 간격마다 픽셀을 샘플링하여 파티클 생성
  const step = 10; // 숫자가 작을수록 파티클이 많아짐
  for (let y = 0; y < posterImg.height; y += step) {
    for (let x = 0; x < posterImg.width; x += step) {
      const index = (x + y * posterImg.width) * 4;
      const a = posterImg.pixels[index + 3]; // Alpha 값

      if (a > 128) { // 투명하지 않은 픽셀만 파티클로 만들기
        const particleX = map(x, 0, posterImg.width, imgX, imgX + imgWidth);
        const particleY = map(y, 0, posterImg.height, imgY, imgY + imgHeight);
        const c = posterImg.get(x, y); // 해당 픽셀의 색상 가져오기
        posterParticles.push(new PosterParticle(particleX, particleY, c));
      }
    }
  }
}

// 파티클 하나하나를 정의하는 클래스
class Particle {
  // 생성자: 파티클이 생성될 때 초기 위치(home)를 설정합니다.
  constructor(x, y) {
    this.pos = createVector(x, y); // 현재 위치
    this.home = createVector(x, y); // 원래 있어야 할 고정 위치
    this.vel = createVector();      // 속도
    this.acc = createVector();      // 가속도

    // 사용자가 요청한 '0' 또는 '1' 문자를 랜덤하게 선택합니다.
    this.char = random() > 0.5 ? "0" : "1";
    this.maxSpeed = 3; // 최대 속도
    this.maxForce = 0.2; // 최대 힘 (방향 전환)
  }

  // 파티클의 물리적 움직임을 계산합니다.
  applyForce(force) {
    this.acc.add(force);
  }

  // 파티클의 위치를 업데이트합니다.
  update() {
    // --- 1. 상호작용: 마우스 피하기 ---
    let mouse = createVector(mouseX, mouseY);
    let d = this.pos.dist(mouse); // 마우스와의 거리
    
    if (d < 80) { // 마우스가 80px 반경 안에 들어오면
      // 마우스 반대 방향으로 밀어내는 힘을 계산합니다.
      let repelForce = p5.Vector.sub(this.pos, mouse);
      repelForce.setMag(5 / d); // 거리가 가까울수록 강하게 밀어냄
      this.applyForce(repelForce);
    }

    // --- 2. 복귀: 원래 위치로 돌아가기 ---
    // 파티클이 원래 위치(home)로 돌아가려는 힘 (스프링처럼)
    let homeForce = p5.Vector.sub(this.home, this.pos);
    homeForce.mult(0.05); // 복귀하는 힘의 세기
    this.applyForce(homeForce);

    // --- 3. 자연스러운 물결 효과 ---
    // Perlin noise를 사용하여 더 자연스럽고 유기적인 움직임을 만듭니다.
    // 각 파티클의 위치와 시간(frameCount)을 기반으로 노이즈 값을 생성하여
    // 부드럽게 변화하는 벡터 필드(흐름)를 만듭니다.
    let noiseScale = 0.005; // 노이즈의 스케일 (값이 작을수록 부드러운 패턴)
    let noiseStrength = 0.1; // 노이즈가 미치는 힘의 강도
    let timeScale = 0.005; // 시간의 흐름에 따른 변화 속도

    // 3D 노이즈를 사용하여 x, y, time을 기반으로 각도를 계산합니다.
    // noise() 결과는 0~1이므로, TWO_PI를 곱해 0~360도 범위의 각도로 변환합니다.
    let angle = noise(this.pos.x * noiseScale, this.pos.y * noiseScale, frameCount * timeScale) * TWO_PI;

    // 계산된 각도로부터 힘 벡터를 생성하고 적용합니다.
    let noiseForce = p5.Vector.fromAngle(angle);
    noiseForce.setMag(noiseStrength);
    this.applyForce(noiseForce);

    // 물리 법칙 적용
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed); // 속도 제한
    this.pos.add(this.vel);
    this.acc.mult(0); // 가속도 초기화

    // 속도를 서서히 줄여 안정화시킵니다. (마찰력/Damping)
    this.vel.mult(0.95);
  }

  // 파티클을 화면에 그립니다.
  show() {
    // 화면 너비에 따라 기본 문자 크기를 다르게 설정합니다.
    let baseSize = (width < 768) ? 24 : 16; // 모바일(768px 미만)에서 더 큰 크기
    let size = baseSize;
    let shakeX = 0; // 기본 흔들림 X
    let shakeY = 0; // 기본 흔들림 Y

    // 모든 파동에 대해 파티클과의 거리를 확인합니다.
    for (let r of ripples) {
      // 최적화: dist() 대신 거리의 제곱을 사용하여 비교합니다.
      let dx = this.pos.x - r.x;
      let dy = this.pos.y - r.y;
      let dSq = dx * dx + dy * dy; // 거리의 제곱

      // 파티클이 파동의 두께 범위 안에 있는지 확인합니다.
      if (dSq > r.radius * r.radius && dSq < (r.radius + r.rippleWidth) * (r.radius + r.rippleWidth)) {
        // 파동의 중심에서 멀어질수록 효과를 감소시킵니다.
        let effect = 1 - (sqrt(dSq) - r.radius) / r.rippleWidth;
        
        // 크기와 흔들림 값을 적용합니다.
        size += 10 * effect; // 최대 10만큼 크기 증가
        shakeX = random(-5, 5) * effect;
        shakeY = random(-5, 5) * effect;
      }
    }

    fill(150, 200, 255); // 파티클 색상 (연한 하늘색)
    noStroke();
    textSize(size); // 계산된 크기 적용
    // 계산된 흔들림 값을 더하여 문자를 그립니다.
    text(this.char, this.pos.x + shakeX, this.pos.y + shakeY);
  }
}