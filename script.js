console.log("🎨 Waterscape Studio v2.5 - Clean Chaos Seepage");

// Color palettes
let palettes = {
    vibrant: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'],
    pastel: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFDFBA', '#E0BBE4', '#957DAD', '#D291BC'],
    earth: ['#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F4A460', '#D2B48C', '#BC8F8F', '#A0522D'],
    ocean: ['#006994', '#4A90A4', '#83C5BE', '#7FCDCD', '#7FB3D3', '#5D737E', '#3E8E7E', '#1F4E79'],
    sunset: ['#FF4B2B', '#FF416C', '#FFA07A', '#FFB347', '#FFD700', '#FF6347', '#FF69B4', '#FF1493'],
    forest: ['#228B22', '#32CD32', '#7CFC00', '#9ACD32', '#90EE90', '#98FB98', '#00FF7F', '#3CB371'],
    monochrome: ['#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7', '#D5DBDB', '#85929E', '#566573']
};

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
    textureMasking: true,
    textureIntensity: 0.7,
    textureDensity: 800,
    // Advanced watercolor effects
    colorBleeding: true,
    bleedingIntensity: 0.6,
    wetOnWet: true,
    wetBlendRadius: 40,
    depthEffect: true,
    depthLayers: 3,
    randomWalkMode: false,
    // Chaos Seepage Control
    chaosSeepageIntensity: 0.7
};

let canvas;
let isGenerating = false;
let activeBrushes = [];

// Simple noise function
function simpleNoise(x, y, scale = 1) {
    return noise(x * scale * 0.01, y * scale * 0.01);
}

// Advanced watercolor effects
function createColorBleedEffect(centerX, centerY, baseColor, nearbyBrushes) {
    if (!params.colorBleeding || nearbyBrushes.length === 0) {
        return {
            r: parseInt(baseColor.slice(1, 3), 16),
            g: parseInt(baseColor.slice(3, 5), 16),
            b: parseInt(baseColor.slice(5, 7), 16)
        };
    }
    
    let blendedColor = {
        r: parseInt(baseColor.slice(1, 3), 16),
        g: parseInt(baseColor.slice(3, 5), 16),
        b: parseInt(baseColor.slice(5, 7), 16)
    };
    
    for (let nearby of nearbyBrushes) {
        let distance = dist(centerX, centerY, nearby.x, nearby.y);
        let maxBleedDistance = (params.brushSize * 2) * params.bleedingIntensity;
        
        if (distance < maxBleedDistance) {
            let influence = map(distance, 0, maxBleedDistance, 0.4, 0) * params.bleedingIntensity;
            blendedColor.r = lerp(blendedColor.r, nearby.r, influence);
            blendedColor.g = lerp(blendedColor.g, nearby.g, influence);
            blendedColor.b = lerp(blendedColor.b, nearby.b, influence);
        }
    }
    
    // Apply light chaos seepage to color variation
    let colorVariation = params.chaosSeepageIntensity * 10;
    blendedColor.r = constrain(blendedColor.r + random(-colorVariation, colorVariation), 0, 255);
    blendedColor.g = constrain(blendedColor.g + random(-colorVariation, colorVariation), 0, 255);
    blendedColor.b = constrain(blendedColor.b + random(-colorVariation, colorVariation), 0, 255);
    
    return blendedColor;
}

// Simple wet-on-wet effect
function createWetOnWetLayer(brush, layerIndex, nearbyBrushes) {
    if (!params.wetOnWet) return null;
    
    let wetZones = [];
    for (let nearby of nearbyBrushes) {
        let distance = dist(brush.x, brush.y, nearby.x, nearby.y);
        let wetDistance = params.wetBlendRadius * params.bleedingIntensity;
        
        if (distance < wetDistance && distance > 0) {
            let blendSteps = 2 + Math.floor(params.chaosSeepageIntensity * 2);
            for (let step = 1; step <= blendSteps; step++) {
                let t = step / (blendSteps + 1);
                let blendX = lerp(brush.x, nearby.x, t);
                let blendY = lerp(brush.y, nearby.y, t);
                
                // Add subtle chaos displacement
                let chaosOffset = params.chaosSeepageIntensity * 15;
                blendX += random(-chaosOffset, chaosOffset);
                blendY += random(-chaosOffset, chaosOffset);
                
                let blendSize = lerp(brush.size, nearby.size, t) * (0.6 + random(0.3));
                
                let blendColor = {
                    r: lerp(brush.r, nearby.r, t * 0.7),
                    g: lerp(brush.g, nearby.g, t * 0.7),
                    b: lerp(brush.b, nearby.b, t * 0.7)
                };
                
                wetZones.push({
                    x: blendX,
                    y: blendY,
                    size: blendSize,
                    color: blendColor,
                    opacity: params.opacity * 0.4 * (1 - t * 0.5)
                });
            }
        }
    }
    return wetZones;
}

function calculateDepthColor(baseColor, x, y, depth = 0) {
    if (!params.depthEffect) return baseColor;
    
    let depthNoise = noise(x * 0.003, y * 0.003, depth * 0.1);
    let depthFactor = map(depthNoise, 0, 1, 0.7, 1.3);
    
    let adjustedColor = {
        r: constrain(baseColor.r * depthFactor, 0, 255),
        g: constrain(baseColor.g * depthFactor, 0, 255),
        b: constrain(baseColor.b * depthFactor, 0, 255)
    };
    
    if (depthFactor < 1) {
        let depthBlue = (1 - depthFactor) * 20;
        adjustedColor.b = constrain(adjustedColor.b + depthBlue, 0, 255);
        adjustedColor.r = constrain(adjustedColor.r - depthBlue * 0.3, 0, 255);
    }
    
    return adjustedColor;
}

// Enhanced shape generation with controlled chaos
function createSplotchyShape(centerX, centerY, baseRadius, complexity = 4) {
    try {
        let vertices = [];
        let sides = int(random(7, 12));
        
        for (let i = 0; i < sides; i++) {
            let angle = (TWO_PI / sides) * i;
            let angleNoise = simpleNoise(i * 0.5, centerX * 0.001, centerY * 0.001);
            
            // Apply chaos seepage to angle variation
            let angleVariation = (angleNoise - 0.5) * 0.6;
            angleVariation *= (1 + params.chaosSeepageIntensity * 0.5);
            angle += angleVariation;
            
            let radiusNoise = simpleNoise(i * 0.3 + 100, centerX * 0.001, centerY * 0.001);
            let radiusVar = baseRadius * (0.5 + radiusNoise * 0.8);
            
            // Apply chaos seepage to radius variation
            radiusVar *= (1 + params.chaosSeepageIntensity * 0.3 * (radiusNoise - 0.5));
            
            let x = centerX + cos(angle) * radiusVar;
            let y = centerY + sin(angle) * radiusVar;
            vertices.push({x: x, y: y});
        }
        
        // Apply deformation rounds based on complexity
        for (let round = 0; round < complexity; round++) {
            let newVertices = [];
            
            for (let i = 0; i < vertices.length; i++) {
                let current = vertices[i];
                let next = vertices[(i + 1) % vertices.length];
                
                newVertices.push(current);
                
                let midX = (current.x + next.x) / 2;
                let midY = (current.y + next.y) / 2;
                
                let noiseX = simpleNoise(midX * 0.005, midY * 0.005, round * 0.1);
                let noiseY = simpleNoise(midX * 0.005 + 1000, midY * 0.005, round * 0.1);
                
                let deformStrength = params.deformStrength * 40;
                // Scale deformation by chaos seepage
                deformStrength *= (1 + params.chaosSeepageIntensity * 0.5);
                
                let deformX = (noiseX - 0.5) * deformStrength;
                let deformY = (noiseY - 0.5) * deformStrength;
                
                newVertices.push({
                    x: midX + deformX,
                    y: midY + deformY
                });
            }
            vertices = newVertices;
        }
        
        return vertices.length > 2 ? vertices : createFallbackShape(centerX, centerY, baseRadius);
        
    } catch (error) {
        console.error("Error creating splotchy shape:", error);
        return createFallbackShape(centerX, centerY, baseRadius);
    }
}

function createFallbackShape(centerX, centerY, radius) {
    let vertices = [];
    let sides = 12;
    
    for (let i = 0; i < sides; i++) {
        let angle = (TWO_PI / sides) * i;
        let x = centerX + cos(angle) * radius;
        let y = centerY + sin(angle) * radius;
        vertices.push({x: x, y: y});
    }
    
    return vertices;
}

// Brush creation
function createWatercolorBrush(depthLayer = 0) {
    try {
        // Use original brush positioning with slight expansion for chaos seepage
        let expansion = params.chaosSeepageIntensity * 0.2;
        let x = random(width * (0.15 - expansion), width * (0.85 + expansion));
        let y = random(height * (0.15 - expansion), height * (0.85 + expansion));
        let size = random(params.brushSize * 0.7, params.brushSize * 1.3);
        
        let colorIndex = int(random(palettes[currentPalette].length));
        let baseColor = palettes[currentPalette][colorIndex];
        
        let r = parseInt(baseColor.slice(1, 3), 16);
        let g = parseInt(baseColor.slice(3, 5), 16);
        let b = parseInt(baseColor.slice(5, 7), 16);
        
        let depthColor = calculateDepthColor({r, g, b}, x, y, depthLayer);
        
        // Apply subtle chaos color variation
        let colorVar = params.chaosSeepageIntensity * 15;
        depthColor.r = constrain(depthColor.r + random(-colorVar, colorVar), 0, 255);
        depthColor.g = constrain(depthColor.g + random(-colorVar, colorVar), 0, 255);
        depthColor.b = constrain(depthColor.b + random(-colorVar, colorVar), 0, 255);
        
        let splotchyVertices = createSplotchyShape(x, y, size, params.edgeComplexity);
        
        return {
            basePolygon: splotchyVertices,
            r: depthColor.r,
            g: depthColor.g,
            b: depthColor.b,
            x: x,
            y: y,
            size: size,
            depth: depthLayer,
            originalColor: baseColor
        };
    } catch (error) {
        console.error("Error creating brush:", error);
        return null;
    }
}

function findNearbyBrushes(brush, allBrushes, maxDistance) {
    let nearby = [];
    
    for (let other of allBrushes) {
        if (other !== brush) {
            let distance = dist(brush.x, brush.y, other.x, other.y);
            if (distance < maxDistance) {
                nearby.push(other);
            }
        }
    }
    
    return nearby;
}

// Drawing with controlled chaos seepage
function drawWatercolorLayer(brush, layerIndex, allBrushes) {
    try {
        if (!brush || !brush.basePolygon || brush.basePolygon.length < 3) {
            return;
        }
        
        let maxBleedDistance = (params.brushSize * 1.5) * params.bleedingIntensity;
        let nearbyBrushes = findNearbyBrushes(brush, allBrushes, maxBleedDistance);
        
        let bleedColor = createColorBleedEffect(brush.x, brush.y, brush.originalColor, nearbyBrushes);
        
        let variation = map(layerIndex, 0, params.layersPerBrush, 1.0, 0.6);
        let positionJitter = variation * 8;
        // Add controlled chaos jitter
        positionJitter *= (1 + params.chaosSeepageIntensity * 0.5);
        
        let layerVertices = createSplotchyShape(
            brush.x + random(-positionJitter, positionJitter),
            brush.y + random(-positionJitter, positionJitter),
            brush.size * random(0.7 + variation * 0.2, 1.1 + variation * 0.2),
            Math.max(2, params.edgeComplexity - 1)
        );
        
        if (!layerVertices || layerVertices.length < 3) {
            layerVertices = createFallbackShape(brush.x, brush.y, brush.size);
        }
        
        blendMode(MULTIPLY);
        
        let layerOpacity = params.opacity;
        if (params.textureMasking) {
            layerOpacity *= random(0.6, 1.2);
            layerOpacity *= map(layerIndex, 0, params.layersPerBrush, 1.2, 0.8);
        }
        
        if (params.depthEffect) {
            layerOpacity *= (1 + brush.depth * 0.3);
        }
        
        fill(bleedColor.r, bleedColor.g, bleedColor.b, layerOpacity);
        noStroke();
        
        beginShape();
        for (let v of layerVertices) {
            vertex(v.x, v.y);
        }
        endShape(CLOSE);
        
        // Wet-on-wet blending zones
        if (params.wetOnWet && nearbyBrushes.length > 0) {
            let wetZones = createWetOnWetLayer(brush, layerIndex, nearbyBrushes);
            if (wetZones) {
                for (let zone of wetZones) {
                    fill(zone.color.r, zone.color.g, zone.color.b, zone.opacity);
                    let zoneVertices = createSplotchyShape(zone.x, zone.y, zone.size, 2);
                    beginShape();
                    for (let v of zoneVertices) {
                        vertex(v.x, v.y);
                    }
                    endShape(CLOSE);
                }
            }
        }
        
        // Subtle texture effects
        if (params.textureMasking && random() < 0.15) {
            let numDots = int(random(1, 3));
            for (let i = 0; i < numDots; i++) {
                let angle = random(TWO_PI);
                let distance = random(brush.size * 0.3, brush.size * 0.8);
                // Add chaos displacement to texture
                distance *= (1 + params.chaosSeepageIntensity * 0.3);
                let dotX = brush.x + cos(angle) * distance;
                let dotY = brush.y + sin(angle) * distance;
                let dotSize = random(1, 3);
                let dotOpacity = layerOpacity * random(0.2, 0.6);
                
                fill(bleedColor.r, bleedColor.g, bleedColor.b, dotOpacity);
                circle(dotX, dotY, dotSize);
            }
        }
        
        blendMode(BLEND);
        
    } catch (error) {
        console.error("Error drawing layer:", error);
        fill(brush.r, brush.g, brush.b, params.opacity);
        noStroke();
        circle(brush.x, brush.y, brush.size);
    }
}

// Generation
async function generateWaterscape() {
    if (isGenerating) return;
    isGenerating = true;
    
    try {
        console.log(`🎨 Generating waterscape with ${(params.chaosSeepageIntensity * 100).toFixed(0)}% chaos seepage...`);
        
        randomSeed(params.randomSeed);
        
        background(255);
        drawBackground();
        
        activeBrushes = [];
        
        let depthLayers = params.depthEffect ? params.depthLayers : 1;
        
        for (let depth = 0; depth < depthLayers; depth++) {
            let brushesInLayer = Math.ceil(params.brushCount / depthLayers);
            
            for (let i = 0; i < brushesInLayer; i++) {
                let brush = createWatercolorBrush(depth);
                if (brush && brush.basePolygon && brush.basePolygon.length > 2) {
                    activeBrushes.push(brush);
                }
            }
        }
        
        console.log(`✨ Created ${activeBrushes.length} brushes`);
        
        if (activeBrushes.length === 0) {
            throw new Error("No valid brushes created");
        }
        
        activeBrushes.sort((a, b) => b.depth - a.depth);
        
        for (let layer = 0; layer < params.layersPerBrush; layer++) {
            for (let brush of activeBrushes) {
                drawWatercolorLayer(brush, layer, activeBrushes);
            }
            
            if (layer % 3 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
        
        updateMetadata();
        
        console.log(`🎨 Generation complete!`);
        
    } catch (error) {
        console.error('❌ Generation error:', error);
        
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
function openColorPicker(colorIndex) {
    editingColorIndex = colorIndex;
    const currentColor = palettes[currentPalette][colorIndex];
    
    document.getElementById('colorInput').value = currentColor;
    document.getElementById('hexInput').value = currentColor;
    document.getElementById('colorPreview').style.backgroundColor = currentColor;
    
    document.getElementById('colorPickerOverlay').style.display = 'flex';
    
    const presetColorsDiv = document.getElementById('presetColors');
    presetColorsDiv.innerHTML = '';
    presetColors.forEach(color => {
        const preset = document.createElement('div');
        preset.className = 'preset-color';
        preset.style.backgroundColor = color;
        preset.onclick = () => selectPresetColor(color);
        presetColorsDiv.appendChild(preset);
    });
    
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

function updateMetadata() {
    const totalLayers = params.brushCount * params.layersPerBrush;
    const currentPaletteInfo = document.getElementById('currentPaletteInfo');
    const layerCountInfo = document.getElementById('layerCountInfo');
    if (currentPaletteInfo) currentPaletteInfo.textContent = currentPalette;
    if (layerCountInfo) layerCountInfo.textContent = totalLayers;
}

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

function updateEffectControls() {
    const bleedingControls = document.querySelectorAll('.bleeding-control');
    const isBleedingEnabled = params.colorBleeding;
    bleedingControls.forEach(control => {
        control.style.opacity = isBleedingEnabled ? '1' : '0.5';
        const slider = control.querySelector('input[type="range"]');
        if (slider) slider.disabled = !isBleedingEnabled;
    });
    
    const wetControls = document.querySelectorAll('.wet-control');
    const isWetEnabled = params.wetOnWet;
    wetControls.forEach(control => {
        control.style.opacity = isWetEnabled ? '1' : '0.5';
        const slider = control.querySelector('input[type="range"]');
        if (slider) slider.disabled = !isWetEnabled;
    });
    
    const depthControls = document.querySelectorAll('.depth-control');
    const isDepthEnabled = params.depthEffect;
    depthControls.forEach(control => {
        control.style.opacity = isDepthEnabled ? '1' : '0.5';
        const slider = control.querySelector('input[type="range"]');
        if (slider) slider.disabled = !isDepthEnabled;
    });
    
    const textureControls = document.querySelectorAll('.texture-control');
    const isTextureEnabled = params.textureMasking;
    textureControls.forEach(control => {
        control.style.opacity = isTextureEnabled ? '1' : '0.5';
        const slider = control.querySelector('input[type="range"]');
        if (slider) slider.disabled = !isTextureEnabled;
    });
}

function setupControls() {
    console.log("🎛️ Setting up controls...");
    
    const paletteSelect = document.getElementById('paletteSelect');
    if (paletteSelect) {
        paletteSelect.addEventListener('change', (e) => {
            currentPalette = e.target.value;
            updateColorPalette();
            generateNew();
        });
    }

    Object.keys(params).forEach(param => {
        const control = document.getElementById(param);
        const valueDisplay = document.getElementById(param + 'Value');
        
        if (control && valueDisplay) {
            if (control.type === 'checkbox') {
                control.addEventListener('change', (e) => {
                    params[param] = e.target.checked;
                    valueDisplay.textContent = params[param] ? 'On' : 'Off';
                    updateEffectControls();
                    generateNew();
                });
            } else {
                control.addEventListener('input', (e) => {
                    if (param === 'deformStrength' || param === 'textureIntensity' || param === 'bleedingIntensity' || param === 'chaosSeepageIntensity') {
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

    const backgroundType = document.getElementById('backgroundType');
    if (backgroundType) {
        backgroundType.addEventListener('change', (e) => {
            params.backgroundType = e.target.value;
            generateNew();
        });
    }

    const overlay = document.getElementById('colorPickerOverlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeColorPicker();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && editingColorIndex >= 0) {
            closeColorPicker();
        }
    });

    updateEffectControls();
}

// P5.js setup
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

window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('❌ JavaScript Error:', msg, 'at line', lineNo);
    return false;
};

console.log("✅ Waterscape Studio v2.5 loaded - Clean Chaos Seepage!");
console.log("🎨 Restored original clarity with subtle chaos seepage control");
