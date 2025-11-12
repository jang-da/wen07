// intro-animation.js

/**
 * 인트로 애니메이션을 관리하는 객체.
 * p5.js의 생명주기(preload, setup, draw)에 맞춰 해당 함수를 호출해야 합니다.
 */
const IntroAnimation = {
  // --- 상태 변수 ---
  font: null,
  messages: [
    "Welcome",
    "2025 졸업전시",
    "CODE의 세계로 당신을 초대합니다"
  ],
  state: 0,       // 현재 메시지 인덱스
  phase: 'forming', // 'forming', 'holding', 'scattering'
  timer: 0,
  finished: false,

  // --- p5.js 생명주기 함수 ---
  preload() {
    this.font = loadFont('https://fonts.gstatic.com/s/notosanskr/v13/PbykFmXiEBPT4ITbgNA5Cgm203T3v7I.woff2');
  },

  setup(particles) {
    textFont(this.font);
    this.startPhase(particles);
  },

  draw(particles) {
    if (this.finished) return;
    this.manage(particles);
  },

  windowResized(particles) {
    if (!this.finished) {
      this.startPhase(particles);
    }
  },

  // --- 핵심 로직 ---
  manage(particles) {
    this.timer++;

    if (this.phase === 'forming' && this.timer > 120) { // 2초 후
      this.phase = 'holding';
      this.timer = 0;
    } else if (this.phase === 'holding' && this.timer > 180) { // 3초 후
      this.phase = 'scattering';
      this.timer = 0;
      for (let p of particles) {
        p.target = null;
      }
    } else if (this.phase === 'scattering' && this.timer > 120) { // 2초 후
      this.state++;
      if (this.state >= this.messages.length) {
        this.finished = true;
        for (let p of particles) {
          p.target = null;
        }
        window.dispatchEvent(new Event('introFinished'));
      } else {
        this.startPhase(particles);
      }
    }
  },

  startPhase(particles) {
    this.phase = 'forming';
    this.timer = 0;

    const message = this.messages[this.state];
    let fontSize, msgWidth;

    if (message.includes("초대합니다")) {
      fontSize = width < 768 ? 30 : 40;
    } else {
      fontSize = width < 768 ? 50 : 80;
    }
    
    textSize(fontSize);
    msgWidth = textWidth(message);

    while (msgWidth > width * 0.9 && fontSize > 10) {
      fontSize -= 2;
      textSize(fontSize);
      msgWidth = textWidth(message);
    }

    const points = this.font.textToPoints(message, width / 2 - msgWidth / 2, height / 2, fontSize, {
      sampleFactor: 0.2,
    });

    for (let i = 0; i < particles.length; i++) {
      if (i < points.length) {
        particles[i].setTarget(points[i].x, points[i].y);
      } else {
        particles[i].target = null;
      }
    }
  }
};