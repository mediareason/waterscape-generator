console.log("🎨 Waterscape Studio v2.1 initializing...");

// Color palettes - now editable
let palettes = {
    vibrant: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'],
    pastel: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFDFBA', '#E0BBE4', '#957DAD', '#D291BC'],
    earth: ['#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F4A460', '#D2B48C', '#BC8F8F', '#A0522D'],
    ocean: ['#006994', '#4A90A4', '#83C5BE', '#7FCDCD', '#7FB3D3', '#5D737E', '#3E8E7E', '#1F4E79'],
    sunset: ['#FF4B2B', '#FF416C', '#FFA07A', '#FFB347', '#FFD700', '#FF6347', '#FF69B4', '#FF1493'],
    forest: ['#228B22', '#32CD32', '#7CFC00', '#9ACD32', '#90EE90', '#98FB98', '#00FF7F', '#3CB371'],
    monochrome: ['#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7', '#D5DBDB', '#85929E', '#566573']
};

// Preset colors for the color picker
const presetColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFDFBA', '#E0BBE4', '#957DAD', '#D291BC',
    '#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F4A460', '#D2B48C', '#BC8F8F', '#A0522D',
    '#006994', '#4A90A4', '#83C5BE', '#7FCDCD', '#7FB3D3', '#5D737E', '#3E8E7E', '#1F4E79'
];

let currentPalette = 'vibrant';
let editingColorIndex = -1;
let params = {
    brushCount: 12,
    layersPerBrush: 25,
    brushSize: 90,
    edgeComplexity: 4,
    deformStrength: 0.3,
    opacity: 8,
    randomSeed: 42,
    backgroundType: 'white',
    // New texture masking parameters
    textureMasking: true,
    textureIntensity: 0.7,
    textureDensity: 800
};

let canvas;

// Gaussian random number generator for natural variation
function gaussianRandom(mean = 0, stdev = 1) {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return z * stdev + mean;
}

// Color picker functions
function openColorPicker(colorIndex) {
    editingColorIndex = colorIndex;
    const currentColor = palettes[currentPalette][colorIndex];
    
    document.getElementById('colorInput').value = currentColor;
    document.getElementById('hexInput').value = currentColor;
    document.getElementById('colorPreview').style.backgroundColor = currentColor;
    
    document.getElementById('colorPickerOverlay').style.display = 'flex';
    
    // Setup preset colors
    const presetColorsDiv = document.getElementById('presetColors');
    presetColorsDiv.innerHTML = '';
    presetColors.forEach(color => {
        const preset = document.createElement('div');
        preset.className = 'preset-color';
        preset.style.backgroundColor = color;
        preset.onclick = () => selectPresetColor(color);
        presetColorsDiv.appendChild(preset);
    });
    
    // Setup color input listeners
    setupColorInputListeners();
}

function setupColorInputListeners() {
    const colorInput = document.getElementById('colorInput');
    const hexInput = document.getElementById('hexInput');
    const colorPreview = document.getElementById('colorPreview');
    
    colorInput.addEventListener('input', (e) => {
        const color = e.target.value;
        hexInput.value = color;
        colorPreview.style.backgroundColor = color;
    });
    
    hexInput.addEventListener('input', (e) => {
        const color = e.target.value;
        if (/^#[0-9A-F]{6}$/i.test(color)) {
            colorInput.value = color;
            colorPreview.style.backgroundColor = color;
        }
    });
}

function closeColorPicker() {
    document.getElementById('colorPickerOverlay').style.display = 'none';
    editingColorIndex = -1;
}

function selectPresetColor(color) {
    document.getElementById('colorInput').value = color;
    document.getElementById('hexInput').value = color;
    document.getElementById('colorPreview').style.backgroundColor = color;
}

function applyColor() {
    if (editingColorIndex >= 0) {
        const newColor = document.getElementById('colorInput').value;
        palettes[currentPalette][editingColorIndex] = newColor;
        updateColorPalette();
        generateNew();
        closeColorPicker();
    }
}

// Update metadata display
function updateMetadata() {
    const totalLayers = params.brushCount * params.layersPerBrush;
    document.getElementById('currentPaletteInfo').textContent = currentPalette;
    document.getElementById('layerCountInfo').textContent = totalLayers;
}

// Simple but effective deformation function
function deformPolygon(vertices, complexity, strength) {
    let result = JSON.parse(JSON.stringify(vertices)); // Deep copy
    
    // Apply multiple rounds of edge subdivision and deformation
    for (let round = 0; round < complexity; round++) {
        let newVertices = [];
        let currentStrength = strength * (1 / (round + 1)); // Reduce strength each round
        
        for (let i = 0; i < result.length; i++) {
            let current = result[i];
            let next = result[(i + 1) % result.length];
            
            newVertices.push(current);
            
            // Create midpoint with random deformation
            let midX = (current.x + next.x) / 2;
            let midY = (current.y + next.y) / 2;
            
            // Add randomness
            let deformX = (Math.random() - 0.5) * currentStrength * 40;
            let deformY = (Math.random() - 0.5) * currentStrength * 40;
            
            newVertices.push({
                x: midX + deformX,
                y: midY + deformY
            });
        }
        
        result = newVertices;
    }
    
    return result;
}

// Create watercolor brush
function createWatercolorBrush() {
    try {
        let x = random(width * 0.2, width * 0.8);
        let y = random(height * 0.2, height * 0.8);
        let size = random(params.brushSize * 0.7, params.brushSize * 1.3);
        let sides = int(random(6, 10));
        
        // Pick random color
        let colorIndex = int(random(palettes[currentPalette].length));
        let baseColor = palettes[currentPalette][colorIndex];
        
        // Parse color
        let r = parseInt(baseColor.slice(1, 3), 16);
        let g = parseInt(baseColor.slice(3, 5), 16);
        let b = parseInt(baseColor.slice(5, 7), 16);
        
        // Add variation
        r = constrain(r + random(-20, 20), 0, 255);
        g = constrain(g + random(-20, 20), 0, 255);
        b = constrain(b + random(-20, 20), 0, 255);
        
        // Create base polygon
        let basePolygon = [];
        for (let i = 0; i < sides; i++) {
            let angle = (TWO_PI / sides) * i;
            let vx = x + cos(angle) * size;
            let vy = y + sin(angle) * size;
            basePolygon.push({x: vx, y: vy});
        }
        
        // Apply deformation
        basePolygon = deformPolygon(basePolygon, params.edgeComplexity, params.deformStrength);
        
        return {
            basePolygon: basePolygon,
            r: r,
            g: g,
            b: b,
            x: x,
            y: y,
            size: size
        };
    } catch (error) {
        console.error("Error creating brush:", error);
        return null;
    }
}

// Draw watercolor layer with working texture masking
function drawWatercolorLayer(brush) {
    try {
        if (!brush) return;
        
        // Create slight variation for this layer
        let layerPolygon = brush.basePolygon.map(v => ({
            x: v.x + random(-2, 2),
            y: v.y + random(-2, 2)
        }));
        
        // Apply minor additional deformation
        layerPolygon = deformPolygon(layerPolygon, 2, params.deformStrength * 0.5);
        
        if (params.textureMasking) {
            // Create colored layer graphics buffer
            let layerGraphics = createGraphics(width, height);
            
            // Draw the blob shape in solid color
            layerGraphics.fill(brush.r, brush.g, brush.b);
            layerGraphics.noStroke();
            layerGraphics.beginShape();
            for (let v of layerPolygon) {
                layerGraphics.vertex(v.x, v.y);
            }
            layerGraphics.endShape(CLOSE);
            
            // Apply texture directly to the layer using blend mode
            layerGraphics.blendMode(MULTIPLY);
            layerGraphics.noStroke();
            
            // Add texture circles for variation
            for (let i = 0; i < params.textureDensity / 20; i++) { // Reduced density for performance
                let tx = random(width);
                let ty = random(height);
                let radius = abs(gaussianRandom(width * 0.015, width * 0.01));
                let opacity = random(params.textureIntensity * 255);
                
                layerGraphics.fill(255, opacity);
                layerGraphics.circle(tx, ty, radius);
            }
            
            // Reset blend mode
            layerGraphics.blendMode(BLEND);
            
            // Draw the textured layer onto the main canvas with low opacity
            tint(255, params.opacity);
            blendMode(MULTIPLY);
            image(layerGraphics, 0, 0);
            blendMode(BLEND);
            noTint();
            
        } else {
            // Traditional rendering without texture masking
            fill(brush.r, brush.g, brush.b, params.opacity);
            noStroke();
            
            beginShape();
            for (let v of layerPolygon) {
                vertex(v.x, v.y);
            }
            endShape(CLOSE);
        }
        
    } catch (error) {
        console.error("Error drawing layer:", error);
    }
}

function generateWaterscape() {
    try {
        console.log("🎨 Generating waterscape...", params);
        
        randomSeed(params.randomSeed);
        
        // Clear canvas
        background(255);
        drawBackground();
        
        // Create brushes
        let brushes = [];
        for (let i = 0; i < params.brushCount; i++) {
            let brush = createWatercolorBrush();
            if (brush) {
                brushes.push(brush);
            }
        }
        
        console.log(`✨ Created ${brushes.length} brushes`);
        
        if (brushes.length === 0) {
            throw new Error("No brushes created");
        }
        
        // Draw layers
        console.log(`🎨 Drawing ${params.layersPerBrush} layers per brush with texture masking: ${params.textureMasking}`);
        for (let layer = 0; layer < params.layersPerBrush; layer++) {
            for (let brush of brushes) {
                drawWatercolorLayer(brush);
            }
        }
        
        // Update metadata
        updateMetadata();
        
        console.log("🎨 Generation complete!");
        
    } catch (error) {
        console.error('❌ Generation error:', error);
        
        // Simple fallback that shows something
        background(255);
        
        // Draw some basic watercolor-like shapes
        for (let i = 0; i < 5; i++) {
            let colorIndex = int(random(palettes[currentPalette].length));
            let baseColor = palettes[currentPalette][colorIndex];
            let r = parseInt(baseColor.slice(1, 3), 16);
            let g = parseInt(baseColor.slice(3, 5), 16);
            let b = parseInt(baseColor.slice(5, 7), 16);
            
            fill(r, g, b, 30);
            noStroke();
            
            let x = random(width * 0.2, width * 0.8);
            let y = random(height * 0.2, height * 0.8);
            let size = random(50, 150);
            
            circle(x, y, size);
        }
        
        updateMetadata();
    }
}

function drawBackground() {
    switch (params.backgroundType) {
        case 'white':
            background(255);
            break;
        case 'paper':
            background(252, 248, 240);
            noStroke();
            for (let i = 0; i < 200; i++) {
                fill(240, 235, 220, random(10, 30));
                circle(random(width), random(height), random(0.5, 2));
            }
            break;
        case 'gradient':
            for (let y = 0; y < height; y++) {
                let alpha = map(y, 0, height, 0, 1);
                let r = lerp(255, 240, alpha);
                let g = lerp(255, 248, alpha);
                let b = lerp(255, 255, alpha);
                stroke(r, g, b);
                line(0, y, width, y);
            }
            break;
        default:
            background(255);
    }
}

// UI Functions
function updateColorPalette() {
    const paletteDiv = document.getElementById('colorPalette');
    if (!paletteDiv) return;
    
    paletteDiv.innerHTML = '';
    
    palettes[currentPalette].forEach((color, index) => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color;
        swatch.title = color;
        swatch.onclick = () => openColorPicker(index);
        paletteDiv.appendChild(swatch);
    });
}

function updateTextureControls() {
    const textureControls = document.querySelectorAll('.texture-control');
    const isEnabled = params.textureMasking;
    
    textureControls.forEach(control => {
        control.style.opacity = isEnabled ? '1' : '0.5';
        const slider = control.querySelector('input[type="range"]');
        if (slider) {
            slider.disabled = !isEnabled;
        }
    });
}

function setupControls() {
    console.log("🎛️ Setting up controls...");
    
    // Palette selector
    const paletteSelect = document.getElementById('paletteSelect');
    if (paletteSelect) {
        paletteSelect.addEventListener('change', (e) => {
            currentPalette = e.target.value;
            updateColorPalette();
            generateNew();
        });
    }

    // Parameter controls
    Object.keys(params).forEach(param => {
        const control = document.getElementById(param);
        const valueDisplay = document.getElementById(param + 'Value');
        
        if (control && valueDisplay) {
            if (control.type === 'checkbox') {
                control.addEventListener('change', (e) => {
                    params[param] = e.target.checked;
                    valueDisplay.textContent = params[param] ? 'On' : 'Off';
                    updateTextureControls();
                    generateNew();
                });
            } else {
                control.addEventListener('input', (e) => {
                    if (param === 'deformStrength' || param === 'textureIntensity') {
                        params[param] = parseFloat(e.target.value);
                        valueDisplay.textContent = params[param].toFixed(1);
                    } else {
                        params[param] = parseInt(e.target.value);
                        valueDisplay.textContent = params[param];
                    }
                    
                    generateNew();
                });
            }
        }
    });

    // Background type
    const backgroundType = document.getElementById('backgroundType');
    if (backgroundType) {
        backgroundType.addEventListener('change', (e) => {
            params.backgroundType = e.target.value;
            generateNew();
        });
    }

    // Close color picker when clicking overlay
    const overlay = document.getElementById('colorPickerOverlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeColorPicker();
            }
        });
    }

    // ESC key to close color picker
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && editingColorIndex >= 0) {
            closeColorPicker();
        }
    });

    // Initialize texture controls state
    updateTextureControls();
}

function setup() {
    try {
        console.log("🚀 Setting up canvas...");
        canvas = createCanvas(800, 600);
        canvas.parent('canvasWrapper');
        
        console.log("✅ Canvas created successfully");
        
        setTimeout(() => {
            setupControls();
            updateColorPalette();
            generateWaterscape();
        }, 200);
        
    } catch (error) {
        console.error('❌ Setup error:', error);
    }
}

function generateNew() {
    console.log("🔄 Generate new called");
    generateWaterscape();
}

function savePNG() {
    try {
        if (canvas) {
            console.log("💾 Exporting PNG...");
            saveCanvas(canvas, `waterscape_${Date.now()}`, 'png');
        }
    } catch (error) {
        console.error('❌ Export error:', error);
        alert('Error saving image. Please try again.');
    }
}

function draw() {
    // Static generation
}

// Error handling
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('❌ JavaScript Error:', msg, 'at line', lineNo);
    return false;
};

console.log("✅ Waterscape Studio v2.1 loaded successfully");