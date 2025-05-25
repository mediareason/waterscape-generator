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