function increaseLevel() {
    level++;
    levelDisplay.content = "level: " + level;
    signalIterval = 0;

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
