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

// Performance optimizations
let backgroundBuffer = null;
let isGenerating = false;

// Gaussian random number generator for natural variation
function gaussianRandom(mean = 0, stdev = 1) {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return z * stdev + mean;
}

// OPTIMIZED: Create texture mask with fewer but larger circles for performance
function createTextureMask(w, h, intensity) {
    let mask = createGraphics(w, h);
    mask.background(0); // Black = transparent areas
    mask.noStroke();
    
    // Reduced circle count but increased impact for performance
    let circleCount = Math.floor(params.textureDensity / 8); // Significantly reduced
    
    for (let i = 0; i < circleCount; i++) {
        let x = random(w);
        let y = random(h);
        // Larger, more varied circles for better splotchy effect
        let radius = abs(gaussianRandom(w * 0.02, w * 0.015)); // Increased size
        let opacity = random(intensity * 200, intensity * 255); // Higher opacity range
        
        mask.fill(255, opacity);
        mask.circle(x, y, radius);
    }
    
    return mask;
}

// ENHANCED: Much more aggressive deformation for splotchy watercolor bleeding
function createSplotchyPolygon(centerX, centerY, baseRadius, complexity = 6) {
    let vertices = [];
    let variance = [];
    
    // Start with more irregular base shape
    let sides = int(random(5, 8));
    for (let i = 0; i < sides; i++) {
        let angle = (TWO_PI / sides) * i + random(-0.3, 0.3); // Add angle variation
        let radiusVar = baseRadius * random(0.4, 1.2); // Much more radius variation
        
        let x = centerX + cos(angle) * radiusVar;
        let y = centerY + sin(angle) * radiusVar;
        
        vertices.push({x: x, y: y});
        variance.push(random(0.5, 2.0)); // Higher variance range
    }
    
    // Apply multiple rounds of aggressive deformation
    for (let round = 0; round < complexity; round++) {
        let newVertices = [];
        let newVariance = [];
        
        for (let i = 0; i < vertices.length; i++) {
            let current = vertices[i];
            let next = vertices[(i + 1) % vertices.length];
            let currentVar = variance[i];
            
            newVertices.push(current);
            newVariance.push(currentVar * 0.85);
            
            // Create highly deformed midpoints for splotchy effect
            let midX = (current.x + next.x) / 2;
            let midY = (current.y + next.y) / 2;
            
            // MUCH more aggressive deformation
            let deformStrength = currentVar * params.deformStrength * 80; // Increased multiplier
            let deformX = gaussianRandom(0, deformStrength);
            let deformY = gaussianRandom(0, deformStrength);
            
            // Add some branching/splitting effects
            if (random() < 0.3 && round > 1) {
                // Create "bleed" points that extend outward
                let bleedDistance = random(10, 30);
                let bleedAngle = random(TWO_PI);
                deformX += cos(bleedAngle) * bleedDistance;
                deformY += sin(bleedAngle) * bleedDistance;
            }
            
            newVertices.push({
                x: midX + deformX,
                y: midY + deformY
            });
            
            newVariance.push(currentVar * random(0.7, 1.1));
        }
        
        vertices = newVertices;
        variance = newVariance;
    }
    
    return { vertices: vertices, variance: variance };
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

// Create watercolor brush with enhanced splotchy characteristics
function createWatercolorBrush() {
    try {
        let x = random(width * 0.15, width * 0.85);
        let y = random(height * 0.15, height * 0.85);
        let size = random(params.brushSize * 0.6, params.brushSize * 1.4); // More size variation
        
        // Pick random color
        let colorIndex = int(random(palettes[currentPalette].length));
        let baseColor = palettes[currentPalette][colorIndex];
        
        // Parse color
        let r = parseInt(baseColor.slice(1, 3), 16);
        let g = parseInt(baseColor.slice(3, 5), 16);
        let b = parseInt(baseColor.slice(5, 7), 16);
        
        // Add more color variation for natural watercolor mixing
        r = constrain(r + random(-30, 30), 0, 255);
        g = constrain(g + random(-30, 30), 0, 255);
        b = constrain(b + random(-30, 30), 0, 255);
        
        // Create highly irregular splotchy polygon
        let splotchy = createSplotchyPolygon(x, y, size, params.edgeComplexity + 2);
        
        return {
            basePolygon: splotchy.vertices,
            baseVariance: splotchy.variance,
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

// ENHANCED: More dramatic layer variation for watercolor bleeding effect
function drawWatercolorLayer(brush) {
    try {
        if (!brush) return;
        
        // Create MUCH more dramatic layer variation
        let layerDeformation = createSplotchyPolygon(
            brush.x + random(-15, 15), // More position variation
            brush.y + random(-15, 15),
            brush.size * random(0.7, 1.2), // More size variation
            3 + int(random(3)) // Variable complexity per layer
        );
        
        if (params.textureMasking) {
            // Create the colored shape layer
            let shapeLayer = createGraphics(width, height);
            shapeLayer.fill(brush.r, brush.g, brush.b);
            shapeLayer.noStroke();
            shapeLayer.beginShape();
            for (let v of layerDeformation.vertices) {
                shapeLayer.vertex(v.x, v.y);
            }
            shapeLayer.endShape(CLOSE);
            
            // Create texture mask for absorption effect
            let textureMask = createTextureMask(width, height, params.textureIntensity);
            
            // Apply mask for watercolor absorption
            shapeLayer.mask(textureMask);
            
            // Draw with proper watercolor opacity
            tint(255, params.opacity * 0.6); // Slightly higher opacity for visibility
            image(shapeLayer, 0, 0);
            noTint();
            
        } else {
            // Traditional rendering with enhanced splotchiness
            fill(brush.r, brush.g, brush.b, params.opacity);
            noStroke();
            
            beginShape();
            for (let v of layerDeformation.vertices) {
                vertex(v.x, v.y);
            }
            endShape(CLOSE);
        }
        
    } catch (error) {
        console.error("Error drawing layer:", error);
        
        // Fallback to simple drawing
        fill(brush.r, brush.g, brush.b, params.opacity);
        noStroke();
        beginShape();
        for (let v of brush.basePolygon) {
            vertex(v.x, v.y);
        }
        endShape(CLOSE);
    }
}

// OPTIMIZED: Async generation with progress updates
async function generateWaterscape() {
    if (isGenerating) return;
    isGenerating = true;
    
    let startTime = performance.now();
    
    try {
        console.log("🎨 Generating splotchy waterscape...", params);
        
        randomSeed(params.randomSeed);
        
        // Clear canvas
        background(255);
        drawBackground();
        
        // Create brushes with enhanced splotchiness
        let brushes = [];
        for (let i = 0; i < params.brushCount; i++) {
            let brush = createWatercolorBrush();
            if (brush) {
                brushes.push(brush);
            }
        }
        
        console.log(`✨ Created ${brushes.length} highly irregular brushes`);
        
        if (brushes.length === 0) {
            throw new Error("No brushes created");
        }
        
        // Draw layers with enhanced splotchy variation
        console.log(`🎨 Drawing ${params.layersPerBrush} splotchy layers per brush`);
        
        for (let layer = 0; layer < params.layersPerBrush; layer++) {
            for (let brush of brushes) {
                drawWatercolorLayer(brush);
            }
            
            // Yield control occasionally for better UI responsiveness
            if (layer % 5 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
        
        // Update metadata
        updateMetadata();
        
        let endTime = performance.now();
        console.log(`🎨 Splotchy generation complete in ${(endTime - startTime).toFixed(1)}ms!`);
        
    } catch (error) {
        console.error('❌ Generation error:', error);
        
        // Simple fallback
        background(255);
        for (let i = 0; i < 5; i++) {
            let colorIndex = int(random(palettes[currentPalette].length));
            let baseColor = palettes[currentPalette][colorIndex];
            let r = parseInt(baseColor.slice(1, 3), 16);
            let g = parseInt(baseColor.slice(3, 5), 16);
            let b = parseInt(baseColor.slice(5, 7), 16);
            
            fill(r, g, b, 30);
            noStroke();
            
            // Even fallback shapes are more splotchy
            let vertices = createSplotchyPolygon(
                random(width * 0.2, width * 0.8),
                random(height * 0.2, height * 0.8),
                random(50, 100),
                3
            ).vertices;
            
            beginShape();
            for (let v of vertices) {
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