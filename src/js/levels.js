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
