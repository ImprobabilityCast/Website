(function () {
    var canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var ctx = canvas.getContext("2d");

    var ScoreFontSize = canvas.wi;
    if (ScoreFontSize > 600) {
        ScoreFontSize = 600;
    }
    ctx.font = ScoreFontSize + "% PressStart2P";

    const INITIAL_VX = -240; // px per sec
    const INITIAL_VY = 240; // +y is down
    const PADDLE_HEIGHT = 40;
    const BALL_RADIUS = 5;
    const R2 = BALL_RADIUS * BALL_RADIUS;
    const MID_SCREEN_X = canvas.width / 2;

    var ball = newBall();

    var pLeft = {
        deltaY: 0,
        deltaT: 0,
        vel: 0,
        x1: canvas.width / 15,
        x2: canvas.width / 15 + 6,
        y1: canvas.height / 2,
        y2: canvas.height / 2 + PADDLE_HEIGHT
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

    function inVBound(hitbox, hDist, ball) {
        var result = false;

        var topY = hitbox.y1 - ball.y;
        var bottomY = hitbox.y2 - ball.y;

        // handle edges
        result |= R2 >= topY * topY + hDist * hDist ;
        result |= R2 >= bottomY * bottomY + hDist * hDist;

        // handle long flat part
        // Not inluding radius so that near corner bounces
        // don'tact like corner bounces.
        result |= ball.y > hitbox.y1 && ball.y < hitbox.y2

        return result;
    }

    function inHBound(hitbox, vDist, ball) {
        var result = false;

        var leftX = hitbox.x1 - ball.x;
        var rightX = hitbox.x2 - ball.x;

        // handle edges
        result |= R2 >= leftX * leftX + vDist * vDist;
        result |= R2 >= rightX * rightX + vDist * vDist;

        // handle flat part
        // Not inluding radius so that near corner bounces
        // don'tact like corner bounces.
        result |= ball.x > hitbox.x1 && ball.x < hitbox.x2

        return result;
    }

    function checkTopBound(hitbox, ball) {
        var vDist = hitbox.y1 - (ball.y + BALL_RADIUS);
        if (vDist <= 0 && ball.y - hitbox.y1 < BALL_RADIUS) {
            return inHBound(hitbox, vDist, ball);
        } else {
            return false;
        }
    }

    function checkBottomBound(hitbox, ball) {
        var vDist = ball.y - (BALL_RADIUS + hitbox.y2);
        if (vDist <= 0 && hitbox.y2 - ball.y < BALL_RADIUS) {
            return inHBound(hitbox, vDist, ball);
        } else {
            return false;
        }
    }

    function checkRightBound(hitbox, ball) {
        var hDist = ball.x - (hitbox.x2 + BALL_RADIUS);
        if (hDist <= 0 && hitbox.x2 - ball.x < BALL_RADIUS) {
            return inVBound(hitbox, hDist, ball);
        } else {
            return false;
        }
    }

    function checkHitboxes() {
        // idk if this will work over velocity 480 px per sec b/c of how hit box is checked
        var top = checkTopBound(pLeft, ball);
        var bottom = checkBottomBound(pLeft, ball);
        var side = checkRightBound(pLeft, ball);
        if (top || bottom) {
            ball.vy = -ball.vy;
            ball.vy += pLeft.vel;
        }
        if (side) {
            ball.vx = -ball.vx;
            ball.vy += pLeft.vel;
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
        let style = window.getComputedStyle(document.documentElement);
        
        let fStr = style.fontSize;
        fStr = fStr.substr(0, fStr.length - 2);
        draw.shift = parseInt(fStr) * ScoreFontSize / 100;

        let lineStr = style.lineHeight;
        lineStr = lineStr.substr(0, lineStr.length - 2);
        var lineHeight = parseInt(lineStr);
    }

    // eTime is elapsed time in milliseconds
    function updatePosition(eTime) {
        var secs = eTime / 1000;
        ball.x += ball.vx * secs;
        ball.y += ball.vy * secs;
    }

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

    function getDeltaY(e) {
        return [
            e.deltaY,
            e.deltaY * lineHeight,
            e.deltaY * window.innerHeight][e.deltaMode];
    }
    
    function pLeftMove(e) {
        var deltaY = getDeltaY(e);
        pLeft.y1 += deltaY;
        pLeft.y2 += deltaY;

        pLeft.deltaY += deltaY;
        
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
            pLeft.vel = (pLeft.deltaY / pLeft.deltaT) * 1000;
        }
        if ((new Date().getTime() - pLeftMove.lastTime) > 400) {
            pLeft.vel = 0;
            pLeft.deltaY = 0;
            pLeft.deltaT = 0;
        }
    }

    function update(eTime) {
        // move ball
        updatePosition(eTime);

        // move paddles
        updatePVel();

        // check bouncy things
        handleHitWall();
        checkHitboxes(eTime);

        // check win conditions
        checkGameOver();

        // update display
        draw();
    }
    
    window.onwheel = pLeftMove;
    // the # of milliseconds in 1s / 60 = 16.6667
    var thing = setInterval(update, 20, 20);
})();
