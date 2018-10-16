const WIDTH = 50
const HEIGHT = 40
const SPEED = 250

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

const coord = (x, y) => ({x, y})
const snakePiece = (x, y, direction=DIRECTIONS.left) => ({...coord(x, y), direction})
const random = max => Math.floor(Math.random() * max)
const generateFood = () => coord(random(WIDTH), random(HEIGHT))

let SNAKE = [ snakePiece(25, 19), snakePiece(26, 19), snakePiece(27, 19) ]
let FOOD = generateFood()
let CURRENT_DIRECTION = DIRECTIONS.left

window.onkeydown = (event) => {
    const newDirection = DIRECTIONS_KEYS[event.key]
    if (newDirection && OPPOSITES[CURRENT_DIRECTION] !== newDirection) {
        CURRENT_DIRECTION = newDirection
    }
}

const cmpCoord = (a, b) => a.x === b.x && a.y === b.y
const coordIsBody = (coord, snake) => snake.filter(cmpCoord.bind(null, coord)).length > 0

const applySnakeRules = (snake, cell) => {
    if(coordIsBody(cell.coord, snake)) {
        cell.classList.add('snake-body')
    }

    if (cmpCoord(cell.coord, FOOD)) {
        cell.classList.add('food')
    }
}

const drawField = (snake) => {
    const main = document.getElementById('main')
    
    const table = document.createElement('table')
    for (col = 0; col < HEIGHT; col++) {
        const line = document.createElement('tr')
        for (row = 0; row < WIDTH; row++) {
            const cell = document.createElement('td')
            cell.coord = coord(row, col)
            applySnakeRules(snake, cell)
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

const walk = snake => {
    snake = snake.map((piece, idx, snake) => {
        if (idx === 0) {
            return walkMethods[CURRENT_DIRECTION](piece)    
        }

        const direction = snake[idx - 1].direction
        return walkMethods[direction](piece)
    })

    if(coordIsBody(FOOD, snake)) {
        const lastPiece = snake[snake.length - 1]
        snake.push(walkMethods[lastPiece.direction](lastPiece))
    }

    return snake
}

const handleFood = (snake, food) => {
    if(coordIsBody(food, snake)) {
        return generateFood()
    }

    return food
}

const play = () => {
    drawField(SNAKE)
    SNAKE = walk(SNAKE)
    FOOD = handleFood(SNAKE, FOOD)
}

setInterval(play, SPEED)