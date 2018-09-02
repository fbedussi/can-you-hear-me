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
    var barColor = 'brown',
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