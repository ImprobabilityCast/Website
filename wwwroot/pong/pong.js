function pong (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var ctx = canvas.getContext("2d");

    var ScoreFontSize = canvas.width;
    if (ScoreFontSize > 600) {
        ScoreFontSize = 600;
    }
    ctx.font = ScoreFontSize + "% PressStart2P";

    const INITIAL_VX = -400; // px per sec
    const INITIAL_VY = 400; // +y is down
    const PADDLE_HEIGHT = 40;
    const BALL_RADIUS = 5;
    const R2 = BALL_RADIUS * BALL_RADIUS;
    const MID_SCREEN_X = canvas.width / 2;
    const SCORE_COLOR = "#79e";

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

    var p1Score = 0;
    var p2Score = 0;
    
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
        ctx.fillStyle = SCORE_COLOR;
        if (Math.log10(p1Score) == drawScore.p1Spaces
                && (drawScore.p1Spaces + 1) * drawScore.shift < MID_SCREEN_X) {
            drawScore.p1Spaces += 1;
        }
        var p1 = MID_SCREEN_X - (drawScore.shift * drawScore.p1Spaces + window.innerWidth / 15);
        ctx.fillText(p1Score, p1, window.innerHeight / 6,
                MID_SCREEN_X - window.innerWidth / 15);

        if (Math.log10(p2Score) == drawScore.p2Spaces) {
                //&& (drawScore.p2Spaces + 1) * drawScore.shift < MID_SCREEN_X) {
            drawScore.p2Spaces += 1;
        }
        var p2 = window.innerWidth - (drawScore.shift * drawScore.p2Spaces + window.innerWidth / 15);
        ctx.fillText(p2Score, p2, window.innerHeight / 6,
                MID_SCREEN_X - window.innerWidth / 15);
    }
    drawScore.p1Spaces = 1;
    drawScore.p2Spaces = 1;

    function pxStr2Int(str) {
        return parseInt(str.substr(0, str.length - 2));
    }

    {
        let style = window.getComputedStyle(document.documentElement);
        drawScore.shift = pxStr2Int(style.fontSize) * ScoreFontSize / 120;
        var lineHeight = pxStr2Int(style.lineHeight);
    }

    function drawMiddleLine() {
        ctx.beginPath();
        ctx.strokeStyle = SCORE_COLOR;
        ctx.setLineDash([12, 18]);
        ctx.lineWidth = 4;
        ctx.moveTo(MID_SCREEN_X, 0);
        ctx.lineTo(MID_SCREEN_X, canvas.height);
        ctx.stroke();
    }

    function drawBackground() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.fillStyle = "#282828";
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.fill();
    }

    function draw() {
        drawBackground();

        drawScore();
        
        drawMiddleLine();

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

    // eTime is elapsed time in milliseconds
    function updatePosition(eTime) {
        var secs = eTime / 1000;
        ball.x += ball.vx * secs;
        ball.y += ball.vy * secs;
    }

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
        checkHitboxes();

        // check win conditions
        checkGameOver();

        // update display
        draw();
    }
    
    window.onwheel = pLeftMove;
    // the # of milliseconds in 1s / 60 = 16.6667
    var thing = setInterval(update, 20, 20);
}

pong(document.getElementById("canvas"));
