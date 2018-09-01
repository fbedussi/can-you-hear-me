//Global variables;
var player,
    signals = [],
    message,
    gameScene,
    gameOverScene,
    scoreDisplay,
    levelDisplay,
    totalScore,
    finalLevel,
    cars = [],
    healthBar,
    signalIndicator,
    g = ga(
        300, 300, setup,
        [
            'images/bob.png',
            'images/car.png',
            'images/car2.png',
        ]
    ),
    canvasW = g.canvas.width,
    canvasH = g.canvas.height,
    initialTime = Date.now(),
    lastTime,
    blurred = false,
    score = 0,
    level = 1,
    playerVelocity = 2,


    //Configuration
    levelTime = 15000,
    signalSpeed = 1,
    signalIterval = 2000,
    fieldDecayTime = 3000,
    numberOfSignals = 7,
    numberOfCars = 1,
    carHitPenalty = 0.08
    ;


function getDirection() {
    return g.randomFloat(-1, 1);
}

function drawSprite(pixels, dimension = 1) {
    var sprite = g.group(),
        x = 0,
        y = 0;

    pixels.forEach((line) => {
        line.forEach((pixelFillStyle) => {
            let pixelSprite = g.rectangle(dimension, dimension, pixelFillStyle, "", 0, x, y);
            sprite.addChild(pixelSprite);
            x += dimension;
        })
        y += dimension;
        x = 0;
    });
    return sprite;
}

function makeSignal(speed) {
    var _ = "transparent";
    var i = "LightSkyBlue";
    var c = "Turquoise";
    var x = "SteelBlue";
    var signal = drawSprite([
        [_, _, _, _, i, _, _, _, _, _, _, i],
        [_, _, i, i, _, _, _, _, _, _, _, _, i, i],
        [_, i, i, _, _, c, _, _, _, _, c, _, _, i, i],
        [_, i, _, _, c, c, _, _, _, _, c, c, _, _, i],
        [i, _, _, c, _, _, _, _, _, _, _, _, c, _, _, i],
        [i, _, c, c, _, x, x, _, _, x, _, _, c, c, _, i],
        [i, _, c, _, x, x, _, x, x, _, x, x, _, c, _, i],
        [i, _, c, _, x, x, _, x, x, _, x, x, _, c, _, i],
        [i, _, c, _, x, x, _, x, x, _, x, x, _, c, _, i],
        [i, _, c, _, _, x, _, _, _, _, x, _, c, c, _, i],
        [i, _, c, c, _, x, x, _, _, x, _, _, c, c, _, i],
        [i, _, _, c, _, _, _, _, _, _, _, _, c, _, _, i],
        [_, i, _, _, c, c, _, _, _, _, c, c, _, _, i],
        [_, i, i, _, _, c, _, _, _, _, c, _, _, i, i],
        [_, _, i, i, _, _, _, _, _, _, _, _, i, i],
        [_, _, _, _, i, _, _, _, _, _, _, i],
    ]);
    signal.speed = speed;
    signal.x = g.randomInt(0, g.canvas.width);
    signal.y = g.randomInt(0, g.canvas.height);
    signal.vy = signal.speed * getDirection();
    signal.vx = signal.speed * getDirection();
    setInterval(() => {
        if (signal.scaleX === 1) {
            signal.scaleX = signal.scaleY = 0.5;
        } else {
            signal.scaleX = signal.scaleY = 1;
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
    var _ = "transparent";
    var B = "black";
    var r = "red";
    var o = "white";
    var icon = drawSprite([
        [_, B, B, B, B, _, B, B, B, B],
        [B, r, r, r, r, B, r, r, r, r, B],
        [B, r, r, r, r, r, r, r, o, r, B],
        [B, r, r, r, r, r, r, r, o, r, B],
        [_, B, r, r, r, r, r, o, r, B],
        [_, _, B, r, r, r, r, r, B],
        [_, _, _, B, r, r, r, B],
        [_, _, _, _, B, r, B],
        [_, _, _, _, _, B],
    ], 1);
    icon.y = 3;
    var outerBar = g.rectangle(40, 15, "rgba(0,0,0,0.5)", "", 0, 15, 0);
    var innerBar = g.rectangle(40, 15, "seaGreen", "", 0, 15, 0);

    healthBar = g.group(icon, outerBar, innerBar);

    healthBar.inner = innerBar;

    healthBar.x = 60;
    healthBar.y = 5;

    gameScene.addChild(healthBar);
}

function createSignalIndicator() {
    var barColor = 'brown',
        bar1 = g.rectangle(5, 5, barColor, "", 0, 17, 10),
        bar2 = g.rectangle(5, 7.5, barColor, "", 0, 24.5, 7.5),
        bar3 = g.rectangle(5, 10, barColor, "", 0, 32, 5),
        bar4 = g.rectangle(5, 12.5, barColor, "", 0, 39.5, 2.5),
        maxSignalStrength = 4;
    var X = barColor;
    var _ = "transparent";
    var antenna = drawSprite([
        [X, _, _, X, _, _, X],
        [_, X, _, X, _, X,],
        [_, _, X, X, X],
        [_, _, _, X],
        [_, _, _, X],
        [_, _, _, X],
    ], 1.5);
    antenna.x = 5;
    antenna.y = 6;
    signalIndicator = g.group(antenna, bar1, bar2, bar3, bar4);
    signalIndicator.x = 5;
    signalIndicator.y = 5;
    signalIndicator.bar1 = bar1;
    signalIndicator.bar2 = bar2;
    signalIndicator.bar3 = bar3;
    signalIndicator.bar4 = bar4;
    signalIndicator.strength = maxSignalStrength;
    signalIndicator.setSignalStrength = function (delta) {
        signalIndicator.strength = Math.min(maxSignalStrength, Math.max(0, signalIndicator.strength + delta));
        for (let i = 1; i <= maxSignalStrength; i++) {
            signalIndicator[`bar${i}`].fillStyle = i <= signalIndicator.strength ? barColor : 'transparent';
        }
    }
    gameScene.addChild(signalIndicator);
}

function createBackground() {
    var background = g.group();
    var bgX = 8;

    g.backgroundColor = "gray";

    [
        [2, "#484848"],
        [2, "#a7a7a7"],
        [1, "#969696"],
        [1, "#584e47"],
        [1, "#63564e"],
        [3, "#7e6d61"],
        [8, "#917c6f"],
        [30, "#7e6d61"],
        [8, "#63554c"],
        [2, "#645a54"],
        [1, "#707070"],
        [1, "#414141"],
    ].forEach((bgData) => {
        bgX += bgData[0];
        background.add(g.rectangle(canvasW - (bgX * 2), canvasH, bgData[1], "", 0, bgX, 0));
    });
    for (let i = 0; i < 300; i++) {
        let gray = g.randomInt(50, 90);
        background.add(g.rectangle(3, 3, `rgb(${gray}, ${gray}, ${gray})`, "", 0, g.randomInt(71, canvasW - 71), g.randomInt(0, canvasH)));
    }
    for (let i = 0; i < 6; i++) {
        background.add(g.rectangle(4, 30, "white", "", 0, (canvasW - 4) / 2, 10 + i * (30 + 20)));
    }

    gameScene.addChild(background);
}

function createSignals() {
    //signals.forEach((signal) => g.signal.remove());
    g.remove(signals);
    signals = [];
    var signalCreationInterval = setInterval(function () {
        if (!lastTime) {
            lastTime = Date.now();
        }
        makeSignal(signalSpeed);
        if (signals.length >= numberOfSignals) {
            clearInterval(signalCreationInterval);
        }
    }, signalIterval);
}

function createCars() {
    var roadWidth = 0.6;
    g.remove(cars);
    cars = [];
    for (let i = 0; i < numberOfCars; i++) {
        createCar(roadWidth, i);
    }
}

function setup() {
    gameScene = g.group();

    createBackground();

    createCars();

    var walkingAnimation = g.filmstrip('images/bob.png', 32, 32, 0);
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

    scoreDisplay = g.text("score: " + score, "10px impact", "black", 245, 5);
    levelDisplay = g.text("lavel: " + level, "10px impact", "black", 245, 20);
    gameScene.add(player, scoreDisplay, levelDisplay);

    createSignals();

    createHealthBar();
    createSignalIndicator();

    message = g.text("Game Over!", "30px impact", "black", 85, g.canvas.height / 2 - 64);
    totalScore = g.text("", "15px impact", "black", 110, g.canvas.height / 2 - 10);
    finalLevel = g.text("", "15px impact", "black", 130, g.canvas.height / 2 + 10);
    var replay = g.text("click or enter to replay", "15px impact", "black", 85, g.canvas.height / 2 + 40);

    gameOverScene = g.group(message, totalScore, finalLevel, replay);

    gameOverScene.visible = false;

    g.state = play;

    playAt(150);
}

function restartSignal(signal) {
    signal.x = g.randomInt(0, canvasW);
    signal.y = g.randomInt(0, canvasH);
    signal.vx = signal.speed * getDirection();
    signal.vy = signal.speed * getDirection();
}

function increaseLevel() {
    level++;
    levelDisplay.content = "level: " + level;
    signalIterval = 0;

    switch (level) {
        case 2:
            numberOfCars++
            createCars();
            break;
        case 3:
            numberOfSignals = 6;
            createSignals();
            break;
        case 4:
            signalSpeed = 2;
            createSignals();
            break;
        case 5:
            numberOfCars++
            createCars();
            break;
        case 6:
            numberOfCars++
            createCars();
            break;
        case 7:
            numberOfSignals = 5;
            createSignals();
            break;
        case 8:
            carHitPenalty = 0.1;
            break;
        case 9:
            numberOfSignals = 4;
            createSignals();
            break;
        default:
            if (level % 2 === 0) {
                fieldDecayTime *= 0.8;
            } else {
                signalSpeed += 1;
                createSignals();
            }
    }
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
        x: 9, y: 0,
        width: g.canvas.width - 9,
        height: g.canvas.height
    })

    var playerHit = false;

    cars.forEach(function (car) {
        var carHitsEdges = (car.originalY < 0 && car.y > canvasH) || car.y < -car.height;

        car.visible = !carHitsEdges;
        car.y = carHitsEdges ? car.originalY : car.y += car.vy;

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
            signalIndicator.setSignalStrength(+1);
            score += 10;
            coinSound();
            scoreDisplay.content = "score: " + score;
            restartSignal(signal);
        }
    });

    var now = Date.now();
    if ((now - lastTime) > fieldDecayTime) {
        if (!signalHit) {
            signalIndicator.setSignalStrength(-1);
        }
        lastTime = now;
    }
    if (Math.floor((now - initialTime) / levelTime) > level) {
        levelUpSound();
        increaseLevel();
    }

    if (healthBar.inner.width < 0 || !signalIndicator.strength) {
        g.state = end;
    }
}

function end() {
    muteMusic();
    g.pause();
    finalLevel.content = "level: " + level;
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

window.onblur = function () {
    sequence1.gain.gain.value = 0
    sequence2.gain.gain.value = 0
    blurred = true
}

g.start();
g.scaleToWindow();
window.addEventListener("resize", () => g.scaleToWindow);
