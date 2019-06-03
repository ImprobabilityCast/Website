(function () {
    var ctx, scoreFontSize, midScreenX, ball, pLeft, pRight;

    const PADDLE_HEIGHT = 50;
    const HALF_PADDLE_HEIGHT = PADDLE_HEIGHT / 2;
    const BALL_RADIUS = 4;
    const SCORE_COLOR = "#79e";
    const BG_COLOR = "#282828";
    const MOVING_PARTS_COLOR = "#eee";

    // the # of milliseconds in 1s / 60 = 16.6667
    const TICK = 20; // milliseconds

    var p1Score = 0;
    var p2Score = 0;

    var interval = -1;
    var ssInterval = -1;
    
    function newBall() {
        return {
            x: midScreenX, // spawn ball in middle of top of window
            y: canvas.height,
            vx: -canvas.width / 2, // px per sec
            vy: canvas.height / 2  // +y is down
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

    function newPlayerRight() {
        return {
            deltaY: 0,
            deltaT: 0,
            vel: 0,
            x1: canvas.width - canvas.width / 15,
            x2: canvas.width - canvas.width / 15 + 8,
            y1: PADDLE_HEIGHT,
            y2: canvas.height - PADDLE_HEIGHT
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

    function checkLeftBound(hitbox, ballLeft, ballRight, oldLeft, oldRight) {
        if ((hitbox.x1 > oldLeft.x && hitbox.x1 < ballLeft.x)
                || (hitbox.x1 > oldRight.x && hitbox.x1 < ballRight.x)) {
            console.log("crossed left bound");
            var intLeft = getYIntercept(hitbox.x1, oldLeft);
            var intRight = getYIntercept(hitbox.x1, oldRight);
            return doRangesIntersect(hitbox.y1, hitbox.y2, intLeft, intRight)
        }
        return false;
    }

    function checkHitboxes(hitbox, oldBall) {
        var hyp = Math.sqrt(ball.vy * ball.vy + ball.vx * ball.vx);

        var shiftX = BALL_RADIUS * ball.vy / hyp;
        var shiftY = BALL_RADIUS * ball.vx / hyp;
        var oldLeft = { x: oldBall.x + shiftX, y: oldBall.y - shiftY };
        var oldRight = { x: oldBall.x - shiftX, y: oldBall.y + shiftY };
        var ballLeft = { x: ball.x + shiftX, y: ball.y - shiftY };
        var ballRight = { x: ball.x - shiftX, y: ball.y + shiftY };

        var top = checkTopBound(hitbox, ballLeft, ballRight, oldLeft, oldRight);
        var bottom = checkBottomBound(hitbox, ballLeft, ballRight, oldLeft, oldRight);
        var right = checkRightBound(hitbox, ballLeft, ballRight, oldLeft, oldRight);
        var left = checkLeftBound(hitbox, ballLeft, ballRight, oldLeft, oldRight);
        
        if (top) {
            console.log("fixing top");
            ball.vy = -ball.vy;
            ball.y = hitbox.y1 - BALL_RADIUS;
            ball.vy += hitbox.vel;
        }
        if (bottom) {
            console.log("fixing bottom");
            ball.vy = -ball.vy;
            ball.y = hitbox.y2 + BALL_RADIUS;
            ball.vy += hitbox.vel;
        }
        if (right) {
            console.log("fixing right");
            ball.vx = -ball.vx;
            ball.x = hitbox.x2 + BALL_RADIUS;
            ball.vy += hitbox.vel;
        }
        if (left) {
            console.log("fixing left");
            ball.vx = -ball.vx;
            ball.x = hitbox.x1 - BALL_RADIUS;
            ball.vy += hitbox.vel;
        }
    }

    function handleHitTBWalls() {
        while (true) {
            if (ball.y - BALL_RADIUS < 0) {
                ball.y = BALL_RADIUS;
                ball.vy = -ball.vy;
                continue;
            }
            if (ball.y + BALL_RADIUS > canvas.height) {
                ball.y -=  2 * (ball.y + BALL_RADIUS - canvas.height);
                ball.vy = -ball.vy;
                continue;
            }
            break;
        }
    }

    function handleHitRLWalls() {
        while (true) {
            if (ball.x - BALL_RADIUS < 0) {
                ball.x = BALL_RADIUS;
                ball.vx = -ball.vx;
                continue;
            }
            if (ball.x + BALL_RADIUS > canvas.width) {
                ball.x -=  2 * (ball.x + BALL_RADIUS - canvas.width);
                ball.vx = -ball.vx;
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
        var p1 = midScreenX - (drawScore.shift * drawScore.p1Spaces + canvas.width / 15);
        ctx.fillText(p1Score, p1, canvas.height / 4,
                midScreenX - window.innerWidth / 15);

        if (Math.log10(p2Score) === drawScore.p2Spaces) {
            drawScore.p2Spaces += 1;
        }
        var p2 = window.innerWidth - (drawScore.shift * drawScore.p2Spaces + canvas.width / 15);
        ctx.fillText(p2Score, p2, canvas.height / 4,
                midScreenX - canvas.width / 15);
    }
    drawScore.p1Spaces = 1;
    drawScore.p2Spaces = 1;

    function drawMiddleLine() {
        ctx.beginPath();
        ctx.strokeStyle = SCORE_COLOR;
        ctx.setLineDash([12, 18]);
        ctx.lineWidth = 4;
        ctx.moveTo(midScreenX, 0);
        ctx.lineTo(midScreenX, canvas.height);
        ctx.stroke();
    }

    function drawBackground() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.fillStyle = BG_COLOR;
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.fill();
    }

    function drawPlayer(player) {
        ctx.beginPath();
        ctx.fillStyle = MOVING_PARTS_COLOR;
        ctx.rect(player.x1, player.y1,
            player.x2 - player.x1, player.y2 - player.y1);
        ctx.fill();
    }

    function drawBall(ball) {
        ctx.beginPath();
        ctx.fillStyle = MOVING_PARTS_COLOR;
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, 360);
        ctx.fill();
    }

    function draw() {
        drawBackground();
        drawScore();
        drawMiddleLine();
        drawBall(ball);

        // draw player 1
        drawPlayer(pLeft);
        // draw player 2
        drawPlayer(pRight);
    }

    // eTime is elapsed time in milliseconds
    function updatePosition(eTime) {
        var secs = eTime / 1000; // velocity is in px per sec
        ball.x += ball.vx * secs;
        ball.y += ball.vy * secs;
    }

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
        handleHitTBWalls();
        checkHitboxes(pLeft, oldBall);
        checkHitboxes(pRight, oldBall);

        // check win conditions
        checkGameOver();

        // update display
        draw();
    }

    function screensaver() {
        // move ball
        updatePosition(TICK);

        // check bouncy things
        handleHitTBWalls();
        handleHitRLWalls();

        // update display
        drawBackground();
        drawScore();
        drawMiddleLine();
        drawBall(ball);
    }

    ///////////////////////
    // Event listeners
    ///////////////////////
    
    function pLeftMove(e) {
        var deltaY = e.movementY;
        pLeft.y1 = e.clientY - HALF_PADDLE_HEIGHT;
        pLeft.y2 = pLeft.y1 + PADDLE_HEIGHT;

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

        drawPlayer(pLeft, MOVING_PARTS_COLOR);
    }
    pLeftMove.lastTime = new Date().getTime();

    function pxStr2Float(str) {
        return parseFloat(str.substr(0, str.length - 2));
    }

    ///////////////////////
    // Public functions.
    ///////////////////////
    window.pong = {};

    window.pong.init = function (canvasElement) {
        canvas = canvasElement;
        ctx = canvas.getContext("2d");

        scoreFontSize = canvas.width;
        if (scoreFontSize > 600) {
            scoreFontSize = 600;
        }
        let style = window.getComputedStyle(document.documentElement);
        drawScore.shift = pxStr2Float(style.fontSize) * scoreFontSize / 120;

        ctx.font = scoreFontSize + "% PressStart2P";
        midScreenX = canvas.width / 2;

        ball = newBall();
        pLeft = newPlayerLeft();
        pRight = newPlayerRight();
        
    }

    window.pong.resume = function () {
        // only resume if paused
        if (interval === -1) {
            window.addEventListener("mousemove", pLeftMove);
            interval = setInterval(update, TICK, TICK);
        }
    }

    window.pong.pause = function () {
        window.removeEventListener("mousemove", pLeftMove);
        clearInterval(interval);
        interval = -1;
    }

    window.pong.restart = function () {
        clearInterval(interval);
        window.removeEventListener("mousemove", pLeftMove);
        ball = newBall();
        pLeft = newPlayerLeft();
        p1Score = 0;
        p2Score = 0;
        window.addEventListener("mousemove", pLeftMove);
        interval = setInterval(update, TICK, TICK);
    }

    window.pong.startScreensaver = function () {
        if (ssInterval === -1) {
            ball = newBall();
            ssInterval = setInterval(screensaver, TICK);
        }
    }

    window.pong.stopScreensaver = function () {
        clearInterval(ssInterval);
    }

    window.pong.isPaused = function () {
        return interval === -1;
    }

})();
