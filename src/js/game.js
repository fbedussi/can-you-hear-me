//Global variables;
var player,
    signals = [],
    message,
    introScene,
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
            'images/cars.png',
        ]
    ),
    gameScene,
    carsGroup,
    canvasW = g.canvas.width,
    canvasH = g.canvas.height,
    initialTime,
    lastTime,
    blurred = false,
    score = 0,
    level = 1,
    playerVelocity = 2,

    //Configuration
    levelTime = 15000,
    signalSpeed = 1,
    signalIterval = 2000,
    fieldDecayTime = 2500,
    numberOfSignals = 6,
    numberOfCars = 1,
    carHitPenalty = 0.15
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

function createHealthBar() {
    var _ = "transparent",
        B = "black",
        r = "red",
        o = "white",
        icon = drawSprite([
            [_, B, B, B, B, _, B, B, B, B],
            [B, r, r, r, r, B, r, r, r, r, B],
            [B, r, r, r, r, r, r, r, o, r, B],
            [B, r, r, r, r, r, r, r, o, r, B],
            [_, B, r, r, r, r, r, o, r, B],
            [_, _, B, r, r, r, r, r, B],
            [_, _, _, B, r, r, r, B],
            [_, _, _, _, B, r, B],
            [_, _, _, _, _, B],
        ], 1)
    innerBar = g.rectangle(40, 15, "seaGreen", "", 0, 15, 0),
        outerBar = g.rectangle(40, 15, "rgba(0,0,0,0.5)", "", 0, 15, 0)
        ;

    icon.y = 3;

    healthBar = g.group(icon, outerBar, innerBar);

    healthBar.inner = innerBar;
    healthBar.x = 60;
    healthBar.y = 5;

    gameScene.addChild(healthBar);
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
}

function makeSignal(speed) {
    var _ = "transparent",
        i = "LightSkyBlue",
        c = "Turquoise",
        x = "SteelBlue",
        signal = drawSprite([
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

function createSignalIndicator() {
    var barColor = 'red',
        bar1 = g.rectangle(5, 5, barColor, "", 0, 17, 10),
        bar2 = g.rectangle(5, 7.5, barColor, "", 0, 24.5, 7.5),
        bar3 = g.rectangle(5, 10, barColor, "", 0, 32, 5),
        bar4 = g.rectangle(5, 12.5, barColor, "", 0, 39.5, 2.5),
        maxSignalStrength = 4,
        X = barColor,
        _ = "transparent",
        antenna = drawSprite([
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
    signalIndicator.y = 4;
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

function createSignals() {
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

function restartSignal(signal) {
    signal.x = g.randomInt(0, canvasW);
    signal.y = g.randomInt(0, canvasH);
    signal.vx = signal.speed * getDirection();
    signal.vy = signal.speed * getDirection();
}

function createCar(carNumber) {
    var direction = carNumber % 2,
        car = g.sprite(direction ? g.frame('images/cars.png', 51, 0, 50, 72) : g.frame('images/cars.png', 0, 0, 50, 72)),
        carHeight = car.height,
        originalY = direction ? -carHeight : canvasH + carHeight,
        verticalSpacing = carNumber > 1 && Math.floor(carNumber / 2) * carHeight + canvasH * 0.4 || 0
        ;

    car.x = direction ? 75 : 175;
    car.y = verticalSpacing;

    car.vx = 0;
    car.vy = direction ? 2 : -2;
    car.originalY = originalY;
    cars.push(car);
    carsGroup.addChild(car);
}

function createCars() {
    g.remove(cars);
    cars = [];
    
    for (let i = 0; i < numberOfCars; i++) {
        createCar(i);
    }
}

function increaseLevel() {
    var levelDisplayX = levelDisplay.x,
        levelDisplayY = levelDisplay.y;
    level++;
    levelDisplay.content = "level: " + level;
    signalIterval = 0;
    levelDisplay.scaleY = levelDisplay.scaleX = 5;
    g.stage.putCenter(levelDisplay, 0, 0);
    setTimeout(() => {
        levelDisplay.scaleY = levelDisplay.scaleX = 1;
        levelDisplay.x = levelDisplayX;
        levelDisplay.y = levelDisplayY;
    }, 1000); 

    switch (level) {
        case 2:
        case 5:
        case 6:
            numberOfCars++
            createCars();
            break;
        case 3:
        case 7:
        case 9:
            --numberOfSignals;
            createSignals();
            break;
        case 4:
            signalSpeed = 2;
            createSignals();
            break;
        case 8:
            carHitPenalty = 0.1;
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

function setup() {
    createBackground();

    introScene = g.group(
        g.rectangle(canvasW - 80, canvasH - 80, "rgba(255,255,255,0.5)", "black", 3, 40, 40),
        g.text("Can you hear me?", "18px impact", "black", 50, 50),
        g.text("You bought the cheapest phone on the", "11px impact", "black", 50, 80),
        g.text("market and you subscribed the cheapest", "11px impact", "black", 50, 95),
        g.text("contract you could find...", "11px impact", "black", 50, 110),
        g.text("now you have to run after the signal", "11px impact", "black", 50, 125),
        g.text("to prevent going offline...", "11px impact", "black", 50, 140),
        g.text("but pay attention not to be", "11px impact", "black", 50, 155),
        g.text("knocked down by a car! Good luck!", "11px impact", "black", 50, 170),
        g.text("Click or press any key to start", "11px impact", "black", 50, 200)
    );

    g.state = intro;

    playAt(150);
}

function startGame() {
    var walkingAnimation = g.filmstrip('images/bob.png', 32, 32, 0);

    window.onclick = window.onkeyup = null;
    introScene.visible = false;
    
    gameScene = g.group(),

    carsGroup = g.group(),
    createCars();

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

    ['Left', 'Right'].forEach(direction => {
        let oppositeDir = direction === 'Left' ? 'Right' : 'Left';
        g.key[`${direction.toLowerCase()}Arrow`].press = function () {
            player.playSequence(player.states[`walk${direction}`]);
            player.vx = direction === 'Left' ? -playerVelocity : playerVelocity;
            player.vy = 0;
        }
        g.key[`${direction.toLowerCase()}Arrow`].release = function () {
            if (!g.key[`${oppositeDir.toLowerCase()}Arrow`].isDown && player.vy === 0) {
                player.vx = 0;
                player.show(player.states[direction.toLowerCase()]);
            }
        };
    });
    ['Up', 'Down'].forEach(direction => {
        let oppositeDir = direction === 'Up' ? 'Down' : 'Up';
        g.key[`${direction.toLowerCase()}Arrow`].press = function () {
            player.playSequence(player.states[`walk${direction}`]);
            player.vy = direction === 'Up' ? -playerVelocity : playerVelocity;
            player.vx = 0;
        }
        g.key[`${direction.toLowerCase()}Arrow`].release = function () {
            if (!g.key[`${oppositeDir.toLowerCase()}Arrow`].isDown && player.vx === 0) {
                player.vy = 0;
                player.show(player.states[direction.toLowerCase()]);
            }
        };
    });

    
    scoreDisplay = g.text("score: " + score, "10px impact", "white", 130, 6);
    levelDisplay = g.text("lavel: " + level, "10px impact", "white", 200, 6);
    gameScene.add(
        player,
        carsGroup,
        g.rectangle(canvasW, 25, "rgba(0,0,0,0.3)", "", 0, 0, 0),
        scoreDisplay,
        levelDisplay
    );

    createSignals();
    createHealthBar();
    createSignalIndicator();

    message = g.text("Game Over!", "30px impact", "black", 85, g.canvas.height / 2 - 64);
    totalScore = g.text("", "15px impact", "black", 110, g.canvas.height / 2 - 10);
    finalLevel = g.text("", "15px impact", "black", 130, g.canvas.height / 2 + 10);

    gameOverScene = g.group(
        g.rectangle(canvasW - 80, canvasH - 80, "rgba(255,255,255,0.5)", "black", 3, 40, 40),
        message,
        totalScore,
        finalLevel,
        g.text("click or enter to replay", "15px impact", "black", 85, g.canvas.height / 2 + 40)
    );

    gameOverScene.visible = false;

    initialTime = Date.now();
    g.state = play;
}

function intro() {
    introScene.visible = true;
    window.onclick = startGame;
    window.onkeyup = window.onclick;
}

function play() {
    if (blurred == true) {
        sequence1.gain.gain.value = 0.1
        sequence2.gain.gain.value = 0.05
    }

    g.move(player);
    g.contain(player, {
        x: 9, y: 0,
        width: canvasW - 9,
        height: canvasH
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
        player.alpha = 0.3;
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
    finalLevel.content = "level: " + level;
    totalScore.content = "total score: " + score;
    gameScene.visible = false;
    gameOverScene.visible = true;
    window.onclick = function () {
        window.location.reload();
    };
    window.onkeyup = function (e) {
        if (e.keyCode === 13) {
            window.location.reload();
        }
    };
}

window.onblur = muteSound;
window.onfocus = setLevels;

g.start();
g.scaleToWindow();
window.addEventListener("resize", () => g.scaleToWindow);
