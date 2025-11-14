// DOM 콘텐츠가 모두 로드되면 스크립트 실행
gsap.set(["#panelTop", "#panelBottom"], { yPercent: 0 });
        // 1단계 텍스트 (왼쪽 상단)
    gsap.set(["#text1", "#text2"], { opacity: 0, y: -20 });
    
    // 2단계 텍스트 (중앙)
    gsap.set(["#textContainer", "#codeText", "#slashText", "#projectText"], { opacity: 0 });
    
    // 로딩 UI (중앙)
    gsap.set(["#loadingContainer", "#loadingPercentage"], { opacity: 0 });
    gsap.set("#loadingBar", { scaleX: 0 });
    // 텍스트 이동 거리를 동적으로 계산하기 위해 요소 참조
    const panelTop = document.getElementById('panelTop'); // panelTop 참조 (계산용)
    const codeText = document.getElementById('codeText');
    const projectText = document.getElementById('projectText');

    
    // 2. GSAP 타임라인 생성
    const tl = gsap.timeline();
    
    // 3. 타임라인에 애니메이션 추가
    
    // (1) 1단계: 왼쪽 상단 텍스트 나타나기
    tl.to(["#text1", "#text2"], {
        duration: 0.8,
        opacity: 1,
        y: 0,
        ease: "power2.out",
        stagger: 0.3
    });

        // (2) 2단계: 중앙 텍스트 및 로딩 UI 나타나기
    tl.to(["#textContainer", "#loadingContainer", "#loadingPercentage"], {
        opacity: 1,
        duration: 0.8
    }, "+=1.5").addLabel("step3start"); // 1단계 텍스트 나타난 후 1.5초 뒤, 레이블 추가

        // (3) 2단계: 텍스트 좌우 이동
    tl.to(codeText, {
        duration: 1,
        x: () => {
            const panelWidth = panelTop.offsetWidth;
            const textWidth = codeText.offsetWidth;
            const padding = 64; 
            return -(panelWidth / 2 - textWidth / 2 - padding);
        },
        ease: "power3.inOut"
    }, "step3start+=0.2"); // 2단계 UI가 나타나고 0.2초 뒤

        tl.to(projectText, {
        duration: 1,
        x: () => {
            const panelWidth = panelTop.offsetWidth;
            const textWidth = projectText.offsetWidth;
            const padding = 64;
            return panelWidth / 2 - textWidth / 2 - padding;
        },
        ease: "power3.inOut"
    }, "<"); // codeText와 동시에
    
    // (4) 2단계: 로딩 애니메이션 (숫자와 바)
    const counter = { value: 0 };
    tl.to(counter, {
        value: 100,
        duration: 1,
        ease: 'power1.inOut',
        onUpdate: () => {
            document.getElementById('loadingPercentage').textContent = `(${Math.round(counter.value)}%)`;
        }
    }, "<"); // 텍스트 이동과 동시에

        tl.to("#loadingBar", {
        scaleX: 1,
        duration: 1,
        ease: "power1.inOut"
    }, "<").addLabel("loadingDone"); // 카운터와 동시에 시작, 완료 지점

        // (5) 3단계: 로딩 UI 숨기기
    tl.to(["#loadingContainer", "#loadingPercentage"], {
        duration: 0.2,
        opacity: 0,
        ease: "power1.in",
        onComplete: () => {
            gsap.set(["#loadingContainer", "#loadingPercentage"], { display: 'none' });
        }
    }, "loadingDone"); // 로딩 완료 시점

        // (6) 4단계: 패널 열기
    const lastAnimationStartTime = "loadingDone+=0.2"; // 로딩 UI 사라지고 0.2초 뒤

        tl.to("#textContainer", {
        duration: 1.2,
        yPercent: -100,
        ease: "power3.inOut"
    }, lastAnimationStartTime);

        tl.to("#panelTop", {
        duration: 1.2,
        yPercent: -100,
        ease: "power3.inOut"
    }, lastAnimationStartTime);

    tl.to("#panelBottom", {
        duration: 1.2,
        yPercent: 100,
        ease: "power3.inOut",
        onComplete: () => {
            document.getElementById('intro-container').style.display = 'none';
            document.getElementById('main-content').style.display = 'block';
            document.body.style.overflow = 'auto'; // 애니메이션 후 스크롤 허용
            if (typeof windowResized === 'function') {
                windowResized();
            }
        }
    }, lastAnimationStartTime);
