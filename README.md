# Waterscape 🎨

Enhanced generative watercolor art with live parameter controls, multiple color palettes, and PNG export capabilities. Built with p5.js and inspired by Tyler Hobbs' watercolor techniques.

## ✨ Features

- **7 Color Palettes**: Vibrant, Pastel, Earth Tones, Ocean, Sunset, Forest, Monochrome
- **Live Parameter Control**: Adjust brush count, size, opacity, deformation, and more in real-time
- **Enhanced Randomness**: Variable brush sizes, polygon complexity, and organic deformation
- **Multiple Backgrounds**: White, paper texture, or gradient backgrounds
- **PNG Export**: Save your creations with timestamped filenames
- **Reproducible Results**: Seed control for consistent generation

## 🚀 Getting Started

1. Clone this repository:
```bash
git clone https://github.com/mediareason/waterscape-generator.git
cd waterscape-generator
```

2. Open `index.html` in your web browser

3. Experiment with the controls to create unique watercolor artworks!

## 🎮 Controls

### Color Palettes
Choose from 7 carefully curated color schemes:
- **Vibrant**: Bold, saturated colors
- **Pastel**: Soft, muted tones
- **Earth Tones**: Natural browns and tans
- **Ocean**: Blues and teals
- **Sunset**: Warm oranges and pinks
- **Forest**: Various greens
- **Monochrome**: Grayscale variations

### Generation Parameters
- **Brush Count** (5-50): Number of brush strokes
- **Layers per Brush** (3-15): Overlapping layers for depth
- **Brush Size** (20-150): Base size of brush strokes
- **Deformation** (0.1-0.8): Amount of organic shape distortion
- **Opacity** (5-50): Transparency of each layer
- **Random Seed** (1-1000): Reproducible randomness

### Backgrounds
- **White**: Clean white background
- **Paper Texture**: Subtle paper-like texture
- **Gradient**: Soft blue gradient

## 🎨 Usage

1. **Select a palette** from the dropdown menu
2. **Adjust parameters** using the sliders
3. **Click "Generate New"** to create a fresh artwork
4. **Save your creation** with the "Save PNG" button

Each adjustment automatically generates a new piece, making it easy to explore different styles and effects.

## 🛠️ Technical Details

Built with:
- **p5.js**: Creative coding framework
- **HTML5 Canvas**: Rendering engine
- **Modern CSS**: Glassmorphism UI design
- **Vanilla JavaScript**: No dependencies beyond p5.js

The algorithm creates layered polygonal shapes with organic deformation to simulate watercolor bleeding and layering effects.

## 📱 Live Demo

[View Live Demo](https://mediareason.github.io/waterscape-generator)

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Inspiration

Inspired by generative art techniques from Tyler Hobbs and the watercolor simulation methods used in modern digital art.