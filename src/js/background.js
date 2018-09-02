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