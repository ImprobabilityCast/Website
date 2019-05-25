(function () {
    var canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var ctx = canvas.getContext("2d");
    ctx.font = "100px PressStart2P";

    const INITIAL_VX = -120; // px per sec
    const INITIAL_VY = 120; // +y is down
    const PADDLE_HEIGHT = 40;

    var ball = newBall();

    var pLeft = {
        x1: 60,
        x2: 68,
        y1: window.innerHeight / 2,
        y2: window.innerHeight / 2 + PADDLE_HEIGHT
    };

    var p1Score = 0;
    var p2Score = 0;
    
    function newBall() {
        return {
            x: window.innerWidth / 2, // spawn ball in middle of top of window
            y: 0,
            vx: INITIAL_VX,
            vy: INITIAL_VY
        };
    }

    function inYBox(hitbox, y) {
        return y > hitbox.y1 && y < hitbox.y2;
    }

    function checkHitboxes() {
        if (inYBox(pLeft, ball.y) && ball.x < pLeft.x2) {
            ball.x += 2 * (pLeft.x2 - ball.x);
            ball.vx = -ball.vx;
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

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.fillStyle = "#282828";
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.fill()

        // draw score
        ctx.beginPath();
        ctx.fillStyle = "#79e";
        var shift = (p1Score >= 100) ? 25 : 100;
        ctx.fillText(p1Score, shift, 175);
        var shift = (p2Score >= 100) ? 25 : 100;
        ctx.fillText(p2Score, canvas.width / 2 + shift, 175);

        // draw ball
        ctx.beginPath();
        ctx.fillStyle = "#eee";
        ctx.arc(ball.x, ball.y, 5, 0, 360);
        ctx.fill();

        // draw player 1
        ctx.rect(pLeft.x1, pLeft.y1,
                pLeft.x2 - pLeft.x1, pLeft.y2 - pLeft.y1);
        ctx.fill();

        // draw player 2
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

    window.onwheel = function (e) {
        pLeft.y1 += e.deltaY * 10;
        pLeft.y2 += e.deltaY * 10;
        if (pLeft.y1 < 0) {
            pLeft.y1 = 0;
            pLeft.y2 = PADDLE_HEIGHT;
        }
        if (pLeft.y2 > canvas.height) {
            pLeft.y1 = canvas.height - PADDLE_HEIGHT;
            pLeft.y2 = canvas.height;
        }
    };


    var thing = setInterval(updatePosition, 16.6667, ball); // the # of milliseconds in 1s / 60
})();
