const canvas = document.getElementById("steam_engine");
const lineColor = "#FFFFFF";
const fillColor = "#FFFFFF";
const lineWidth = 10;

window.addEventListener("load", () => {
    const width = window.innerWidth / 1.2;
    const height = width * 9 / 16;
    canvas.width = width;
    canvas.height = height;
    const steamEngine = new SteamEngine(canvas, lineColor, fillColor, lineWidth);
});

window.addEventListener("resize", () => {
    const canvas = document.getElementById("steam_engine");
    const width = window.innerWidth / 1.2;  //proportions of the viewport
    const height = width * 9 / 16;

    canvas.steamEngineInstance.resize(width, height);
});

class SteamEngine {
    constructor(canvas, lineColor, fillColor, lineWidth) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.width = canvas.width;
        this.height = canvas.height;

        this.lastTime = 0;
        this.speed = (160 * Math.PI) / 180;
        this.animate = this.animate.bind(this);
        this.canvas.steamEngineInstance = this;

        this.lineColor = lineColor;
        this.fillColor = fillColor;
        this.lineWidth = lineWidth;
        
        this.model = new SteamModel(this.angle, this.width, this.height, this.lineWidth);
        this.effect = new Effect(this.ctx, this.model.exhaustX, this.model.exhaustY);
        this.setDefaultStyles();
        requestAnimationFrame(this.animate);
    }

    draw() {
        this.drawWheel();
        this.drawPiston();
        this.drawChamber();
        this.drawBase();
        this.drawPistonValve();
        this.drawTopChamber();
        this.drawExhaust();
    }

    animate(time) {
        const deltaTime = (time - (this.lastTime || time)) / 1000;
        this.lastTime = time;
        const deltaAngle = this.speed * deltaTime;
        this.model.calculate(deltaAngle);

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.save();
        this.ctx.scale(this.model.scale, this.model.scale);
        this.ctx.translate(-40, 0);

        this.effect.draw(deltaAngle);
        this.draw();
        this.ctx.restore();
        requestAnimationFrame(this.animate);
    }

    resize(width, height, lineColor, fillColor, lineWidth) {
        this.width = width;
        this.height = height;

        this.canvas.width = width;
        this.canvas.height = height;

        this.model.resize(width, height);
        this.setDefaultStyles();
    }

    setDefaultStyles(){
        this.ctx.strokeStyle = this.lineColor;
        this.ctx.fillStyle = this.fillColor;
        this.ctx.lineWidth = this.lineWidth;
    }

    drawWheel(){
        this.ctx.beginPath();
        this.ctx.lineWidth = 22;
        this.ctx.arc(this.model.wheelX, this.model.wheelY, this.model.wheelExteriorRadius, 0, 2 * Math.PI);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.lineWidth = 6;
        this.ctx.arc(this.model.wheelX, this.model.wheelY, this.model.wheelPistonRadius, 0, 2 * Math.PI);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.lineWidth = 6;
        this.ctx.arc(this.model.wheelX, this.model.wheelY, this.model.wheelValveRadius, 0, 2 * Math.PI);
        this.ctx.stroke();


        for (let i = 0; i < 10; i++) {
            const a = this.model.angle + i * this.model.spokeAngle;
            const endX = this.model.wheelX + this.model.wheelExteriorRadius * Math.cos(a);
            const endY = this.model.wheelY + this.model.wheelExteriorRadius * Math.sin(a);
            // midpoint of spoke
            const midX = this.model.wheelX + 0.5 * this.model.wheelExteriorRadius * Math.cos(a);
            const midY = this.model.wheelY + 0.5 * this.model.wheelExteriorRadius * Math.sin(a);
            // perpendicular direction
            const perpX = -Math.sin(a);
            const perpY =  Math.cos(a);
            // control point
            const ctrlX = midX + perpX * this.model.spokeCurve;
            const ctrlY = midY + perpY * this.model.spokeCurve;
            this.ctx.beginPath();
            this.ctx.lineWidth = this.model.spokeLineWidth;
            this.ctx.lineCap = "butt";
            this.ctx.moveTo(this.model.wheelX, this.model.wheelY);
            this.ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
            this.ctx.stroke();
        };
        this.ctx.lineWidth = this.lineWidth;
    }

    drawPiston(){
        this.ctx.beginPath();
        this.ctx.lineCap = "round";
        this.ctx.moveTo(this.model.wheelArmX, this.model.wheelArmY);
        this.ctx.lineTo(this.model.pistonRodX, this.model.pistonY);
        this.ctx.stroke();
        
        this.ctx.beginPath(); //pistonRod and piston
        this.ctx.fillRect(this.model.pistonX + this.model.pistonWidth/2, this.model.pistonY - this.model.pistonRodHeight/2, this.model.pistonRodWidth, this.model.pistonRodHeight);
        this.ctx.fillRect(this.model.pistonX - this.model.pistonWidth/2, this.model.pistonY - this.model.pistonHeight / 2, this.model.pistonWidth, this.model.pistonHeight); 
        this.ctx.fill();
    }

    drawChamber(){
        this.ctx.beginPath(); //lower combustion chamber
        this.ctx.lineCap = "butt";
        this.ctx.moveTo(this.model.rightChamberWall, this.model.pistonY + this.model.rodGap);
        this.ctx.lineTo(this.model.rightChamberWall, this.model.pistonY + this.model.pistonHeight/2);
        this.ctx.lineTo(this.model.leftChamberWall, this.model.pistonY + this.model.pistonHeight/2);
        this.ctx.lineTo(this.model.leftChamberWall, this.model.pistonY - this.model.pistonHeight/2);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.model.rightChamberWall, this.model.pistonY - this.model.rodGap);   
        this.ctx.lineTo(this.model.rightChamberWall, this.model.pistonY - this.model.pistonHeight/2);
        this.ctx.stroke();

        this.ctx.beginPath();//middle block exterior left
        this.ctx.moveTo(this.model.leftChamberWall + this.model.bezierPipeX3 + 20, this.model.bezierPipeY3 - this.model.bezierPadding2);
        this.ctx.lineTo(this.model.rightChamberWall - this.model.bezierPipeX3 - 20, this.model.bezierPipeY3 - this.model.bezierPadding2);
        this.ctx.strokeStyle = this.lineColor + "07";
        this.ctx.stroke();

        this.ctx.beginPath();//middle block right
        this.ctx.strokeStyle = this.lineColor;
        this.ctx.lineCap = "butt";
        this.ctx.moveTo(this.model.middlePoint - 10, this.model.pistonY - this.model.pistonHeight/2);
        this.ctx.lineTo(this.model.pmiX, this.model.pistonY - this.model.pistonHeight/2);
        this.ctx.lineTo(this.model.pmiX, this.model.pistonY - this.model.pistonHeight/2 - this.model.bezierPadding1);
        this.ctx.bezierCurveTo(this.model.pmiX - this.model.bezierPipeX1, this.model.bezierPipeY1, this.model.pmiX, this.model.bezierPipeY2, this.model.pmiX - this.model.bezierPipeX3, this.model.bezierPipeY3);
        this.ctx.lineTo(this.model.pmiX - this.model.bezierPipeX3 - 5, this.model.bezierPipeY3);
        this.ctx.lineTo(this.model.pmiX - this.model.bezierPipeX3 - 5, this.model.bezierPipeY3 - this.model.bezierPadding2);
        this.ctx.lineTo(this.model.pmiX - this.model.bezierPipeX3 - 15, this.model.bezierPipeY3 - this.model.bezierPadding2);
        this.ctx.stroke();

        this.ctx.beginPath();//middle block left
        this.ctx.moveTo(this.model.middlePoint - 10, this.model.pistonY - this.model.pistonHeight/2);
        this.ctx.lineTo(this.model.pmsX, this.model.pistonY - this.model.pistonHeight/2);
        this.ctx.lineTo(this.model.pmsX, this.model.pistonY - this.model.pistonHeight/2 - this.model.bezierPadding1);
        this.ctx.bezierCurveTo(this.model.pmsX + this.model.bezierPipeX1, this.model.bezierPipeY1, this.model.pmsX, this.model.bezierPipeY2, this.model.pmsX + this.model.bezierPipeX3, this.model.bezierPipeY3);
        this.ctx.lineTo(this.model.pmsX + this.model.bezierPipeX3 + 5, this.model.bezierPipeY3);
        this.ctx.lineTo(this.model.pmsX + this.model.bezierPipeX3 + 5, this.model.bezierPipeY3 - this.model.bezierPadding2);
        this.ctx.lineTo(this.model.pmsX + this.model.bezierPipeX3 + 15, this.model.bezierPipeY3 - this.model.bezierPadding2);
        this.ctx.stroke();

        this.ctx.beginPath();//middle block exterior right
        this.ctx.lineCap = "butt";
        this.ctx.moveTo(this.model.rightChamberWall, this.model.pistonY - this.model.pistonHeight/2);
        this.ctx.lineTo(this.model.rightChamberWall, this.model.pistonY - this.model.pistonHeight/2 - this.model.bezierPadding1);
        this.ctx.bezierCurveTo(this.model.rightChamberWall - this.model.bezierPipeX1, this.model.bezierPipeY1, this.model.rightChamberWall, this.model.bezierPipeY2, this.model.rightChamberWall - this.model.bezierPipeX3, this.model.bezierPipeY3-15);
        this.ctx.lineTo(this.model.rightChamberWall - this.model.bezierPipeX3 - 20, this.model.bezierPipeY3 - this.model.bezierPadding2);
        this.ctx.stroke();

        this.ctx.beginPath();//middle block exterior left
        this.ctx.moveTo(this.model.leftChamberWall, this.model.pistonY - this.model.pistonHeight/2);
        this.ctx.lineTo(this.model.leftChamberWall, this.model.pistonY - this.model.pistonHeight/2 - this.model.bezierPadding1);
        this.ctx.bezierCurveTo(this.model.leftChamberWall + this.model.bezierPipeX1, this.model.bezierPipeY1, this.model.leftChamberWall, this.model.bezierPipeY2, this.model.leftChamberWall + this.model.bezierPipeX3, this.model.bezierPipeY3-15);
        this.ctx.lineTo(this.model.leftChamberWall + this.model.bezierPipeX3 + 20, this.model.bezierPipeY3 - this.model.bezierPadding2);
        this.ctx.stroke();
    }

    drawBase() {
        this.ctx.beginPath();
        this.ctx.lineCap = "round";
        this.ctx.arc(this.model.wheelX, this.model.wheelY, this.model.baseRadius, 0, this.model.tangentAngle, false);
        this.ctx.moveTo(this.model.tx, this.model.ty);
        this.ctx.lineTo(this.model.rightChamberWall, this.model.baseRodEndY);
        this.ctx.lineTo(this.model.rightChamberWall, this.model.baseRodY);
        this.ctx.lineTo(this.model.leftChamberWall, this.model.baseRodY);
        this.ctx.lineTo(this.model.leftChamberWall, this.model.baseRodY + this.model.baseHeight);
        this.ctx.lineTo(this.model.wheelX + this.model.baseRadius + this.model.baseRightWidth, this.model.baseRodY + this.model.baseHeight);
        this.ctx.lineTo(this.model.wheelX + this.model.baseRadius + this.model.baseRightWidth, this.model.wheelY);
        this.ctx.lineTo(this.model.wheelX + this.model.baseRadius, this.model.wheelY);
        this.ctx.stroke();
        this.ctx.fill();
    }

    drawPistonValve(){
        this.ctx.beginPath();
        this.ctx.moveTo(this.model.valveWheelArmX, this.model.valveWheelArmY);
        this.ctx.lineTo(this.model.valveRodX, this.model.valveY);
        this.ctx.stroke();
        
        this.ctx.fillRect(this.model.valveX - this.model.valveWidth/2, this.model.valveY - this.model.valveHeight/2, this.model.valveWidth, this.model.valveHeight/2);
        this.ctx.fillRect(this.model.valveX + this.model.valveWidth/2, this.model.valveY - this.model.valveRodHeight/2, this.model.valveRodWidth, this.model.valveRodHeight);
        this.ctx.fillRect(this.model.valveX + this.model.valveWidth/2 - this.model.valveWidth/this.model.valveOpeningFactor, this.model.valveY - this.model.valveHeight/2, this.model.valveWidth/this.model.valveOpeningFactor, this.model.valveHeight);
        this.ctx.fillRect(this.model.valveX - this.model.valveWidth/2, this.model.valveY - this.model.valveHeight/2, this.model.valveWidth/this.model.valveOpeningFactor, this.model.valveHeight);
    }

    drawTopChamber(){
        this.ctx.beginPath();
        this.ctx.lineCap = "butt";
        this.ctx.moveTo(this.model.rightTopChamberWall, this.model.valveY + 8);
        this.ctx.lineTo(this.model.rightTopChamberWall, this.model.bezierPipeY3 - this.model.bezierPadding2);
        this.ctx.lineTo(this.model.rightTopChamberWall - this.model.rightTopChamberPadding, this.model.bezierPipeY3 - this.model.bezierPadding2);
        this.ctx.moveTo(this.model.leftTopChamberWall + this.model.leftTopChamberPadding, this.model.bezierPipeY3 - this.model.bezierPadding2);
        this.ctx.lineTo(this.model.leftTopChamberWall, this.model.bezierPipeY3 - this.model.bezierPadding2);
        this.ctx.lineTo(this.model.leftTopChamberWall, this.model.valveY - this.model.topChamberHeight + 20);
        this.ctx.lineTo(this.model.leftTopChamberWall + 20, this.model.valveY - this.model.topChamberHeight);
        this.ctx.lineTo(this.model.rightTopChamberWall, this.model.valveY - this.model.topChamberHeight);
        this.ctx.lineTo(this.model.rightTopChamberWall, this.model.valveY - 8);
        this.ctx.stroke();
    }

    drawExhaust(){
        this.ctx.beginPath();
        this.ctx.moveTo(this.model.rightTopChamberWall, this.model.valveY - 25);
        this.ctx.lineTo(this.model.rightTopChamberWall + 40 + this.model.exhaustPipeRadius/2, this.model.valveY - 25);
        this.ctx.lineTo(this.model.rightTopChamberWall + 40 + 60 + this.model.exhaustPipeRadius/2, this.model.valveY - 25 - 40);
        this.ctx.moveTo(this.model.rightTopChamberWall, this.model.valveY - 25 - this.model.exhaustPipeRadius);
        this.ctx.lineTo(this.model.rightTopChamberWall + 40, this.model.valveY - 25 - this.model.exhaustPipeRadius);
        this.ctx.lineTo(this.model.rightTopChamberWall + 40 + 60, this.model.valveY - 25 - 40 - this.model.exhaustPipeRadius);
        this.ctx.stroke();
    }
}


class SteamModel {
    constructor(angle, width, height, lineWidth) {
        this.angle = 0;
        this.width = width;
        this.height = height;
        this.lineWidth = lineWidth;
        this.designWidth = 1422;
        this.scale = this.width / this.designWidth;

        //wheel
        this.wheelX = 1070;
        this.wheelY = 600;
        this.wheelExteriorRadius = 240;
        this.wheelPistonRadius = 100;
        this.spokeNumber = 7;
        this.spokeAngle = (2 * Math.PI) / this.spokeNumber;
        this.spokeLineWidth = 8;
        this.spokeCurve = 0.15 * this.wheelExteriorRadius;

        //piston
        this.pistonHeight = 120;
        this.pistonWidth = 20;
        this.pistonX = undefined;   //the value at the middle of the piston
        this.pistonY = 560; //height of the piston axis
        this.pistonRodWidth = 350; //goes into the middle of the piston
        this.pistonRodHeight = 10;
        this.pistonRodLength = 350;

        //combustion chamber
        this.combustionChamberWidth = 50;
        this.rodGap = 8;
        this.staticCalculus();
    }

    calculate(deltaAngle) {
        this.angle += deltaAngle;

        this.wheelArmX = this.wheelX + this.wheelPistonRadius * Math.cos(this.angle);
        this.wheelArmY = this.wheelY + this.wheelPistonRadius * Math.sin(this.angle);

        this.pistonRodX = this.wheelArmX - Math.sqrt(this.pistonRodLength**2 - (this.wheelArmY - this.pistonY)**2);
        this.pistonX = this.pistonRodX - this.pistonRodWidth - this.pistonWidth/2;
        let delta_Valve_Y = Math.abs(this.wheelY - this.valveY);

        this.valveWheelArmX = this.wheelX + this.wheelValveRadius * Math.cos(this.angle + this.valvePhase);
        this.valveWheelArmY = this.wheelY + this.wheelValveRadius * Math.sin(this.angle + this.valvePhase);
        this.valveRodX = this.valveWheelArmX - Math.sqrt(this.valveRodLength**2 - delta_Valve_Y**2);
        this.valveX = this.valveRodX - this.valveRodWidth - this.valveWidth/2;
    }

    staticCalculus(){
        let delta_Piston_Y = Math.abs(this.wheelY - this.pistonY);
        this.pmsX = this.wheelX - Math.sqrt((this.pistonRodLength + this.wheelPistonRadius)**2 - delta_Piston_Y**2) - this.pistonRodWidth  - this.pistonWidth;
        this.pmiX = this.wheelX - Math.sqrt((this.pistonRodLength - this.wheelPistonRadius)**2 - delta_Piston_Y**2) - this.pistonRodWidth;
        this.middlePoint = (this.pmiX + this.pmsX)/2;

        this.rightChamberWall = this.pmiX + this.combustionChamberWidth;
        this.leftChamberWall = this.pmsX - this.combustionChamberWidth;

        this.bezierPadding1 = 20;
        this.bezierPadding2 = 15;
        this.bezierPipeX1 = 30;
        this.bezierPipeY1 = this.pistonY - this.pistonHeight/2 - 40;
        this.bezierPipeY2 = this.pistonY - this.pistonHeight/2 - 40;
        this.bezierPipeX3 = 70;
        this.bezierPipeY3 = this.pistonY - this.pistonHeight/2 - 50;

        this.baseHeight = 250;
        this.baseRightWidth = 110;
        this.baseMarginRadius = 40;
        this.baseRadius = this.wheelPistonRadius + this.baseMarginRadius;

        this.baseRodX = this.rightChamberWall;
        this.baseRodY = this.pistonY + this.pistonHeight/2;
        this.baseRodLength = Math.hypot(this.baseRodX - this.wheelX, this.baseRodY - this.wheelY);
        this.tangentAngle = Math.atan2(this.baseRodY - this.wheelY, this.baseRodX - this.wheelX) - Math.acos(this.baseRadius / this.baseRodLength); // the low tangent angle
        this.tx = this.wheelX + this.baseRadius * Math.cos(this.tangentAngle);
        this.ty = this.wheelY + this.baseRadius * Math.sin(this.tangentAngle);
        //tangent direction (perpendicular to radius)
        let t = (this.baseRodX - this.tx) / -Math.sin(this.tangentAngle);
        this.baseRodEndX = this.baseRadius;
        this.baseRodEndY = this.ty + t * Math.cos(this.tangentAngle);

        this.valveHeight = 32;
        this.valveWidth = 2.7 * this.combustionChamberWidth;
        this.wheelValveRadius = 27;
        this.valveY = this.bezierPipeY3 - this.bezierPadding2 - this.valveHeight/2 - this.lineWidth/2;
        this.valvePhase = Math.PI/2;

        this.valveRodLength = 380; //valveRodLength value has to be fine tuned to compensate the delta in Y differences.
        this.valveRodWidth = 309;
        this.valveRodHeight = 10;
        this.valveOpeningFactor = 5.7;
        this.rightTopChamberPadding = 100;
        this.leftTopChamberPadding = 80;
        this.rightTopChamberWall = this.rightTopChamberPadding + this.rightChamberWall - this.bezierPipeX3;
        this.leftTopChamberWall = -this.leftTopChamberPadding + this.leftChamberWall + this.bezierPipeX3;
        this.topChamberHeight = 80;

        this.exhaustPipeRadius = 20;
        this.exhaustX = this.rightTopChamberWall + 40 + 60 + 22; 
        this.exhaustY = this.valveY - 25 - 40 - this.exhaustPipeRadius;
    } 
    
    resize(width, height) { 
        this.width = width;
        this.height = height;
        this.scale = width / this.designWidth;
        this.staticCalculus();
    }
}


class Particle {
    constructor(ctx, exhaustX, exhaustY){
        this.ctx = ctx;
        this.X = exhaustX;
        this.Y = exhaustY;
        this.r = 10 * Math.random();
        this.dX = 1;
        this.dY = 4;
        this.opacity = "99";
    }

    draw(){
        this.X += this.dX * Math.random();
        this.Y -= this.dY * Math.random();
        this.dX += 0.2 * Math.random();
        this.dY -= 0.01 * Math.random();
        this.r +=  0.4 * Math.random();

        if(this.r > 12){this.opacity = "66"};
        if(this.r > 16){this.opacity = "44"};
        if(this.r > 22){this.opacity = "22"};

        this.ctx.fillStyle = "#ffffff" + this.opacity;
        this.ctx.beginPath();
        this.ctx.arc(this.X, this.Y, this.r, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = "#ffffff";
    }
}


class Effect {
    constructor(ctx, exhaustX, exhaustY){
        this.ctx = ctx;
        this.exhaustX = exhaustX;
        this.exhaustY = exhaustY;
        this.particles = [];
        this.angle = 0;
    }

    draw(deltaAngle) {
        this.angle += deltaAngle;

        if(this.angle >= 2*Math.PI){
            this.angle -= 2*Math.PI;
        }

        if((Math.PI + 1 < this.angle && this.angle < Math.PI + 3.05) || (1 < this.angle && this.angle < 3.05) ){
            for(let i = 0; i<=1; i++){
                this.particles.push(new Particle(this.ctx, this.exhaustX, this.exhaustY));

                if(this.particles.length > 170){
                    this.particles.shift();
                }
            }
        }

        this.particles.forEach(particle => {
            particle.draw();
        });
    }
}


