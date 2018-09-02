function createCar(carNumber) {
    var direction = carNumber % 2,
        car = g.sprite(`images/car${direction ? '2' : ''}.png`),
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
    gameScene.addChild(car);
}

function createCars() {
    g.remove(cars);
    cars = [];
    for (let i = 0; i < numberOfCars; i++) {
        createCar(i);
    }
}