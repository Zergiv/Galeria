const density = 3
const distance = 0
const speed = 200
const directions = ["top", "right", "bottom", "left"]
let isPaused = false
const images = [
    "https://i.ibb.co/7x3sBJnn/image.png",
    "https://i.ibb.co/5xjpvnW7/image.png",
    "https://i.ibb.co/xSjgm4Nj/image.png",
    "https://i.ibb.co/21Jdszv3/image.png",
    "https://i.ibb.co/pBYq0vVW/image.png",
    "https://i.ibb.co/0jDPpwNN/image.png",
    "https://i.ibb.co/gMXWBJTc/image.png",
    "https://i.ibb.co/B5TkftNf/687b83310d74480b9443d9933668127d.png",
    "https://i.ibb.co/d48Z2HX2/BTS-Namjoon-PNG-Image.png",
    "https://i.ibb.co/BVpZ6m87/20250523-194048.jpg",
    "https://i.ibb.co/N6HFr7Yn/20250523-193710.jpg",
    "https://i.ibb.co/kgC26TY6/20250515-205923.jpg",
    "https://i.ibb.co/LXN43mfb/20250515-210015.jpg",
    "https://i.ibb.co/b5PY62S6/20250523-193955.jpg",
    "https://i.ibb.co/wrjKPCVx/20250523-194116.jpg",
]

function preloadImages(srcArray, callback) {
    let loaded = 0
    srcArray.forEach((src) => {
        const img = new Image()
        img.onload = () => {
            loaded++
            if (loaded === srcArray.length) callback()
        }
        img.src = src
    })
}

document.addEventListener("DOMContentLoaded", () => {
    preloadImages(images, () => {
        renderWalls()
    })
})

const allGridElements = []
let intervalId

function renderWalls() {
    const gridContainer = document.querySelector(".inf-grid-hero-container")
    gridContainer.style.setProperty("--grid-sz", density)
    gridContainer.style.setProperty("--rev-dis", distance)

    allGridElements.length = 0

    directions.forEach((dir) => {
        const parent = document.querySelector(`.${dir}`)
        if (!parent) return
        parent.innerHTML = ""
        const total = density * density
        for (let i = 1; i <= total; i++) {
            const div = document.createElement("div")
            div.classList.add(`${dir.charAt(0)}${i}`)
            parent.appendChild(div)
            allGridElements.push(div)
        }
    })

    startImageInterval()
}

let loadedCount = 0
let totalElementsToLoad = 0

function getNeighbors(element) {
    const classList = Array.from(element.classList);
    let wallClass = null;
    for (let cls of classList) {
        if (cls.match(/^[trbl]\d+$/)) {
            wallClass = cls;
            break;
        }
    }
    if (!wallClass) return [];

    const wall = wallClass.charAt(0);
    const index = parseInt(wallClass.slice(1));
    const total = density * density;
    if (index < 1 || index > total) return [];

    const row = Math.floor((index-1) / density);
    const col = (index-1) % density;
    const neighbors = [];

    // Arriba
    if (row > 0) {
        const neighborIndex = (row-1)*density + col + 1;
        neighbors.push(document.querySelector(`.${wall}${neighborIndex}`));
    }
    // Abajo
    if (row < density-1) {
        const neighborIndex = (row+1)*density + col + 1;
        neighbors.push(document.querySelector(`.${wall}${neighborIndex}`));
    }
    // Izquierda
    if (col > 0) {
        const neighborIndex = row*density + (col-1) + 1;
        neighbors.push(document.querySelector(`.${wall}${neighborIndex}`));
    }
    // Derecha
    if (col < density-1) {
        const neighborIndex = row*density + (col+1) + 1;
        neighbors.push(document.querySelector(`.${wall}${neighborIndex}`));
    }

    return neighbors.filter(el => el !== null);
}

function startImageInterval() {
    if (intervalId) clearInterval(intervalId);
    loadedCount = 0;
    totalElementsToLoad = allGridElements.length;

    intervalId = setInterval(() => {
        if (isPaused) return;
        const unloadedElements = allGridElements.filter((el) => !el.classList.contains("loaded"));
        if (unloadedElements.length === 0) return;

        const randomElement = unloadedElements[Math.floor(Math.random() * unloadedElements.length)];
        
        // Obtener imágenes de vecinos cargados
        const neighbors = getNeighbors(randomElement);
        const loadedNeighbors = neighbors.filter(neighbor => neighbor.classList.contains('loaded'));
        const neighborImages = loadedNeighbors.map(neighbor => {
            const bg = neighbor.style.background;
            if (!bg) return null;
            const match = bg.match(/url\("?'?([^"')]+)"?'?\)/);
            return match ? match[1] : null;
        }).filter(url => url !== null);

        // Filtrar imágenes disponibles
        let availableImages = images.filter(img => !neighborImages.includes(img));
        if (availableImages.length === 0) availableImages = images;
        
        const randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];
        
        randomElement.style.background = `url('${randomImage}')`;
        randomElement.classList.add("loaded");
        loadedCount++;

        randomElement.addEventListener("click", () => {
            showSelectedImage(randomImage);
            pauseInterval();
        });

        if (loadedCount >= totalElementsToLoad) {
            clearInterval(intervalId);
            document.dispatchEvent(new Event("allImagesLoaded"));
        }
    }, speed);
}

function showSelectedImage(imageUrl) {
    const selectedImageContainer = document.getElementById("selectedImageContainer")
    const selectedImage = document.getElementById("selectedImage")

    // Establecer la imagen de fondo
    selectedImage.style.backgroundImage = `url('${imageUrl}')`

    // Mostrar el contenedor
    selectedImageContainer.classList.add("active")

    // Añadir clase al body para controlar otros elementos
    document.body.classList.add("image-selected")

    // Habilitar el overlay
    document.getElementById("overlay").style.pointerEvents = "all"
}

function hideSelectedImage() {
    const selectedImageContainer = document.getElementById("selectedImageContainer")

    // Añadir animación de cierre
    selectedImageContainer.classList.add("closing")

    setTimeout(() => {
        // Ocultar el contenedor
        selectedImageContainer.classList.remove("active", "closing")

        // Remover clase del body
        document.body.classList.remove("image-selected")

        // Deshabilitar el overlay
        document.getElementById("overlay").style.pointerEvents = "none"

        // Limpiar la imagen
        document.getElementById("selectedImage").style.backgroundImage = ""

        // Reanudar el intervalo si estaba pausado
        if (isPaused) {
            isPaused = false
            startImageInterval()
        }
    }, 500) // Duración de la animación de cierre
}

function pauseInterval() {
    isPaused = true
}

function resumeInterval() {
    hideSelectedImage()
}

document.getElementById("back-btn").addEventListener("click", resumeInterval)
document.getElementById("overlay").addEventListener("click", resumeInterval)

// También permitir cerrar con la tecla Escape
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("image-selected")) {
        resumeInterval()
    }
})

document.addEventListener("allImagesLoaded", () => {
    document.body.classList.add("all-loaded")
})
