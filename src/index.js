const canvas = document.getElementById("steam_engine");
const lineColor = "white";
const fillColor = "white";
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
        this.speed = (100 * Math.PI) / 180;
        this.model = new SteamModel(this.angle, this.width, this.height);
        this.animate = this.animate.bind(this);
        this.canvas.steamEngineInstance = this;

        this.lineColor = lineColor;
        this.fillColor = fillColor;
        this.lineWidth = lineWidth;
        this.setDefaultStyles();
        requestAnimationFrame(this.animate);
    }

    draw() {
        this.drawWheel();
        this.drawPiston();
        this.drawChamber();
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

        this.ctx.lineWidth = this.linewWidth;
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
        this.ctx.moveTo(this.model.leftChamberWall + this.model.bezierPipeX3 + 20, this.model.bezierPipeY3 - 15);
        this.ctx.lineTo(this.model.rightChamberWall - this.model.bezierPipeX3 - 20, this.model.bezierPipeY3 - 15);
        this.ctx.strokeStyle ="#FFFFFF07";
        this.ctx.stroke();

        this.ctx.beginPath();//middle block right
        this.ctx.strokeStyle =this.lineColor;
        this.ctx.lineCap = "butt";
        this.ctx.moveTo(this.model.middlePoint - 10, this.model.pistonY - this.model.pistonHeight/2);
        this.ctx.lineTo(this.model.pmiX, this.model.pistonY - this.model.pistonHeight/2);
        this.ctx.lineTo(this.model.pmiX, this.model.pistonY - this.model.pistonHeight/2 - this.model.bezierPadding1);
        this.ctx.bezierCurveTo(this.model.pmiX - this.model.bezierPipeX1, this.model.bezierPipeY1, this.model.pmiX, this.model.bezierPipeY2, this.model.pmiX - this.model.bezierPipeX3, this.model.bezierPipeY3);
        this.ctx.lineTo(this.model.pmiX - this.model.bezierPipeX3 - 5, this.model.bezierPipeY3);
        this.ctx.lineTo(this.model.pmiX - this.model.bezierPipeX3 - 5, this.model.bezierPipeY3 - 15);
        this.ctx.lineTo(this.model.pmiX - this.model.bezierPipeX3 - 15, this.model.bezierPipeY3 - 15);
        this.ctx.stroke();

        this.ctx.beginPath();//middle block left
        this.ctx.moveTo(this.model.middlePoint - 10, this.model.pistonY - this.model.pistonHeight/2);
        this.ctx.lineTo(this.model.pmsX, this.model.pistonY - this.model.pistonHeight/2);
        this.ctx.lineTo(this.model.pmsX, this.model.pistonY - this.model.pistonHeight/2 - this.model.bezierPadding1);
        this.ctx.bezierCurveTo(this.model.pmsX + this.model.bezierPipeX1, this.model.bezierPipeY1, this.model.pmsX, this.model.bezierPipeY2, this.model.pmsX + this.model.bezierPipeX3, this.model.bezierPipeY3);
        this.ctx.lineTo(this.model.pmsX + this.model.bezierPipeX3 + 5, this.model.bezierPipeY3);
        this.ctx.lineTo(this.model.pmsX + this.model.bezierPipeX3 + 5, this.model.bezierPipeY3 - 15);
        this.ctx.lineTo(this.model.pmsX + this.model.bezierPipeX3 + 15, this.model.bezierPipeY3 - 15);
        this.ctx.stroke();

        this.ctx.beginPath();//middle block exterior right
        this.ctx.lineCap = "butt";
        this.ctx.moveTo(this.model.rightChamberWall, this.model.pistonY - this.model.pistonHeight/2);
        this.ctx.lineTo(this.model.rightChamberWall, this.model.pistonY - this.model.pistonHeight/2 - this.model.bezierPadding1);
        this.ctx.bezierCurveTo(this.model.rightChamberWall - this.model.bezierPipeX1, this.model.bezierPipeY1, this.model.rightChamberWall, this.model.bezierPipeY2, this.model.rightChamberWall - this.model.bezierPipeX3, this.model.bezierPipeY3-15);
        this.ctx.lineTo(this.model.rightChamberWall - this.model.bezierPipeX3 - 20, this.model.bezierPipeY3 - 15);
        this.ctx.stroke();

        this.ctx.beginPath();//middle block exterior left
        this.ctx.moveTo(this.model.leftChamberWall, this.model.pistonY - this.model.pistonHeight/2);
        this.ctx.lineTo(this.model.leftChamberWall, this.model.pistonY - this.model.pistonHeight/2 - this.model.bezierPadding1);
        this.ctx.bezierCurveTo(this.model.leftChamberWall + this.model.bezierPipeX1, this.model.bezierPipeY1, this.model.leftChamberWall, this.model.bezierPipeY2, this.model.leftChamberWall + this.model.bezierPipeX3, this.model.bezierPipeY3-15);
        this.ctx.lineTo(this.model.leftChamberWall + this.model.bezierPipeX3 + 20, this.model.bezierPipeY3 - 15);
        this.ctx.stroke();
    }
}


class SteamModel {
    constructor(angle, width, height) {
        this.angle = 0;
        this.width = width;
        this.height = height;
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
        this.pistonX = this.pistonRodX - this.pistonRodLength - this.pistonWidth/2;
    }

    staticCalculus(){
        let delta_Y = Math.abs(this.wheelY - this.pistonY);
        this.pmsX = this.wheelX - Math.sqrt((this.pistonRodLength + this.wheelPistonRadius)**2 - delta_Y**2) - this.pistonRodWidth  - this.pistonWidth;
        this.pmiX = this.wheelX - Math.sqrt((this.pistonRodLength - this.wheelPistonRadius)**2 - delta_Y**2) - this.pistonRodWidth;
        this.middlePoint = (this.pmiX + this.pmsX)/2;

        this.rightChamberWall = this.pmiX + this.combustionChamberWidth;
        this.leftChamberWall = this.pmsX - this.combustionChamberWidth;

        this.bezierPadding1 = 20
        this.bezierPipeX1 = 30;
        this.bezierPipeY1 = this.pistonY - this.pistonHeight/2 - 40;
        this.bezierPipeY2 = this.pistonY - this.pistonHeight/2 - 40;
        this.bezierPipeX3 = 50;
        this.bezierPipeY3 = this.pistonY - this.pistonHeight/2 - 50;

    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.scale = width / this.designWidth;
        this.staticCalculus();
    }
}






/*
const combustionChamber_w = 50;
const combustionPipe_r = combustionChamber_w - piston_w/2 + 5;
const bezier_pipe_x1_term = 60;
const bezier_pipe_x2_term = 80;
const bezier_pipe_y1_term = 20;
const bezier_pipe_y2_term = 40;
const bezier_pipe_y3_term = 60;

function drawCombustionChamber(){


    ctx.beginPath(); //middle block section
    ctx.moveTo(left_wall_combustion_x + combustionPipe_r, piston_y - piston_h/2);
    ctx.lineTo(rigth_wall_combustion_x - combustionPipe_r, piston_y - piston_h/2 );
    ctx.bezierCurveTo(rigth_wall_combustion_x - combustionPipe_r, piston_y - piston_h/2 - bezier_pipe_y1_term, rigth_wall_combustion_x - combustionPipe_r - bezier_pipe_x1_term, piston_y - piston_h/2 - bezier_pipe_y2_term , rigth_wall_combustion_x - combustionPipe_r - bezier_pipe_x2_term, piston_y - piston_h/2- bezier_pipe_y3_term);
    ctx.moveTo(left_wall_combustion_x + combustionPipe_r, piston_y - piston_h/2);
    ctx.bezierCurveTo(left_wall_combustion_x + combustionPipe_r, piston_y - piston_h/2 - bezier_pipe_y1_term, left_wall_combustion_x + combustionPipe_r + bezier_pipe_x1_term, piston_y - piston_h/2 - bezier_pipe_y2_term , left_wall_combustion_x + combustionPipe_r + bezier_pipe_x2_term, piston_y - piston_h/2 - bezier_pipe_y3_term);
    ctx.stroke();

    ctx.beginPath(); //exterior bezier section 
    ctx.moveTo(rigth_wall_combustion_x, piston_y - piston_h/2);
    ctx.bezierCurveTo(rigth_wall_combustion_x , piston_y - piston_h/2 - bezier_pipe_y1_term, rigth_wall_combustion_x - bezier_pipe_x1_term, piston_y - piston_h/2 - bezier_pipe_y2_term , rigth_wall_combustion_x - bezier_pipe_x2_term, piston_y - piston_h/2 - bezier_pipe_y3_term);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(left_wall_combustion_x, piston_y - piston_h/2);
    ctx.bezierCurveTo(left_wall_combustion_x, piston_y - piston_h/2 - bezier_pipe_y1_term, left_wall_combustion_x + bezier_pipe_x1_term, piston_y - piston_h/2 - bezier_pipe_y2_term , left_wall_combustion_x  + bezier_pipe_x2_term, piston_y - piston_h/2 - bezier_pipe_y3_term);
    ctx.stroke();
}


const base_margin_r = 40;
const base_h = 250;
const  base_right_width = 110;
let base_r = wheel_piston_r + base_margin_r;
//line from base_rod to 
let base_rod_x = rigth_wall_combustion_x;
let base_rod_y = piston_y + piston_h / 2;
let base_rod_length = Math.hypot(base_rod_x - wheel_x,base_rod_y - wheel_y);
let tangent_angle = Math.atan2(base_rod_y - wheel_y, base_rod_x - wheel_x) - Math.acos(base_r / base_rod_length); // the low tangent angle
//tangent points
let tx = wheel_x + base_r * Math.cos(tangent_angle);
let ty = wheel_y + base_r * Math.sin(tangent_angle);
//tangent direction (perpendicular to radius)
let t = (base_rod_x - tx) / -Math.sin(tangent_angle);
let base_rod_x_end = base_rod_x;
let base_rod_y_end = ty + t * Math.cos(tangent_angle)

function drawBase() {
    ctx.beginPath();
    ctx.arc(wheel_x, wheel_y,base_r,0,tangent_angle,false);
    ctx.moveTo(tx, ty);
    ctx.lineTo(base_rod_x_end, base_rod_y_end);
    ctx.lineTo(rigth_wall_combustion_x, piston_y + piston_h/2);
    ctx.lineTo(left_wall_combustion_x, piston_y + piston_h/2);
    ctx.lineTo(left_wall_combustion_x, piston_y + piston_h/2 + base_h);
    ctx.lineTo(wheel_x + base_r + base_right_width, piston_y + piston_h/2 + base_h);
    ctx.lineTo(wheel_x + base_r + base_right_width, wheel_y);
    ctx.lineTo(wheel_x + base_r, wheel_y);
    ctx.stroke();
    ctx.fill();
}


let valve_h = 50;
let valve_w = 2.5 * combustionPipe_r;
let valve_r = 5;
let valve_y = piston_y - piston_h/2- bezier_pipe_y3_term  - valve_h/2;
let middle_point = (rigth_wall_combustion_x + left_wall_combustion_x)/2;
let movement_ratio = (rigth_wall_combustion_x - combustionPipe_r - bezier_pipe_x2_term - middle_point)/(-middle_point + rigth_wall_combustion_x -combustionChamber_w - piston_w/2 + 5);

let valve_phase = Math.PI / 2; 
let valve_throw = combustionPipe_r * 0.5;
const eccentric_r = 22;            
const eccentric_phase = Math.PI/2;
let rodValveLength = 376;   //fine tuned
function drawPistonValve(){
    function getEccentricPos(angle) {
        return {
            x: wheel_x + eccentric_r * Math.cos(angle + eccentric_phase),
            y: wheel_y + eccentric_r * Math.sin(angle + eccentric_phase)
        };
    }
    const valveRodLength = 380;

    function getValveX(angle) {
        const ecc = getEccentricPos(angle);
        const dy = ecc.y - valve_y;
        const inside = valveRodLength**2 - dy**2;
        if (inside <= 0) return middle_point;
        const dx = Math.sqrt(inside);
        return ecc.x - dx;
    }
    const ecc = getEccentricPos(angle);
    const valve_x = getValveX(angle);

    //wheel rod
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineWidth = 6;
    ctx.moveTo(ecc.x, ecc.y);
    ctx.lineTo(valve_x, valve_y);
    ctx.stroke();

    //valve with fixed rod
    ctx.beginPath();
    ctx.roundRect(valve_x - valve_w/2 -rodValveLength, valve_y - valve_h/2, valve_w, valve_h, valve_r);
    ctx.fill()
    ctx.beginPath();
    ctx.lineWidth = 6;
    ctx.moveTo(valve_x, valve_y);
    ctx.lineTo(valve_x +  valve_w/2 - rodValveLength, valve_y);
    ctx.stroke();
    ctx.clearRect(valve_x - valve_w/2 + 20 -rodValveLength , valve_y - valve_h/2 + 20, valve_w - 40 , valve_h - 20) 
    //wheel circle
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.arc(wheel_x, wheel_y, eccentric_r, 0, 2 * Math.PI);
    ctx.stroke();
}


let top_chamber_w = 100;
function drawTopBlock(){
    ctx.beginPath(); //right
    ctx.moveTo(rigth_wall_combustion_x - bezier_pipe_x2_term, piston_y - piston_h/2 - bezier_pipe_y3_term);
    ctx.lineTo(rigth_wall_combustion_x - bezier_pipe_x2_term + top_chamber_w, piston_y - piston_h/2 - bezier_pipe_y3_term);
    ctx.lineTo(rigth_wall_combustion_x - bezier_pipe_x2_term + top_chamber_w, piston_y - piston_h/2 - bezier_pipe_y3_term - valve_h/2 + 8);
    ctx.stroke();

    ctx.beginPath(); //left
    ctx.moveTo(left_wall_combustion_x  + bezier_pipe_x2_term, piston_y - piston_h/2 - bezier_pipe_y3_term);
    ctx.lineTo(left_wall_combustion_x  + bezier_pipe_x2_term - top_chamber_w/2, piston_y - piston_h/2 - bezier_pipe_y3_term);
    ctx.lineTo(left_wall_combustion_x  + bezier_pipe_x2_term - top_chamber_w/2, piston_y - piston_h/2 - bezier_pipe_y3_term - valve_h - 10);
    ctx.lineTo(left_wall_combustion_x  + bezier_pipe_x2_term - top_chamber_w/2 + 20, piston_y - piston_h/2 - bezier_pipe_y3_term - valve_h - 10 - 20);
    ctx.lineTo(rigth_wall_combustion_x - bezier_pipe_x2_term + top_chamber_w - 20, piston_y - piston_h/2 - bezier_pipe_y3_term - valve_h - 10 - 20);
    ctx.lineTo(rigth_wall_combustion_x - bezier_pipe_x2_term + top_chamber_w, piston_y - piston_h/2 - bezier_pipe_y3_term - valve_h - 10);
    ctx.lineTo(rigth_wall_combustion_x - bezier_pipe_x2_term + top_chamber_w, piston_y - piston_h/2 - bezier_pipe_y3_term - valve_h/2 - 8);
    ctx.stroke();
}


const exhaust_x = 80;
const exhaust_w = 25;
const exhaust_h = 100; 
function drawExhaust(){
    ctx.beginPath(); //right
    ctx.moveTo(rigth_wall_combustion_x - bezier_pipe_x2_term + top_chamber_w - exhaust_x, piston_y - piston_h/2 - bezier_pipe_y3_term - valve_h - 10 - 20);
    ctx.lineTo(rigth_wall_combustion_x - bezier_pipe_x2_term + top_chamber_w - exhaust_x, piston_y - piston_h/2 - bezier_pipe_y3_term - valve_h - exhaust_h);
    ctx.lineTo(rigth_wall_combustion_x - bezier_pipe_x2_term + top_chamber_w - exhaust_x + 100, piston_y - piston_h/2 - bezier_pipe_y3_term - valve_h - exhaust_h - 100);
    ctx.stroke();

    ctx.beginPath(); //left
    ctx.moveTo(rigth_wall_combustion_x - bezier_pipe_x2_term + top_chamber_w - exhaust_x - exhaust_w, piston_y - piston_h/2 - bezier_pipe_y3_term - valve_h - 10 - 20);
    ctx.lineTo(rigth_wall_combustion_x - bezier_pipe_x2_term + top_chamber_w - exhaust_x - exhaust_w, piston_y - piston_h/2 - bezier_pipe_y3_term - valve_h - exhaust_h - exhaust_w/2);
    ctx.lineTo(rigth_wall_combustion_x - bezier_pipe_x2_term + top_chamber_w - exhaust_x - exhaust_w + 112 , piston_y - piston_h/2 - bezier_pipe_y3_term - valve_h - exhaust_h - exhaust_w/2 - 112);
    ctx.stroke();
}
*/

let lastTime = 0;
function animate(time){

}


