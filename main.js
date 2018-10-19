const WIDTH = 50
const HEIGHT = 40
const SPEED = 10
const AUTO_PLAY = true

const DIRECTIONS = {
    left: 'left',
    right: 'right',
    up: 'up',
    down: 'down',
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
const findBodyPos = (coord, snake) => snake.findIndex(cmpCoord.bind(null, coord))

const applySnakeRules = (snake, food, cell) => {
    const bodyPos = findBodyPos(cell.coord, snake)

    if(bodyPos > -1) {
        const posFactor = (bodyPos * 5) % 200

        const green = posFactor > 100 ?  150 - (posFactor % 100) : 150 + posFactor
        cell.style.background = `rgb(0 ${green} 0)`
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

const avoidBody = (direction, snake, attemptsHistory = []) => {
    const head = snake[0]
    const headDirection = head.direction

    if (attemptsHistory.length === 4) {
        if (!coordIsBody(walkMethods[headDirection](head), snake)) {
            return headDirection
        }
        
        return direction
    }


    if (coordIsBody(walkMethods[direction](head), snake)) {
        
        if (direction ===  DIRECTIONS.up) {
            if (headDirection === DIRECTIONS.up) {
                direction = DIRECTIONS.left
            } else if (headDirection === DIRECTIONS.left || headDirection === DIRECTIONS.right) {
                direction = DIRECTIONS.down
            }
        } else if (direction ===  DIRECTIONS.down) {
            if (headDirection === DIRECTIONS.down) {
                direction = DIRECTIONS.left
            } else if (headDirection === DIRECTIONS.left || headDirection === DIRECTIONS.right) {
                direction = DIRECTIONS.up
            }
        }  else if (direction ===  DIRECTIONS.left) {
            if (headDirection === DIRECTIONS.left) {
                direction = DIRECTIONS.up
            } else if (headDirection === DIRECTIONS.up || headDirection === DIRECTIONS.down) {
                direction = DIRECTIONS.right
            }
        } else if (direction ===  DIRECTIONS.right) {
            if (headDirection === DIRECTIONS.right) {
                direction = DIRECTIONS.up
            } else if (headDirection === DIRECTIONS.up || headDirection === DIRECTIONS.down) {
                direction = DIRECTIONS.left
            }
        }

        direction = avoidBody(direction, snake, [...attemptsHistory, direction])
    }

    return direction
}

const autoPlayNextDirection = (snake, food) => {
    const head = snake[0]
    let nextDirection = null

    if(food.y === head.y) {
        if (food.x > head.x) {
            if (head.direction === DIRECTIONS.left) {
                nextDirection = DIRECTIONS.up
            } else {
                nextDirection = DIRECTIONS.right
            }
        } else {
            if (head.direction === DIRECTIONS.right) {
                nextDirection = DIRECTIONS.up
            } else {
                nextDirection = DIRECTIONS.left
            }
        }
    } else {
        if (food.y > head.y) {
            if (head.direction === DIRECTIONS.up) {
                nextDirection = DIRECTIONS.right
            } else {
                nextDirection = DIRECTIONS.down
            }
        } else {
            if (head.direction === DIRECTIONS.down) {
                nextDirection = DIRECTIONS.right
            } else {
                nextDirection = DIRECTIONS.up
            }
        }
    }

    nextDirection = avoidBody(nextDirection, snake)

    return nextDirection
}

const play = () => {

    let score = 0
    let snake = [ snakePiece(25, 19), snakePiece(26, 19), snakePiece(27, 19) ]
    let food = generateFood()
    let currentDirection = DIRECTIONS.left
    let changingDirection = null

    if (!AUTO_PLAY) {
        window.onkeydown = (event) => {
            const newDirection = DIRECTIONS_KEYS[event.key]
            if (newDirection && OPPOSITES[currentDirection] !== newDirection) {
                changingDirection = newDirection
            }
        }
    }

    const intervalId = setInterval(() => {
        drawField(snake, food)    

        if (changingDirection) {
            currentDirection = changingDirection
            changingDirection = null
        }

        if(AUTO_PLAY) {
            currentDirection = autoPlayNextDirection(snake, food)
        }

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