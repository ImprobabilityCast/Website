function pong (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var ctx = canvas.getContext("2d");

    var ScoreFontSize = canvas.width;
    if (ScoreFontSize > 600) {
        ScoreFontSize = 600;
    }
    ctx.font = ScoreFontSize + "% PressStart2P";

    const INITIAL_VX = - canvas.width / 2; // px per sec
    const INITIAL_VY = canvas.height / 2; // +y is down
    const PADDLE_HEIGHT = 40
    const HALF_PADDLE_HEIGHT = PADDLE_HEIGHT / 2;
    const BALL_RADIUS = 4;
    const MID_SCREEN_X = canvas.width / 2;
    const SCORE_COLOR = "#79e";

    var ball = newBall();
    var pLeft = newPlayerLeft();

    var p1Score = 0;
    var p2Score = 0;

    // the # of milliseconds in 1s / 60 = 16.6667
    var interval = setInterval(update, 20, 20);
    
    function newBall() {
        return {
            x: MID_SCREEN_X, // spawn ball in middle of top of window
            y: canvas.height,
            vx: INITIAL_VX,
            vy: INITIAL_VY
        };
    }

    function newPlayerLeft() {
        return {
            deltaY: 0,
            deltaT: 0,
            vel: 0,
            x1: canvas.width / 15,
            x2: canvas.width / 15 + 8,
            y1: canvas.height / 2 - HALF_PADDLE_HEIGHT,
            y2: canvas.height / 2 + HALF_PADDLE_HEIGHT
        };
    }

    function getXIntercept(yLine, coords) {
        var deltaY = yLine - coords.y;
        var deltaT = deltaY / ball.vy;
        return coords.x + deltaT * ball.vx;
    }

    function getYIntercept(xLine, coords) {
        var deltaX = xLine - coords.x;
        var deltaT = deltaX / ball.vx
        return coords.y + deltaT * ball.vy;
    }

    function doRangesIntersect(start1, end1, start2, end2) {
        return (start2 <= start1 && end2 >= start1) // check if ranges overlap
            || (start2 >= start1 && end2 <= start1)
            || (start2 <= end1 && end2 >= end1)
            || (start2 >= end1 && end2 <= end1)
            || (start2 >= start1 && end2 <= end1) // check if one range inside other
            || (start2 <= start1 && end2 >= end1);
    }

    function checkTopBound(hitbox, ballLeft, ballRight, oldLeft, oldRight) {
        if ((hitbox.y1 < ballLeft.y && hitbox.y1 > oldLeft.y)
                || (hitbox.y1 < ballRight.y && hitbox.y1 > oldRight.y)) {
            console.log("crossed top bound");
            var intLeft = getXIntercept(hitbox.y1, oldLeft);
            var intRight = getXIntercept(hitbox.y1, oldRight);
            return doRangesIntersect(hitbox.x1, hitbox.x2, intLeft, intRight);
        }
        return false;
    }

    function checkBottomBound(hitbox, ballLeft, ballRight, oldLeft, oldRight) {
        if ((hitbox.y2 < oldLeft.y && hitbox.y2 > ballLeft.y)
                || (hitbox.y2 < oldRight.y && hitbox.y2 > ballRight.y)) {
            console.log("crossed bottom bound");
            var intLeft = getXIntercept(hitbox.y2, oldLeft);
            var intRight = getXIntercept(hitbox.y2, oldRight);
            return doRangesIntersect(hitbox.x1, hitbox.x2, intLeft, intRight);
        }
        return false;
    }

    function checkRightBound(hitbox, ballLeft, ballRight, oldLeft, oldRight) {
        if ((hitbox.x2 < oldLeft.x && hitbox.x2 > ballLeft.x)
                || (hitbox.x2 < oldRight.x && hitbox.x2 > ballRight.x)) {
            console.log("crossed right bound");
            var intLeft = getYIntercept(hitbox.x2, oldLeft);
            var intRight = getYIntercept(hitbox.x2, oldRight);
            return doRangesIntersect(hitbox.y1, hitbox.y2, intLeft, intRight)
        }
        return false;
    }

    function checkHitboxes(oldBall) {
        var hyp = Math.sqrt(ball.vy * ball.vy + ball.vx * ball.vx);

        var shiftX = BALL_RADIUS * ball.vy / hyp;
        var shiftY = BALL_RADIUS * ball.vx / hyp;
        var oldLeft = { x: oldBall.x + shiftX, y: oldBall.y - shiftY };
        var oldRight = { x: oldBall.x - shiftX, y: oldBall.y + shiftY };
        var ballLeft = { x: ball.x + shiftX, y: ball.y - shiftY };
        var ballRight = { x: ball.x - shiftX, y: ball.y + shiftY };

        var top = checkTopBound(pLeft, ballLeft, ballRight, oldLeft, oldRight);
        var bottom = checkBottomBound(pLeft, ballLeft, ballRight, oldLeft, oldRight);
        var right = checkRightBound(pLeft, ballLeft, ballRight, oldLeft, oldRight);
        
        if (top){
            console.log("fixing top");
            ball.vy = -ball.vy;
            ball.y = pLeft.y1 - BALL_RADIUS;
            ball.vy += pLeft.vel;
        }
        if (bottom) {
            console.log("fixing bottom");
            ball.vy = -ball.vy;
            ball.y = pLeft.y2 + BALL_RADIUS;
            ball.vy += pLeft.vel;
        }
        if (right) {
            console.log("fixing right");
            ball.vx = -ball.vx;
            ball.x = pLeft.x2 + BALL_RADIUS;
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
        if (Math.log10(p1Score) === drawScore.p1Spaces) {
            drawScore.p1Spaces += 1;
        }
        var p1 = MID_SCREEN_X - (drawScore.shift * drawScore.p1Spaces + window.innerWidth / 15);
        ctx.fillText(p1Score, p1, window.innerHeight / 6,
                MID_SCREEN_X - window.innerWidth / 15);

        if (Math.log10(p2Score) === drawScore.p2Spaces) {
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
        var oldBall = {
            x: ball.x,
            y: ball.y
        }
        // move ball
        updatePosition(eTime);

        // move paddles
        updatePVel();

        // check bouncy things
        handleHitWall();
        checkHitboxes(oldBall);

        // check win conditions
        checkGameOver();

        // update display
        draw();
    }

    window.onwheel = pLeftMove;
    canvas.oncontextmenu = function (e) {
        e.preventDefault();
        if (window.onwheel === null) {
            pong.resume();
        } else {
            pong.pause();
        }
    }

    ///////////////////////
    // Public functions.
    ///////////////////////

    pong.resume = function () {
        // only resume if paused
        if (window.onwheel === null) {
            window.onwheel = pLeftMove
            interval = setInterval(update, 20, 20);
        }
    }

    pong.pause = function () {
        window.onwheel = null;
        clearInterval(interval);
    }

    pong.restart = function () {
        clearInterval(interval);
        ball = newBall();
        pLeft = newPlayerLeft();
        p1Score = 0;
        p2Score = 0;
        window.onwheel = pLeftMove
        interval = setInterval(update, 20, 20);
    }

    pong.screensaver = function () {

    }
}
