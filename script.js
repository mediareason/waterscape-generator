console.log("🎨 Waterscape Studio v2.2 initializing...");

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
    // NEW: Advanced watercolor effects
    colorBleeding: true,
    bleedingIntensity: 0.6,
    wetOnWet: true,
    wetBlendRadius: 40,
    depthEffect: true,
    depthLayers: 3,
    randomWalkMode: false
};

let canvas;
let isGenerating = false;
// NEW: Store brush data for advanced effects
let activeBrushes = [];

// Gaussian random number generator for natural variation
function gaussianRandom(mean = 0, stdev = 1) {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return z * stdev + mean;
}

// NEW: Color bleeding system - allows colors to flow between adjacent shapes
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
    
    // Calculate color bleeding from nearby brushes
    for (let nearby of nearbyBrushes) {
        let distance = dist(centerX, centerY, nearby.x, nearby.y);
        let maxBleedDistance = (params.brushSize * 2) * params.bleedingIntensity;
        
        if (distance < maxBleedDistance) {
            // Calculate bleeding influence based on distance and wetness
            let influence = map(distance, 0, maxBleedDistance, 0.4, 0) * params.bleedingIntensity;
            
            // Blend colors proportionally
            blendedColor.r = lerp(blendedColor.r, nearby.r, influence);
            blendedColor.g = lerp(blendedColor.g, nearby.g, influence);
            blendedColor.b = lerp(blendedColor.b, nearby.b, influence);
        }
    }
    
    // Add subtle variation
    blendedColor.r = constrain(blendedColor.r + random(-15, 15), 0, 255);
    blendedColor.g = constrain(blendedColor.g + random(-15, 15), 0, 255);
    blendedColor.b = constrain(blendedColor.b + random(-15, 15), 0, 255);
    
    return blendedColor;
}