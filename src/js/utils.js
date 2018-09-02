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