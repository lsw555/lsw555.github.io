(() => {
  const canvas = document.getElementById("particle-canvas");
  const heading = document.getElementById("particle-heading");
  if (!canvas || !heading) return;

  const context = canvas.getContext("2d");
  const mask = document.createElement("canvas");
  const maskContext = mask.getContext("2d", { willReadFrequently: true });
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const labels = ["AI & SOCIETY", "CLIMATE COMMUNICATION", "COMPUTATIONAL NETWORKS"];
  const colors = ["#21677a", "#2d8a87", "#172b3a"];
  let width = 0;
  let height = 0;
  let ratio = 1;
  let shapeIndex = 0;
  let particles = [];
  let targets = [];
  let frameId = 0;
  let morphTimer = 0;

  const random = (min, max) => min + Math.random() * (max - min);

  function prepareMask() {
    mask.width = Math.max(1, Math.round(width));
    mask.height = Math.max(1, Math.round(height));
    maskContext.clearRect(0, 0, width, height);
    maskContext.fillStyle = "#000";
    maskContext.strokeStyle = "#000";
    maskContext.lineCap = "round";
    maskContext.lineJoin = "round";
  }

  function drawAI() {
    const cx = width * 0.5;
    const cy = height * 0.46;
    const scale = Math.min(width, height) / 390;
    maskContext.lineWidth = 10 * scale;
    maskContext.beginPath();
    maskContext.arc(cx, cy - 78 * scale, 42 * scale, 0, Math.PI * 2);
    maskContext.stroke();
    maskContext.beginPath();
    maskContext.moveTo(cx, cy - 36 * scale);
    maskContext.lineTo(cx, cy + 68 * scale);
    maskContext.moveTo(cx, cy - 12 * scale);
    maskContext.lineTo(cx - 72 * scale, cy + 33 * scale);
    maskContext.moveTo(cx, cy - 12 * scale);
    maskContext.lineTo(cx + 70 * scale, cy + 4 * scale);
    maskContext.lineTo(cx + 112 * scale, cy - 22 * scale);
    maskContext.moveTo(cx, cy + 68 * scale);
    maskContext.lineTo(cx - 58 * scale, cy + 125 * scale);
    maskContext.moveTo(cx, cy + 68 * scale);
    maskContext.lineTo(cx + 58 * scale, cy + 125 * scale);
    maskContext.stroke();
    maskContext.beginPath();
    maskContext.moveTo(cx + 112 * scale, cy - 22 * scale);
    maskContext.lineTo(cx + 90 * scale, cy - 31 * scale);
    maskContext.moveTo(cx + 112 * scale, cy - 22 * scale);
    maskContext.lineTo(cx + 98 * scale, cy - 2 * scale);
    maskContext.stroke();
  }

  function drawEarth() {
    const cx = width * 0.5;
    const cy = height * 0.5;
    const radius = Math.min(width, height) * 0.31;
    maskContext.lineWidth = Math.max(7, radius * 0.07);
    maskContext.beginPath();
    maskContext.arc(cx, cy, radius, 0, Math.PI * 2);
    maskContext.stroke();
    maskContext.lineWidth *= 0.62;
    maskContext.beginPath();
    maskContext.ellipse(cx, cy, radius * 0.46, radius, 0, 0, Math.PI * 2);
    maskContext.moveTo(cx - radius, cy);
    maskContext.lineTo(cx + radius, cy);
    maskContext.stroke();
    maskContext.beginPath();
    maskContext.ellipse(cx - radius * 0.25, cy - radius * 0.2, radius * 0.2, radius * 0.28, -0.55, 0, Math.PI * 2);
    maskContext.ellipse(cx + radius * 0.3, cy + radius * 0.22, radius * 0.27, radius * 0.19, 0.55, 0, Math.PI * 2);
    maskContext.fill();
  }

  function drawNetwork() {
    const nodes = [
      [0.23, 0.33], [0.43, 0.22], [0.68, 0.3], [0.77, 0.56],
      [0.54, 0.7], [0.28, 0.66], [0.48, 0.47]
    ];
    const links = [[0,1],[0,5],[0,6],[1,2],[1,6],[2,3],[2,6],[3,4],[3,6],[4,5],[4,6],[5,6]];
    const scale = Math.min(width, height);
    maskContext.lineWidth = Math.max(5, scale * 0.018);
    maskContext.beginPath();
    links.forEach(([from, to]) => {
      maskContext.moveTo(nodes[from][0] * width, nodes[from][1] * height);
      maskContext.lineTo(nodes[to][0] * width, nodes[to][1] * height);
    });
    maskContext.stroke();
    nodes.forEach(([x, y], index) => {
      maskContext.beginPath();
      maskContext.arc(x * width, y * height, (index === 6 ? 18 : 13) * scale / 390, 0, Math.PI * 2);
      maskContext.fill();
    });
  }

  function sampleShape(index) {
    prepareMask();
    [drawAI, drawEarth, drawNetwork][index]();
    const pixels = maskContext.getImageData(0, 0, mask.width, mask.height).data;
    const step = Math.max(8, Math.round(Math.min(width, height) / 42));
    const points = [];
    for (let y = step; y < height - step; y += step) {
      for (let x = step; x < width - step; x += step) {
        if (pixels[(Math.floor(y) * mask.width + Math.floor(x)) * 4 + 3] > 80) {
          points.push({ x, y });
        }
      }
    }
    return points.sort(() => Math.random() - 0.5).slice(0, 520);
  }

  function setShape(index, immediate = false) {
    shapeIndex = index;
    targets = sampleShape(index);
    heading.style.opacity = "0";
    window.setTimeout(() => {
      heading.textContent = labels[index];
      heading.style.opacity = "1";
    }, reduceMotion ? 0 : 180);

    while (particles.length < targets.length) {
      particles.push({
        x: random(0, width),
        y: random(0, height),
        vx: 0,
        vy: 0,
        char: Math.random() > 0.5 ? "1" : "0",
        alpha: 0
      });
    }
    particles.forEach((particle, i) => {
      const target = targets[i % Math.max(1, targets.length)] || { x: width / 2, y: height / 2 };
      particle.tx = target.x;
      particle.ty = target.y;
      particle.color = colors[index];
      particle.active = i < targets.length;
      if (immediate) {
        particle.x = target.x;
        particle.y = target.y;
        particle.alpha = particle.active ? 0.9 : 0;
      }
    });
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(280, rect.width);
    height = Math.max(260, rect.height);
    ratio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    setShape(shapeIndex, true);
  }

  function render() {
    context.clearRect(0, 0, width, height);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = `600 ${Math.max(8, Math.min(11, width / 52))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    particles.forEach((particle) => {
      const spring = reduceMotion ? 1 : 0.035;
      particle.vx = (particle.vx + (particle.tx - particle.x) * spring) * 0.82;
      particle.vy = (particle.vy + (particle.ty - particle.y) * spring) * 0.82;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.alpha += ((particle.active ? 0.88 : 0) - particle.alpha) * 0.08;
      if (particle.alpha < 0.02) return;
      context.globalAlpha = particle.alpha;
      context.fillStyle = particle.color;
      context.fillText(particle.char, particle.x, particle.y);
    });
    context.globalAlpha = 1;
    if (!reduceMotion) frameId = requestAnimationFrame(render);
  }

  function startMorphing() {
    if (reduceMotion) return;
    morphTimer = window.setInterval(() => setShape((shapeIndex + 1) % 3), 4800);
  }

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 120);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(frameId);
      window.clearInterval(morphTimer);
    } else if (!reduceMotion) {
      render();
      startMorphing();
    }
  });

  resize();
  render();
  startMorphing();
})();
