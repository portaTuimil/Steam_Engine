const canvas = document.getElementById("steam_engine");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth/ 1.2;
canvas.height = (window.innerWidth/ 1.2)*9/16;

ctx.fillStyle = "white";
ctx.strokeStyle = "white";
ctx.lineWidth = 5;

let angle = 0;

function draw(angle){
    drawWheel(angle);
    drawPiston(angle);
    drawCombustionChamber();
    drawBase();
}


let wheel_x = 1070;
let wheel_y = 540;
let wheel_ext_r = 200;
let wheel_piston_r = 140;
let spoke_n = 7;
let spoke_a = (360 / spoke_n)*Math.PI/180;
let spoke_w = 8;

function drawWheel(angle){
    ctx.beginPath();
    ctx.arc(wheel_x, wheel_y, wheel_ext_r, 0, 2 * Math.PI);
    ctx.stroke();
    for (let i = 0; i<10; i++){
        ctx.beginPath();
        ctx.lineWidth = spoke_w;
        ctx.lineCap = "butt";
        ctx.moveTo(wheel_x, wheel_y);
        ctx.lineTo(wheel_ext_r * Math.cos(angle + i*spoke_a) + wheel_x, wheel_ext_r * Math.sin(angle + i*spoke_a) + wheel_y);
        ctx.stroke();
        ctx.lineWidth = 5;
    }
}


let piston_h = 100;
let piston_w = 20;
let piston_x;   //the value at the middle of the piston
let piston_y = 500; //height of the piston axis
let connectingRod_w = 350; //goes into the middle of the piston
let connectingRod_h = 10;
let rodLength = 350;

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


let combustionChamber_w = 50;
let combustionPipe_r = 50;
let bezier_pipe_x1_term = 50;
let bezier_pipe_x2_term = 60;
let bezier_pipe_y1_term = 20;
let bezier_pipe_y2_term = 40;
let bezier_pipe_y3_term = 60;

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
    ctx.stroke();
    ctx.beginPath();
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


let base_margin_r = 40;
let base_h = 250;
let base_right_width = 30;
let base_r = wheel_piston_r + base_margin_r;
//line from base_rod to 
const base_rod_x = rigth_wall_combustion_x;
const base_rod_y = piston_y + piston_h / 2;
const base_rod_length = Math.hypot(base_rod_x - wheel_x,base_rod_y - wheel_y);
const tangent_angle = Math.atan2(base_rod_y - wheel_y, base_rod_x - wheel_x) - Math.acos(base_r / base_rod_length); // the low tangent angle
//tangent points
const tx = wheel_x + base_r * Math.cos(tangent_angle);
const ty = wheel_y + base_r * Math.sin(tangent_angle);
//tangent direction (perpendicular to radius)
const t = (base_rod_x - tx) / -Math.sin(tangent_angle);
const base_rod_x_end = base_rod_x;
const base_rod_y_end = ty + t * Math.cos(tangent_angle);

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
    ctx.fill();
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
}


let lastTime = 0;
function animate(time){
    const deltaTime = (time - lastTime) / 1000; // seconds
    lastTime = time;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //actualizar el estado
    angle += (180 * Math.PI / 180)* deltaTime;
    draw(angle);
    window.requestAnimationFrame(animate);
}

//draw(angle);
requestAnimationFrame(animate);