//Global variables;
var player,
    signals = [],
    message,
    introScene,
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
        g.text("knocked down by a car!", "11px impact", "black", 50, 170),
        g.text("good luck!", "11px impact", "black", 50, 200)
    );

    g.state = intro;

    playAt(150);
}

function startGame() {
    var walkingAnimation = g.filmstrip('images/bob.png', 32, 32, 0);

    window.onclick = window.onkeyup = null;
    introScene.visible = false;

    gameScene = g.group();

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
    
    scoreDisplay = g.text("score: " + score, "10px impact", "black", 245, 5);
    levelDisplay = g.text("lavel: " + level, "10px impact", "black", 245, 20);
    gameScene.add(player, scoreDisplay, levelDisplay);

    createSignals();
    createHealthBar();
    createSignalIndicator();

    message = g.text("Game Over!", "30px impact", "black", 85, g.canvas.height / 2 - 64);
    totalScore = g.text("", "15px impact", "black", 110, g.canvas.height / 2 - 10);
    finalLevel = g.text("", "15px impact", "black", 130, g.canvas.height / 2 + 10);

    gameOverScene = g.group(
        message, 
        totalScore, 
        finalLevel, 
        g.text("click or enter to replay", "15px impact", "black", 85, g.canvas.height / 2 + 40)
    );

    gameOverScene.visible = false;

    g.state = play;
}

function intro() {
    introScene.visible = true;
    window.onclick = startGame;
    window.onkeyup = window.onclick;
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

window.onblur = function() {
    sequence1.gain.gain.value = 0;
    sequence2.gain.gain.value = 0;
    blurred = true;
    isMuted = true;
}
window.onfocus = function() {
    sequence1.gain.gain.value = 0.1;
    sequence2.gain.gain.value = 0.05;
    blurred = false;
    isMuted = false;
}

g.start();
g.scaleToWindow();
window.addEventListener("resize", () => g.scaleToWindow);
