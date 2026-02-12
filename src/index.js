const canvas = document.getElementById("steam_engine");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth/ 1.2;
canvas.height = (window.innerWidth/ 1.2)*9/16;

const linewWidth = 10;

ctx.fillStyle = "white";
ctx.strokeStyle = "white";
ctx.lineWidth = linewWidth;

let angle = 0;

function draw(angle){
    drawWheel(angle);
    drawPiston(angle);
    drawCombustionChamber();
    drawBase();
    drawPistonValve(angle);
    drawTopBlock();
    drawExhaust();
}


const wheel_x = 1070;
const wheel_y = 600;
const wheel_ext_r = 240;
const wheel_piston_r = 100;
const spoke_n = 7;
const spoke_a = (360 / spoke_n)*Math.PI/180;
const spoke_w = 8;    
const spoke_curve = 0.15 * wheel_ext_r;

function drawWheel(angle){
    ctx.beginPath();
    ctx.lineWidth = 22;
    ctx.arc(wheel_x, wheel_y, wheel_ext_r, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 6;
    ctx.arc(wheel_x, wheel_y, wheel_piston_r, 0, 2 * Math.PI);
    ctx.stroke();

    for (let i = 0; i < 10; i++) {
        const a = angle + i * spoke_a;
        const endX = wheel_x + wheel_ext_r * Math.cos(a);
        const endY = wheel_y + wheel_ext_r * Math.sin(a);
        // midpoint of spoke
        const midX = wheel_x + 0.5 * wheel_ext_r * Math.cos(a);
        const midY = wheel_y + 0.5 * wheel_ext_r * Math.sin(a);
        // perpendicular direction
        const perpX = -Math.sin(a);
        const perpY =  Math.cos(a);
        // control point
        const ctrlX = midX + perpX * spoke_curve;
        const ctrlY = midY + perpY * spoke_curve;
        ctx.beginPath();
        ctx.lineWidth = spoke_w;
        ctx.lineCap = "butt";
        ctx.moveTo(wheel_x, wheel_y);
        ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
        ctx.stroke();
    }
    ctx.lineWidth = linewWidth;
}


const piston_h = 120;
const piston_w = 20;
let piston_x;   //the value at the middle of the piston
const piston_y = 560; //height of the piston axis
const connectingRod_w = 350; //goes into the middle of the piston
const connectingRod_h = 10;
const rodLength = 350;

function drawPiston(angle){
    //coords calculation:
    let wheel_arm_x = wheel_x + wheel_piston_r * Math.cos(angle);
    let wheel_arm_y = wheel_y + wheel_piston_r*Math.sin(angle);

    let dy = wheel_arm_y - piston_y;
    let dx = Math.sqrt(rodLength**2 - dy**2);
    piston_x = wheel_arm_x - dx - connectingRod_w -  piston_w/2;

    //from the wheel to the piston rod
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.moveTo(wheel_arm_x, wheel_arm_y);
    ctx.lineTo(piston_x + connectingRod_w, piston_y);
    ctx.stroke();

    //fixed rod
    ctx.beginPath();
    ctx.fillRect(piston_x, piston_y - connectingRod_h/2, connectingRod_w, connectingRod_h);
    //piston
    ctx.fillRect(piston_x - piston_w/2, piston_y - piston_h / 2, piston_w, piston_h); 
    ctx.fill();
}


const combustionChamber_w = 50;
const combustionPipe_r = combustionChamber_w - piston_w/2 + 5;
const bezier_pipe_x1_term = 60;
const bezier_pipe_x2_term = 80;
const bezier_pipe_y1_term = 20;
const bezier_pipe_y2_term = 40;
const bezier_pipe_y3_term = 60;

//for excentric rods
let delta_Y = Math.abs(wheel_y - piston_y);
let x_pms = Math.sqrt((rodLength - wheel_piston_r)**2 - delta_Y**2);
let x_pmi = Math.sqrt((rodLength + wheel_piston_r)**2 - delta_Y**2);

let left_wall_combustion_x = wheel_x - x_pmi - connectingRod_w - piston_w/2 - combustionChamber_w;
let rigth_wall_combustion_x = wheel_x - x_pms - connectingRod_w - piston_w/2 + combustionChamber_w;
function drawCombustionChamber(){
    ctx.beginPath(); //lower combustion chamber
    ctx.moveTo(rigth_wall_combustion_x, piston_y + 10);
    ctx.lineTo(rigth_wall_combustion_x, piston_y + piston_h/2);
    ctx.lineTo(left_wall_combustion_x, piston_y + piston_h/2);
    ctx.lineTo(left_wall_combustion_x, piston_y - piston_h/2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rigth_wall_combustion_x, piston_y - 10);
    ctx.lineTo(rigth_wall_combustion_x, piston_y - piston_h/2);
    ctx.stroke();

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


let lastTime = 0;
function animate(time){
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = canvas.width / 1422; // original design width

    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(-40, 0);
    draw(angle);
    ctx.restore();

    angle += (300 * Math.PI / 180)* deltaTime;
    ctx.fillStyle = "white";
    ctx.strokeStyle = "white";
    ctx.lineWidth = linewWidth;
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

function resizeCanvas() {
    canvas.width = window.innerWidth / 1.2;
    canvas.height = canvas.width * 9 / 16;  // keep aspect ratio
}

window.addEventListener('resize', () => {
    resizeCanvas();
});
resizeCanvas();