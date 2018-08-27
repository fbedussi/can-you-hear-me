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
        600, 600, setup,
        [
            'images/signal.png',
        ]
    ),
    canvasW = g.canvas.width,
    canvasH = g.canvas.height,
    signalSpeed = 2,
    fieldDecayTime = 1000,
    numberOfSignals = 3,
    lastTime = Date.now();
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

function createCar(roadWidth, direction) {
    var carHeight = canvasH * 0.25;
    var carWidth = canvasW * 0.15;
    var originalY = direction ? -carHeight : canvasH + carHeight; 
    var car = g.rectangle(
        carWidth, 
        carHeight,
        direction ? "green" : "white", 
        "", 
        0,
        direction ? (canvasW - (canvasW * roadWidth)) / 2 + canvasW * 0.05 : (canvasW  / 2) + (canvasW * roadWidth / 2) - carWidth - canvasW * 0.05,
        originalY); 
    
    car.vx = 0;
    car.vy = direction ? 2 : -2;
    car.originalY = originalY;
    cars.push(car);
    gameScene.addChild(car);
}

function createHealthBar() {
    var outerBar = g.rectangle(canvasW * 0.15, canvasH * 0.05, "black"),
        innerBar = g.rectangle(canvasW * 0.15, canvasH * 0.05, "yellowGreen"),
        text = g.text("energy", "15px arial", "black", 0, 0);

    healthBar = g.group(outerBar, innerBar, text);

    healthBar.inner = innerBar;

    healthBar.x = canvasW * 0.825;
    healthBar.y = canvasH * 0.05;

    gameScene.addChild(healthBar);
}

function createSignalBar() {
    var outerBar = g.rectangle(canvasW * 0.15, canvasH * 0.05, "black"),
        innerBar = g.rectangle(canvasW * 0.15, canvasH * 0.05, "red"),
        text = g.text("signal", "15px arial", "black", 0, 0);

    signalBar = g.group(outerBar, innerBar, text);

    signalBar.inner = innerBar;
    signalBar.maxWidth = signalBar.width;
    signalBar.x = canvasW * 0.02;
    signalBar.y = canvasH * 0.05;
    signalBar.numberOfSegments = 5;
    gameScene.addChild(signalBar);
}


function setup() {
    var roadWidth = 0.6;
    var signalCreationInterval = 1000;
    var numberOfCars = 2;
    signals = [];
    cars = [];
    score = 0;

    g.backgroundColor = "gray";

    gameScene = g.group();
    
    road = g.rectangle(canvasW * roadWidth, canvasH, "black", "", 0, canvasW * ((1 - roadWidth) / 2), 0);
    gameScene.addChild(road);
    for (let i = 0; i < numberOfCars; i++) {
        createCar(roadWidth, i % 2);
    }

    player = g.rectangle(canvasW * 0.05, canvasW * 0.08, "rebeccapurple", "", 0, canvasW * 0.01, canvasH * 0.5);
    g.fourKeyController(player, 5, 38, 39, 40, 37);

    scoreDisplay = g.text("score:" + score, "20px impact", "black", 400, 10);
    gameScene.add(scoreDisplay, player);

    var signalCreationInterval = setInterval(function() {
        makeSignal(signalSpeed);
        if (signals.length >= numberOfSignals) {
            clearInterval(signalCreationInterval);
        }
    }, signalCreationInterval);

    createHealthBar();
    createSignalBar();

    message = g.text("Game Over!", "64px impact", "black", 120, g.canvas.height / 2 - 64);
    totalScore = g.text("", "25px impact", "black", 180, g.canvas.height / 2 + 20);
    var replay = g.text("click to replay", "32px impact", "black", 175, g.canvas.height / 2 + 64);
    
    gameOverScene = g.group(message, totalScore, replay);

    gameOverScene.visible = false;

    g.state = play;
}

function restartSignal(signal) {
    signal.x = g.randomInt(0, canvasW);
    signal.y =  g.randomInt(0, canvasH);
    signal.vx = signal.speed * getDirection();
    signal.vy = signal.speed * getDirection();
    g.fadeIn(signal, 360);
}

function play() {
    g.move(player);
    g.contain(player, g.stage.localBounds)

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
        healthBar.inner.width -= 1;
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
            signalBar.inner.width = Math.max(signalBar.maxWidth, signalBar.width + signalBar.width / signalBar.numberOfSegments);
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
    g.pause();
    totalScore.content = "total score: " + score;
    gameScene.visible = false;
    gameOverScene.visible = true;
    window.addEventListener('click', function() {
        window.location.reload();
    });
}

g.start();
g.scaleToWindow();
window.addEventListener("resize", () => g.scaleToWindow);
