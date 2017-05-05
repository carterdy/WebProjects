/*  Written by Dylan Carter, 998996038, c4carter
*/

//Various global variables
var xLimit = 400;
var yLimit = 600;

var level = 0;
var score = 0;
var highScore;
var gamePaused = false;
var gameStarted = false;
var curTime = 0;
var nextBug = 1
var lastBugTime = 0;
var bugInterval;

var bugList = [];
var foodList = [];
//Bug stats
var orangeSpeed = 60 + 20*level;
var orangeScore = 1;
var orangeProb = 0.4;

var redSpeed = 75 + 25*level;
var redScore = 3;
var redProb = 0.3;

var blackSpeed = 150 + 50*level;
var blackScore = 5;
var blackProb = 0.3;

var bugLength = 40;
var bugWidth = 10;
var foodSize = 20;

var mouseX = 0;
var mouseY = 0;

var startButtonX = 150;
var startButtonY = 400;
var startButtonWidth = 100;
var startButtonHeight = 50;
var level1SelectX = 140;
var level1SelectY = 325;
var level2SelectX = 240;
var level2SelectY = 325;
var levelSelectSize = 20;



function init() {
    if (window.localStorage.getItem('highScore')){
        highScore = window.localStorage.getItem('highScore');
    } else {
        highScore = 0;
    }
    document.getElementById("gameCanvas").addEventListener("mousedown", getPosition, false);
    drawStartPage();
}

/* Draw the start page for the game. Include high score, level, and a button to start.
*/
function drawStartPage(){
    var ctx = document.getElementById("gameCanvas").getContext('2d');
    ctx.clearRect(0, 0, xLimit, yLimit);
    ctx.strokeRect(0, 0, xLimit, yLimit);
    ctx.font = "15px Arial";
    ctx.strokeText("Level 1", 125, 300);
    ctx.strokeText("Level 2", 225, 300);
    ctx.strokeRect(140, 325, 20, 20);
    ctx.strokeRect(240, 325, 20, 20);

    ctx.font = "30px Arial";
    ctx.strokeText("High score: " + highScore, 110, 150);
    ctx.strokeRect(startButtonX, startButtonY, startButtonWidth, startButtonHeight);
    ctx.strokeText("Start", startButtonX + 15, startButtonY+startButtonHeight-10);

    //http://stackoverflow.com/questions/7559386/asynchronously-delay-js-until-a-condition-is-met
    (function wait() {
        if (gameStarted){
            runGame();
        } else {
            setTimeout(wait, 50);
        }
    })();
}

/*Bug object constructors.
*Create a bug using the given location and colour
*x: x coordinate of nose of bug in pixels
*y: y coordinate of nose of bug in pixels
*colour: colour of bug (from orange, red, or black)
*/
function CreateBug(x, y, direction, colour) {
    //determine probability, speed, and score based on colour. Speed will be in pixel change per second assuming animation at 60hz
    switch (colour) {
        case "orange":
            this.speed = orangeSpeed * (1/60);
            this.points = orangeScore;
            break;
        case "red":
            this.speed = redSpeed * (1/60);
            this.points = redScore;
            break;
        case "black":
            this.speed = blackSpeed * (1/60);
            this.points = blackScore;
            break;
        default:
            this.speed = 0;
            this.points = 0;
            this.prob = 0;
    }

    //The head length of the bug in pixels
    this.headLen = bugLength/4;
    this.xLoc = x;
    this.yLoc = y;
    this.direction = direction;
    this.colour = colour;
    this.forRemoval = false;
    this.alpha = 1.00;
    this.endX = this.xLoc + bugLength * Math.cos(this.direction*Math.PI/180);
    this.endY = this.yLoc + bugLength * Math.sin(this.direction*Math.PI/180);

    this.draw = drawBug;
    this.getClosestFood = getClosestFood;
    this.getDirectionToFood = getDirectionToFood;
    this.checkFood = checkFood;
    this.moveForward = moveForward;
    this.kill = killBug;
}

function drawBug(){
        var ctx = document.getElementById("gameCanvas").getContext('2d');
        ctx.strokeStyle = "#000000";
        ctx.fillStyle = this.colour;
        ctx.save();
        //Translate to centre of bug and rotate
        ctx.translate((this.xLoc+this.endX)/2, (this.yLoc+this.endY)/2);
        ctx.rotate((this.direction + 90)*Math.PI/180);
        ctx.translate(0, -(bugLength/2));
        if (this.forRemoval){
            ctx.globalAlpha = this.alpha;
            this.alpha -= 0.01;
        }
        //ctx.translate(0, bugLength/2*(-1));
        //Draw legs at each quarter
        //First leg pair
        ctx.beginPath();
        var firstQuarter = (this.headLen + (bugLength - this.headLen) / 4);
        ctx.moveTo(0, firstQuarter);
        ctx.lineTo((bugWidth * 1), firstQuarter - bugWidth);
        ctx.lineTo((bugWidth * 1) + bugWidth / 2, (firstQuarter - bugWidth) + (bugLength / 5));
        ctx.moveTo(0, firstQuarter);
        ctx.lineTo((0 - bugWidth * 1), firstQuarter - bugWidth);
        ctx.lineTo((0 - bugWidth * 1) - bugWidth / 2, (firstQuarter - bugWidth) + (bugLength / 5));
        //Second leg pair
        var secondQuarter = firstQuarter + (bugLength - this.headLen) / 4;
        ctx.moveTo(0, secondQuarter);
        ctx.lineTo((bugWidth * 1), secondQuarter - bugWidth);
        ctx.lineTo((bugWidth * 1) + bugWidth / 2, (secondQuarter - bugWidth) + (bugLength / 5));
        ctx.moveTo(0, secondQuarter);
        ctx.lineTo((0 - bugWidth * 1), secondQuarter - bugWidth);
        ctx.lineTo((0 - bugWidth * 1) - bugWidth / 2, (secondQuarter - bugWidth) + (bugLength / 5));
        //Third leg pair
        var thirdQuarter = secondQuarter + (bugLength - this.headLen) / 4;
        ctx.moveTo(0, thirdQuarter);
        ctx.lineTo((bugWidth * 1), thirdQuarter - bugWidth);
        ctx.lineTo((bugWidth * 1) + bugWidth / 2, (thirdQuarter - bugWidth) + (bugLength / 5));
        ctx.moveTo(0, thirdQuarter);
        ctx.lineTo((0 - bugWidth * 1), thirdQuarter - bugWidth);
        ctx.lineTo((0 - bugWidth * 1) - bugWidth / 2, (thirdQuarter - bugWidth) + (bugLength / 5));
        ctx.stroke();

        //Create the head
        ctx.beginPath();
        ctx.arc(0, (this.headLen / 2), this.headLen / 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        //Find the point on the head to attach antennae
        var x1 = 0;
        var y1 = this.headLen / 2;
        var x2 = x1 + (this.headLen / 2) * Math.sin(Math.PI / 4);
        var y2 = y1 - (this.headLen / 2) * Math.cos(Math.PI / 4);
        var x3 = x1 - (this.headLen / 2) * Math.sin(Math.PI / 4);
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 + this.headLen / 3, y2 - this.headLen / 2);
        ctx.lineTo((x2 + this.headLen / 3) + (this.headLen / 3), y2 - this.headLen / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x3, y2);
        ctx.lineTo(x3 - this.headLen / 3, y2 - this.headLen / 2);
        ctx.lineTo((x3 - this.headLen / 3) - (this.headLen / 3), y2 - this.headLen / 2);
        ctx.stroke();
        ctx.beginPath();
        //Start the body shape at the neck
        ctx.beginPath();
        ctx.moveTo(0, this.headLen);
        //Draw the body
        ctx.bezierCurveTo((0 - bugWidth), (this.headLen), (0 - bugWidth), (bugLength), 0, (bugLength));
        ctx.moveTo(0, this.headLen);
        ctx.bezierCurveTo((bugWidth), (this.headLen), (bugWidth), (bugLength), 0, (bugLength));
        ctx.stroke();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, this.headLen);
        ctx.lineTo(0, (bugLength));
        ctx.stroke();
        ctx.beginPath();

        ctx.restore();
}

/*  Kill this bug, fading it off the game and granting points
*/
function killBug(){
    this.speed = 0;
    score += this.points;
    this.forRemoval = true;
}

/*Create a food at the given location
*x: x coordinate of food in pixels
*y: y coordinate of food in pixels
*/
function CreateFood(x, y) {

    this.xLoc = x;
    this.yLoc = y;

    this.remove = removeFood;
    this.draw = drawFood;
}

function drawFood(){
    var canvas = document.getElementById("gameCanvas");
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "green";
    ctx.strokeStyle = "black";
    ctx.beginPath;
    ctx.moveTo(this.xLoc, this.yLoc);
    ctx.arc(this.xLoc, this.yLoc, foodSize / 2, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
    ctx.beginPath;
}

/* Remove the food from the game. Must remove the image and then remove it from the global food list
*/
function removeFood(){
    //First paint over the food with white
    var ctx = document.getElementById("gameCanvas").getContext('2d');
    ctx.fillStyle = "white";
    ctx.beginPath;
    ctx.moveTo(this.xLoc, this.yLoc);
    ctx.arc(this.xLoc, this.yLoc, foodSize / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath;
    //Now find this food in the global array and remove it
    for (var i = 0; i < foodList.length; i++){
        var curFood = foodList[i];
        if (curFood.xLoc == this.xLoc && curFood.yLoc == this.yLoc){
            foodList.splice(i, 1);
            break;
        }
    }
    if (foodList.length == 0){
        endRound();
    }
}

/*Draws and updates the scoreboard at the top of the game*/
function drawScoreboard() {
    var ctx = document.getElementById("gameCanvas").getContext('2d');
    ctx.clearRect(0, 0, xLimit, 50);
    ctx.strokeRect(0, 0, xLimit, 50);

    ctx.font = "30px Arial";
    ctx.strokeText("Time: " + (60 - curTime), 10, 45);
    ctx.strokeText("Score: " + score, 250, 45)

    drawPauseButton(gamePaused);
}

//Draws and operates the pause button. State refers to paused or unpaused. false for playing, true for paused
function drawPauseButton(state) {
    this.xLoc = 175;
    this.yLoc = 15;
    var ctx = document.getElementById("gameCanvas").getContext('2d');
    switch (state) {
        case false:
            ctx.fillStyle = "black"
            ctx.fillRect(this.xLoc, this.yLoc, 10, 30);
            ctx.fillRect(this.xLoc + 20, this.yLoc, 10, 30);
            break;
        case true:
            ctx.beginPath;
            ctx.fillStyle = "green";
            ctx.moveTo(this.xLoc, this.yLoc);
            ctx.lineTo(this.xLoc, this.yLoc + 30);
            ctx.lineTo(this.xLoc + 30, this.yLoc + 15);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath;
            break;
        default:
            break;
    }
}

/* Check if a bug is located at the location (xPos, yPos).  If there is, remove it and grant its score.
*/
function checkBugClicked(xPos, yPos){
    for (var i = 0; i < bugList.length; i++){
        var bug = bugList[i];
        var minXBound = Math.min(bug.xLoc, bug.endX) - Math.abs(Math.cos(bug.direction) * bugWidth);
        var maxXBound = Math.max(bug.xLoc, bug.endX) + Math.abs(Math.cos(bug.direction) * bugWidth);
        var minYBound = Math.min(bug.yLoc, bug.endY) - Math.abs(Math.sin(bug.direction) * bugWidth);
        var maxYBound = Math.max(bug.yLoc, bug.endY) + Math.abs(Math.sin(bug.direction) * bugWidth);
        if (xPos >= minXBound && xPos <= maxXBound && yPos >= minYBound && yPos <= maxYBound && !bug.forRemoval){
            bug.kill();
        }
    }
}

//responds to mouse clicks
function getPosition(event) {
    mouseX = event.offsetX;
    mouseY = event.offsetY;
    //Check to see if game starting
    if (!gameStarted){
        var ctx = document.getElementById("gameCanvas").getContext('2d');
        if (mouseX >= startButtonX && mouseX <= (startButtonX + startButtonWidth) && mouseY >= startButtonY && mouseY <= (startButtonY + startButtonHeight)){
            gameStarted = !gameStarted;
        } else if (mouseX >= level1SelectX && mouseX <= level1SelectX+levelSelectSize && mouseY >= level1SelectY && mouseY <= level1SelectY+levelSelectSize){
            level = 0;
        } else if (mouseX >= level2SelectX && mouseX <= level2SelectX+levelSelectSize && mouseY >= level2SelectY && mouseY <= level2SelectY+levelSelectSize) {
            level = 1;
        }
        switch (level){
        case 0:
            ctx.fillRect(level1SelectX, level1SelectY, levelSelectSize, levelSelectSize);
            ctx.clearRect(level2SelectX, level2SelectY, levelSelectSize, levelSelectSize);
            break;
        case 1:
            ctx.fillRect(level2SelectX, level2SelectY, levelSelectSize, levelSelectSize);
            ctx.clearRect(level1SelectX, level1SelectY, levelSelectSize, levelSelectSize);
            break;
        default:
            break;
    }
    }
    //check to see if pause button clicked
    if (mouseX >= 175 && mouseX <= 205 && mouseY >= 15 && mouseY <= 45){
        gamePaused = !gamePaused;
        drawScoreboard();
    //Check to see if a bug was clicked
    } else {
        //Cheating prevention
        if (!gamePaused){
            checkBugClicked(mouseX, mouseY);
        }
    }
}

//Code for ranom number on interval from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomIntInclusive(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomColour(){
    var num = Math.random();
    switch (true){
        case (num < 0.4):
            return "orange";
            break;
        case (num < 0.7):
            return "red";
            break;
        case (num < 1.0):
            return "black";
            break;
        default:
            return "blue"
            break;
    }
}

//Updates the time every second and then adds a bug to the board if a new bug is due
function addRandomBug(){
    if (curTime >= 60){
        endRound();
    } else if (!gamePaused) {
        curTime ++;
        if (curTime == (nextBug + lastBugTime)){
            //Get colour and x location of bug
            var randomX = getRandomIntInclusive(10, 390);
            var randColour = getRandomColour();
           
            bugList.push(new CreateBug(randomX, 60, 0, randColour));
            lastBugTime = curTime;
            nextBug = nextBugTime();
        }
    }
}

/*  Get the food object closest to this bug object. Return 0 if there is no food.
*/
function getClosestFood(){
    if (foodList.length == 0){
        return 0;
    } else {
        var curClosest = -1;
        var curDistance = -1;
        for (var i = 0; i < foodList.length; i++){
            var curFood = foodList[i];
            var distance = Math.sqrt(Math.pow(curFood.xLoc - this.xLoc, 2) + Math.pow(curFood.yLoc - this.yLoc, 2));
            if (curClosest == -1){
                curClosest = curFood;
                curDistance = distance;
            } else if (distance < curDistance) {
                curClosest = curFood;
                curDistance = distance;
            }
        }
        return curClosest;
    }
}

/*  Get this bug's angle direction to the given food object.
*/
function getDirectionToFood(food){
    return Math.round(Math.abs(Math.atan2(food.yLoc - this.xLoc, food.xLoc - this.xLoc) * 180/Math.PI));
}

/*  Check to see if the bug has reached the given food.  Remove the food if the bug has.
*/
function checkFood(food){
    if ((Math.pow(this.endX - food.xLoc, 2) + Math.pow(this.endY - food.yLoc, 2)) < Math.pow(foodSize/2, 2)){
        food.remove();
    }
}

/* Move this bug forward depending on its speed.
*/
function moveForward(){
    this.xLoc = this.xLoc + this.speed * ((Math.floor(Math.cos(this.direction*Math.PI/180)) + 0.5) * 2);
    this.yLoc = this.yLoc + this.speed * ((Math.floor(Math.sin(this.direction*Math.PI/180)) + 0.5) * 2);
    this.endX = this.xLoc + bugLength * Math.cos(this.direction*Math.PI/180);
    this.endY = this.yLoc + bugLength * Math.sin(this.direction*Math.PI/180);
}

/*  Animate the bugs.  Rotate each bug towards the closest food, increment bugs' positions towards food.
* Consume food if the bug has reached a food object.
* Re-draw the food
*/
function animateBoard(){
    var ctx = document.getElementById("gameCanvas").getContext('2d');
    if (!gamePaused){
        ctx.clearRect(0, 50, xLimit, yLimit - 50);
        ctx.strokeRect(0, 50, xLimit, yLimit - 50);
        //Loop through each bug and for each one find its new direction and move it forward.
        for (var i = 0; i < bugList.length; i++){
            var bug = bugList[i];
            var closestFood = bug.getClosestFood();
            if (closestFood != 0){
                if (!bug.forRemoval){
                    bug.direction = bug.getDirectionToFood(closestFood);
                    bug.moveForward();
                    bug.checkFood(closestFood);
                }
                if (bug.alpha > 0){
                    bug.draw();
                }
            }
        }

        for (var j = 0; j < foodList.length; j++){
            foodList[j].draw();
        }
        drawScoreboard();
        //Spin while the game is going but don't refresh until game is unpaused
    }
        window.requestAnimationFrame(animateBoard);
}


/*
* Add numFoods foods to the board with random locations
*/
function createRandomFoods(numFoods){
    for (var i = 0; i < numFoods; i++){
        var randX = getRandomIntInclusive(0, xLimit);
        var randY = getRandomIntInclusive((0 + yLimit/5), yLimit);
        foodList.push(new CreateFood(randX, randY));
    }
}

//Return an int from 1-3 inclusive
function nextBugTime(){
    var num = 10;
    while (num != 10){
        num = Math.floor((Math.random() * 10 ) + 1);
    }
    return ((num % 3) + 1)
}

/*  Called when the current round has ended. Manage storing the score and moving on to the next round
*  or ending the game.
*/
function endRound(){
    window.clearInterval(bugInterval);
    if (score > highScore){
        window.localStorage.setItem('highScore', score);
    }
    level ++;
    if (level > 1){
        //Game ends
    } else {
        runGame();
    }
}

/*Function to run the game.  Needs to keep track of bug and food locations, update score, update animations, etc
*/
function runGame() {
    score = 0;
    gamePaused = false;
    curTime = 0;
    nextBug = 1
    lastBugTime = 0;
    bugList = [];
    foodList = [];

    drawScoreboard();
    bugInterval = window.setInterval(addRandomBug, 1000);
    createRandomFoods(5);
    window.requestAnimationFrame(animateBoard);
}
window.onload = init;
