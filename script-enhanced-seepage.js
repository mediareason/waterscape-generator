console.log("🌊 Enhanced Water Seepage Effects v1.0");

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

// Create chaotic seepage extensions
function createSeepageExtensions(centerX, centerY, baseRadius, params) {
    let extensions = [];
    let extensionCount = Math.floor(map(params.edgeComplexity, 1, 10, 3, 12));
    
    for (let i = 0; i < extensionCount; i++) {
        let angle = random(TWO_PI);
        let extensionLength = baseRadius * random(0.3, 1.2) * (params.deformStrength + 0.5);
        let segments = Math.floor(random(5, 15));
        
        let currentX = centerX + cos(angle) * baseRadius * 0.7;
        let currentY = centerY + sin(angle) * baseRadius * 0.7;
        let currentAngle = angle;
        
        let extensionPoints = [{x: currentX, y: currentY}];
        
        for (let j = 1; j <= segments; j++) {
            let t = j / segments;
            
            // Apply chaotic forces
            let chaosNoise = turbulentNoise(currentX, currentY, 3) * 2;
            let flowTurbulence = turbulentNoise(currentX * 2, currentY * 2, 2) * 1.5;
            let fiberInfluence = noise(currentX * 0.01, currentY * 0.01) * PI;
            
            // Update angle with organic chaos
            currentAngle += (chaosNoise - 1) * 0.8 + (flowTurbulence - 0.75) * 0.6 + sin(fiberInfluence) * 0.4;
            
            // Variable step length for irregular absorption
            let stepLength = (extensionLength / segments) * (0.5 + turbulentNoise(currentX, currentY) * 0.8);
            
            currentX += cos(currentAngle) * stepLength;
            currentY += sin(currentAngle) * stepLength;
            
            extensionPoints.push({x: currentX, y: currentY});
            
            // Create micro-branches for capillary action
            if (random() < 0.3 && j > 2) {
                let branchAngle = currentAngle + random(-PI/3, PI/3);
                let branchLength = stepLength * random(0.5, 1.5);
                let branchX = currentX + cos(branchAngle) * branchLength;
                let branchY = currentY + sin(branchAngle) * branchLength;
                extensionPoints.push({x: branchX, y: branchY});
            }
        }
        
        extensions.push(extensionPoints);
    }
    
    return extensions;
}

// Enhanced shape creation with organic seepage
function createOrganicSeepageShape(centerX, centerY, baseRadius, complexity = 4) {
    try {
        let vertices = [];
        let sides = int(random(6, 10));
        
        // Create base shape with more irregularity
        for (let i = 0; i < sides; i++) {
            let angle = (TWO_PI / sides) * i;
            
            // Add multiple layers of noise for chaos
            let angleNoise1 = noise(i * 0.5, centerX * 0.001, centerY * 0.001);
            let angleNoise2 = turbulentNoise(centerX + i * 50, centerY + i * 50);
            angle += (angleNoise1 - 0.5) * 1.2 + (angleNoise2 - 0.5) * 0.8;
            
            // Highly variable radius for organic feel
            let radiusNoise = turbulentNoise(i * 100 + centerX, i * 100 + centerY, 3);
            let radiusVar = baseRadius * (0.3 + radiusNoise * 1.2);
            
            let x = centerX + cos(angle) * radiusVar;
            let y = centerY + sin(angle) * radiusVar;
            vertices.push({x: x, y: y});
        }
        
        // Apply multiple deformation rounds for organic chaos
        for (let round = 0; round < complexity; round++) {
            let newVertices = [];
            
            for (let i = 0; i < vertices.length; i++) {
                let current = vertices[i];
                let next = vertices[(i + 1) % vertices.length];
                
                newVertices.push(current);
                
                // Create highly irregular midpoints
                let midX = (current.x + next.x) / 2;
                let midY = (current.y + next.y) / 2;
                
                // Multiple noise layers for chaos
                let noiseX1 = turbulentNoise(midX * 0.005, midY * 0.005, round + 1);
                let noiseY1 = turbulentNoise(midX * 0.005 + 1000, midY * 0.005, round + 1);
                let noiseX2 = noise(midX * 0.02, midY * 0.02, round * 0.1);
                let noiseY2 = noise(midX * 0.02 + 2000, midY * 0.02, round * 0.1);
                
                let deformStrength = params.deformStrength * 60 * (1 + round * 0.3);
                let deformX = (noiseX1 - 0.5) * deformStrength + (noiseX2 - 0.5) * deformStrength * 0.5;
                let deformY = (noiseY1 - 0.5) * deformStrength + (noiseY2 - 0.5) * deformStrength * 0.5;
                
                // Add flow-direction bias for seepage effect
                let flowBias = atan2(midY - centerY, midX - centerX);
                let flowStrength = params.deformStrength * 20;
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

// Enhanced wet-on-wet with chaotic seepage
function createChaoticWetBlending(brush, layerIndex, nearbyBrushes) {
    if (!params.wetOnWet || nearbyBrushes.length === 0) return [];
    
    let blendZones = [];
    
    for (let nearby of nearbyBrushes) {
        let distance = dist(brush.x, brush.y, nearby.x, nearby.y);
        let wetDistance = params.wetBlendRadius * params.bleedingIntensity * 1.5;
        
        if (distance < wetDistance && distance > 0) {
            // Create chaotic seepage paths between brushes
            let pathSegments = int(random(8, 16));
            
            for (let step = 1; step <= pathSegments; step++) {
                let t = step / (pathSegments + 1);
                
                // Base interpolation
                let baseX = lerp(brush.x, nearby.x, t);
                let baseY = lerp(brush.y, nearby.y, t);
                
                // Add turbulent displacement for organic seepage
                let turbulence = turbulentNoise(baseX, baseY, 4) * 50;
                let flowNoise = noise(baseX * 0.005, baseY * 0.005, layerIndex * 0.1) * 80;
                
                let seepageX = baseX + (turbulence - 25) * params.deformStrength;
                let seepageY = baseY + (flowNoise - 40) * params.deformStrength;
                
                let blendSize = lerp(brush.size, nearby.size, t) * (0.4 + random(0.4));
                
                // Create organic color blending
                let blendColor = {
                    r: lerp(brush.r, nearby.r, t * 0.8) + random(-20, 20),
                    g: lerp(brush.g, nearby.g, t * 0.8) + random(-20, 20),
                    b: lerp(brush.b, nearby.b, t * 0.8) + random(-20, 20)
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
                    seepageExtensions: random() < 0.4 // Sometimes add extensions
                });
            }
        }
    }
    
    return blendZones;
}

// Enhanced drawing function with seepage effects
function drawOrganicSeepageLayer(brush, layerIndex, allBrushes) {
    try {
        if (!brush || !brush.basePolygon || brush.basePolygon.length < 3) {
            return;
        }
        
        let maxBleedDistance = (params.brushSize * 2) * params.bleedingIntensity;
        let nearbyBrushes = findNearbyBrushes(brush, allBrushes, maxBleedDistance);
        
        let bleedColor = createColorBleedEffect(brush.x, brush.y, brush.originalColor, nearbyBrushes);
        
        let variation = map(layerIndex, 0, params.layersPerBrush, 1.2, 0.4);
        let positionJitter = variation * 15; // Increased jitter for more chaos
        
        // Create main organic shape with enhanced seepage
        let layerVertices = createOrganicSeepageShape(
            brush.x + random(-positionJitter, positionJitter),
            brush.y + random(-positionJitter, positionJitter),
            brush.size * random(0.6 + variation * 0.3, 1.3 + variation * 0.3),
            Math.max(3, params.edgeComplexity)
        );
        
        if (!layerVertices || layerVertices.length < 3) {
            layerVertices = createFallbackShape(brush.x, brush.y, brush.size);
        }
        
        blendMode(MULTIPLY);
        
        let layerOpacity = params.opacity * (0.8 + random(0.4));
        if (params.textureMasking) {
            layerOpacity *= random(0.5, 1.3);
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
        
        // Add seepage extensions from main shape
        if (params.edgeComplexity > 3 && random() < 0.7) {
            let extensions = createSeepageExtensions(brush.x, brush.y, brush.size, params);
            
            for (let extension of extensions) {
                if (extension.length > 2) {
                    let extensionOpacity = layerOpacity * random(0.3, 0.8);
                    let extensionWidth = random(1, 4);
                    
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
                    deformStrength: params.deformStrength * 0.7
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
        
        // Enhanced texture effects with more chaos
        if (params.textureMasking && random() < 0.25) {
            let numSplatters = int(random(2, 6));
            for (let i = 0; i < numSplatters; i++) {
                // Create random splatter positions with organic distribution
                let splatterAngle = random(TWO_PI);
                let splatterDist = random(brush.size * 0.2, brush.size * 1.2);
                let splatterX = brush.x + cos(splatterAngle) * splatterDist;
                let splatterY = brush.y + sin(splatterAngle) * splatterDist;
                
                // Add turbulent displacement
                splatterX += (turbulentNoise(splatterX, splatterY) - 0.5) * 30;
                splatterY += (turbulentNoise(splatterX + 1000, splatterY) - 0.5) * 30;
                
                let splatterSize = random(0.5, 3);
                let splatterOpacity = layerOpacity * random(0.2, 0.7);
                
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

// Export enhanced functions for integration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createOrganicSeepageShape,
        createSeepageExtensions,
        createChaoticWetBlending,
        drawOrganicSeepageLayer,
        turbulentNoise
    };
}

console.log("✅ Enhanced Water Seepage Effects loaded!");
console.log("🌊 New features: Organic seepage + Chaotic extensions + Turbulent flow");
