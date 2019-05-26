(function () {
    var canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var ctx = canvas.getContext("2d");

    var ScoreFontSize = window.innerWidth;
    if (ScoreFontSize > 600) {
        ScoreFontSize = 600;
    }
    ctx.font = ScoreFontSize + "% PressStart2P";

    const INITIAL_VX = -180; // px per sec
    const INITIAL_VY = 180; // +y is down
    const PADDLE_HEIGHT = 40;
    const BALL_RADIUS = 5;
    const MID_SCREEN_X = window.innerWidth / 2;

    var ball = newBall();

    var pLeft = {
        deltaY: 0,
        deltaT: 0,
        vel: 0,
        x1: window.innerWidth / 15,
        x2: window.innerWidth / 15 + 8,
        y1: window.innerHeight / 2,
        y2: window.innerHeight / 2 + PADDLE_HEIGHT
    };

    var p1Score = 100;
    var p2Score = 98;
    
    function newBall() {
        return {
            x: MID_SCREEN_X, // spawn ball in middle of top of window
            y: 0,
            vx: INITIAL_VX,
            vy: INITIAL_VY
        };
    }

    function inBackHitbox(hitbox, ball) {
        var lowerDist = (hitbox.y2 - ball.y) * (hitbox.y2 - ball.y)
            + (hitbox.x1 - ball.x) * (hitbox.x1 - ball.x);
        var upperDist = (hitbox.y1 - ball.y) * (hitbox.y1 - ball.y)
            + (hitbox.x1 - ball.x) * (hitbox.x1 - ball.x);
        return lowerDist < BALL_RADIUS * BALL_RADIUS
            || upperDist < BALL_RADIUS * BALL_RADIUS;
    }

    function inFrontHitbox(hitbox, ball) {
        var lowerDist = (hitbox.y2 - ball.y) * (hitbox.y2 - ball.y)
            + (hitbox.x2 - ball.x) * (hitbox.x2 - ball.x);
        var upperDist = (hitbox.y1 - ball.y) * (hitbox.y1 - ball.y)
            + (hitbox.x2 - ball.x) * (hitbox.x2 - ball.x);
        return lowerDist < BALL_RADIUS * BALL_RADIUS
            || upperDist < BALL_RADIUS * BALL_RADIUS;
    }

    function checkHitboxes() {
        // idk if this will work over velocity 480 px per sec b/c of how hit box is checked
        if (inFrontHitbox(pLeft, ball)) {
            //ball.x += 2 * (pLeft.x2 - ball.x);
            ball.vx = -ball.vx;
            ball.vy += pLeft.vel;
        }
        if (inBackHitbox(pLeft, ball)) {
            if (pLeft.vel == 0) {
                ball.vy *= -1;
            } else if (pLeft.vel < 0 == ball.vy < 0) {
                ball.vy += pLeft.vel;
            } else {
                ball.vy = (ball.vy - pLeft.vel) * -1;
            }
        }
    }

    function handleHitWall() {

        while (true) {
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

    function checkGameOver() {
        if (ball.x < 0) {
            p2Score += 1;
            ball = newBall();
        } else if (ball.x > canvas.width) {
            p1Score += 1;
            ball = newBall();
        }
    }

    function drawScore() {
        ctx.beginPath();
        ctx.fillStyle = "#79e";
        if (Math.log10(p1Score) == draw.p1Spaces
                && (draw.p1Spaces + 1) * draw.shift < MID_SCREEN_X) {
            draw.p1Spaces += 1;
        }
        var p1 = MID_SCREEN_X - (draw.shift * draw.p1Spaces + window.innerWidth / 15);
        ctx.fillText(p1Score, p1, window.innerHeight / 6,
                MID_SCREEN_X - window.innerWidth / 15);

        if (Math.log10(p2Score) == draw.p2Spaces
                && (draw.p2Spaces + 1) * draw.shift < MID_SCREEN_X) {
            draw.p2Spaces += 1;
        }
        var p2 = window.innerWidth - (draw.shift * draw.p2Spaces + window.innerWidth / 15);
        ctx.fillText(p2Score, p2, window.innerHeight / 6,
                MID_SCREEN_X - window.innerWidth / 15);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.fillStyle = "#282828";
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.fill();

        drawScore();

        // draw dividing line

        // draw ball
        ctx.beginPath();
        ctx.fillStyle = "#eee";
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, 360);
        ctx.fill();

        // draw player 1
        ctx.rect(pLeft.x1, pLeft.y1,
                pLeft.x2 - pLeft.x1, pLeft.y2 - pLeft.y1);
        ctx.fill();

        // draw player 2
    }

    draw.p1Spaces = 3;
    draw.p2Spaces = 2;
    {
        let fStr = window.getComputedStyle(document.documentElement).fontSize;
        fStr = fStr.substr(0, fStr.length - 2);
        draw.shift = parseInt(fStr) * ScoreFontSize / 100;
    }

    function updatePosition() {
        var time = new Date().getTime();
        var et = (time - updatePosition.lastTime) / 1000;
        ball.x += ball.vx * et;
        ball.y += ball.vy * et;
        handleHitWall();

        checkHitboxes();
        checkGameOver();

        draw();
        updatePosition.lastTime = time;
        console.log(ball.vy);
    }

    updatePosition.lastTime = new Date().getTime();


    // function repeatPress(e) {
    //     if (e.repeat) {
    //         pLeft.y1 -= 5;
    //         pLeft.y2 -= 5;
    //         setTimeout(repeatPress, 200, e);
    //     }
    // }

    // window.onkeypress = function (e) {
    //     switch (e.key) {
    //         case "w":
    //             pLeft.y1 -= 5; // up is negative
    //             pLeft.y2 -= 5;
    //             repeatPress(e);
    //     }
    // };

    // window.onkeyup = function (e) {

    // };
    
    function pLeftMove(e) {
        pLeft.y1 += e.deltaY * 10;
        pLeft.y2 += e.deltaY * 10;

        pLeft.deltaY += e.deltaY * 10;
        
        var time = new Date().getTime();
        pLeft.deltaT += time - pLeftMove.lastTime;
        pLeftMove.lastTime = time;
        
        if (pLeft.y1 < 0) {
            pLeft.y1 = 0;
            pLeft.y2 = PADDLE_HEIGHT;
        }
        if (pLeft.y2 > canvas.height) {
            pLeft.y1 = canvas.height - PADDLE_HEIGHT;
            pLeft.y2 = canvas.height;
        }
    };

    pLeftMove.lastTime = new Date().getTime();

    function updatePVel() {
        if (pLeft.deltaT > 0) {
            pLeft.vel = (pLeft.deltaY / pLeft.deltaT) * 3000;
        }
        if ((new Date().getTime() - pLeftMove.lastTime) > 400) {
            pLeft.vel = 0;
            pLeft.deltaY = 0;
            pLeft.deltaT = 0;
        }
    }
    
    window.onwheel = pLeftMove;
    setInterval(updatePVel, 300);
    var thing = setInterval(updatePosition, 16.6667, ball); // the # of milliseconds in 1s / 60
})();
