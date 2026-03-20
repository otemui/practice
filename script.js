//const enemyImg = new Image();
const enemyImages = ["MimizUma.png", "MimizUma2.png", "MimizUma3.png"].map(path => Object.assign(new Image(), {src: path}));
const playerImg = new Image();
const pointImg = new Image(); 
const pointImg2 = new Image();
const effectCageImg = new Image();
playerImg.src = "CatMagicianNoWhite.png";
//enemyImg.src = "MimizUma.png";
pointImg.src = "BardBlessing.png";
pointImg2.src = "BardBlessing2.png";
effectCageImg.src = "EffectCage.png";
const PlayerSize = 40;
const EnemySize = 33;
const FeeldSize = 400;
const ShakeTime = 20;
const PlayerStaminaMax = 30;
const PlayerStaminaCost = 0.3;
const PlayerStaminaLimit = 3;
const EnemySenseOfSmell = 200;
let TimeScale = 1.0;
let player = {x: 0, y: 0, size: PlayerSize, color:"red", deg:"right", speed: 10, state:"walk", stamina:100};
let bar = {x: player.x, y:player.y - PlayerSize / 2, BarColor:"green", BlankColor:"yellow", LimitColor:"red", sizeX:PlayerSize, sizeY:5, life:0.5};
let particlesCage = [];
let particlesPoint = [];
let enemies = [];
let food = {x: Math.random() * FeeldSize - PlayerSize, y: Math.random() * FeeldSize - PlayerSize, size: PlayerSize - 10, color: "yellow"};
let gameState = {state: "start", score: 0, highscore: 0, highCombo: 0};
let frame = 0;
let index = 0;
let shaketime = 0;
let comboCount = 0;
let comboTimer = 0;
let grayAmount = 0;
let fingerDownX = 0;
let fingerDownY = 0;
let fingerX = 0;
let fingerY = 0;
let isFingerDown = false;
let OperatePlayer = false;
const scoreElemant = document.getElementById("currentScore");
const highscoreElemant = document.getElementById("highScore");
const highComboElemant = document.getElementById("highCombo");
gameState.highscore = Number(localStorage.getItem("HighScore"));
gameState.highCombo = Number(localStorage.getItem("HighCombo"));
scoreElemant.textContent = "Score: " + gameState.score;
highscoreElemant.textContent = "HighScore: " + gameState.highscore;
highComboElemant.textContent = "HighCombo: " + gameState.highCombo;
const canvas = document.getElementById("gameCanvas");//canvasの指定
const ctx = canvas.getContext("2d");//canvasに書き込むための筆の入手

ctx.textAlign = "center";

function effectCage(){
    for (let i = 0; i < 20; i++){
        particlesCage.push({x:food.x + food.size / 2, y:food.y + food.size / 2,vx: (Math.random() - 0.5) * 4, vy:(Math.random() - 0.5) * 4, size: 5, life:1.0});    //{x,y:餌の中心, vx,vy;-2~2までのランダムの速度,size粒の大きさ:,life;透明度}
    }
}

function effectPoint(){
    particlesPoint.push({x:food.x + food.size / 2, y:food.y + food.size / 2, vx: food.x + food.size / 2, vy: -0.75, size: 5, life: 1.0}); 
}

function gameover(){
    ctx.clearRect(0, 0, FeeldSize, FeeldSize);
    gameState.state = "gameover";
}

function draw(){
    if(gameState.state === "start"){
        ctx.font = "20px Arial";
        ctx.fillStyle = "black";
        ctx.fillText("Game STart", FeeldSize / 2, FeeldSize / 2);
        ctx.font = "20px Arial";
        ctx.fillText("Prease press Enter", FeeldSize / 2, FeeldSize / 2 + 20);
        shaketime = 0;
        enemies = [];
        enemies.push({x: FeeldSize - EnemySize, y: FeeldSize - EnemySize, size:EnemySize, color:"blue", speed: 0.4, deg:"left", state:"CHASE", PatrolGoalX: 0, PatrolGoalY:0});
        gameState.highscore = Number(localStorage.getItem("HighScore"));
    }else if(gameState.state === "play"){
        ctx.save();
        grayAmount = (1.0 - TimeScale) * 100;
        ctx.filter = `grayscale(${grayAmount}%)`;
        if(Math.abs(player.x - food.x) < PlayerSize && Math.abs(player.y - food.y) < PlayerSize){   //鳥加護当たり判定
            effectCage();
            effectPoint();
            TimeScale = 0.1;
            comboTimer = 1.0;
            food.x = Math.random() * (FeeldSize - PlayerSize);
            food.y = Math.random() * (FeeldSize - PlayerSize); 
            if(comboTimer > 0) comboCount++;     
            gameState.score = gameState.score + 1;
            //shaketime = 20;
            if(gameState.score % 5 != 0){
                enemies.forEach((enemy) => {
                    enemy.speed += 0.03;
                });    
            }else{
                enemies.push({x: FeeldSize - EnemySize, y: FeeldSize - EnemySize, size:EnemySize, color:"blue", speed: 0.4, deg:"left", state:"PATROL"});
            }    
        }


        if(TimeScale === 1.0) ctx.filter = "none";
        TimeScale = TimeScale + 1 / 120;
        if(TimeScale >= 0.5) TimeScale = 1.0;
        if (shaketime > 0){     //敵との接触においての画面の振動
            ctx.save();
            ctx.translate((Math.random() - 0.5) * shaketime, (Math.random() - 0.5) * shaketime);
            shaketime--;
            if(shaketime == 0) {
                gameover();
            }
        }

        ctx.clearRect(0, 0, FeeldSize, FeeldSize);  //canvasリセット
        frame++;

        (frame % 120 < 60) ? ctx.drawImage(pointImg, food.x, food.y, food.size, food.size) : ctx.drawImage(pointImg2, food.x, food.y, food.size, food.size);   //鳥籠のアニメーション
        particlesCage.forEach((P) => {
            P.x += P.vx * TimeScale;
            P.y += P.vy * TimeScale;
            P.life -= 0.02;
            ctx.save();
            ctx.globalAlpha = Math.max(0, P.life);
            ctx.drawImage(effectCageImg, P.x, P.y, P.size, P.size);
            ctx.restore();
        });
        particlesCage = particlesCage.filter(p => {
            return p.life > 0;
        });
        
        ctx.drawImage(playerImg, player.x, player.y, player.size, player.size); //プレイヤーの表示
        if(player.state === "run"){
            (player.stamina > 0) ? player.speed = 20 : player.state = "tired";
        }else if(player.state === "walk"){
            player.speed = 10;
            player.stamina = player.stamina + 1 / 30;
        }else if(player.state === "tired"){
            player.speed = 5;
            player.stamina = player.stamina + 1 / 60;
            if(player.stamina > PlayerStaminaLimit) player.state = "walk";
        }
        if(player.deg === "left"){
            ctx.save();
            ctx.translate(player.x + player.size, player.y);
            ctx.scale(-1,1);
            ctx.drawImage(playerImg, 0, 0, player.size, player.size);
            ctx.restore(); 
        }

        scoreElemant.textContent = "Score: " + gameState.score;     //スコアの表記
        highscoreElemant.textContent = "HighScore: " + gameState.highscore;
        highComboElemant.textContent = "HighCombo: " + gameState.highCombo;

        comboTimer = comboTimer - 1 / 180;      //コンボ表記
        if (comboTimer < 0) {
            comboTimer = 0;
            comboCount = 0;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, comboTimer);
        ctx.strokeStyle = "black";
        ctx.lineWidth = "20px";
        ctx.strokeText(comboCount + " COMBO", FeeldSize - 50, 40);
        ctx.font = "20px Arial";
        ctx.fillStyle = "red";
        ctx.fillText(comboCount + " COMBO", FeeldSize - 50, 40);
        ctx.restore();

        enemies.forEach((enemy) => {        //敵のもろもろ　ミミズ馬
            //console.log(enemy.state);
            ctx.beginPath();
            if (enemy.state === "CHASE"){
                ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
            }else{
                ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
            }         
            ctx.lineWidth = 2;
            ctx.arc(enemy.x + EnemySize / 2, enemy.y + EnemySize / 2 , EnemySenseOfSmell, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            if(enemy.state === "CHASE"){
                ctx.fillStyle = "rgba(255,0,0,0.1)";
            }else{
                ctx.fillStyle = "rgba(0,0,255,0.1)";
            }
            
            ctx.arc(enemy.x + EnemySize / 2, enemy.y + EnemySize / 2 , EnemySenseOfSmell, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();

            index = Math.floor(frame / 40 ) % enemyImages.length;
            ctx.fillStyle = enemy.color; //enemy
            ctx.drawImage(enemyImages[index], enemy.x, enemy.y, enemy.size, enemy.size);
            if(enemy.state == "CHASE") {
                if(player.x - enemy.x < 0) {
                    enemy.x = enemy.x - enemy.speed * TimeScale;
                    enemy.deg = "left";
                }else{
                    enemy.x = enemy.x + enemy.speed * TimeScale;
                    enemy.deg = "right";
                }
                enemy.y += (player.y - enemy.y < 0) ? -enemy.speed : enemy.speed;

                if(Math.hypot(enemy.x - player.x, enemy.y - player.y) >= EnemySenseOfSmell){
                    enemy.state = "PATROL";
                }
            }else if(enemy.state == "PATROL"){
                enemy.PatrolGoalX = Math.random() * (FeeldSize - EnemySize);
                enemy.PatrolGoalY = Math.random() * (FeeldSize - EnemySize);
                enemy.state = "PATROLING";
            }else if(enemy.state == "PATROLING") {
                if(Math.abs(enemy.PatrolGoalX - enemy.x) > Math.abs(enemy.PatrolGoalY - enemy.y)){    //enemy移動
                    //enemy.x += (enemy.x - enemy.x < 0) ? -enemy.speed : enemy.speed;   //条件が真なら左，そうでないなら右の値を返す．
                    if(enemy.PatrolGoalX - enemy.x < 0) {
                        enemy.x = enemy.x - enemy.speed * TimeScale;
                        enemy.deg = "left";
                    }else{
                        enemy.x = enemy.x + enemy.speed * TimeScale;
                        enemy.deg = "right";
                    }
                }else{
                    enemy.y += (enemy.PatrolGoalY - enemy.y < 0) ? -enemy.speed : enemy.speed;
                }

                if(Math.abs(enemy.x - enemy.PatrolGoalX) < EnemySize && Math.abs(enemy.x - enemy.PatrolGoalX) < EnemySize) enemy.state = "PATROL";
                if(Math.hypot(enemy.x - player.x, enemy.y - player.y) < EnemySenseOfSmell){
                    //enemy.state = "CHASE";
                }
            }
            if(Math.abs(player.x - enemy.x) < PlayerSize - 5 && Math.abs(player.y - enemy.y) < PlayerSize - 5){     //敵との当たり判定
                if(shaketime == 0) shaketime = ShakeTime;
            }
            if(enemy.deg === "right"){  //敵の向き表示
                ctx.save();
                ctx.translate(enemy.x + enemy.size, enemy.y);
                ctx.scale(-1,1);
                ctx.drawImage(enemyImages[index], 0, 0, enemy.size, enemy.size);
                ctx.restore(); 
            }

            particlesPoint.forEach(p => {   //ポイントの表記
                if (frame % 3 == 0) p.x += (Math.random() - 0.5) * 10;
                p.y += p.vy;
                p.life -= 0.03;
                ctx.save();
                ctx.globalAlpha = Math.max(0, p.life);
                ctx.font = "30px Arial";
                ctx.fillStyle = "red";
                ctx.fillText("+1P", p.x, p.y);
                ctx.font = "20px Arial";
                ctx.fillText(comboCount + " COMBO", p.vx, p.y + 20);
                ctx.restore();
            });
            particlesPoint = particlesPoint.filter(P => {
                return P.life > 0;
            });

        });

        if(food.x < 0) food.x = 0;
        if(food.x > FeeldSize) food.x = (FeeldSize - PlayerSize);
        if(food.y < 0) food.y = 0;
        if(food.y > FeeldSize) food.y = (FeeldSize - PlayerSize);      


        if (player.stamina >= PlayerStaminaMax) player.stamina = PlayerStaminaMax;  //プレイヤーのスタミナ関係
        if (player.stamina <= 0) player.stamina = 0;
        bar.x = player.x;
        bar.y = player.y + PlayerSize - bar.sizeY;
        ctx.save();
        ctx.globalAlpha = bar.life;
        ctx.fillStyle = bar.BlankColor;
        ctx.fillRect(bar.x, bar.y, bar.sizeX * (1 - PlayerStaminaLimit / PlayerStaminaMax), bar.sizeY);
        ctx.fillStyle = bar.LimitColor;
        ctx.fillRect(bar.x + bar.sizeX * (1 - PlayerStaminaLimit / PlayerStaminaMax), bar.y, bar.sizeX * PlayerStaminaLimit / PlayerStaminaMax, bar.sizeY);
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = bar.life + 0.2;
        ctx.fillStyle = bar.BarColor;
        ctx.fillRect(bar.x + bar.sizeX * (1- player.stamina / PlayerStaminaMax), bar.y, bar.sizeX * (player.stamina / PlayerStaminaMax), bar.sizeY);
        ctx.restore();
        ctx.restore();



        if(isFingerDown == "true"){
            ctx.beginPath();
            ctx.strokeStyle = "rgba(72, 72, 72, 0.2)";      
            ctx.lineWidth = 2;
            ctx.arc(fingerDownX, fingerDownY , 50, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.fillStyle = "rgba(28,28,28,0.5)";
            ctx.arc(fingerDownX, fingerDownY, 50, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();

            let vx = fingerX - fingerDownX;
            let vy = fingerY - fingerDownY;
            let distance = Math.hypot(vx, vy);
            if(distance > 50){
                fingerX = fingerDownX + (50 * vx / distance);
                fingerY = fingerDownY + (50 * vy / distance);
            }

            ctx.beginPath();
            ctx.strokeStyle = "rgba(14, 14, 14, 0.2)";      
            ctx.lineWidth = 2;
            ctx.arc(fingerX, fingerY , 20, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.fillStyle = "rgb(0, 0, 0, 1)";
            ctx.arc(fingerX, fingerY, 20, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            
        }

        if(shaketime != 0) ctx.restore();
    }else if(gameState.state === "gameover"){
        gameover();
        ctx.font = "40px Arial";
        ctx.fillStyle = "black";
        ctx.fillText("Score: " + gameState.score, FeeldSize / 2, FeeldSize / 2 + 60);
        ctx.font = "40px Arial";
        ctx.fillStyle = "black";
        ctx.fillText("Game Over", FeeldSize / 2, FeeldSize / 2);
        ctx.font = "20px Arial";
        ctx.fillText("Prease press Enter", FeeldSize / 2, FeeldSize / 2 + 20);

        if(gameState.highscore < gameState.score) localStorage.setItem("HighScore", gameState.score);
        if(gameState.highCombo < comboCount) localStorage.setItem("HighCombo", comboCount);
    }
    requestAnimationFrame(draw);
}

playerImg.onload = () =>{
    draw();
}

window.addEventListener("keyup", (e) => {
    if (e.key === " ") {
        if (player.stamina > 5) {
            player.state = "walk";
        }else{
            player.state = "tired";
        }
    }
});

window.addEventListener("keydown", (e) => {
    //アロー関数　引数を使いまわせる
    if (e.key === "Enter") {
        if(gameState.state === "start") gameState.state = "play";
        if(gameState.state === "gameover"){
            ctx.clearRect(0, 0, FeeldSize, FeeldSize);
            gameState.state = "start";
            player = {x: 0, y: 0, size: PlayerSize, color:"red", deg:"right", speed: 10, state:"walk", stamina:100};
            food = food;
            gameState.score = 0;
            scoreElemant.textContent = "Score: " + gameState.score;
            frame = 0;
        }
    }
    if (e.key === "ArrowRight") {
        if (shaketime == 0 && player.x < FeeldSize - PlayerSize){
            player.x = player.x + player.speed * TimeScale;
            if(player.state === "run") player.stamina = player.stamina - PlayerStaminaCost;
            player.deg = "right";
        }       
    }
    if (e.key === "ArrowLeft") {
        if (shaketime == 0 && player.x > 0){
            player.x = player.x - player.speed * TimeScale;
            if(player.state === "run") player.stamina = player.stamina - PlayerStaminaCost;
            player.deg = "left";
        }
    }
    if (e.key === "ArrowUp") {
        if (shaketime == 0 && player.y > 0){
            player.y = player.y - player.speed * TimeScale;
            if(player.state === "run") player.stamina = player.stamina - PlayerStaminaCost;
        }
    }
    if (e.key === "ArrowDown"){
        if (shaketime == 0 && player.y < FeeldSize - PlayerSize){
            player.y = player.y + player.speed * TimeScale;
            if(player.state === "run") player.stamina = player.stamina - PlayerStaminaCost;
        }
    }

    if (e.key === " ") {
        if (player.stamina > PlayerStaminaLimit){
            player.state = "run";
        }
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    fingerDownX = touch.pageX - rect.left;
    fingerDownY = touch.pageY - rect.top;
    isFingerDown = "true";
}, {passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    isFingerDown = "false";
}, {passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    fingerX = touch.pageX - rect.left;
    fingerY = touch.pageY - rect.top;
    //isFingerDown = "true";
}, {passive: false });

window.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];

    if(gameState.state === "start") gameState.state = "play";
    if(gameState.state === "gameover"){
        ctx.clearRect(0, 0, FeeldSize, FeeldSize);
        gameState.state = "start";
        player = {x: 0, y: 0, size: PlayerSize, color:"red", deg:"right", speed: 10, state:"walk", stamina:100};
        food = food;
        gameState.score = 0;
        scoreElemant.textContent = "Score: " + gameState.score;
        frame = 0;
    }

}, {passive: false });