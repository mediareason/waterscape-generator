console.log("🔬 Advanced Chaos Investigation System v2.0 initializing...");

// =================== CHAOS MATHEMATICS CORE ===================

// Lorenz Attractor for chaotic flow patterns
class LorenzAttractor {
    constructor(sigma = 10, rho = 28, beta = 8/3) {
        this.sigma = sigma;
        this.rho = rho;
        this.beta = beta;
        this.x = 1;
        this.y = 1;
        this.z = 1;
        this.dt = 0.01;
    }
    
    step() {
        const dx = this.sigma * (this.y - this.x) * this.dt;
        const dy = (this.x * (this.rho - this.z) - this.y) * this.dt;
        const dz = (this.x * this.y - this.beta * this.z) * this.dt;
        
        this.x += dx;
        this.y += dy;
        this.z += dz;
        
        return { x: this.x, y: this.y, z: this.z };
    }
}

// Multi-octave turbulent flow field
class ChaosFlowField {
    constructor(resolution = 20) {
        this.resolution = resolution;
        this.cols = Math.floor(width / resolution) + 1;
        this.rows = Math.floor(height / resolution) + 1;
        this.field = [];
        this.time = 0;
        this.generateField();
    }
    
    generateField() {
        this.field = [];
        for (let x = 0; x < this.cols; x++) {
            this.field[x] = [];
            for (let y = 0; y < this.rows; y++) {
                // Multi-layered Perlin noise for complex flow
                let angle = noise(x * 0.1, y * 0.1, this.time * 0.01) * TWO_PI * 4;
                angle += noise(x * 0.02, y * 0.02, this.time * 0.005) * TWO_PI * 2;
                angle += noise(x * 0.5, y * 0.5, this.time * 0.02) * PI;
                
                this.field[x][y] = angle;
            }
        }
    }
    
    getFlow(x, y) {
        const col = Math.floor(constrain(x / this.resolution, 0, this.cols - 1));
        const row = Math.floor(constrain(y / this.resolution, 0, this.rows - 1));
        return this.field[col][row];
    }
    
    update() {
        this.time += 1;
        this.generateField();
    }
}

// Fractal branch system for organic patterns
class FractalBranch {
    constructor(x, y, angle, length, generation = 0, maxGen = 4) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.length = length;
        this.generation = generation;
        this.maxGen = maxGen;
        this.children = [];
        this.points = [];
        this.generateBranch();
    }
    
    generateBranch() {
        let segments = Math.floor(this.length / 3);
        let currentX = this.x;
        let currentY = this.y;
        let currentAngle = this.angle;
        
        for (let i = 0; i < segments; i++) {
            let t = i / segments;
            
            // Add chaos to branch growth
            let chaosForce = noise(currentX * 0.01, currentY * 0.01, this.generation * 0.5) * PI * 0.3;
            let turbulence = noise(currentX * 0.05, currentY * 0.05) * 0.4;
            
            currentAngle += chaosForce + (turbulence - 0.2);
            
            let stepLength = this.length / segments;
            currentX += cos(currentAngle) * stepLength;
            currentY += sin(currentAngle) * stepLength;
            
            this.points.push({ x: currentX, y: currentY, width: this.length * (1 - t * 0.7) });
        }
        
        // Generate child branches
        if (this.generation < this.maxGen && this.length > 5) {
            let branchCount = Math.floor(random(1, 4));
            for (let i = 0; i < branchCount; i++) {
                let branchAngle = this.angle + random(-PI/2, PI/2);
                let branchLength = this.length * random(0.4, 0.8);
                let branchPoint = this.points[Math.floor(this.points.length * random(0.3, 0.9))];
                
                if (branchPoint) {
                    this.children.push(new FractalBranch(
                        branchPoint.x, branchPoint.y, branchAngle, 
                        branchLength, this.generation + 1, this.maxGen
                    ));
                }
            }
        }
    }
    
    getAllPoints() {
        let allPoints = [...this.points];
        for (let child of this.children) {
            allPoints = allPoints.concat(child.getAllPoints());
        }
        return allPoints;
    }
}

// =================== CHAOS INVESTIGATION METHODS ===================

// Method 1: Lorenz Attractor Streams
function createLorenzSeepage(centerX, centerY, baseRadius, params) {
    let attractor = new LorenzAttractor();
    let streamPoints = [];
    let streamCount = Math.floor(random(3, 8));
    
    for (let s = 0; s < streamCount; s++) {
        let stream = [];
        attractor.x = random(-2, 2);
        attractor.y = random(-2, 2);
        attractor.z = random(20, 30);
        
        for (let i = 0; i < 50; i++) {
            let point = attractor.step();
            
            // Map attractor coordinates to canvas space
            let x = centerX + (point.x * baseRadius * 0.1);
            let y = centerY + (point.y * baseRadius * 0.1);
            
            // Add local turbulence
            x += noise(i * 0.3, s * 100) * 20 - 10;
            y += noise(i * 0.3 + 1000, s * 100) * 20 - 10;
            
            stream.push({ x, y, z: point.z });
        }
        streamPoints.push(stream);
    }
    
    return streamPoints;
}

// Method 2: Flow Field Followers
function createFlowFieldSeepage(centerX, centerY, baseRadius, flowField, params) {
    let followers = [];
    let followerCount = Math.floor(random(5, 12));
    
    for (let f = 0; f < followerCount; f++) {
        let follower = {
            x: centerX + random(-baseRadius * 0.3, baseRadius * 0.3),
            y: centerY + random(-baseRadius * 0.3, baseRadius * 0.3),
            trail: []
        };
        
        // Let follower follow the flow field
        for (let step = 0; step < random(20, 60); step++) {
            let flowAngle = flowField.getFlow(follower.x, follower.y);
            
            // Add momentum and chaos
            let speed = 1 + noise(step * 0.2, f * 50) * 2;
            let chaosAngle = noise(follower.x * 0.01, follower.y * 0.01) * PI * 0.4;
            
            follower.x += cos(flowAngle + chaosAngle) * speed;
            follower.y += sin(flowAngle + chaosAngle) * speed;
            
            follower.trail.push({ x: follower.x, y: follower.y });
            
            // Stop if too far from center
            if (dist(follower.x, follower.y, centerX, centerY) > baseRadius * 2) break;
        }
        
        followers.push(follower.trail);
    }
    
    return followers;
}

// Method 3: Fractal Branch Networks
function createFractalSeepage(centerX, centerY, baseRadius, params) {
    let branches = [];
    let branchCount = Math.floor(random(2, 6));
    
    for (let b = 0; b < branchCount; b++) {
        let angle = (TWO_PI / branchCount) * b + random(-PI/4, PI/4);
        let length = baseRadius * random(0.5, 1.2);
        
        let startX = centerX + cos(angle) * baseRadius * 0.2;
        let startY = centerY + sin(angle) * baseRadius * 0.2;
        
        let branch = new FractalBranch(startX, startY, angle, length, 0, 3);
        branches.push(branch.getAllPoints());
    }
    
    return branches;
}

// Method 4: Cellular Automata Expansion
function createCellularSeepage(centerX, centerY, baseRadius, params) {
    let grid = [];
    let gridSize = 5;
    let cols = Math.floor(baseRadius * 2 / gridSize);
    let rows = Math.floor(baseRadius * 2 / gridSize);
    
    // Initialize grid
    for (let x = 0; x < cols; x++) {
        grid[x] = [];
        for (let y = 0; y < rows; y++) {
            let distance = dist(x * gridSize, y * gridSize, cols * gridSize / 2, rows * gridSize / 2);
            grid[x][y] = distance < baseRadius * 0.8 ? 1 : 0;
        }
    }
    
    // Apply cellular automata rules
    for (let generation = 0; generation < 3; generation++) {
        let newGrid = JSON.parse(JSON.stringify(grid));
        
        for (let x = 1; x < cols - 1; x++) {
            for (let y = 1; y < rows - 1; y++) {
                let neighbors = 0;
                for (let nx = -1; nx <= 1; nx++) {
                    for (let ny = -1; ny <= 1; ny++) {
                        if (grid[x + nx][y + ny]) neighbors++;
                    }
                }
                
                // Chaos rule: grow with probability based on neighbors and noise
                let growthChance = map(neighbors, 0, 9, 0.1, 0.8);
                growthChance *= noise(x * 0.3, y * 0.3, generation * 0.5);
                
                if (random() < growthChance) {
                    newGrid[x][y] = 1;
                }
            }
        }
        grid = newGrid;
    }
    
    // Convert to points
    let points = [];
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            if (grid[x][y]) {
                points.push({
                    x: centerX - cols * gridSize / 2 + x * gridSize,
                    y: centerY - rows * gridSize / 2 + y * gridSize
                });
            }
        }
    }
    
    return [points];
}

// Method 5: Fibonacci Spiral Chaos
function createFibonacciSeepage(centerX, centerY, baseRadius, params) {
    let spirals = [];
    let spiralCount = Math.floor(random(2, 5));
    
    for (let s = 0; s < spiralCount; s++) {
        let spiral = [];
        let points = Math.floor(random(30, 80));
        let goldenAngle = PI * (3 - Math.sqrt(5)); // Golden angle
        
        for (let i = 0; i < points; i++) {
            let r = Math.sqrt(i) * baseRadius * 0.1;
            let theta = i * goldenAngle + s * PI * 0.5;
            
            // Add chaos to the spiral
            r *= 1 + noise(i * 0.1, s * 50) * 0.8;
            theta += noise(i * 0.2, s * 50) * 0.4;
            
            let x = centerX + r * cos(theta);
            let y = centerY + r * sin(theta);
            
            spiral.push({ x, y });
        }
        spirals.push(spiral);
    }
    
    return spirals;
}

// Method 6: Reaction-Diffusion Patterns
function createReactionDiffusionSeepage(centerX, centerY, baseRadius, params) {
    let patterns = [];
    let waveCount = Math.floor(random(3, 7));
    
    for (let w = 0; w < waveCount; w++) {
        let wave = [];
        let startAngle = random(TWO_PI);
        let waveLength = random(10, 30);
        let amplitude = baseRadius * random(0.2, 0.6);
        
        for (let i = 0; i < 60; i++) {
            let t = i / 60;
            let angle = startAngle + t * PI * 2;
            
            // Reaction-diffusion inspired pattern
            let reactionTerm = sin(i * 0.5) * cos(i * 0.3);
            let diffusionTerm = noise(i * 0.2, w * 100) * 2 - 1;
            
            let r = baseRadius * 0.3 + amplitude * (reactionTerm + diffusionTerm * 0.5);
            
            let x = centerX + r * cos(angle);
            let y = centerY + r * sin(angle);
            
            wave.push({ x, y });
        }
        patterns.push(wave);
    }
    
    return patterns;
}

// =================== CHAOS INVESTIGATION SYSTEM ===================

let chaosFlowField;
let chaosParams = {
    method: 1, // 1-6 for different chaos methods
    intensity: 0.7,
    density: 0.5,
    evolution: 0.3,
    complexity: 0.6,
    organicFactor: 0.8
};

function initializeChaosSystem() {
    chaosFlowField = new ChaosFlowField(15);
    console.log("🌀 Chaos investigation system initialized");
}

function investigateChaosSeepage(centerX, centerY, baseRadius, method = null) {
    if (!method) method = chaosParams.method;
    
    let seepagePatterns = [];
    
    switch (method) {
        case 1:
            seepagePatterns = createLorenzSeepage(centerX, centerY, baseRadius, chaosParams);
            break;
        case 2:
            seepagePatterns = createFlowFieldSeepage(centerX, centerY, baseRadius, chaosFlowField, chaosParams);
            break;
        case 3:
            seepagePatterns = createFractalSeepage(centerX, centerY, baseRadius, chaosParams);
            break;
        case 4:
            seepagePatterns = createCellularSeepage(centerX, centerY, baseRadius, chaosParams);
            break;
        case 5:
            seepagePatterns = createFibonacciSeepage(centerX, centerY, baseRadius, chaosParams);
            break;
        case 6:
            seepagePatterns = createReactionDiffusionSeepage(centerX, centerY, baseRadius, chaosParams);
            break;
        default:
            // Hybrid approach - combine multiple methods
            let methods = [1, 2, 3, 4, 5, 6];
            let selectedMethods = [];
            for (let i = 0; i < 3; i++) {
                selectedMethods.push(methods[Math.floor(random(methods.length))]);
            }
            
            for (let m of selectedMethods) {
                seepagePatterns = seepagePatterns.concat(investigateChaosSeepage(centerX, centerY, baseRadius, m));
            }
            break;
    }
    
    return seepagePatterns;
}

// =================== ENHANCED WATERCOLOR INTEGRATION ===================

function createChaosEnhancedBrush() {
    try {
        let x = random(width * 0.2, width * 0.8);
        let y = random(height * 0.2, height * 0.8);
        let size = random(params.brushSize * 0.7, params.brushSize * 1.3);
        
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
        
        // Create base shape with chaos investigation
        let baseShape = createOrganicShapeWithChaos(x, y, size);
        
        // Generate chaos seepage patterns
        let chaosSeepage = investigateChaosSeepage(x, y, size);
        
        return {
            baseShape: baseShape,
            chaosSeepage: chaosSeepage,
            r: r,
            g: g,
            b: b,
            x: x,
            y: y,
            size: size,
            originalColor: { r, g, b }
        };
    } catch (error) {
        console.error("Error creating chaos-enhanced brush:", error);
        return null;
    }
}

function createOrganicShapeWithChaos(centerX, centerY, baseRadius) {
    let vertices = [];
    let sides = int(random(6, 12));
    
    for (let i = 0; i < sides; i++) {
        let angle = (TWO_PI / sides) * i;
        
        // Apply multiple chaos layers
        let chaosLayer1 = noise(i * 0.5, centerX * 0.001, centerY * 0.001);
        let chaosLayer2 = noise(i * 0.3, centerX * 0.002, centerY * 0.002, chaosParams.evolution);
        let chaosLayer3 = sin(i * chaosParams.complexity * 2) * cos(i * chaosParams.organicFactor);
        
        angle += (chaosLayer1 - 0.5) * chaosParams.intensity * 2;
        angle += (chaosLayer2 - 0.5) * chaosParams.intensity;
        angle += chaosLayer3 * 0.3;
        
        // Chaos-influenced radius
        let radiusChaos = noise(i * 0.4, centerX * 0.003, centerY * 0.003);
        radiusChaos += noise(i * 0.8, centerX * 0.001) * 0.5;
        
        let radius = baseRadius * (0.4 + radiusChaos * 1.2 * chaosParams.density);
        
        let x = centerX + cos(angle) * radius;
        let y = centerY + sin(angle) * radius;
        
        vertices.push({ x, y });
    }
    
    // Apply chaos deformation rounds
    let deformRounds = Math.floor(chaosParams.complexity * 6) + 2;
    
    for (let round = 0; round < deformRounds; round++) {
        let newVertices = [];
        
        for (let i = 0; i < vertices.length; i++) {
            let current = vertices[i];
            let next = vertices[(i + 1) % vertices.length];
            
            newVertices.push(current);
            
            // Chaos-enhanced midpoint creation
            let midX = (current.x + next.x) / 2;
            let midY = (current.y + next.y) / 2;
            
            // Multiple chaos forces
            let turbulence = noise(midX * 0.01, midY * 0.01, round * 0.3) * 2 - 1;
            let flowForce = noise(midX * 0.005, midY * 0.005, chaosParams.evolution) * 2 - 1;
            let organicForce = sin(midX * 0.02) * cos(midY * 0.02);
            
            let deformStrength = params.deformStrength * chaosParams.intensity * 80;
            
            let deformX = (turbulence + flowForce * 0.7 + organicForce * 0.5) * deformStrength;
            let deformY = (turbulence * 0.8 + flowForce + organicForce * 0.3) * deformStrength;
            
            newVertices.push({
                x: midX + deformX,
                y: midY + deformY
            });
        }
        vertices = newVertices;
    }
    
    return vertices;
}

function drawChaosInvestigationLayer(brush, layerIndex) {
    try {
        if (!brush || !brush.baseShape || brush.baseShape.length < 3) {
            return;
        }
        
        // Update chaos flow field occasionally
        if (frameCount % 60 === 0) {
            chaosFlowField.update();
        }
        
        let variation = map(layerIndex, 0, params.layersPerBrush, 1.5, 0.3);
        let positionJitter = variation * 25 * chaosParams.intensity;
        
        // Create layer-specific organic shape
        let layerShape = brush.baseShape.map(v => ({
            x: v.x + random(-positionJitter, positionJitter),
            y: v.y + random(-positionJitter, positionJitter)
        }));
        
        // Apply additional chaos deformation to this layer
        let layerChaos = layerIndex * 0.1;
        for (let i = 0; i < layerShape.length; i++) {
            let vertex = layerShape[i];
            let chaosX = noise(vertex.x * 0.02, vertex.y * 0.02, layerChaos) * 2 - 1;
            let chaosY = noise(vertex.x * 0.02 + 1000, vertex.y * 0.02, layerChaos) * 2 - 1;
            
            vertex.x += chaosX * chaosParams.intensity * 15;
            vertex.y += chaosY * chaosParams.intensity * 15;
        }
        
        // Calculate layer opacity with chaos variation
        let baseOpacity = params.opacity * (0.7 + random(0.6));
        let chaosOpacityMod = noise(layerIndex * 0.3, brush.x * 0.01, brush.y * 0.01);
        let layerOpacity = baseOpacity * (0.5 + chaosOpacityMod);
        
        // Draw main chaos-enhanced shape
        blendMode(MULTIPLY);
        fill(brush.r, brush.g, brush.b, layerOpacity);
        noStroke();
        
        beginShape();
        for (let v of layerShape) {
            vertex(v.x, v.y);
        }
        endShape(CLOSE);
        
        // Draw chaos seepage patterns as thin exploratory lines
        if (brush.chaosSeepage && brush.chaosSeepage.length > 0) {
            let seepageOpacity = layerOpacity * 0.4 * chaosParams.density;
            
            for (let pattern of brush.chaosSeepage) {
                if (pattern && pattern.length > 1) {
                    // Vary line properties based on chaos parameters
                    let lineWeight = random(0.5, 2.5) * chaosParams.complexity;
                    let lineOpacity = seepageOpacity * random(0.3, 1.2);
                    
                    stroke(brush.r, brush.g, brush.b, lineOpacity);
                    strokeWeight(lineWeight);
                    noFill();
                    
                    // Draw chaos investigation lines
                    beginShape();
                    for (let i = 0; i < pattern.length; i++) {
                        let point = pattern[i];
                        if (point && typeof point.x === 'number' && typeof point.y === 'number') {
                            // Add micro-chaos to seepage lines
                            let microChaosX = noise(i * 0.5, point.x * 0.01) * 3 - 1.5;
                            let microChaosY = noise(i * 0.5 + 500, point.y * 0.01) * 3 - 1.5;
                            
                            vertex(point.x + microChaosX, point.y + microChaosY);
                        }
                    }
                    endShape();
                }
            }
            noStroke();
        }
        
        // Add chaos-driven texture effects
        if (random() < chaosParams.organicFactor * 0.3) {
            let textureCount = Math.floor(chaosParams.density * 8);
            for (let t = 0; t < textureCount; t++) {
                let textureAngle = random(TWO_PI);
                let textureDist = random(brush.size * 0.1, brush.size * 0.8);
                let textureX = brush.x + cos(textureAngle) * textureDist;
                let textureY = brush.y + sin(textureAngle) * textureDist;
                
                // Apply chaos displacement
                textureX += noise(textureX * 0.05, textureY * 0.05) * 20 - 10;
                textureY += noise(textureX * 0.05 + 1000, textureY * 0.05) * 20 - 10;
                
                let textureSize = random(0.8, 4) * chaosParams.complexity;
                let textureOpacity = layerOpacity * random(0.2, 0.8);
                
                fill(brush.r, brush.g, brush.b, textureOpacity);
                circle(textureX, textureY, textureSize);
            }
        }
        
        blendMode(BLEND);
        
    } catch (error) {
        console.error("Error drawing chaos investigation layer:", error);
        // Fallback to simple circle
        fill(brush.r, brush.g, brush.b, params.opacity);
        noStroke();
        circle(brush.x, brush.y, brush.size);
    }
}

// =================== CHAOS CONTROL INTERFACE ===================

function setupChaosControls() {
    console.log("🎛️ Setting up chaos investigation controls...");
    
    // Add chaos control panel to existing UI
    const controlsContainer = document.querySelector('.controls');
    if (controlsContainer) {
        const chaosSection = document.createElement('div');
        chaosSection.className = 'control-section';
        chaosSection.innerHTML = `
            <h3>🔬 Chaos Investigation</h3>
            
            <div class="control-group">
                <label for="chaosMethod">Investigation Method:</label>
                <select id="chaosMethod">
                    <option value="1">Lorenz Attractors</option>
                    <option value="2">Flow Field Followers</option>
                    <option value="3">Fractal Branches</option>
                    <option value="4">Cellular Automata</option>
                    <option value="5">Fibonacci Spirals</option>
                    <option value="6">Reaction-Diffusion</option>
                    <option value="0">Hybrid (Multi-Method)</option>
                </select>
            </div>
            
            <div class="control-group">
                <label for="chaosIntensity">Chaos Intensity:</label>
                <input type="range" id="chaosIntensity" min="0.1" max="2.0" step="0.1" value="0.7">
                <span id="chaosIntensityValue">0.7</span>
            </div>
            
            <div class="control-group">
                <label for="chaosDensity">Pattern Density:</label>
                <input type="range" id="chaosDensity" min="0.1" max="1.5" step="0.1" value="0.5">
                <span id="chaosDensityValue">0.5</span>
            </div>
            
            <div class="control-group">
                <label for="chaosEvolution">Temporal Evolution:</label>
                <input type="range" id="chaosEvolution" min="0.0" max="1.0" step="0.1" value="0.3">
                <span id="chaosEvolutionValue">0.3</span>
            </div>
            
            <div class="control-group">
                <label for="chaosComplexity">Structural Complexity:</label>
                <input type="range" id="chaosComplexity" min="0.1" max="1.0" step="0.1" value="0.6">
                <span id="chaosComplexityValue">0.6</span>
            </div>
            
            <div class="control-group">
                <label for="chaosOrganic">Organic Factor:</label>
                <input type="range" id="chaosOrganic" min="0.1" max="1.0" step="0.1" value="0.8">
                <span id="chaosOrganicValue">0.8</span>
            </div>
            
            <button id="regenerateWithChaos" class="action-button">🌀 Regenerate with Chaos</button>
        `;
        
        controlsContainer.appendChild(chaosSection);
        
        // Setup chaos control event listeners
        setupChaosEventListeners();
    }
}

function setupChaosEventListeners() {
    // Chaos method selector
    const methodSelect = document.getElementById('chaosMethod');
    if (methodSelect) {
        methodSelect.addEventListener('change', (e) => {
            chaosParams.method = parseInt(e.target.value);
            generateChaosWaterscape();
        });
    }
    
    // Chaos parameter controls
    const chaosControls = [
        'chaosIntensity', 'chaosDensity', 'chaosEvolution', 
        'chaosComplexity', 'chaosOrganic'
    ];
    
    chaosControls.forEach(controlId => {
        const control = document.getElementById(controlId);
        const valueDisplay = document.getElementById(controlId + 'Value');
        
        if (control && valueDisplay) {
            control.addEventListener('input', (e) => {
                const paramName = controlId.replace('chaos', '').toLowerCase();
                chaosParams[paramName] = parseFloat(e.target.value);
                valueDisplay.textContent = chaosParams[paramName].toFixed(1);
                
                // Real-time updates for some parameters
                if (paramName === 'evolution') {
                    chaosParams.evolution = parseFloat(e.target.value);
                }
            });
        }
    });
    
    // Regenerate button
    const regenButton = document.getElementById('regenerateWithChaos');
    if (regenButton) {
        regenButton.addEventListener('click', generateChaosWaterscape);
    }
}

// =================== MAIN CHAOS GENERATION FUNCTION ===================

function generateChaosWaterscape() {
    try {
        console.log("🌀 Generating chaos-enhanced waterscape...", chaosParams);
        
        randomSeed(params.randomSeed);
        
        // Initialize chaos system if not done
        if (!chaosFlowField) {
            initializeChaosSystem();
        }
        
        // Clear canvas
        background(255);
        drawBackground();
        
        // Create chaos-enhanced brushes
        let brushes = [];
        for (let i = 0; i < params.brushCount; i++) {
            let brush = createChaosEnhancedBrush();
            if (brush) {
                brushes.push(brush);
            }
        }
        
        console.log(`✨ Created ${brushes.length} chaos-enhanced brushes`);
        
        if (brushes.length === 0) {
            throw new Error("No chaos brushes created");
        }
        
        // Draw layers with chaos investigation
        for (let layer = 0; layer < params.layersPerBrush; layer++) {
            // Update chaos evolution
            chaosParams.evolution = layer / params.layersPerBrush;
            
            for (let brush of brushes) {
                drawChaosInvestigationLayer(brush, layer);
            }
        }
        
        // Update metadata
        updateMetadata();
        
        console.log("🔬 Chaos investigation complete!");
        
    } catch (error) {
        console.error('❌ Chaos generation error:', error);
        
        // Fallback to basic generation
        generateWaterscape();
    }
}

// =================== INITIALIZATION ===================

// Override the existing generateNew function for chaos mode
let originalGenerateNew = window.generateNew;
window.generateNew = function() {
    if (chaosParams && chaosParams.method >= 0) {
        generateChaosWaterscape();
    } else {
        originalGenerateNew();
    }
};

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initializeChaosSystem();
        setupChaosControls();
        console.log("🌊 Chaos Investigation System ready for experimentation!");
    }, 1000);
});

// Export for modular usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        chaosParams,
        investigateChaosSeepage,
        generateChaosWaterscape,
        initializeChaosSystem,
        LorenzAttractor,
        ChaosFlowField,
        FractalBranch
    };
}

console.log("✅ Advanced Chaos Investigation System v2.0 loaded!");
console.log("🔬 Features: 6 chaos methods + Flow fields + Fractals + Organic seepage");
console.log("🌀 Ready for deep chaos exploration and pattern investigation!");
