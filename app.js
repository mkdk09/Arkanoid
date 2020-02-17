const fieldHeight = 400
const fieldWidth = 500
const numberOfRows = 3 //ブロックの行数
const tilesInRow = 8 //ブロックの列数
const sizeOfGap = 3 // ブロック間の隙間

const requestAnimationFrame = window.requestAnimationFrame //アニメーション

class Tile { //ブロックのオブジェクト
    constructor(x, y) {
        this.x = x
        this.y = y
        this.isAlive = true
    }

    draw(ctx) { //描画
        if (!this.isAlive) return
        ctx.fillStyle = Tile.color
        ctx.fillRect(
            this.x,
            this.y,
            Tile.width,
            Tile.height
        )
    }
}

Tile.color = 'rgba(0, 0, 255, 0.5)' //ブロックの色
Tile.width = fieldWidth / tilesInRow - 2 * sizeOfGap //ブロック1つの横幅
Tile.height = 25 //ブロック1つの縦幅

const generateTiles = () => { //ブロックのオブジェクトを生成
    const tiles = []
    for (let i = 0; i < numberOfRows; i++) {
        tiles[i] = []
        for (let j = 0; j < tilesInRow; j++) {
            const x = (2 * j + 1) * sizeOfGap + j * Tile.width
            const y = (2 * i + 1) * sizeOfGap + i * Tile.height
            tiles[i][j] = new Tile(x, y) //Tileオブジェクト生成
        }
    }
    return tiles
}

const drawTiles = (tiles, ctx) => { //ブロックを描画する
    for (let i = 0; i < numberOfRows; i++) {
        for (let j = 0; j < tilesInRow; j++) {
            tiles[i][j].draw(ctx) //ブロック描画
        }
    }
}

class Platform { //バーのオブジェクト
    constructor() {
        this.x = (fieldWidth - Platform.width) / 2
        this.y = fieldHeight - Platform.height
    }

    draw(ctx) { //描画
        ctx.fillStyle = Platform.color
        ctx.fillRect(
            this.x,
            this.y,
            Platform.width,
            Platform.height
        )
    }

    movePlatformByEvent(e) { //バーの移動
        const modifier = 1
        switch(e.keyCode) {
            case 37: { //左
                if (this.x > 0) {
                    this.x -= Platform.speed * modifier
                }
                break
            }
            case 39: { //右
                if (this.x < fieldWidth - Platform.width) {
                    this.x += Platform.speed * modifier
                }
                break
            }
        }
    }
}

Platform.width = 150 //バーの横幅
Platform.height = 10 //バーの縦幅
Platform.color = 'red' //バーの色
Platform.speed = 50 //バーの移動速度

class Ball { //ボールのオブジェクト
    constructor() {
        this.x = fieldWidth / 2
        this.y = fieldHeight - Ball.radius - Platform.height
        this.angle = -(Math.random() * (Math.PI / 2) + Math.PI / 4)
    }

    draw(ctx) { //描画
        ctx.beginPath() //現在のパスをリセット
        ctx.arc(
            this.x,
            this.y,
            Ball.radius,
            0,
            2 * Math.PI,
            false
        )
        ctx.fillStyle = Ball.color
        ctx.fill()
    }
}

Ball.radius = 8 //ボールの半径
Ball.color = 'yellowgreen' //ボールの色
Ball.speed = 5 //ボールのスピード

const play = (arkanoid) => {
    const {
        tiles,
        platform,
        ball,
    } = arkanoid 

    if (ball.y <= Ball.radius) { //ボールが天井に当たった時
        ball.angle = Math.PI - ball.angle
        Ball.speed = -Ball.speed
        return
    }

    if (ball.y >= fieldHeight - Platform.height - Ball.radius) { //ボールが下にきた時
        if ( //ボールがバーに当たった時
            (ball.x + (Ball.radius * 2) >= platform.x) &&
            (ball.x - (Ball.radius * 2) <= platform.x + Platform.width)
        ) {
            const shift = (platform.x + (Platform.width / 2) - ball.x) / (Platform.width / 2)
            const shiftCoef = (shift / 2) + 0.5
            ball.angle = -(shiftCoef * (Math.PI / 2) + Math.PI / 4)
            if (Ball.speed < 0) { //天井から跳ね返ってきた時ボールのスピードがマイナスになっているのでプラスに戻す
                Ball.speed = -(Ball.speed)
            }
            return
        } else if (ball.y >= fieldHeight - Ball.radius) { //ボールが床に当たった時GameOver
            arkanoid.status = 'finish'
            arkanoid.finish()
            return
        }
    }

    if ( //ボールが横の壁に当たった時
        (ball.x <= Ball.radius) ||
        (ball.x >= fieldWidth - Ball.radius)
    ) {
        ball.angle = Math.PI - ball.angle
        return
    }

    for (let tilesRow of tiles) { //ボールがブロックに当たった時
        for (let tile of tilesRow) {
            if (!tile.isAlive) continue
            if (
                ball.x - Ball.radius <= tile.x + Tile.width &&
                ball.x + Ball.radius >= tile.x &&
                ball.y - Ball.radius <= tile.y + Tile.height &&
                ball.y + Ball.radius >= tile.y
            ) {
                tile.isAlive = false
                ball.angle *= -1
                return
            }
        }
    }
}

const render = (ctx, arkanoid) => {
    const {
        tiles,
        platform,
        ball,
    } = arkanoid

    //ボールの移動
    ball.y += (Ball.speed * Math.sin(ball.angle))
    ball.x += (Ball.speed * Math.cos(ball.angle))

    //canvas丸ごとclear
    ctx.clearRect(0, 0, fieldWidth, fieldHeight)
    drawTiles(tiles, ctx)
    platform.draw(ctx)
    ball.draw(ctx)

    //console.log(ball.y <= Ball.radius)
    //console.log(ball.angle)

    play(arkanoid)

    if (arkanoid.status === 'play') {
        requestAnimationFrame(() => render(ctx, arkanoid))
    }
}

window.onload = () => {
    const canvas = document.getElementById('arkanoid') //canvas取得
    const ctx = canvas.getContext('2d') 
    //const tiles = generateTiles() //Tileオブジェクトを作成
    //const platform = new Platform() //バーオブジェクトを作成

    const arkanoid = {
        tiles: generateTiles(), //Tileオブジェクトを作成
        platform: new Platform(), //バーオブジェクトを作成
        ball: new Ball(), //ボールオブジェクトを作成
        status: 'play',
        finish() { //ゲームオーバー時
            ctx.font = '50px Arial'
            ctx.fillStyle = 'red'
            ctx.textAlign = 'center'
            ctx.fillText('Game Over', fieldWidth / 2, fieldHeight / 2)
        },
    }

    //drawTiles(tiles, ctx) //ブロックを描画
    //platform.draw(ctx) //バーを描画

    addEventListener('keydown', arkanoid.platform.movePlatformByEvent.bind(arkanoid.platform))

    render(ctx, arkanoid)
}