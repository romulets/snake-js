const WIDTH = 50
const HEIGHT = 40
const SPEED = 500

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

let SNAKE = [ coord(25, 19), coord(26, 19), coord(27, 19) ]

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
    [DIRECTIONS.right]: ({x, y}) => coord(x + 1, y),
    [DIRECTIONS.left]: ({x, y}) => coord(x - 1, y),
    [DIRECTIONS.up]: ({x, y}) => coord(x, y - 1),
    [DIRECTIONS.down]: ({x, y}) => coord(x, y + 1),
}

const walk = snake => {
    return snake.map(walkMethods[CURRENT_DIRECTION])
}

const play = () => {
    drawField(SNAKE)
    SNAKE = walk(SNAKE)
}

setInterval(play, SPEED)