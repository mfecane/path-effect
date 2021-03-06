import mouse from "js/mouse";
import { mapclamp } from "js/lib";

import svgfile from "assets/svg/svg-low.svg";
import loadSvg from "js/svg/read";
import tweakshapes from "js/svg/tweakshapes";

let canvas;
let ctx;
const time = { start: Date.now(), current: 0, duration: 2.0, loop: 6 };
const size = { w: 0, h: 0, cx: 0, cy: 0 };
let points;
let shapes;

class Shape {
  constructor(points) {
    this.points = points;
    this.start = 0;
    this.end = 1.0;
    this.width = 5;
    this.drawn = 0;
    this.color = `rgba(255,255,255,1)`;
  }

  draw(t) {
    if (t < this.start) {
      return;
    }
    t = (t - this.start) / (this.end - this.start);
    let i = Math.floor((this.points.length - 1) * t);
    for (let j = this.drawn; j < i; ++j) {
      let w = this.calculateWidth(j);
      const color = this.color;
      color = "white";
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(
        size.cx + this.points[j].x,
        this.points[j].y,
        w,
        0,
        Math.PI * 2,
        true
      );
      // symmetry
      ctx.arc(
        size.cx - this.points[j].x,
        this.points[j].y,
        w,
        0,
        Math.PI * 2,
        true
      );
      ctx.fill();
    }
    this.drawn = i;
  }

  calculateWidth(j) {
    let w = j / (this.points.length - 1);
    w = -w * (w - 1);
    return mapclamp(w, 0, 1 / 4, 1, this.width);
  }
}

const handleShapes = function () {
  shapes.forEach((el) => {
    function easeOutCubic(x) {
      return 1 - Math.pow(1 - x, 3);
    }
    let t = time.current / time.duration;
    t = t > 1 ? 1 : t;
    t = easeOutCubic(t);
    el.draw(t);
  });
};

const setCanvasSize = function () {
  size.w = canvas.width = window.innerWidth;
  size.h = canvas.height = window.innerHeight;
  size.cx = size.w / 2;
  size.cy = size.h / 2;
};

const init = function () {
  canvas = document.createElement(`canvas`);
  document.body.appendChild(canvas);
  canvas.id = "canvas";
  ctx = canvas.getContext("2d");

  setCanvasSize();
  window.addEventListener(`resize`, () => {
    resetTime();
    resetCanvas();
    setCanvasSize();
  });

  points = loadSvg(svgfile);
  createShapes();
  return this;
};

const createShapes = function () {
  shapes = points.map((el, index) => {
    let overwrite = {};
    if (tweakshapes[index]) {
      overwrite = tweakshapes[index];
    }
    let shape = new Shape(el);
    Object.assign(shape, overwrite);
    return shape;
  });
};

const resetCanvas = function () {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, size.w, size.h);
};

const handleTime = function (resetCallback) {
  time.current = (Date.now() - time.start) / 1000.0;
  if (time.current > time.loop) {
    resetCallback();
    resetTime();
  }
};

const resetTime = function () {
  time.start = Date.now();
  time.current = (Date.now() - time.start) / 1000.0;
};

const animate = function () {
  handleTime(resetCanvas);
  handleShapes();
  window.requestAnimationFrame(animate);
};

window.onload = () => {
  init();
  animate();
};
