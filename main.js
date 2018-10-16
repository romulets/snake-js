const WIDTH = 50
const HEIGHT = 40
const SPEED = 50

const DIRECTIONS = {
    left: 1,
    right: 2,
    up: 3,
    down: 4,
}

const DIRECTIONS_KEYS = {
    ArrowUp: DIRECTIONS.up,
    ArrowRight: DIRECTIONS.right,
    ArrowDown: DIRECTIONS.down,
    ArrowLeft: DIRECTIONS.left
}

const OPPOSITES = {
    [DIRECTIONS.up]: DIRECTIONS.down,
    [DIRECTIONS.down]: DIRECTIONS.up,
    [DIRECTIONS.left]: DIRECTIONS.right,
    [DIRECTIONS.right]: DIRECTIONS.left
}

const coord = (x, y) => ({x: x < 0 ? WIDTH + x : x % WIDTH, y: y < 0 ? HEIGHT + y : y % HEIGHT})
const snakePiece = (x, y, direction=DIRECTIONS.left) => ({...coord(x, y), direction})
const random = max => Math.floor(Math.random() * max)
const generateFood = () => coord(random(WIDTH), random(HEIGHT))
const cmpCoord = (a, b) => a.x === b.x && a.y === b.y
const coordIsBody = (coord, snake) => snake.filter(cmpCoord.bind(null, coord)).length > 0

const applySnakeRules = (snake, food, cell) => {
    if(cmpCoord(cell.coord, snake[0])) {
        cell.classList.add('snake-head')
    } else if(coordIsBody(cell.coord, snake)) {
        cell.classList.add('snake-body')
    } else if (cmpCoord(cell.coord, food)) {
        cell.classList.add('food')
    }
}

const drawField = (snake, food) => {
    const main = document.getElementById('main')
    
    const table = document.createElement('table')
    for (col = 0; col < HEIGHT; col++) {
        const line = document.createElement('tr')
        for (row = 0; row < WIDTH; row++) {
            const cell = document.createElement('td')
            cell.coord = coord(row, col)
            applySnakeRules(snake, food, cell)
            line.appendChild(cell)
        }
        table.appendChild(line)
    }

    main.innerHTML = null
    main.appendChild(table)
}

const walkMethods = {
    [DIRECTIONS.right]: ({x, y}) => snakePiece(x + 1, y, DIRECTIONS.right),
    [DIRECTIONS.left]: ({x, y}) => snakePiece(x - 1, y, DIRECTIONS.left),
    [DIRECTIONS.up]: ({x, y}) => snakePiece(x, y - 1, DIRECTIONS.up),
    [DIRECTIONS.down]: ({x, y}) => snakePiece(x, y + 1, DIRECTIONS.down),
}

const walk = (snake, food, headDirection) => {
    const lastPiece = snake[snake.length - 1]

    snake = snake.map((piece, idx, snake) => {
        if (idx === 0) {
            return walkMethods[headDirection](piece)    
        }

        const direction = snake[idx - 1].direction
        return walkMethods[direction](piece)
    })

    if (coordIsBody(snake[0], snake.slice(1))) {
        return null
    }

    if(coordIsBody(food, snake)) {
        snake.push(lastPiece)
    }

    return snake
}

const handleFood = (snake, food, score) => {
    if(coordIsBody(food, snake)) {
        score += 1
        return { food: generateFood(), score }
    }

    return { food, score }
}

const updateScore = score => {
    document.getElementById('score').innerText = score
}

const handleCrash = intervalId => {
    clearInterval(intervalId)
    setTimeout(() => {
        const playAgain = confirm('You crashed. Want to play again?')
        if (playAgain) {
            play()
        }
    }, 15)
}

const play = () => {

    let score = 0
    let snake = [ snakePiece(25, 19), snakePiece(26, 19), snakePiece(27, 19) ]
    let food = generateFood()
    let currentDirection = DIRECTIONS.left

    window.onkeydown = (event) => {
        const newDirection = DIRECTIONS_KEYS[event.key]
        if (newDirection && OPPOSITES[currentDirection] !== newDirection) {
            currentDirection = newDirection
        }
    }

    const intervalId = setInterval(() => {
        drawField(snake, food)    

        const newSnake = walk(snake, food, currentDirection)
        if (newSnake === null) {
            drawField(snake, food)
            handleCrash(intervalId)
            return
        }

        snake = newSnake;
        
        ({ food, score } = handleFood(snake, food, score))
        updateScore(score)
    }, SPEED)
}

play()