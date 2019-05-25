var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var ctx = canvas.getContext("2d");

const INITIAL_VX = -120; // px per sec
const INITIAL_VY = 120; // +y is down

var ball = {
    x: window.innerWidth / 2, // spawn ball in middle of top of window
    y: 0,
    vx: INITIAL_VX,
    vy: INITIAL_VY
}

function handleHitWall(ball) {

    while (true) {
        if (ball.x < 0) {
            ball.x = -ball.x;
            ball.vx = -ball.vx;
            continue;
        }
        if (ball.x > canvas.width) {
            ball.x -= 2 * (ball.x - canvas.width);
            ball.vx = -ball.vx;
            continue;
        }
        if (ball.y < 0) {
            ball.y = -ball.y;
            ball.vy = -ball.vy;
            continue;
        }
        if (ball.y > canvas.height) {
            ball.y -=  2 * (ball.y - canvas.height);
            ball.vy = -ball.vy;
            continue;
        }
        break;
    }
}

function draw(ball) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 5, 0, 360); 
    ctx.fill();
}

function updatePosition(ball) {
    var time = new Date().getTime();
    var et = (time - updatePosition.lastTime) / 1000;
    ball.x += ball.vx * et;
    ball.y += ball.vy * et;
    handleHitWall(ball)
    draw(ball);
    updatePosition.lastTime = time;
}

updatePosition.lastTime = new Date().getTime();

var thing = setInterval(updatePosition, 16.6667, ball); // the # of milliseconds in 1s / 60
