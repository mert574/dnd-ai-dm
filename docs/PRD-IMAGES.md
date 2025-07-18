# Image Integration PRD

## Overview
Integrate visual assets for D&D content including spells, items, weapons, and characters. Use a combination of AI-generated images and free RPG assets to create a rich visual experience.

## Requirements

### Core Features
1. **Image Generation**
   - AI image generation for unique content
   - Style consistency with D&D theme
   - Caching and optimization
   - Fallback system for failed generations

2. **Static Assets**
   - Icon system for UI elements
   - Loading states and placeholders
   - Error handling with fallbacks
   - Asset optimization and CDN delivery

3. **Image Management**
   - Caching strategy
   - Lazy loading
   - Responsive images
   - Progressive loading

## Implementation

### Image Sources

1. **AI Generation (Primary)**
   - Service: Replicate API with Stable Diffusion
   - Style: Fantasy art with D&D aesthetic
   - Resolution: 512x512 for items, 1024x1024 for scenes
   - Cache Duration: 30 days
   - Prompt Engineering:
     ```typescript
     interface ImagePrompt {
       base: string;      // Base description
       style: string[];   // Style modifiers
       quality: string[]; // Quality modifiers
       negative: string[]; // Things to avoid
     }
     ```

2. **Game-Icons.net (Secondary)**
   - Usage: UI elements, loading states
   - Format: SVG with color customization
   - Categories needed:
     - Weapons
     - Spells
     - Items
     - Status effects

3. **Fallback System**
   ```typescript
   type ImageSource = 'ai' | 'icons' | 'placeholder';
   
   interface ImageStrategy {
     type: ImageSource;
     priority: number;
     condition: () => boolean;
   }
   ```

### Directory Structure
```
assets/
├── icons/              # SVG icons from game-icons.net
│   ├── weapons/
│   ├── spells/
│   └── items/
├── placeholders/       # Fallback images
└── generated/         # AI-generated images cache
    ├── weapons/
    ├── spells/
    └── items/
```

### API Design
```typescript
interface ImageService {
  // Generate or retrieve image for an item
  getImage(item: {
    type: 'spell' | 'weapon' | 'item';
    name: string;
    description: string;
  }): Promise<string>;

  // Preload images for a list of items
  preloadImages(items: Item[]): Promise<void>;

  // Clear cached images
  clearCache(): Promise<void>;
}
```

### Caching Strategy
1. **Generated Images**
   - Store in SQLite with metadata
   - Cache in CDN/filesystem
   - Invalidate after 30 days
   - Regenerate in background

2. **Static Assets**
   - Cache in browser
   - Version in build
   - CDN distribution

### Implementation Steps

1. **Setup (Day 1)**
   - Configure Replicate API
   - Set up image storage
   - Create base components

2. **Core Features (Day 2)**
   - Implement image generation
   - Add caching layer
   - Create fallback system

3. **UI Integration (Day 3)**
   - Add to item displays
   - Implement loading states
   - Add error handling

4. **Optimization (Day 4)**
   - Add CDN integration
   - Optimize loading
   - Add preloading

## Success Metrics
- Image generation < 2s
- Cache hit rate > 95%
- Storage < 1GB
- Load time < 200ms

## Dependencies
- Replicate API
- SQLite
- Sharp for image processing
- Game-icons.net assets

## Risks & Mitigations

1. **AI Generation Costs**
   - Cache aggressively
   - Use smaller sizes
   - Implement quotas

2. **Quality Issues**
   - Strict prompt engineering
   - Manual review system
   - Community feedback

3. **Performance**
   - CDN caching
   - Progressive loading
   - Size optimization

4. **Storage Growth**
   - Regular cleanup
   - Size limits
   - Compression

## Next Steps
1. Set up Replicate API account
2. Create image generation service
3. Implement caching system
4. Add to UI components 