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