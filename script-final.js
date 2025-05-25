// Final setup and utility functions

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

// Initialize effect controls state
updateEffectControls();

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

console.log("✅ Waterscape Studio v2.2 loaded successfully with Advanced Water Effects!");
console.log("🌊 New features: Color Bleeding, Wet-on-Wet Blending, Depth-based Variation");