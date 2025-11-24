# Folio 2025

## Setup

Create `.env` file based on `.env.example`

Download and install [Node.js](https://nodejs.org/en/download/) then run this followed commands:

``` bash
# Install dependencies
npm install

# Serve at localhost:1234
npm run dev

# Build for production in the dist/ directory
npm run build
```

## Tick order

| Order | Components |
|---|---|
| 0 | Inputs |
| 1 | Vehicle (pre Physics) |
| 2 | Physics |
| 3 | Entities |
| 4 | View |
| 5 | Vehicle (post Physics) |
| 6 | PhysicsWireframe |
| 7 | Lighting |
| 8 | GroundData |
| 9 | Grass |
| 10 | BlackFriday |
| 11 | BricksWalls |
| 12 | Sounds |
| 998 | Rendering |
| 999 | Monitoring |

## Blender

### Export

- Use corresponding presets
- Mute the palette texture (loaded and set in Three.js `Material` directly)
- Quantizing
    - Terrain
        - Position: 12
        - Normal: 2
        - Tex Coord: 2
        - Color: 2
        - Generic: 2
    - Others
        - Position: 12
        - Normal: 6
        - Tex Coord: 6
        - Color: 2
        - Generic: 2