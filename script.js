const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const shelves = [
    {
        id: 1,
        x: 50,
        y: 50,
        width: 200,
        height: 400,
        boxes: [
            { id: 1, product: "Nutrición A", lote: "LoteA1", vencimiento: "2025-11-30", cantidad: 24, color: "red" },
            { id: 2, product: "Nutrición A", lote: "LoteA2", vencimiento: "2025-11-30", cantidad: 24, color: "red" },
            { id: 3, product: "Nutrición A", lote: "LoteA3", vencimiento: "2025-12-31", cantidad: 24, color: "green" },
            { id: 4, product: "Nutrición A", lote: "LoteA4", vencimiento: "2025-12-31", cantidad: 24, color: "green" }
        ]
    }
];

let scale = 1;
let offsetX = 0, offsetY = 0;
let selectedBox = null;
let isDragging = false, lastX, lastY;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    shelves.forEach(shelf => {
        ctx.fillStyle = '#ccc';
        ctx.fillRect(shelf.x, shelf.y, shelf.width, shelf.height);

        shelf.boxes.forEach((box, i) => {
            const boxY = shelf.y + (i * 80);
            ctx.fillStyle = selectedBox === box ? '#ff0' : box.color;
            ctx.fillRect(shelf.x, boxY, shelf.width, 70);
            ctx.fillStyle = 'black';
            ctx.font = '14px Arial';
            ctx.fillText(`${box.lote} (${box.cantidad} frascos)`, shelf.x + 5, boxY + 40);
        });
    });
    ctx.restore();

    if (selectedBox) {
        const total = shelves[0].boxes.reduce((sum, b) => sum + b.cantidad, 0);
        info.innerHTML = `
            <h3>${selectedBox.product}</h3>
            <p>Total: ${total} frascos</p>
            <p>Lote: ${selectedBox.lote}</p>
            <p>Vence: ${selectedBox.vencimiento}</p>
            <p>Cantidad: ${selectedBox.cantidad}</p>
            <p>Nov 2025: ${shelves[0].boxes.filter(b => b.vencimiento.includes('11')).reduce((sum, b) => sum + b.cantidad, 0)} frascos</p>
            <p>Dic 2025: ${shelves[0].boxes.filter(b => b.vencimiento.includes('12')).reduce((sum, b) => sum + b.cantidad, 0)} frascos</p>
        `;
    } else {
        info.innerHTML = 'Toca una caja para detalles';
    }
}

canvas.addEventListener('wheel', e => {
    scale += e.deltaY * -0.001;
    scale = Math.max(0.5, Math.min(3, scale));
    draw();
});

canvas.addEventListener('mousedown', e => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});
canvas.addEventListener('mousemove', e => {
    if (isDragging) {
        offsetX += e.clientX - lastX;
        offsetY += e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        draw();
    }
});
canvas.addEventListener('mouseup', () => isDragging = false);

canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offsetX) / scale;
    const y = (e.clientY - rect.top - offsetY) / scale;
    selectedBox = null;
    shelves.forEach(shelf => {
        shelf.boxes.forEach((box, i) => {
            const boxY = shelf.y + (i * 80);
            if (x >= shelf.x && x <= shelf.x + shelf.width && y >= boxY && y <= boxY + 70) {
                selectedBox = box;
            }
        });
    });
    draw();
});

canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const touch = e.touches[0];
    lastX = touch.clientX;
    lastY = touch.clientY;
    isDragging = true;

    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left - offsetX) / scale;
    const y = (touch.clientY - rect.top - offsetY) / scale;
    selectedBox = null;
    shelves.forEach(shelf => {
        shelf.boxes.forEach((box, i) => {
            const boxY = shelf.y + (i * 80);
            if (x >= shelf.x && x <= shelf.x + shelf.width && y >= boxY && y <= boxY + 70) {
                selectedBox = box;
            }
        });
    });
    draw();
});
canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (isDragging) {
        const touch = e.touches[0];
        offsetX += touch.clientX - lastX;
        offsetY += touch.clientY - lastY;
        lastX = touch.clientX;
        lastY = touch.clientY;
        draw();
    }
});
canvas.addEventListener('touchend', () => isDragging = false);

let lastDist = 0;
canvas.addEventListener('touchmove', e => {
    if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
        if (lastDist) {
            scale += (dist - lastDist) * 0.01;
            scale = Math.max(0.5, Math.min(3, scale));
            draw();
        }
        lastDist = dist;
    }
});
canvas.addEventListener('touchend', () => lastDist = 0);

draw();
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
});