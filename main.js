const currentNum = document.getElementById("currentNumberOfPoints")
const slider = document.getElementById("countSlider")
const canvas = document.getElementById("canvas")
const context = canvas.getContext("2d")

let pointsOnCanvas = []
let timer = null

const randomOddNumber = () => {
    const oddNumbers = [5, 7, 9, 11, 13, 15, 17, 19];
    return oddNumbers[Math.floor(Math.random() * oddNumbers.length)]
}

const randomPoint = () => {
    return {
        x: 10 + Math.random() * (canvas.width - 2 * 10),
        y: 10 + Math.random() * (canvas.height - 2 * 10)
    }
}

const generatePointsOnCanvas = (count) => {
    pointsOnCanvas = []
    for (let i = 0; i < count; i++) {
        pointsOnCanvas.push(randomPoint())
    }
}

const drawPoints = (highlight = new Set(),circle = null) => {
    context.clearRect(0, 0, canvas.width, canvas.height)

    for (let i = 0; i<pointsOnCanvas.length; i++) {
        const point = pointsOnCanvas[i]

        context.fillStyle = highlight.has(i) ? "#f563cc" : "#79CAFF"
        const r = highlight.has(i) ? 7 : 5

        context.beginPath();
        context.arc(point.x, point.y, r, 0, Math.PI * 2)
        context.fill()
    }

    if(circle) {
        context.strokeStyle = "#df2ef3"
        context.lineWidth = 2
        context.beginPath();
        context.arc(circle.cx, circle.cy, circle.r, 0, Math.PI * 2)
        context.stroke();

    }
}

const midpoint = (firstPoint,secondPoint) => {

    const xCoordinate = (firstPoint.x + secondPoint.x) / 2
    const yCoordinate = (firstPoint.y + secondPoint.y) / 2

    return {
        x: xCoordinate,
        y: yCoordinate
    }
}

const normalVektor = (firstPoint,secondPoint) => {
    const vectorX = secondPoint.x - firstPoint.x
    const vectorY = secondPoint.y - firstPoint.y
    return {x: -vectorY, y: vectorX}
}

const intersectLines = (firstPoint, vectorFirstPoint, secondPoint, vectorSecondPoint) => {
    const det = vectorFirstPoint.x * vectorSecondPoint.y - vectorFirstPoint.y * vectorSecondPoint.x
    if (Math.abs(det) < 1e-10) return null;

    const parameter = ((secondPoint.x - firstPoint.x) * vectorSecondPoint.y - (secondPoint.y - firstPoint.y) * vectorSecondPoint.x) / det

    const xCoordinate = firstPoint.x + parameter * vectorFirstPoint.x
    const yCoordinate = firstPoint.y + parameter * vectorFirstPoint.y

    return {
        x: xCoordinate,
        y: yCoordinate
    }
}

const createCircle  = (firstPoint,secondPoint,thirdPoint) => {
    const firstMidpoint  = midpoint(firstPoint, secondPoint)
    const secondMidpoint = midpoint(firstPoint, thirdPoint)

    const firstVerticalDirection = normalVektor(firstPoint,secondPoint)
    const secondVericalDirection = normalVektor(firstPoint,thirdPoint)
    
    const center = intersectLines(firstMidpoint,firstVerticalDirection,secondMidpoint,secondVericalDirection)

    if(!center) return null
    const radius = Math.hypot(center.x - firstPoint.x, center.y - firstPoint.y)

    return {
        cx: center.x,
        cy: center.y,
        r: radius
    }
}

const buildTriples = (n) => {
    const triples = []
    for (let i = 0; i < n -2; i++){
        for (let j = i+1; j< n -1; j++){
            for(let k = j +1; k<n; k++){
                triples.push([i,j,k])
            }
        }
    }
    return triples
}

const isInsideCircle = (point,circle) => {
    const distance = Math.hypot(point.x - circle.cx, point.y - circle.cy)
    return distance < circle.r - 1e-9
}

const countInside = (circle,i,j,k) => {
    let inside = 0

    for( let x = 0; x < pointsOnCanvas.length; x++){
        if(x === i || x===j || x ===k) continue
        if(isInsideCircle(pointsOnCanvas[x],circle)) {
            inside++
        }
    }
    return inside
}

const stopSearchAnimation = () => {
    if(timer){
        clearInterval(timer)
        timer = null
    }
}

const startSearchAnimation = () => {
    stopSearchAnimation()

    const amount  = (pointsOnCanvas.length - 3 ) / 2
    const triples = buildTriples(pointsOnCanvas.length)
    let step = 0


    timer = setInterval(()=> {
        if(triples.length <= step){
            stopSearchAnimation()
            drawPoints()
            return
        }

        const [i,j,k] = triples[step]

        const circle = createCircle(
            pointsOnCanvas[i],
            pointsOnCanvas[j],
            pointsOnCanvas[k]
        )

        drawPoints(new Set([i,j,k]),circle)

        if(circle) {
            const inside = countInside(circle,i,j,k)
            if(inside === amount){
                stopSearchAnimation()
                return
            }
        }
        step++
    },20)
}

const reload = () => {
    stopSearchAnimation()
    const count = Number(slider.value)
    currentNum.textContent = count
    generatePointsOnCanvas(count)
    drawPoints()
}
slider.addEventListener("input", () => {
    currentNum.textContent = slider.value
})
slider.addEventListener("change",reload)

document.getElementById("search").addEventListener("click",startSearchAnimation)
reload()