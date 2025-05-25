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

// ENHANCED: Organic texture approach with better blending
function applyTextureToShape(vertices, intensity, density, brushColor) {
    if (!params.textureMasking) return vertices;
    
    try {
        let texturedVertices = [];
        
        // Apply texture by modifying vertices and adding organic variations
        for (let i = 0; i < vertices.length; i++) {
            let current = vertices[i];
            let next = vertices[(i + 1) % vertices.length];
            
            texturedVertices.push(current);
            
            // Add organic texture variations along edges
            let edgeLength = dist(current.x, current.y, next.x, next.y);
            let numTexturePoints = int(map(edgeLength, 10, 100, 1, density / 300));
            
            for (let t = 1; t < numTexturePoints; t++) {
                let progress = t / numTexturePoints;
                let edgeX = lerp(current.x, next.x, progress);
                let edgeY = lerp(current.y, next.y, progress);
                
                // Add organic, flowing texture displacement
                let edgeAngle = atan2(next.y - current.y, next.x - current.x);
                let perpAngle = edgeAngle + PI/2;
                
                // Use noise for more organic texture variation
                let noiseVal = noise(edgeX * 0.01, edgeY * 0.01, frameCount * 0.001);
                let displacement = (noiseVal - 0.5) * intensity * 30;
                
                // Create flowing, organic absorption patterns
                let flowDirection = 1;
                if (random() < intensity * 0.4) {
                    flowDirection = -1; // Some inward flow for absorption
                }
                
                texturedVertices.push({
                    x: edgeX + cos(perpAngle) * displacement * flowDirection,
                    y: edgeY + sin(perpAngle) * displacement * flowDirection
                });
            }
        }
        
        return texturedVertices;
        
    } catch (error) {
        console.error("Texture application error:", error);
        return vertices;
    }
}

// ENHANCED: More organic splotchy shape generation
function createSplotchyShape(centerX, centerY, baseRadius, complexity = 4) {
    try {
        let vertices = [];
        
        if (params.randomWalkMode) {
            // Random Walk Mode - more organic flow
            let numPoints = 40;
            let currentX = centerX;
            let currentY = centerY;
            let angle = 0;
            
            for (let i = 0; i < numPoints; i++) {
                // More flowing, less jerky movement
                angle += (noise(i * 0.1, frameCount * 0.001) - 0.5) * params.deformStrength * 1.5;
                let stepSize = baseRadius / numPoints * (0.8 + noise(i * 0.05) * 0.4);
                
                currentX += cos(angle) * stepSize;
                currentY += sin(angle) * stepSize;
                
                if (dist(currentX, currentY, centerX, centerY) < baseRadius * 1.3) {
                    vertices.push({x: currentX, y: currentY});
                }
            }
            
            return vertices.length > 2 ? vertices : createFallbackShape(centerX, centerY, baseRadius);
        }
        
        // ORGANIC HYBRID: More flowing, less geometric
        let sides = int(random(7, 12)); // More sides for smoother flow
        
        // Step 1: Create organic base with flowing variation
        for (let i = 0; i < sides; i++) {
            let angle = (TWO_PI / sides) * i;
            
            // Add organic angle variation using noise
            let angleNoise = noise(i * 0.5, centerX * 0.001, centerY * 0.001);
            angle += (angleNoise - 0.5) * 0.6;
            
            // Organic radius variation
            let radiusNoise = noise(i * 0.3 + 100, centerX * 0.001, centerY * 0.001);
            let radiusVar = baseRadius * (0.5 + radiusNoise * 0.8);
            
            let x = centerX + cos(angle) * radiusVar;
            let y = centerY + sin(angle) * radiusVar;
            vertices.push({x: x, y: y});
        }
        
        // Step 2: Apply flowing deformation
        for (let round = 0; round < complexity; round++) {
            let newVertices = [];
            
            for (let i = 0; i < vertices.length; i++) {
                let current = vertices[i];
                let next = vertices[(i + 1) % vertices.length];
                
                newVertices.push(current);
                
                // Organic midpoint with flowing deformation
                let midX = (current.x + next.x) / 2;
                let midY = (current.y + next.y) / 2;
                
                // Use noise for more organic, flowing deformation
                let noiseX = noise(midX * 0.005, midY * 0.005, round * 0.1);
                let noiseY = noise(midX * 0.005 + 1000, midY * 0.005, round * 0.1);
                
                let deformStrength = params.deformStrength * 40;
                let deformX = (noiseX - 0.5) * deformStrength;
                let deformY = (noiseY - 0.5) * deformStrength;
                
                newVertices.push({
                    x: midX + deformX,
                    y: midY + deformY
                });
            }
            vertices = newVertices;
        }
        
        // Step 3: Add organic flowing extensions (not rigid drips)
        if (random() < 0.7) {
            let numFlows = int(random(2, 5));
            for (let f = 0; f < numFlows; f++) {
                let baseIndex = int(random(vertices.length));
                let baseVertex = vertices[baseIndex];
                
                // Create flowing extensions rather than geometric drips
                let flowAngle = random(TWO_PI);
                let flowSteps = int(random(3, 8));
                let currentX = baseVertex.x;
                let currentY = baseVertex.y;
                
                for (let step = 1; step <= flowSteps; step++) {
                    let stepProgress = step / flowSteps;
                    
                    // Gradually curve the flow
                    flowAngle += (random() - 0.5) * 0.3;
                    let stepLength = (1 - stepProgress) * random(8, 15);
                    
                    currentX += cos(flowAngle) * stepLength;
                    currentY += sin(flowAngle) * stepLength;
                    
                    vertices.push({x: currentX, y: currentY});
                }
            }
        }
        
        // Step 4: Apply organic texture modification
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
    let sides = 12; // More sides for smoother fallback
    
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

// Create watercolor brush with organic characteristics
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
        
        // Add organic color variation
        r = constrain(r + random(-25, 25), 0, 255);
        g = constrain(g + random(-25, 25), 0, 255);
        b = constrain(b + random(-25, 25), 0, 255);
        
        // Create organic splotchy shape
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

// ENHANCED: Organic layer drawing with better blending
function drawWatercolorLayer(brush, layerIndex) {
    try {
        if (!brush || !brush.basePolygon || brush.basePolygon.length < 3) {
            return;
        }
        
        // Create organic layer variation
        let variation = map(layerIndex, 0, params.layersPerBrush, 1.0, 0.6); // Smaller variation in later layers
        let positionJitter = variation * 8; // Reduced jitter for later layers
        
        let layerVertices = createSplotchyShape(
            brush.x + random(-positionJitter, positionJitter),
            brush.y + random(-positionJitter, positionJitter),
            brush.size * random(0.7 + variation * 0.2, 1.1 + variation * 0.2),
            Math.max(2, params.edgeComplexity - 1)
        );
        
        if (!layerVertices || layerVertices.length < 3) {
            layerVertices = createFallbackShape(brush.x, brush.y, brush.size);
        }
        
        // ORGANIC BLENDING: Use multiply blend mode for authentic watercolor mixing
        blendMode(MULTIPLY);
        
        // Organic opacity variation based on layer
        let layerOpacity = params.opacity;
        if (params.textureMasking) {
            // Vary opacity for more organic buildup
            layerOpacity *= random(0.6, 1.2);
            // Earlier layers slightly more opaque for better color buildup
            layerOpacity *= map(layerIndex, 0, params.layersPerBrush, 1.2, 0.8);
        }
        
        fill(brush.r, brush.g, brush.b, layerOpacity);
        noStroke();
        
        beginShape();
        for (let v of layerVertices) {
            vertex(v.x, v.y);
        }
        endShape(CLOSE);
        
        // ORGANIC TEXTURE: Flowing, subtle additional texture
        if (params.textureMasking && random() < 0.2) { // Reduced frequency
            let numDots = int(random(2, 5)); // Fewer dots
            for (let i = 0; i < numDots; i++) {
                let angle = random(TWO_PI);
                let distance = random(brush.size * 0.3, brush.size * 0.8);
                let dotX = brush.x + cos(angle) * distance;
                let dotY = brush.y + sin(angle) * distance;
                let dotSize = random(1, 4); // Smaller dots
                let dotOpacity = layerOpacity * random(0.3, 0.8); // More subtle
                
                fill(brush.r, brush.g, brush.b, dotOpacity);
                circle(dotX, dotY, dotSize);
            }
        }
        
        // Reset blend mode
        blendMode(BLEND);
        
    } catch (error) {
        console.error("Error drawing layer:", error);
        
        // Simple fallback
        fill(brush.r, brush.g, brush.b, params.opacity);
        noStroke();
        circle(brush.x, brush.y, brush.size);
    }
}

// Enhanced async generation with organic flow
async function generateWaterscape() {
    if (isGenerating) return;
    isGenerating = true;
    
    let startTime = performance.now();
    
    try {
        console.log("🎨 Generating organic waterscape...", params);
        
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
        
        console.log(`✨ Created ${brushes.length} organic brushes (Random Walk: ${params.randomWalkMode})`);
        
        if (brushes.length === 0) {
            throw new Error("No valid brushes created");
        }
        
        // Draw layers with organic blending
        console.log(`🎨 Drawing ${params.layersPerBrush} organic layers per brush`);
        
        for (let layer = 0; layer < params.layersPerBrush; layer++) {
            for (let brush of brushes) {
                drawWatercolorLayer(brush, layer);
            }
            
            // Yield control for UI responsiveness
            if (layer % 4 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
        
        // Update metadata
        updateMetadata();
        
        let endTime = performance.now();
        console.log(`🎨 Organic generation complete in ${(endTime - startTime).toFixed(1)}ms!`);
        
    } catch (error) {
        console.error('❌ Generation error:', error);
        
        // Organic fallback
        background(255);
        for (let i = 0; i < 8; i++) {
            let colorIndex = int(random(palettes[currentPalette].length));
            let baseColor = palettes[currentPalette][colorIndex];
            let r = parseInt(baseColor.slice(1, 3), 16);
            let g = parseInt(baseColor.slice(3, 5), 16);
            let b = parseInt(baseColor.slice(5, 7), 16);
            
            fill(r, g, b, 25);
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