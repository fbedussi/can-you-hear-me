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

function createCars() {
    var roadWidth = 0.6;
    g.remove(cars);
    cars = [];
    for (let i = 0; i < numberOfCars; i++) {
        createCar(roadWidth, i);
    }
}