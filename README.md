# Waterscape 🌊

Enhanced generative watercolor art with advanced seepage effects, live parameter controls, multiple color palettes, and PNG export capabilities. Built with p5.js and inspired by natural watercolor behavior.

## ✨ Features

### 🎨 Core Features
- **7 Color Palettes**: Vibrant, Pastel, Earth Tones, Ocean, Sunset, Forest, Monochrome
- **Interactive Color Editor**: Click any color to customize with the built-in color picker
- **Live Parameter Control**: Adjust all settings in real-time with instant preview
- **PNG Export**: Save your creations with timestamped filenames
- **Reproducible Results**: Seed control for consistent generation

### 🌊 Advanced Water Effects (NEW v2.4!)
- **🌪️ Chaos Seepage Control**: Master slider to control organic seepage intensity (0-100%)
- **💧 Color Bleeding**: Realistic color migration between nearby brush strokes
- **🎨 Wet-on-Wet Blending**: Authentic watercolor mixing behavior
- **🏔️ Depth Layering**: Multi-layer depth simulation for realistic watercolor stacking
- **✨ Texture Masking**: Paper grain and absorption effects

### 🌈 Organic Seepage System
- **Chaotic Extensions**: Water naturally flows beyond shape boundaries
- **Turbulent Flow**: Multi-octave noise for unpredictable, organic patterns  
- **Capillary Action**: Simulates water following paper fibers
- **Irregular Absorption**: Variable seepage based on paper texture simulation
- **Micro-Branching**: Tiny seepage branches for ultra-realistic effects

## 🚀 Getting Started

1. Clone this repository:
```bash
git clone https://github.com/mediareason/waterscape-generator.git
cd waterscape-generator
```

2. Open `index.html` in your web browser

3. Experiment with the **Chaos Seepage** slider and other controls to create unique watercolor artworks!

## 🎮 Controls

### Color Palettes & Editing
Choose from 7 carefully curated color schemes:
- **Vibrant**: Bold, saturated colors
- **Pastel**: Soft, muted tones  
- **Earth Tones**: Natural browns and tans
- **Ocean**: Blues and teals
- **Sunset**: Warm oranges and pinks
- **Forest**: Various greens
- **Monochrome**: Grayscale variations

💡 **Pro Tip**: Click any color swatch to open the color picker and create custom palettes!

### 🌊 Advanced Water Effects
- **Chaos Seepage (0.0-1.0)**: Master control for organic seepage intensity - higher values create more chaotic, water-like spreading
- **Color Bleeding**: Enable realistic color migration between brush strokes
- **Bleeding Intensity (0.2-1.0)**: Control how much colors bleed into each other
- **Wet-on-Wet**: Enable authentic watercolor mixing behavior
- **Wet Blend Radius (20-80)**: Distance for wet-on-wet color blending
- **Depth Effect**: Multi-layer depth simulation
- **Depth Layers (1-5)**: Number of depth layers for realistic stacking

### Generation Parameters
- **Brush Count** (5-20): Number of brush strokes
- **Layers per Brush** (10-50): Overlapping layers for depth and texture
- **Brush Size** (40-150): Base size of brush strokes
- **Edge Complexity** (2-6): Organic shape complexity
- **Blur Amount** (0.1-0.6): Amount of organic shape distortion
- **Layer Opacity** (4-15): Transparency of each layer

### Texture & Effects
- **Texture Masking**: Enable paper grain simulation
- **Texture Intensity** (0.2-1.0): Strength of paper texture effects  
- **Texture Density** (300-1500): Density of texture grain points
- **Random Seed** (1-1000): Reproducible randomness

### Backgrounds
- **White**: Clean white background
- **Paper Texture**: Subtle paper-like texture with grain
- **Gradient**: Soft gradient background

## 🎨 Usage Tips

### For Maximum Seepage Effects:
1. **Start with Chaos Seepage**: Set to 0.7-1.0 for maximum organic flow
2. **Enable all Water Effects**: Turn on Color Bleeding, Wet-on-Wet, and Depth Effect
3. **Increase Edge Complexity**: Set to 5-6 for more chaotic boundaries
4. **Higher Blur Amount**: 0.4-0.6 creates more organic distortion
5. **Enable Texture Masking**: Simulates realistic paper absorption

### For Controlled, Traditional Look:
1. **Lower Chaos Seepage**: Set to 0.2-0.4 for contained shapes
2. **Reduce Edge Complexity**: Set to 2-3 for cleaner edges
3. **Lower Bleeding Intensity**: 0.3-0.5 for subtle color mixing

## 🛠️ Technical Details

Built with:
- **p5.js**: Creative coding framework
- **HTML5 Canvas**: Hardware-accelerated rendering
- **Advanced Noise Functions**: Multi-octave turbulent noise for organic chaos
- **Watercolor Physics**: Realistic simulation of paint behavior
- **Modern CSS**: Glassmorphism UI design
- **Vanilla JavaScript**: No dependencies beyond p5.js

### Algorithm Features:
- **Organic Shape Generation**: Multi-round deformation using turbulent noise
- **Seepage Extensions**: Chaotic tendrils that flow beyond boundaries  
- **Color Physics**: Realistic color bleeding and wet-on-wet mixing
- **Paper Simulation**: Texture masking and absorption effects
- **Depth Rendering**: Multi-layer composition with proper depth sorting

## 📱 Live Demo

[View Live Demo](https://mediareason.github.io/waterscape-generator)

## 🔄 Version History

### v2.4 - Chaos Seepage Control
- ➕ **NEW**: Chaos Seepage Intensity slider for direct control
- ✨ Enhanced organic seepage effects with turbulent flow
- 🎯 Improved chaotic extensions and micro-branching
- 🎨 Better color variation and texture chaos

### v2.3 - Enhanced Seepage Effects  
- 🌊 Advanced organic seepage system
- 🌪️ Turbulent noise for chaotic flow patterns
- 💧 Capillary action simulation
- 🎨 Irregular absorption effects

### v2.2 - Advanced Water Effects
- 💧 Color bleeding between brush strokes
- 🎨 Wet-on-wet blending system
- 🏔️ Multi-layer depth effects
- ✨ Enhanced texture masking

## 🤝 Contributing

Feel free to submit issues and enhancement requests! Areas for contribution:
- Additional color palettes
- New seepage algorithms  
- Performance optimizations
- UI improvements

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Inspiration

Inspired by:
- Tyler Hobbs' generative watercolor techniques
- Natural watercolor physics and behavior
- Real paper grain and absorption patterns
- Organic chaos theory and turbulent flow systems
