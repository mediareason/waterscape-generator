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

// ALTERNATIVE TEXTURE APPROACH: Direct shape modification instead of masking
function applyTextureToShape(vertices, intensity, density) {
    if (!params.textureMasking) return vertices;
    
    try {
        let texturedVertices = [];
        
        // Apply texture by modifying vertices and adding texture points
        for (let i = 0; i < vertices.length; i++) {
            let current = vertices[i];
            let next = vertices[(i + 1) % vertices.length];
            
            texturedVertices.push(current);
            
            // Add texture variations along edges
            let numTexturePoints = int(random(1, density / 200)); // Reduced density
            for (let t = 1; t < numTexturePoints; t++) {
                let progress = t / numTexturePoints;
                let edgeX = lerp(current.x, next.x, progress);
                let edgeY = lerp(current.y, next.y, progress);
                
                // Add perpendicular texture displacement
                let edgeAngle = atan2(next.y - current.y, next.x - current.x);
                let perpAngle = edgeAngle + PI/2;
                let displacement = (random() - 0.5) * intensity * 20;
                
                // Random chance to create texture "holes" by pushing inward
                if (random() < intensity * 0.3) {
                    displacement *= -1; // Inward displacement
                }
                
                texturedVertices.push({
                    x: edgeX + cos(perpAngle) * displacement,
                    y: edgeY + sin(perpAngle) * displacement
                });
            }
        }
        
        return texturedVertices;
        
    } catch (error) {
        console.error("Texture application error:", error);
        return vertices; // Return original if texture fails
    }
}

// SIMPLIFIED: More reliable splotchy shape generation
function createSplotchyShape(centerX, centerY, baseRadius, complexity = 4) {
    try {
        let vertices = [];
        
        if (params.randomWalkMode) {
            // Random Walk Mode - simplified for reliability
            let numPoints = 30;
            let currentX = centerX;
            let currentY = centerY;
            let angle = 0;
            
            for (let i = 0; i < numPoints; i++) {
                angle += (random() - 0.5) * params.deformStrength * 2;
                let stepSize = baseRadius / numPoints * random(0.5, 2);
                
                currentX += cos(angle) * stepSize;
                currentY += sin(angle) * stepSize;
                
                if (dist(currentX, currentY, centerX, centerY) < baseRadius * 1.2) {
                    vertices.push({x: currentX, y: currentY});
                }
            }
            
            return vertices.length > 2 ? vertices : createFallbackShape(centerX, centerY, baseRadius);
        }
        
        // HYBRID: Start with reliable base, add splotchiness step by step
        let sides = int(random(6, 10));
        
        // Step 1: Create base polygon with variation
        for (let i = 0; i < sides; i++) {
            let angle = (TWO_PI / sides) * i + random(-0.2, 0.2);
            let radiusVar = baseRadius * random(0.6, 1.2);
            
            let x = centerX + cos(angle) * radiusVar;
            let y = centerY + sin(angle) * radiusVar;
            vertices.push({x: x, y: y});
        }
        
        // Step 2: Apply controlled deformation
        for (let round = 0; round < complexity; round++) {
            let newVertices = [];
            
            for (let i = 0; i < vertices.length; i++) {
                let current = vertices[i];
                let next = vertices[(i + 1) % vertices.length];
                
                newVertices.push(current);
                
                // Add midpoint with deformation
                let midX = (current.x + next.x) / 2;
                let midY = (current.y + next.y) / 2;
                
                let deformStrength = params.deformStrength * 50; // Controlled amount
                let deformX = (random() - 0.5) * deformStrength;
                let deformY = (random() - 0.5) * deformStrength;
                
                newVertices.push({
                    x: midX + deformX,
                    y: midY + deformY
                });
            }
            vertices = newVertices;
        }
        
        // Step 3: Add some drips (simplified)
        if (random() < 0.6) { // 60% chance
            let numDrips = int(random(1, 4));
            for (let d = 0; d < numDrips; d++) {
                let baseIndex = int(random(vertices.length));
                let baseVertex = vertices[baseIndex];
                
                let dripAngle = random(TWO_PI);
                let dripLength = random(15, 30);
                
                let dripX = baseVertex.x + cos(dripAngle) * dripLength;
                let dripY = baseVertex.y + sin(dripAngle) * dripLength;
                
                vertices.push({x: dripX, y: dripY});
            }
        }
        
        // Step 4: Apply texture modification directly to shape
        vertices = applyTextureToShape(vertices, params.textureIntensity, params.textureDensity);
        
        return vertices.length > 2 ? vertices : createFallbackShape(centerX, centerY, baseRadius);
        
    } catch (error) {
        console.error("Error creating splotchy shape:", error);
        return createFallbackShape(centerX, centerY, baseRadius);
    }
}

// Fallback to ensure we always have a valid shape
function createFallbackShape(centerX, centerY, radius) {
    let vertices = [];
    let sides = 8;
    
    for (let i = 0; i < sides; i++) {
        let angle = (TWO_PI / sides) * i;
        let x = centerX + cos(angle) * radius;
        let y = centerY + sin(angle) * radius;
        vertices.push({x: x, y: y});
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

// Create watercolor brush with reliable splotchy characteristics
function createWatercolorBrush() {
    try {
        let x = random(width * 0.15, width * 0.85);
        let y = random(height * 0.15, height * 0.85);
        let size = random(params.brushSize * 0.7, params.brushSize * 1.3);
        
        // Pick random color
        let colorIndex = int(random(palettes[currentPalette].length));
        let baseColor = palettes[currentPalette][colorIndex];
        
        // Parse color
        let r = parseInt(baseColor.slice(1, 3), 16);
        let g = parseInt(baseColor.slice(3, 5), 16);
        let b = parseInt(baseColor.slice(5, 7), 16);
        
        // Add color variation
        r = constrain(r + random(-30, 30), 0, 255);
        g = constrain(g + random(-30, 30), 0, 255);
        b = constrain(b + random(-30, 30), 0, 255);
        
        // Create reliable splotchy shape
        let splotchyVertices = createSplotchyShape(x, y, size, params.edgeComplexity);
        
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

// Draw watercolor layer with WORKING texture alternative
function drawWatercolorLayer(brush) {
    try {
        if (!brush || !brush.basePolygon || brush.basePolygon.length < 3) {
            console.warn("Invalid brush or polygon, skipping layer");
            return;
        }
        
        // Create layer variation with texture built-in
        let layerVertices = createSplotchyShape(
            brush.x + random(-10, 10),
            brush.y + random(-10, 10),
            brush.size * random(0.8, 1.2),
            Math.max(2, params.edgeComplexity - 1)
        );
        
        if (!layerVertices || layerVertices.length < 3) {
            console.warn("Invalid layer vertices, using fallback");
            layerVertices = createFallbackShape(brush.x, brush.y, brush.size);
        }
        
        // SIMPLIFIED: Direct drawing without problematic mask() function
        fill(brush.r, brush.g, brush.b, params.opacity);
        noStroke();
        
        beginShape();
        for (let v of layerVertices) {
            vertex(v.x, v.y);
        }
        endShape(CLOSE);
        
        // Additional texture effect: Add some small transparent circles for paper texture
        if (params.textureMasking && random() < 0.3) {
            let numDots = int(random(3, 8));
            for (let i = 0; i < numDots; i++) {
                let dotX = brush.x + random(-brush.size, brush.size);
                let dotY = brush.y + random(-brush.size, brush.size);
                let dotSize = random(2, 6);
                let dotOpacity = random(params.opacity * 0.5, params.opacity * 1.5);
                
                fill(brush.r, brush.g, brush.b, dotOpacity);
                circle(dotX, dotY, dotSize);
            }
        }
        
    } catch (error) {
        console.error("Error drawing layer:", error);
        
        // Emergency fallback - draw simple circle
        fill(brush.r, brush.g, brush.b, params.opacity);
        noStroke();
        circle(brush.x, brush.y, brush.size);
    }
}

// Simplified async generation - NO PROBLEMATIC MASKING
async function generateWaterscape() {
    if (isGenerating) return;
    isGenerating = true;
    
    let startTime = performance.now();
    
    try {
        console.log("🎨 Generating waterscape WITHOUT mask() function...", params);
        
        randomSeed(params.randomSeed);
        
        // Clear canvas
        background(255);
        drawBackground();
        
        // Create brushes
        let brushes = [];
        for (let i = 0; i < params.brushCount; i++) {
            let brush = createWatercolorBrush();
            if (brush && brush.basePolygon && brush.basePolygon.length > 2) {
                brushes.push(brush);
            }
        }
        
        console.log(`✨ Created ${brushes.length} reliable brushes (Random Walk: ${params.randomWalkMode})`);
        
        if (brushes.length === 0) {
            throw new Error("No valid brushes created");
        }
        
        // Draw layers with alternative texture method
        console.log(`🎨 Drawing ${params.layersPerBrush} layers per brush`);
        
        for (let layer = 0; layer < params.layersPerBrush; layer++) {
            for (let brush of brushes) {
                drawWatercolorLayer(brush);
            }
            
            // Yield control for UI responsiveness
            if (layer % 5 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
        
        // Update metadata
        updateMetadata();
        
        let endTime = performance.now();
        console.log(`🎨 Alternative texture generation complete in ${(endTime - startTime).toFixed(1)}ms!`);
        
    } catch (error) {
        console.error('❌ Generation error:', error);
        
        // Simple fallback
        background(255);
        for (let i = 0; i < 8; i++) {
            let colorIndex = int(random(palettes[currentPalette].length));
            let baseColor = palettes[currentPalette][colorIndex];
            let r = parseInt(baseColor.slice(1, 3), 16);
            let g = parseInt(baseColor.slice(3, 5), 16);
            let b = parseInt(baseColor.slice(5, 7), 16);
            
            fill(r, g, b, 40);
            noStroke();
            
            let fallbackVertices = createSplotchyShape(
                random(width * 0.2, width * 0.8),
                random(height * 0.2, height * 0.8),
                random(50, 100),
                3
            );
            
            beginShape();
            for (let v of fallbackVertices) {
                vertex(v.x, v.y);
            }
            endShape(CLOSE);
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