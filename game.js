class SnakeGame {
    constructor() {
        this.board = document.getElementById('gameBoard');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.scoreElement = document.getElementById('score');
        
        this.gridSize = 20;
        this.tileCount = 20;
        this.speed = 150;
        
        this.snake = [];
        this.food = {};
        this.direction = 'right';
        this.score = 0;
        this.gameInterval = null;
        this.isGameRunning = false;
        
        // 初始化音频上下文
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        this.init();
    }
    
    init() {
        this.board.style.width = `${this.gridSize * this.tileCount}px`;
        this.board.style.height = `${this.gridSize * this.tileCount}px`;
        
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    startGame() {
        if (this.isGameRunning) return;
        
        this.isGameRunning = true;
        this.snake = [
            { x: 10, y: 10 }
        ];
        this.direction = 'right';
        this.score = 0;
        this.scoreElement.textContent = this.score;
        
        this.generateFood();
        this.gameInterval = setInterval(() => this.gameLoop(), this.speed);
    }
    
    restartGame() {
        clearInterval(this.gameInterval);
        this.startGame();
    }
    
    gameLoop() {
        this.moveSnake();
        if (this.checkCollision()) {
            this.gameOver();
            return;
        }
        this.checkFood();
        this.draw();
    }
    
    moveSnake() {
        const head = { ...this.snake[0] };
        
        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        this.snake.unshift(head);
        if (!this.checkFood()) {
            this.snake.pop();
        }
        this.playMoveSound();
    }
    
    checkCollision() {
        const head = this.snake[0];
        
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= this.tileCount || 
            head.y < 0 || head.y >= this.tileCount) {
            return true;
        }
        
        // 检查自身碰撞
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    checkFood() {
        const head = this.snake[0];
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.scoreElement.textContent = this.score;
            this.generateFood();
            this.playScoreSound();
            return true;
        }
        return false;
    }
    
    generateFood() {
        this.food = {
            x: Math.floor(Math.random() * this.tileCount),
            y: Math.floor(Math.random() * this.tileCount)
        };
        
        // 确保食物不会生成在蛇身上
        for (let segment of this.snake) {
            if (segment.x === this.food.x && segment.y === this.food.y) {
                this.generateFood();
                break;
            }
        }
    }
    
    draw() {
        this.board.innerHTML = '';
        
        // 绘制蛇
        this.snake.forEach((segment, index) => {
            const snakeElement = document.createElement('div');
            snakeElement.style.position = 'absolute';
            snakeElement.style.width = `${this.gridSize}px`;
            snakeElement.style.height = `${this.gridSize}px`;
            snakeElement.style.left = `${segment.x * this.gridSize}px`;
            snakeElement.style.top = `${segment.y * this.gridSize}px`;
            snakeElement.style.boxSizing = 'border-box';
            snakeElement.style.borderRadius = index === 0 ? '8px' : '4px';
            snakeElement.style.transition = 'all 0.1s ease';
            snakeElement.className = index === 0 ? 'snake-head' : 'snake-body';
            this.board.appendChild(snakeElement);
        });
        
        // 绘制食物
        const foodElement = document.createElement('div');
        foodElement.style.position = 'absolute';
        foodElement.style.width = `${this.gridSize}px`;
        foodElement.style.height = `${this.gridSize}px`;
        foodElement.style.left = `${this.food.x * this.gridSize}px`;
        foodElement.style.top = `${this.food.y * this.gridSize}px`;
        foodElement.style.boxSizing = 'border-box';
        foodElement.style.borderRadius = '50%';
        foodElement.style.transition = 'all 0.2s ease';
        foodElement.className = 'food';
        this.board.appendChild(foodElement);
    }
    
    handleKeyPress(e) {
        if (!this.isGameRunning) return;
        
        const key = e.key.toLowerCase();
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
        
        const newDirection = {
            'arrowup': 'up',
            'arrowdown': 'down',
            'arrowleft': 'left',
            'arrowright': 'right',
            'w': 'up',
            's': 'down',
            'a': 'left',
            'd': 'right'
        }[key];
        
        if (newDirection && opposites[newDirection] !== this.direction) {
            this.direction = newDirection;
        }
    }
    
    gameOver() {
        clearInterval(this.gameInterval);
        this.isGameRunning = false;
        this.playGameOverSound();
        alert(`游戏结束！得分：${this.score}`);
    }

    // 添加移动音效
    playMoveSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    // 添加得分音效
    playScoreSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    // 添加游戏结束音效
    playGameOverSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }
}

// 初始化游戏
const game = new SnakeGame(); 