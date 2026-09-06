document.querySelectorAll('.big-copy').forEach((el) => {
  el.textContent = '还没有 AI 工作经历，但我已经开始用 AI 工具做事。';
});

document.querySelectorAll('.photo-collage img').forEach((image) => {
  if (image.src.includes('2025-11-01%20150823.jpg')) { image.remove(); return; }
  if (image.parentElement?.tagName === 'A') return;
  const link = document.createElement('a');
  link.href = image.src; link.target = '_blank'; link.rel = 'noreferrer';
  image.parentNode.insertBefore(link, image); link.appendChild(image);
});

const hero = document.querySelector('.hero');
if (hero) {
  const oldVisual = hero.querySelector('.avatar-stage');
  if (oldVisual) oldVisual.outerHTML = `<div class="hero-visual">
    <div class="video-stage">
      <video id="fold-video" muted playsinline preload="auto"><source src="首页互动视频.mp4?v=20260905-3" type="video/mp4"></video>
    </div>
    <div class="hand-console">
      <div class="camera-frame"><video id="hand-camera" autoplay playsinline muted></video><canvas id="hand-canvas"></canvas><span class="camera-label">LIVE HAND TRACKING</span></div>
      <div class="gesture-status"><span id="gesture-label">正在加载手势识别</span><small>张开手掌 · 聚拢手指</small></div>
    </div>
  </div>`;
}

const style = document.createElement('style');
style.textContent = `@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
body{font-family:Manrope,Arial,'Microsoft YaHei',sans-serif}.hero{position:relative}.hero-copy{grid-column:1/7;z-index:2}.hero-visual{grid-column:7/13;height:calc(100vh - 118px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px}.video-stage{position:relative;width:min(720px,50vw);height:min(610px,61vh);display:flex;align-items:center;justify-content:center;background:#fff;overflow:hidden}.video-stage video{position:absolute;opacity:0;pointer-events:none}.video-stage #portrait-canvas{display:block;width:100%;height:100%;object-fit:contain}.hand-console{width:min(720px,50vw);display:flex;align-items:center;justify-content:center;gap:20px}.camera-frame{width:220px;height:124px;position:relative;background:#111;overflow:hidden}.camera-frame video,.camera-frame canvas{position:absolute;width:100%;height:100%;object-fit:cover;transform:scaleX(-1)}.camera-frame canvas{z-index:1}.camera-label{position:absolute;z-index:2;left:10px;top:8px;color:#fff;font:600 8px Manrope,sans-serif;letter-spacing:.12em}.gesture-status{min-width:180px;display:grid;gap:6px;font-size:12px}.gesture-status small{font-size:10px;color:#666}@media(max-width:850px){.hero-visual{height:auto;margin-top:40px}.video-stage,.hand-console{width:100%}.video-stage{height:430px}.hero-copy{grid-column:auto}}`;
document.head.appendChild(style);
const fullPortraitStyle=document.createElement('style');fullPortraitStyle.textContent='.video-stage video{position:static!important;opacity:1!important;display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;filter:none!important;mix-blend-mode:normal!important}';document.head.appendChild(fullPortraitStyle);

const foldVideo = document.querySelector('#fold-video');
const portraitCanvas = null;
const cameraVideo = document.querySelector('#hand-camera');
const handCanvas = document.querySelector('#hand-canvas');
const gestureLabel = document.querySelector('#gesture-label');

function renderPortrait() {
  if (!foldVideo?.videoWidth || !portraitCanvas) return;
  if (portraitCanvas.width !== foldVideo.videoWidth) {
    portraitCanvas.width = foldVideo.videoWidth; portraitCanvas.height = foldVideo.videoHeight;
  }
  const ctx = portraitCanvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(foldVideo, 0, 0);
  const frame = ctx.getImageData(0, 0, portraitCanvas.width, portraitCanvas.height);
  const pixels = frame.data, width = portraitCanvas.width, height = portraitCanvas.height;
  const seen = new Uint8Array(width * height), queue = [];
  const eligible = (index) => { const i=index*4,max=Math.max(pixels[i],pixels[i+1],pixels[i+2]),min=Math.min(pixels[i],pixels[i+1],pixels[i+2]);return min>105&&max-min<38; };
  const add = (index) => { if(index>=0&&index<seen.length&&!seen[index]&&eligible(index)){seen[index]=1;queue.push(index);} };
  for(let x=0;x<width;x++){add(x);add((height-1)*width+x);}for(let y=0;y<height;y++){add(y*width);add(y*width+width-1);}
  for(let q=0;q<queue.length;q++){const n=queue[q],x=n%width,y=(n/width)|0;if(x)add(n-1);if(x<width-1)add(n+1);if(y)add(n-width);if(y<height-1)add(n+width);}
  queue.forEach(index=>{const i=index*4;pixels[i]=pixels[i+1]=pixels[i+2]=255;});
  ctx.putImageData(frame, 0, 0);
}
// The replacement video already has a white background, so no pixel masking is applied.

function loadScript(src) {
  return new Promise((resolve, reject) => { const script = document.createElement('script'); script.src = src; script.onload = resolve; script.onerror = reject; document.head.appendChild(script); });
}

async function initHands() {
  if (!foldVideo || !cameraVideo || !handCanvas || window.__handsStarted) return;
  window.__handsStarted = true;
  if (!window.Hands) {
    await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
    await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
    await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
  }
  const ctx = handCanvas.getContext('2d');
  const hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
  hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: .65, minTrackingConfidence: .6 });
  let targetProgress = 0, currentProgress = 0, hasHand = false, lastSeek = 0;
  hands.onResults((results) => {
    handCanvas.width = cameraVideo.videoWidth || 640; handCanvas.height = cameraVideo.videoHeight || 360;
    ctx.clearRect(0, 0, handCanvas.width, handCanvas.height);
    const hand = results.multiHandLandmarks?.[0]; hasHand = Boolean(hand);
    if (!hand) { gestureLabel.textContent = '未检测到手 · 保持画面'; return; }
    drawConnectors(ctx, hand, HAND_CONNECTIONS, { color: '#fff', lineWidth: 3 });
    drawLandmarks(ctx, hand, { color: '#fff', lineWidth: 1, radius: 3 });
    const wrist = hand[0], tips = [8, 12, 16, 20], bases = [5, 9, 13, 17];
    const extension = tips.reduce((sum, tip, i) => sum + Math.hypot(hand[tip].x - wrist.x, hand[tip].y - wrist.y) / Math.max(.01, Math.hypot(hand[bases[i]].x - wrist.x, hand[bases[i]].y - wrist.y)), 0) / 4;
    targetProgress = Math.max(0, Math.min(1, (1.58 - extension) / .58));
    if (extension > 1.5) targetProgress = 0;
    gestureLabel.textContent = targetProgress > .55 ? '手指聚拢 / 握拳' : '手掌张开';
  });
  const syncVideo = () => {
    if (hasHand && foldVideo.duration) {
      currentProgress += (targetProgress - currentProgress) * .42;
      const time = currentProgress * Math.max(0, foldVideo.duration - .02);
      const now=performance.now();if(now-lastSeek>32&&Math.abs(foldVideo.currentTime-time)>.008){foldVideo.currentTime=time;lastSeek=now;}
    }
    requestAnimationFrame(syncVideo);
  };
  syncVideo();
  const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 }, audio: false });
  cameraVideo.srcObject = stream; await cameraVideo.play();
  const camera = new Camera(cameraVideo, { onFrame: async () => hands.send({ image: cameraVideo }), width: 640, height: 360 });
  camera.start();
}

initHands().catch(() => { if (gestureLabel) gestureLabel.textContent = '摄像头或手势识别不可用'; window.__handsStarted = false; });
