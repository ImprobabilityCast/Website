function pong (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var ctx = canvas.getContext("2d");

    var ScoreFontSize = canvas.width;
    if (ScoreFontSize > 600) {
        ScoreFontSize = 600;
    }
    ctx.font = ScoreFontSize + "% PressStart2P";

    const INITIAL_VX = -100; // px per sec
    const INITIAL_VY = 100; // +y is down
    const PADDLE_HEIGHT = 40
    const HALF_PADDLE_HEIGHT = PADDLE_HEIGHT / 2;
    const BALL_RADIUS = 4;
    const R2 = BALL_RADIUS * BALL_RADIUS;
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
            y: 0,
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

    function didXIntercept(hitbox, coords) {
        var deltaY = hitbox.y1 - coords.y;
        var deltaT = deltaY / ball.vy;
        var posX = coords.x + deltaT * ball.vx;
        return  (posX >= hitbox.x1 && posX <= hitbox.x2);
    }

    function didYIntercept(y, ballCoord, coords) {
        return (y > coords.y) && (y < ballCoord.y);
    }

    function didSurroundTop(hitbox, coordLeft, coordRight) {
        return (coordLeft.x <= hitbox.x1 && coordRight.x >= hitbox.x1)
            || (coordLeft.x >= hitbox.x1 && coordRight.x <= hitbox.x1)
            || (coordLeft.x <= hitbox.x2 && coordRight.x >= hitbox.x2)
            || (coordLeft.x >= hitbox.x2 && coordRight.x <= hitbox.x2);
    }

    function checkTopBound(hitbox, ballLeft, ballRight, coordLeft, coordRight) {
        if (didYIntercept(hitbox.y1, ballLeft, coordLeft)) {
            console.log("crosssed Y on left");
            return didXIntercept(hitbox, coordLeft)
                || didSurroundTop(hitbox, coordLeft, coordRight);
        } else if (didYIntercept(hitbox.y1, ballRight, coordRight)) {
            console.log("crossed Y on right");
            return didXIntercept(hitbox, coordRight)
                || didSurroundTop(hitbox, coordLeft, coordRight);
        }
        return false;
    }

    function checkHitboxes(oldBall) {
        var hyp = Math.sqrt(ball.vy * ball.vy + ball.vx * ball.vx);

        var shiftX = BALL_RADIUS * ball.vy / hyp;
        var shiftY = BALL_RADIUS * ball.vx / hyp;
        var coordLeft = { x: oldBall.x + shiftX, y: oldBall.y - shiftY };
        var coordRight = { x: oldBall.x - shiftX, y: oldBall.y + shiftY };
        var ballLeft = { x: ball.x + shiftX, y: ball.y - shiftY };
        var ballRight = { x: ball.x - shiftX, y: ball.y + shiftY };
        // idk if this will work over velocity 480 px per sec b/c of how hit box is checked
        var top = checkTopBound(pLeft, ballLeft, ballRight, coordLeft, coordRight);
        //var side = checkRightBound(pLeft, ball);
        //var bottom = checkBottomBound(oldX, oldY, pLeft, ball);
        
        // if (side) {
        //     ball.vx = -ball.vx;
        //     //ball.vy += pLeft.vel;
        // }
        if (top){// || bottom) {
            console.log("fixing top");
            ball.vy = -ball.vy;
            ball.y = pLeft.y1 - BALL_RADIUS;
            // ball.x += ball.vx * 0.02;
            // ball.y += ball.vy * 0.02;
            //ball.vy += pLeft.vel;
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
