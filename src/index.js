const radian = (degrees) => Math.PI / 180 * degrees;

const arcPos = (centerX, centerY, radius, degrees) =>
  ({
    x: centerX + Math.sin(radian(degrees)) * radius,
    y: centerY - Math.cos(radian(degrees)) * radius
  })

class Layer {
  constructor(canvasSelector, is_animated) {
    this.canvas = document.querySelector(canvasSelector);
    this.is_animated = is_animated;
    this.ctx = undefined;
    this.initCanvas();
    this.objects = [];
  }

  initCanvas() {
    if (this.canvas.getContext) {
      this.ctx = this.canvas.getContext('2d');

    } else {
      console.log('Canvas is not supported on this browser.');
      return false;
    }
  }

  addObject(obj, posX, posY) {
    this.objects.push({obj, posX, posY});
  }

  render() {
    if (this.is_animated) {
      this.clear();
      requestAnimationFrame(this.render.bind(this));
    }
    this.objects.forEach(item => item.obj.render(this.ctx, item.posX, item.posY));
  }

  clear() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }
}


class Grid {
  constructor({gap = 10, strokeStyle = '#ddd', lineWidth = 0.5}) {
    Object.assign(this, {gap, strokeStyle, lineWidth});
  }

  draw(ctx, posX, posY) {
    let w = ctx.canvas.width;
    let h = ctx.canvas.height;

    ctx.lineWidth = this.lineWidth;
    ctx.strokeStyle = this.strokeStyle;

    for (let x = 0; x <= w; x = x + this.gap) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    for (let y = 0; y <= h; y = y + this.gap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  render(ctx, posX, posY) {
    this.draw(ctx, posX, posY);
  }
}

class Triangle {
  constructor({posX = 0,
               posY = 0,
               radius = 100,
               angle = 0,
               color = "rgba(255,255,0,.3)",
               lineWidth = 1,
               strokeStyle = "#000",
               rotationSpeed = 0,
               showGuides = false })
  {
    Object.assign(this, {posX, posY, radius, angle, rotationSpeed, showGuides, color, lineWidth, strokeStyle});
  }

  trianglePoints(centerX, centerY, radius, rotation) {
    return ({
      a: arcPos(centerX, centerY, radius, rotation),
      b: arcPos(centerX, centerY, radius, rotation + 120),
      c: arcPos(centerX, centerY, radius, rotation + 240)
    });
  }

  drawGuides(ctx, posX, posY) {
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'red';

    // mark center
    ctx.moveTo(posX, posY);
    ctx.beginPath();
    ctx.arc(posX, posY, 2, 0, Math.PI * 2);
    ctx.stroke();

    // draw circle
    ctx.beginPath();
    ctx.arc(posX, posY, this.radius, 0, Math.PI * 2);
    ctx.stroke();

    // draw radial marks
    for (let deg = 0; deg <= 360; deg = deg + 30) {
      let rp = arcPos(posX, posY, this.radius, deg);
      ctx.moveTo(rp.x, rp.y);
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  draw(ctx, posX, posY) {
    let {a, b, c} = this.trianglePoints(posX, posY, this.radius, this.angle);

    ctx.lineWidth = this.lineWidth;
    ctx.strokeStyle = this.strokeStyle;
    ctx.fillStyle = this.color;

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.lineTo(a.x, a.y);
    ctx.stroke();
    ctx.fill();
  }

  update() {
    this.angle = (this.angle + this.rotationSpeed) % 360;
  }

  render(ctx, posX, posY) {
    this.draw(ctx, posX, posY);
    this.showGuides && this.drawGuides(ctx, posX, posY);
    this.update();
  }
}

bgLayer = new Layer('#background-layer');
bgLayer.addObject(new Grid({}), 0, 0);
bgLayer.render();

fgLayer = new Layer('#game-layer', true);
fgLayer.addObject(new Triangle({radius: 200, angle: 0, rotationSpeed: 0.25, showGuides: true }), 250, 250);
fgLayer.addObject(new Triangle({radius: 100, angle: 180, rotationSpeed: -1 }), 250, 250);
fgLayer.addObject(new Triangle({radius: 50, angle: 0, rotationSpeed:  1 }), 250, 250);
fgLayer.addObject(new Triangle({radius: 25, angle: 180, rotationSpeed: -2 }), 250, 250);
fgLayer.addObject(new Triangle({radius: 12.5, angle: 0, rotationSpeed: 3 }), 250, 250);
fgLayer.render();
