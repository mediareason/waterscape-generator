# 🎨 Waterscape Generator v2.1 (Stable)

A beautiful generative watercolor art application built with p5.js. Create stunning watercolor-style artwork with customizable brushes, color palettes, and parameters using the Tyler Hobbs algorithm.

## ✨ Live Demo
**🚀 [Try it now!](https://mediareason.github.io/waterscape-generator/)**

## 🏷️ Stable Release
This is the **v2.1 stable build** - recommended for production use.
- ✅ All controls working properly
- ✅ Clean, reliable generation
- ✅ Simplified interface focused on core functionality
- ✅ Tyler Hobbs watercolor algorithm

## 🎨 Features

### Color Palettes
- 7 built-in color palettes (Vibrant, Pastel, Earth Tones, Ocean, Sunset, Forest, Monochrome)
- **Editable colors** - click any color swatch to customize with color picker
- Live preview of palette changes

### Generation Controls
- **Brush Count** (5-20) - Number of watercolor brushes
- **Layers per Brush** (10-50) - Depth and opacity buildup
- **Brush Size** (40-150) - Scale of watercolor marks

### Watercolor Effects
- **Edge Complexity** (2-6) - Organic edge detail using Tyler Hobbs deformation
- **Blur Amount** (0.1-0.6) - Watercolor bleeding effect
- **Layer Opacity** (4-15) - Transparency and color buildup

### Background Options
- **White** - Clean paper background
- **Paper Texture** - Subtle texture simulation
- **Gradient** - Soft gradient backdrop

### Export
- **PNG Export** - High-quality image download
- **800×600px** output resolution

## 🔧 Technical Implementation

### Tyler Hobbs Algorithm
Implements the renowned watercolor simulation technique:
- Polygon-based brush shapes
- Recursive edge subdivision and deformation
- Multi-layer transparency buildup
- Organic randomization

### Performance Optimized
- Clean, single-script architecture
- Efficient p5.js rendering
- Reliable error handling
- Responsive controls

## 🚀 Usage

1. **Choose a palette** - Select from presets or click colors to customize
2. **Adjust parameters** - Use sliders to control generation
3. **Generate** - Click "Generate" for new artwork
4. **Export** - Save as PNG when satisfied

## 🛠️ Development

### File Structure
```
├── index.html          # Main application
├── script.js           # Core generation logic
├── styles.css          # Modern dark UI styling
└── README.md          # Documentation
```

### Key Functions
- `generateWaterscape()` - Main generation algorithm
- `deformPolygon()` - Tyler Hobbs edge deformation
- `createWatercolorBrush()` - Brush shape generation
- `drawWatercolorLayer()` - Layer rendering

## 📜 Version History

### v2.1 (Stable) - Current
- ✅ Clean, working controls
- ✅ Reliable generation algorithm
- ✅ Simplified UI focused on core features
- ✅ Tyler Hobbs watercolor technique
- ✅ Functional color picker
- ✅ Stable export functionality

## 🎯 Branches
- `main` - Latest development
- `stable` - Production-ready stable build (v2.1)

## 🤝 Contributing

This is a stable, production-ready build. For new features or improvements:
1. Branch from `stable` for safety
2. Test thoroughly before merging
3. Maintain backward compatibility

## 🎨 Art Inspiration

Based on the watercolor simulation techniques popularized by Tyler Hobbs and other generative artists, focusing on:
- Organic, natural-looking edges
- Realistic watercolor transparency
- Subtle color variation and bleeding
- Balanced composition

---

**🏆 Stable Build** | **🎨 Tyler Hobbs Algorithm** | **🚀 Production Ready**