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
    // Enhanced texture masking parameters
    textureMasking: true,
    textureIntensity: 0.7,
    textureDensity: 800,
    // NEW: Hybrid splotchiness options
    randomWalkMode: false
};

let canvas;
let isGenerating = false;

// Gaussian random number generator for natural variation
function gaussianRandom(mean = 0, stdev = 1) {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return z * stdev + mean;
}

// Create texture mask for watercolor absorption effect
function createTextureMask(w, h, intensity) {
    let mask = createGraphics(w, h);
    mask.background(0);
    mask.noStroke();
    
    let circleCount = Math.floor(params.textureDensity / 8);
    
    for (let i = 0; i < circleCount; i++) {
        let x = random(w);
        let y = random(h);
        let radius = abs(gaussianRandom(w * 0.02, w * 0.015));
        let opacity = random(intensity * 200, intensity * 255);
        
        mask.fill(255, opacity);
        mask.circle(x, y, radius);
    }
    
    return mask;
}

// HYBRID METHOD: Combine Tyler Hobbs + Drip Simulation + Blob Subdivision
function createHybridSplotchyShape(centerX, centerY, baseRadius, params) {
    let vertices = [];
    
    if (params.randomWalkMode) {
        // Random Walk Mode - Organic spreading paint effect
        return createRandomWalkShape(centerX, centerY, baseRadius, params);
    }
    
    // STEP 1: Start with Tyler Hobbs base polygon with variation
    let sides = int(random(5, 9));
    for (let i = 0; i < sides; i++) {
        let angle = (TWO_PI / sides) * i + random(-0.4, 0.4); // More angle variation
        let radiusVar = baseRadius * random(0.3, 1.3); // Dramatic radius variation
        
        let x = centerX + cos(angle) * radiusVar;
        let y = centerY + sin(angle) * radiusVar;
        vertices.push({x: x, y: y});
    }
    
    // STEP 2: Apply Tyler Hobbs deformation with enhanced chaos
    for (let round = 0; round < params.edgeComplexity; round++) {
        let newVertices = [];
        
        for (let i = 0; i < vertices.length; i++) {
            let current = vertices[i];
            let next = vertices[(i + 1) % vertices.length];
            
            newVertices.push(current);
            
            // Enhanced Tyler Hobbs deformation
            let midX = (current.x + next.x) / 2;
            let midY = (current.y + next.y) / 2;
            
            let deformStrength = params.deformStrength * 100; // Increased
            let deformX = gaussianRandom(0, deformStrength);
            let deformY = gaussianRandom(0, deformStrength);
            
            newVertices.push({
                x: midX + deformX,
                y: midY + deformY
            });
        }
        vertices = newVertices;
    }
    
    // STEP 3: Add Blob Subdivision for fractal detail
    if (random() < 0.7) { // 70% chance for subdivision
        let subdivisionVertices = [];
        for (let i = 0; i < vertices.length; i++) {
            let current = vertices[i];
            let next = vertices[(i + 1) % vertices.length];
            
            subdivisionVertices.push(current);
            
            // Add 1-3 subdivision points per edge
            let subdivisions = int(random(1, 4));
            for (let s = 1; s < subdivisions; s++) {
                let t = s / subdivisions;
                let subX = lerp(current.x, next.x, t);
                let subY = lerp(current.y, next.y, t);
                
                // Perpendicular displacement for organic variation
                let perpAngle = atan2(next.y - current.y, next.x - current.x) + PI/2;
                let displacement = (random() - 0.5) * params.deformStrength * 60;
                
                subdivisionVertices.push({
                    x: subX + cos(perpAngle) * displacement,
                    y: subY + sin(perpAngle) * displacement
                });
            }
        }
        vertices = subdivisionVertices;
    }
    
    // STEP 4: Add Drip Extensions for bleeding effect
    if (random() < 0.8) { // 80% chance for drips
        let numDrips = int(random(2, 6));
        let dripVertices = [];
        
        for (let d = 0; d < numDrips; d++) {
            let baseIndex = int(random(vertices.length));
            let baseVertex = vertices[baseIndex];
            
            // Create drip extending outward
            let dripAngle = random(TWO_PI);
            let dripLength = random(15, 40);
            
            // Create tapering drip
            for (let step = 1; step <= 4; step++) {
                let progress = step / 4;
                let currentLength = dripLength * progress;
                let width = baseRadius * 0.08 * (1 - progress * 0.7); // Tapers
                
                let centerX = baseVertex.x + cos(dripAngle) * currentLength;
                let centerY = baseVertex.y + sin(dripAngle) * currentLength;
                
                // Add width with random variation
                let perpAngle = dripAngle + PI/2;
                let widthVar = width * random(0.5, 1.5);
                
                dripVertices.push({
                    x: centerX + cos(perpAngle) * widthVar,
                    y: centerY + sin(perpAngle) * widthVar
                });
                dripVertices.push({
                    x: centerX - cos(perpAngle) * widthVar,
                    y: centerY - sin(perpAngle) * widthVar
                });
            }
        }
        
        // Merge drip vertices with main shape
        vertices = vertices.concat(dripVertices);
    }
    
    return vertices;
}

// Random Walk Mode - Alternative organic spreading effect
function createRandomWalkShape(centerX, centerY, baseRadius, params) {
    let vertices = [];
    let walkers = [];
    
    // Start multiple walkers from center
    let numWalkers = int(random(3, 8));
    for (let i = 0; i < numWalkers; i++) {
        walkers.push({
            x: centerX + random(-10, 10),
            y: centerY + random(-10, 10),
            angle: random(TWO_PI),
            energy: random(50, 150)
        });
    }
    
    // Let walkers spread organically
    for (let step = 0; step < 100; step++) {
        for (let walker of walkers) {
            if (walker.energy <= 0) continue;
            
            // Bias toward center with some randomness
            let toCenter = atan2(centerY - walker.y, centerX - walker.x);
            let bias = map(dist(walker.x, walker.y, centerX, centerY), 0, baseRadius, 0.3, 0.05);
            
            walker.angle += (random() - 0.5) * params.deformStrength * 3;
            walker.angle = lerp(walker.angle, toCenter + PI, bias); // Move away from center
            
            let stepSize = random(2, 8) * (walker.energy / 100);
            walker.x += cos(walker.angle) * stepSize;
            walker.y += sin(walker.angle) * stepSize;
            walker.energy -= 1;
            
            // Keep within bounds and add to vertices
            if (dist(walker.x, walker.y, centerX, centerY) < baseRadius * 1.5) {
                vertices.push({x: walker.x, y: walker.y});
            }
        }
    }
    
    return vertices;
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

// Create watercolor brush with hybrid splotchy characteristics
function createWatercolorBrush() {
    try {
        let x = random(width * 0.1, width * 0.9);
        let y = random(height * 0.1, height * 0.9);
        let size = random(params.brushSize * 0.5, params.brushSize * 1.5);
        
        // Pick random color with enhanced variation
        let colorIndex = int(random(palettes[currentPalette].length));
        let baseColor = palettes[currentPalette][colorIndex];
        
        // Parse color
        let r = parseInt(baseColor.slice(1, 3), 16);
        let g = parseInt(baseColor.slice(3, 5), 16);
        let b = parseInt(baseColor.slice(5, 7), 16);
        
        // Enhanced color variation for natural watercolor mixing
        r = constrain(r + random(-40, 40), 0, 255);
        g = constrain(g + random(-40, 40), 0, 255);
        b = constrain(b + random(-40, 40), 0, 255);
        
        // Create hybrid splotchy shape
        let splotchyVertices = createHybridSplotchyShape(x, y, size, params);
        
        return {
            basePolygon: splotchyVertices,
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

// Draw watercolor layer with hybrid splotchiness
function drawWatercolorLayer(brush) {
    try {
        if (!brush) return;
        
        // Create layer variation using hybrid approach
        let layerVertices = createHybridSplotchyShape(
            brush.x + random(-20, 20),
            brush.y + random(-20, 20),
            brush.size * random(0.6, 1.3),
            params
        );
        
        if (params.textureMasking) {
            // Create the colored shape layer
            let shapeLayer = createGraphics(width, height);
            shapeLayer.fill(brush.r, brush.g, brush.b);
            shapeLayer.noStroke();
            
            if (layerVertices.length > 2) {
                shapeLayer.beginShape();
                for (let v of layerVertices) {
                    shapeLayer.vertex(v.x, v.y);
                }
                shapeLayer.endShape(CLOSE);
            }
            
            // Create texture mask for absorption effect
            let textureMask = createTextureMask(width, height, params.textureIntensity);
            
            // Apply mask for watercolor absorption
            shapeLayer.mask(textureMask);
            
            // Draw with proper watercolor opacity
            tint(255, params.opacity * 0.7);
            image(shapeLayer, 0, 0);
            noTint();
            
        } else {
            // Traditional rendering with hybrid splotchiness
            fill(brush.r, brush.g, brush.b, params.opacity);
            noStroke();
            
            if (layerVertices.length > 2) {
                beginShape();
                for (let v of layerVertices) {
                    vertex(v.x, v.y);
                }
                endShape(CLOSE);
            }
        }
        
    } catch (error) {
        console.error("Error drawing layer:", error);
        
        // Simple fallback
        fill(brush.r, brush.g, brush.b, params.opacity);
        noStroke();
        circle(brush.x, brush.y, brush.size);
    }
}

// Async generation with hybrid splotchiness
async function generateWaterscape() {
    if (isGenerating) return;
    isGenerating = true;
    
    let startTime = performance.now();
    
    try {
        console.log("🎨 Generating hybrid splotchy waterscape...", params);
        
        randomSeed(params.randomSeed);
        
        // Clear canvas
        background(255);
        drawBackground();
        
        // Create brushes with hybrid splotchy characteristics
        let brushes = [];
        for (let i = 0; i < params.brushCount; i++) {
            let brush = createWatercolorBrush();
            if (brush) {
                brushes.push(brush);
            }
        }
        
        console.log(`✨ Created ${brushes.length} hybrid splotchy brushes (Random Walk: ${params.randomWalkMode})`);
        
        if (brushes.length === 0) {
            throw new Error("No brushes created");
        }
        
        // Draw layers with hybrid splotchy variation
        console.log(`🎨 Drawing ${params.layersPerBrush} hybrid layers per brush`);
        
        for (let layer = 0; layer < params.layersPerBrush; layer++) {
            for (let brush of brushes) {
                drawWatercolorLayer(brush);
            }
            
            // Yield control for UI responsiveness
            if (layer % 3 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
        
        // Update metadata
        updateMetadata();
        
        let endTime = performance.now();
        console.log(`🎨 Hybrid splotchy generation complete in ${(endTime - startTime).toFixed(1)}ms!`);
        
    } catch (error) {
        console.error('❌ Generation error:', error);
        
        // Fallback with simple shapes
        background(255);
        for (let i = 0; i < 5; i++) {
            let colorIndex = int(random(palettes[currentPalette].length));
            let baseColor = palettes[currentPalette][colorIndex];
            let r = parseInt(baseColor.slice(1, 3), 16);
            let g = parseInt(baseColor.slice(3, 5), 16);
            let b = parseInt(baseColor.slice(5, 7), 16);
            
            fill(r, g, b, 30);
            noStroke();
            circle(random(width), random(height), random(50, 100));
        }
        
        updateMetadata();
    } finally {
        isGenerating = false;
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
    if (!isGenerating) {
        console.log("🔄 Generate new called");
        generateWaterscape();
    }
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