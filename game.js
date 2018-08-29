var player,
    signals,
    message,
    gameScene,
    gameOverScene,
    score,
    scoreDisplay,
    totalScore,
    cars,
    healthBar,
    signalBar,
    g = ga(
        300, 300, setup,
        [
            'images/background.png',
            'images/signal.png',
            'images/bob.png',
            'images/car.png',
            'images/car2.png',
        ]
    ),
    canvasW = g.canvas.width,
    canvasH = g.canvas.height,
    signalSpeed = 2,
    signalIterval = 2000,
    fieldDecayTime = 1000,
    numberOfSignals = 4,
    numberOfCars = 4,
    carHitPenalty = 0.1,
    lastTime;
;

function getDirection() {
    return g.randomFloat(-1, 1);
}

function makeSignal(speed) {
    var signal = g.sprite('images/signal.png');

    signal.speed = speed;
    signal.x = g.randomInt(0, g.canvas.width);
    signal.y = g.randomInt(0, g.canvas.height);
    signal.vy = signal.speed * getDirection();
    signal.vx = signal.speed * getDirection();
    setInterval(() => {
        if (signal.scaleX === 1) {
            signal.scaleX = 0.5;
            signal.scaleY = 0.5;
        } else {
            signal.scaleX = 1;
            signal.scaleY = 1;
        }
    }, 100)

    signals.push(signal);

    gameScene.addChild(signal);
}

function createCar(roadWidth, carNumber) {
    var direction = carNumber % 2;
    var car = g.sprite(`images/car${direction ? '2' : ''}.png`);
    var carHeight = car.height;
    var carWidth = car.width;
    var originalY = direction ? -carHeight : canvasH + carHeight;
    var verticalSpacing = carNumber > 1 && Math.floor(carNumber / 2) * carHeight + canvasH * 0.4 || 0
    car.x = direction ? (canvasW - (canvasW * roadWidth)) / 2 + canvasW * 0.05 : (canvasW / 2) + (canvasW * roadWidth / 2) - carWidth - canvasW * 0.05;
    car.y = verticalSpacing;

    car.vx = 0;
    car.vy = direction ? 2 : -2;
    car.originalY = originalY;
    cars.push(car);
    gameScene.addChild(car);
}

function createHealthBar() {
    var outerBar = g.rectangle(canvasW * 0.15, canvasH * 0.05, "black"),
        innerBar = g.rectangle(canvasW * 0.15, canvasH * 0.05, "yellowGreen"),
        text = g.text("energy", "10px arial", "black", 0, 0);

    healthBar = g.group(outerBar, innerBar, text);

    healthBar.inner = innerBar;

    healthBar.x = canvasW * 0.825;
    healthBar.y = canvasH * 0.05;

    gameScene.addChild(healthBar);
}

function createSignalBar() {
    var outerBar = g.rectangle(canvasW * 0.15, canvasH * 0.05, "black"),
        innerBar = g.rectangle(canvasW * 0.15, canvasH * 0.05, "red"),
        text = g.text("signal", "10px arial", "black", 0, 0);

    signalBar = g.group(outerBar, innerBar, text);

    signalBar.inner = innerBar;
    signalBar.maxWidth = signalBar.width;
    signalBar.x = canvasW * 0.02;
    signalBar.y = canvasH * 0.05;
    signalBar.numberOfSegments = 5;
    gameScene.addChild(signalBar);
}

blurred = false
    window.onblur = function () {
        sequence1.gain.gain.value = 0
        sequence2.gain.gain.value = 0
        blurred = true
    }

function setup() {
    var roadWidth = 0.6;
    var playerVelocity = 2;
    signals = [];
    cars = [];
    score = 0;

    g.backgroundColor = "gray";

    gameScene = g.group();

    // road = g.rectangle(canvasW * roadWidth, canvasH, "black", "", 0, canvasW * ((1 - roadWidth) / 2), 0);
    // gameScene.addChild(road);
    var background = g.sprite('images/background.png');
    gameScene.addChild(background);
    for (let i = 0; i < numberOfCars; i++) {
        createCar(roadWidth, i);
    }

    var walkingAnimation = g.filmstrip('images/bob.png', 32, 32);
    player = g.sprite(walkingAnimation);
    player.setPosition(0, 100);
    player.states = {
        up: 7,
        left: 15,
        down: 3,
        right: 11,
        walkUp: [4, 7],
        walkLeft: [12, 15],
        walkDown: [0, 3],
        walkRight: [8, 11]
    };
    player.show(player.states.right);
    leftArrow = g.keyboard(37);
    upArrow = g.keyboard(38);
    rightArrow = g.keyboard(39);
    downArrow = g.keyboard(40);
    leftArrow.press = function () {
        player.playSequence(player.states.walkLeft);
        player.vx = -playerVelocity;
        player.vy = 0;
    };
    leftArrow.release = function () {
        if (!rightArrow.isDown && player.vy === 0) {
            player.vx = 0;
            player.show(player.states.left);
        }
    };
    upArrow.press = function () {
        player.playSequence(player.states.walkUp);
        player.vy = -playerVelocity;
        player.vx = 0;
    };
    upArrow.release = function () {
        if (!downArrow.isDown && player.vx === 0) {
            player.vy = 0;
            player.show(player.states.up);
        }
    };
    rightArrow.press = function () {
        player.playSequence(player.states.walkRight);
        player.vx = playerVelocity;
        player.vy = 0;
    };
    rightArrow.release = function () {
        if (!leftArrow.isDown && player.vy === 0) {
            player.vx = 0;
            player.show(player.states.right);
        }
    };
    downArrow.press = function () {
        player.playSequence(player.states.walkDown);
        player.vy = playerVelocity;
        player.vx = 0;
    };
    downArrow.release = function () {
        if (!upArrow.isDown && player.vx === 0) {
            player.vy = 0;
            player.show(player.states.down);
        }
    };

    scoreDisplay = g.text("score:" + score, "10px impact", "black", canvasW * 0.01, canvasW * 0.005);
    gameScene.add(scoreDisplay, player);

    var signalCreationInterval = setInterval(function () {
        if (!lastTime) {
            lastTime = Date.now();
        }
        makeSignal(signalSpeed);
        if (signals.length >= numberOfSignals) {
            clearInterval(signalCreationInterval);
        }
    }, signalIterval);

    createHealthBar();
    createSignalBar();

    message = g.text("Game Over!", "30px monospace", "black", 85, g.canvas.height / 2 - 64);
    totalScore = g.text("", "15px monospace", "black", 110, g.canvas.height / 2);
    var replay = g.text("click or enter to replay", "15px monospace", "black", 50, g.canvas.height / 2 + 40);

    gameOverScene = g.group(message, totalScore, replay);

    gameOverScene.visible = false;

    g.state = play;


    

    playAt(150);
}

function restartSignal(signal) {
    signal.x = g.randomInt(0, canvasW);
    signal.y = g.randomInt(0, canvasH);
    signal.vx = signal.speed * getDirection();
    signal.vy = signal.speed * getDirection();
    g.fadeIn(signal, 360);
}

function play() {
    if (blurred == true) {
        if (isMuted == false) {
            sequence1.gain.gain.value = 0.1
            sequence2.gain.gain.value = 0.05
        }
    }

    g.move(player);
    g.contain(player, {
        x: 18, y: 0,
        width: g.canvas.width - 18,
        height: g.canvas.height
    })

    var playerHit = false;

    cars.forEach(function (car) {
        g.move(car);

        var carHitsEdges = (car.originalY < canvasH && car.y > canvasH) || car.y < -car.height;

        if (carHitsEdges) {
            car.y = car.originalY;
        }

        if (g.hitTestRectangle(player, car)) {
            playerHit = true;
        }
    });

    if (playerHit) {
        player.alpha = 0.5;
        dashSound();
        healthBar.inner.width -= carHitPenalty;
    } else {
        player.alpha = 1;
    }

    var signalHit = false;

    signals.forEach(function (signal) {
        signal.x += signal.vx;
        signal.y += signal.vy;

        var signalHitsEdges = g.contain(signal, g.stage.localBounds);

        if (signalHitsEdges === "top" || signalHitsEdges === "bottom") {
            signal.vy *= -1;
        } else if (signalHitsEdges === "right" || signalHitsEdges === "left") {
            signal.vx *= -1;
        }

        if (g.hitTestCircleRectangle(signal, player)) {
            signalHit = true;
            signalBar.inner.width = Math.min(signalBar.maxWidth, signalBar.width + signalBar.width / signalBar.numberOfSegments);
            score += 10;
            coinSound();
            scoreDisplay.content = "score: " + score;
            restartSignal(signal);
        }
    });

    var now = Date.now();
    if ((now - lastTime) > fieldDecayTime) {
        if (!signalHit) {
            signalBar.inner.width = Math.max(0, signalBar.inner.width - signalBar.width / signalBar.numberOfSegments);
        }
        lastTime = now;
    }

    if (healthBar.inner.width < 0 || signalBar.inner.width <= 0) {
        g.state = end;
    }
}

function end() {
    muteMusic();
    g.pause();
    totalScore.content = "total score: " + score;
    gameScene.visible = false;
    gameOverScene.visible = true;
    window.addEventListener('click', function () {
        window.location.reload();
    });
    window.addEventListener('keyup', function (e) {
        if (e.keyCode === 13) {
            window.location.reload();
        }
    });
}

g.start();
g.scaleToWindow();
window.addEventListener("resize", () => g.scaleToWindow);
