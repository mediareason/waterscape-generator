console.log("🌊 Waterscape Studio v2.4.1 - Chaos Seepage Control Edition");

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
    // NEW: Chaos Seepage Control
    chaosSeepageIntensity: 0.7
};

let canvas;
let isGenerating = false;
let activeBrushes = [];

// Enhanced noise functions for organic chaos
function turbulentNoise(x, y, octaves = 4) {
    let value = 0;
    let amplitude = 1;
    let frequency = 0.003;
    
    for (let i = 0; i < octaves; i++) {
        value += noise(x * frequency, y * frequency) * amplitude;
        amplitude *= 0.5;
        frequency *= 2;
    }
    
    return value;
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
    
    // Apply chaos seepage to color variation
    let chaosColorVariation = params.chaosSeepageIntensity * 15;
    blendedColor.r = constrain(blendedColor.r + random(-chaosColorVariation, chaosColorVariation), 0, 255);
    blendedColor.g = constrain(blendedColor.g + random(-chaosColorVariation, chaosColorVariation), 0, 255);
    blendedColor.b = constrain(blendedColor.b + random(-chaosColorVariation, chaosColorVariation), 0, 255);
    
    return blendedColor;
}

// Create chaotic seepage extensions with intensity control
function createSeepageExtensions(centerX, centerY, baseRadius, params) {
    let extensions = [];
    let chaosMultiplier = params.chaosSeepageIntensity;
    
    // Scale extension count based on chaos intensity
    let baseExtensions = map(params.edgeComplexity, 1, 10, 3, 12);
    let extensionCount = Math.floor(baseExtensions * (0.3 + chaosMultiplier * 0.7));
    
    for (let i = 0; i < extensionCount; i++) {
        let angle = random(TWO_PI);
        let extensionLength = baseRadius * random(0.3, 1.2) * (params.deformStrength + 0.5) * chaosMultiplier;
        let segments = Math.floor(random(5, 15) * (0.5 + chaosMultiplier * 0.5));
        
        let currentX = centerX + cos(angle) * baseRadius * 0.7;
        let currentY = centerY + sin(angle) * baseRadius * 0.7;
        let currentAngle = angle;
        
        let extensionPoints = [{x: currentX, y: currentY}];
        
        for (let j = 1; j <= segments; j++) {
            let t = j / segments;
            
            // Apply chaotic forces scaled by intensity
            let chaosNoise = turbulentNoise(currentX, currentY, 3) * 2 * chaosMultiplier;
            let flowTurbulence = turbulentNoise(currentX * 2, currentY * 2, 2) * 1.5 * chaosMultiplier;
            let fiberInfluence = noise(currentX * 0.01, currentY * 0.01) * PI * chaosMultiplier;
            
            // Update angle with organic chaos scaled by intensity
            let angleChange = (chaosNoise - 1) * 0.8 + (flowTurbulence - 0.75) * 0.6 + sin(fiberInfluence) * 0.4;
            currentAngle += angleChange * chaosMultiplier;
            
            // Variable step length for irregular absorption
            let stepLength = (extensionLength / segments) * (0.5 + turbulentNoise(currentX, currentY) * 0.8 * chaosMultiplier);
            
            currentX += cos(currentAngle) * stepLength;
            currentY += sin(currentAngle) * stepLength;
            
            extensionPoints.push({x: currentX, y: currentY});
            
            // Create micro-branches for capillary action (scaled by chaos)
            let branchProbability = 0.3 * chaosMultiplier;
            if (random() < branchProbability && j > 2) {
                let branchAngle = currentAngle + random(-PI/3, PI/3) * chaosMultiplier;
                let branchLength = stepLength * random(0.5, 1.5) * chaosMultiplier;
                let branchX = currentX + cos(branchAngle) * branchLength;
                let branchY = currentY + sin(branchAngle) * branchLength;
                extensionPoints.push({x: branchX, y: branchY});
            }
        }
        
        extensions.push(extensionPoints);
    }
    
    return extensions;
}

// Enhanced chaotic wet-on-wet blending with intensity control
function createChaoticWetBlending(brush, layerIndex, nearbyBrushes) {
    if (!params.wetOnWet || nearbyBrushes.length === 0) return [];
    
    let blendZones = [];
    let chaosMultiplier = params.chaosSeepageIntensity;
    
    for (let nearby of nearbyBrushes) {
        let distance = dist(brush.x, brush.y, nearby.x, nearby.y);
        let wetDistance = params.wetBlendRadius * params.bleedingIntensity * (1 + chaosMultiplier * 0.5);
        
        if (distance < wetDistance && distance > 0) {
            // Create chaotic seepage paths between brushes (scaled by chaos intensity)
            let baseSegments = int(random(8, 16));
            let pathSegments = Math.floor(baseSegments * (0.5 + chaosMultiplier * 0.5));
            
            for (let step = 1; step <= pathSegments; step++) {
                let t = step / (pathSegments + 1);
                
                // Base interpolation
                let baseX = lerp(brush.x, nearby.x, t);
                let baseY = lerp(brush.y, nearby.y, t);
                
                // Add turbulent displacement for organic seepage (scaled by chaos)
                let turbulence = turbulentNoise(baseX, baseY, 4) * 50 * chaosMultiplier;
                let flowNoise = noise(baseX * 0.005, baseY * 0.005, layerIndex * 0.1) * 80 * chaosMultiplier;
                
                let seepageX = baseX + (turbulence - 25 * chaosMultiplier) * params.deformStrength;
                let seepageY = baseY + (flowNoise - 40 * chaosMultiplier) * params.deformStrength;
                
                let blendSize = lerp(brush.size, nearby.size, t) * (0.4 + random(0.4));
                
                // Create organic color blending with chaos variation
                let colorChaos = 20 * chaosMultiplier;
                let blendColor = {
                    r: lerp(brush.r, nearby.r, t * 0.8) + random(-colorChaos, colorChaos),
                    g: lerp(brush.g, nearby.g, t * 0.8) + random(-colorChaos, colorChaos),
                    b: lerp(brush.b, nearby.b, t * 0.8) + random(-colorChaos, colorChaos)
                };
                
                // Constrain colors
                blendColor.r = constrain(blendColor.r, 0, 255);
                blendColor.g = constrain(blendColor.g, 0, 255);
                blendColor.b = constrain(blendColor.b, 0, 255);
                
                blendZones.push({
                    x: seepageX,
                    y: seepageY,
                    size: blendSize,
                    color: blendColor,
                    opacity: params.opacity * 0.3 * (1 - t * 0.3),
                    seepageExtensions: random() < (0.4 * chaosMultiplier) // Chaos-scaled extensions
                });
            }
        }
    }
    
    return blendZones;
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

// Enhanced organic seepage shape creation with chaos intensity control
function createOrganicSeepageShape(centerX, centerY, baseRadius, complexity = 4) {
    try {
        let vertices = [];
        let sides = int(random(6, 10));
        let chaosMultiplier = params.chaosSeepageIntensity;
        
        // Create base shape with chaos-controlled irregularity
        for (let i = 0; i < sides; i++) {
            let angle = (TWO_PI / sides) * i;
            
            // Add multiple layers of noise for chaos (scaled by intensity)
            let angleNoise1 = noise(i * 0.5, centerX * 0.001, centerY * 0.001);
            let angleNoise2 = turbulentNoise(centerX + i * 50, centerY + i * 50);
            let angleVariation = (angleNoise1 - 0.5) * 1.2 + (angleNoise2 - 0.5) * 0.8;
            angle += angleVariation * chaosMultiplier;
            
            // Highly variable radius for organic feel (scaled by chaos)
            let radiusNoise = turbulentNoise(i * 100 + centerX, i * 100 + centerY, 3);
            let radiusVariation = (0.3 + radiusNoise * 1.2);
            let radiusVar = baseRadius * (0.7 + radiusVariation * chaosMultiplier * 0.3);
            
            let x = centerX + cos(angle) * radiusVar;
            let y = centerY + sin(angle) * radiusVar;
            vertices.push({x: x, y: y});
        }
        
        // Apply multiple deformation rounds for organic chaos (scaled by intensity)
        let effectiveComplexity = Math.max(2, Math.floor(complexity * (0.5 + chaosMultiplier * 0.5)));
        
        for (let round = 0; round < effectiveComplexity; round++) {
            let newVertices = [];
            
            for (let i = 0; i < vertices.length; i++) {
                let current = vertices[i];
                let next = vertices[(i + 1) % vertices.length];
                
                newVertices.push(current);
                
                // Create highly irregular midpoints
                let midX = (current.x + next.x) / 2;
                let midY = (current.y + next.y) / 2;
                
                // Multiple noise layers for chaos (scaled by intensity)
                let noiseX1 = turbulentNoise(midX * 0.005, midY * 0.005, round + 1);
                let noiseY1 = turbulentNoise(midX * 0.005 + 1000, midY * 0.005, round + 1);
                let noiseX2 = noise(midX * 0.02, midY * 0.02, round * 0.1);
                let noiseY2 = noise(midX * 0.02 + 2000, midY * 0.02, round * 0.1);
                
                let baseDeformStrength = params.deformStrength * 60 * (1 + round * 0.3);
                let chaosDeformStrength = baseDeformStrength * chaosMultiplier;
                let deformX = (noiseX1 - 0.5) * chaosDeformStrength + (noiseX2 - 0.5) * chaosDeformStrength * 0.5;
                let deformY = (noiseY1 - 0.5) * chaosDeformStrength + (noiseY2 - 0.5) * chaosDeformStrength * 0.5;
                
                // Add flow-direction bias for seepage effect (scaled by chaos)
                let flowBias = atan2(midY - centerY, midX - centerX);
                let flowStrength = params.deformStrength * 20 * chaosMultiplier;
                deformX += cos(flowBias + noise(midX * 0.01, midY * 0.01) * PI) * flowStrength;
                deformY += sin(flowBias + noise(midX * 0.01, midY * 0.01) * PI) * flowStrength;
                
                newVertices.push({
                    x: midX + deformX,
                    y: midY + deformY
                });
            }
            vertices = newVertices;
        }
        
        return vertices.length > 2 ? vertices : createFallbackShape(centerX, centerY, baseRadius);
        
    } catch (error) {
        console.error("Error creating organic seepage shape:", error);
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

// Brush creation with enhanced seepage and good canvas coverage
function createWatercolorBrush(depthLayer = 0) {
    try {
        // Balanced seepage buffer for good coverage without over-complication
        let seepageBuffer = params.brushSize * (0.5 + params.chaosSeepageIntensity * 0.5);
        let x = random(-seepageBuffer, width + seepageBuffer);
        let y = random(-seepageBuffer, height + seepageBuffer);
        let size = random(params.brushSize * 0.7, params.brushSize * 1.3);
        
        let colorIndex = int(random(palettes[currentPalette].length));
        let baseColor = palettes[currentPalette][colorIndex];
        
        let r = parseInt(baseColor.slice(1, 3), 16);
        let g = parseInt(baseColor.slice(3, 5), 16);
        let b = parseInt(baseColor.slice(5, 7), 16);
        
        let depthColor = calculateDepthColor({r, g, b}, x, y, depthLayer);
        
        // Apply chaos seepage to initial color variation
        let chaosColorVar = 25 * params.chaosSeepageIntensity;
        depthColor.r = constrain(depthColor.r + random(-chaosColorVar, chaosColorVar), 0, 255);
        depthColor.g = constrain(depthColor.g + random(-chaosColorVar, chaosColorVar), 0, 255);
        depthColor.b = constrain(depthColor.b + random(-chaosColorVar, chaosColorVar), 0, 255);
        
        let organicVertices = createOrganicSeepageShape(x, y, size, params.edgeComplexity);
        
        return {
            basePolygon: organicVertices,
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

// Enhanced drawing function with chaos-controlled organic seepage effects
function drawOrganicSeepageLayer(brush, layerIndex, allBrushes) {
    try {
        if (!brush || !brush.basePolygon || brush.basePolygon.length < 3) {
            return;
        }
        
        let maxBleedDistance = (params.brushSize * 2) * params.bleedingIntensity;
        let nearbyBrushes = findNearbyBrushes(brush, allBrushes, maxBleedDistance);
        
        let bleedColor = createColorBleedEffect(brush.x, brush.y, brush.originalColor, nearbyBrushes);
        
        let variation = map(layerIndex, 0, params.layersPerBrush, 1.2, 0.4);
        let baseJitter = variation * 15;
        let chaosJitter = baseJitter * params.chaosSeepageIntensity; // Chaos-controlled jitter
        
        // Create main organic shape with enhanced seepage
        let layerVertices = createOrganicSeepageShape(
            brush.x + random(-chaosJitter, chaosJitter),
            brush.y + random(-chaosJitter, chaosJitter),
            brush.size * random(0.6 + variation * 0.3, 1.3 + variation * 0.3),
            Math.max(3, params.edgeComplexity)
        );
        
        if (!layerVertices || layerVertices.length < 3) {
            layerVertices = createFallbackShape(brush.x, brush.y, brush.size);
        }
        
        blendMode(MULTIPLY);
        
        let layerOpacity = params.opacity * (0.8 + random(0.4) * params.chaosSeepageIntensity);
        if (params.textureMasking) {
            let chaosOpacityVariation = params.chaosSeepageIntensity * 0.8;
            layerOpacity *= random(0.5, 1.3) * (0.5 + chaosOpacityVariation);
            layerOpacity *= map(layerIndex, 0, params.layersPerBrush, 1.4, 0.6);
        }
        
        // Draw main organic shape
        fill(bleedColor.r, bleedColor.g, bleedColor.b, layerOpacity);
        noStroke();
        
        beginShape();
        for (let v of layerVertices) {
            vertex(v.x, v.y);
        }
        endShape(CLOSE);
        
        // Add seepage extensions from main shape (controlled by chaos intensity)
        let extensionProbability = 0.7 * params.chaosSeepageIntensity;
        if (params.edgeComplexity > 3 && random() < extensionProbability) {
            let extensions = createSeepageExtensions(brush.x, brush.y, brush.size, params);
            
            for (let extension of extensions) {
                if (extension.length > 2) {
                    let extensionOpacity = layerOpacity * random(0.3, 0.8) * params.chaosSeepageIntensity;
                    let extensionWidth = random(1, 4) * (0.5 + params.chaosSeepageIntensity * 0.5);
                    
                    stroke(bleedColor.r, bleedColor.g, bleedColor.b, extensionOpacity);
                    strokeWeight(extensionWidth);
                    
                    noFill();
                    beginShape();
                    for (let point of extension) {
                        vertex(point.x, point.y);
                    }
                    endShape();
                }
            }
            noStroke();
        }
        
        // Enhanced chaotic wet-on-wet blending
        let chaoticBlendZones = createChaoticWetBlending(brush, layerIndex, nearbyBrushes);
        for (let zone of chaoticBlendZones) {
            fill(zone.color.r, zone.color.g, zone.color.b, zone.opacity);
            
            if (zone.seepageExtensions) {
                // Create mini seepage from blend zones
                let miniExtensions = createSeepageExtensions(zone.x, zone.y, zone.size * 0.5, {
                    edgeComplexity: 2,
                    deformStrength: params.deformStrength * 0.7,
                    chaosSeepageIntensity: params.chaosSeepageIntensity
                });
                
                for (let ext of miniExtensions) {
                    if (ext.length > 1) {
                        stroke(zone.color.r, zone.color.g, zone.color.b, zone.opacity * 0.6);
                        strokeWeight(1);
                        noFill();
                        beginShape();
                        for (let point of ext) {
                            vertex(point.x, point.y);
                        }
                        endShape();
                    }
                }
                noStroke();
            } else {
                // Regular blend zone
                let zoneVertices = createOrganicSeepageShape(zone.x, zone.y, zone.size, 2);
                beginShape();
                for (let v of zoneVertices) {
                    vertex(v.x, v.y);
                }
                endShape(CLOSE);
            }
        }
        
        // Enhanced texture effects with chaos control
        let chaoticTextureProbability = 0.25 * params.chaosSeepageIntensity;
        if (params.textureMasking && random() < chaoticTextureProbability) {
            let baseSplatters = int(random(2, 6));
            let numSplatters = Math.floor(baseSplatters * (0.5 + params.chaosSeepageIntensity * 0.5));
            
            for (let i = 0; i < numSplatters; i++) {
                // Create random splatter positions with organic distribution
                let splatterAngle = random(TWO_PI);
                let splatterDist = random(brush.size * 0.2, brush.size * 1.2) * (0.8 + params.chaosSeepageIntensity * 0.4);
                let splatterX = brush.x + cos(splatterAngle) * splatterDist;
                let splatterY = brush.y + sin(splatterAngle) * splatterDist;
                
                // Add turbulent displacement scaled by chaos
                let turbulentDisplacement = 30 * params.chaosSeepageIntensity;
                splatterX += (turbulentNoise(splatterX, splatterY) - 0.5) * turbulentDisplacement;
                splatterY += (turbulentNoise(splatterX + 1000, splatterY) - 0.5) * turbulentDisplacement;
                
                let splatterSize = random(0.5, 3) * (0.7 + params.chaosSeepageIntensity * 0.6);
                let splatterOpacity = layerOpacity * random(0.2, 0.7) * params.chaosSeepageIntensity;
                
                fill(bleedColor.r, bleedColor.g, bleedColor.b, splatterOpacity);
                circle(splatterX, splatterY, splatterSize);
            }
        }
        
        blendMode(BLEND);
        
    } catch (error) {
        console.error("Error drawing organic seepage layer:", error);
        // Fallback to simple circle
        fill(brush.r, brush.g, brush.b, params.opacity);
        noStroke();
        circle(brush.x, brush.y, brush.size);
    }
}

// Generation with enhanced seepage
async function generateWaterscape() {
    if (isGenerating) return;
    isGenerating = true;
    
    try {
        console.log(`🌊 Generating waterscape with ${(params.chaosSeepageIntensity * 100).toFixed(0)}% chaos seepage...`);
        
        randomSeed(params.randomSeed);
        
        background(255);
        drawBackground();
        
        activeBrushes = [];
        
        let depthLayers = params.depthEffect ? params.depthLayers : 1;
        
        // Increase brush count slightly for better coverage
        let totalBrushCount = Math.max(params.brushCount, params.brushCount + 2);
        
        for (let depth = 0; depth < depthLayers; depth++) {
            let brushesInLayer = Math.ceil(totalBrushCount / depthLayers);
            
            for (let i = 0; i < brushesInLayer; i++) {
                let brush = createWatercolorBrush(depth);
                if (brush && brush.basePolygon && brush.basePolygon.length > 2) {
                    activeBrushes.push(brush);
                }
            }
        }
        
        console.log(`✨ Created ${activeBrushes.length} organic brushes with ${(params.chaosSeepageIntensity * 100).toFixed(0)}% seepage intensity`);
        
        if (activeBrushes.length === 0) {
            throw new Error("No valid brushes created");
        }
        
        activeBrushes.sort((a, b) => b.depth - a.depth);
        
        for (let layer = 0; layer < params.layersPerBrush; layer++) {
            for (let brush of activeBrushes) {
                drawOrganicSeepageLayer(brush, layer, activeBrushes);
            }
            
            if (layer % 3 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
        
        updateMetadata();
        
        console.log(`🎨 Enhanced seepage generation complete!`);
        
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
            
            let fallbackVertices = createOrganicSeepageShape(
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
    console.log("🎛️ Setting up enhanced controls with chaos seepage slider...");
    
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
        console.log("🚀 Setting up chaos seepage canvas...");
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
        console.log("🔄 Generate new organic seepage called");
        generateWaterscape();
    }
}

function savePNG() {
    try {
        if (canvas) {
            console.log("💾 Exporting organic seepage PNG...");
            saveCanvas(canvas, `waterscape_seepage_${Date.now()}`, 'png');
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

console.log("✅ Waterscape Studio v2.4.1 loaded with Chaos Seepage Control!");
console.log("🌊 Features: Organic Seepage + Chaotic Extensions + Turbulent Flow + Capillary Action");
console.log("🎛️ Use the chaosSeepageIntensity slider to control organic seepage effects");
