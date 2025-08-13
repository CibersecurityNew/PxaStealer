(() => {
  const canvas = document.getElementById('circuit');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  let width, height;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resize);
  resize();

  const NUM_POINTS = 120;
  const MAX_DIST = 150;

  class Point {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.baseRadius = 2 + Math.random() * 2;
      this.radius = this.baseRadius;
      this.pulse = Math.random() * Math.PI * 2;
      this.hue = 180 + Math.random() * 60; // tons de azul/ciano
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;

      if(this.x < 0 || this.x > width) this.vx *= -1;
      if(this.y < 0 || this.y > height) this.vy *= -1;

      this.pulse += 0.06;
      this.radius = this.baseRadius + Math.sin(this.pulse) * this.baseRadius / 2;
    }
    draw() {
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius*3);
      gradient.addColorStop(0, `hsla(${this.hue}, 100%, 80%, 0.9)`);
      gradient.addColorStop(1, `hsla(${this.hue}, 100%, 50%, 0)`);

      ctx.fillStyle = gradient;
      ctx.shadowColor = `hsla(${this.hue}, 100%, 80%, 0.8)`;
      ctx.shadowBlur = this.radius * 6;

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
      ctx.fill();

      ctx.shadowBlur = 0;
    }
  }

  const points = [];
  for(let i=0; i<NUM_POINTS; i++) {
    points.push(new Point());
  }

  let mouse = {x: null, y: null};
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseout', e => {
    mouse.x = null;
    mouse.y = null;
  });

  function drawLines() {
    for(let i=0; i<NUM_POINTS; i++) {
      const p1 = points[i];
      for(let j=i+1; j<NUM_POINTS; j++) {
        const p2 = points[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if(dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.7;
          const widthLine = 1 + (1 - dist / MAX_DIST) * 2;

          ctx.strokeStyle = `hsla(190, 100%, 75%, ${alpha})`;
          ctx.lineWidth = widthLine;
          ctx.shadowColor = `hsla(190, 100%, 75%, ${alpha})`;
          ctx.shadowBlur = 15 * alpha;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          ctx.shadowBlur = 0;
        }
      }
    }
  }

  function drawMouseConnection() {
    if(mouse.x === null || mouse.y === null) return;

    for(let p of points) {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if(dist < MAX_DIST) {
        const alpha = (1 - dist / MAX_DIST);
        const widthLine = 1 + (1 - dist / MAX_DIST) * 2;

        ctx.strokeStyle = `hsla(190, 100%, 85%, ${alpha})`;
        ctx.lineWidth = widthLine;
        ctx.shadowColor = `hsla(190, 100%, 85%, ${alpha})`;
        ctx.shadowBlur = 25 * alpha;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();

        ctx.shadowBlur = 0;
      }
      // também desenha um ponto brilhante seguindo o mouse
      if(dist < 80) {
        const glowAlpha = (1 - dist / 80);
        const radius = 6 * glowAlpha;

        ctx.fillStyle = `hsla(190, 100%, 90%, ${glowAlpha})`;
        ctx.shadowColor = `hsla(190, 100%, 90%, ${glowAlpha})`;
        ctx.shadowBlur = 20 * glowAlpha;

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, radius, 0, Math.PI*2);
        ctx.fill();

        ctx.shadowBlur = 0;
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    drawLines();

    for(let p of points) {
      p.update();
      p.draw();
    }

    drawMouseConnection();

    requestAnimationFrame(animate);
  }

  animate();

})();