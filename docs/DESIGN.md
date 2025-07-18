# D&D AI DM Design System

## Theme
Our design system is inspired by the dark, mysterious world of Dungeons & Dragons, emphasizing readability and immersion.

### Color Palette

#### Primary Colors
- **Blood Red** (`text-red-500`)
  - Used for headings and important text
  - Represents dragon fire, magic, and adventure
  - Provides strong contrast against dark backgrounds

- **Deep Crimson** (`bg-red-700`, `hover:bg-red-800`)
  - Primary action buttons
  - Symbolizes power and importance
  - Darkens on hover for interactive feedback

#### Secondary Colors
- **Stone Gray** (`bg-stone-600`, `hover:bg-stone-700`)
  - Secondary action buttons
  - Reminiscent of aged leather and parchment
  - Provides visual hierarchy in actions

#### Background Colors
- **Dungeon Dark** (`bg-gray-900`)
  - Main background color
  - Creates an immersive, dark atmosphere
  - Reduces eye strain during long sessions

- **Surface Dark** (`bg-gray-800`)
  - Card and component backgrounds
  - Slightly lighter than main background
  - Creates subtle depth and layering

#### Accent Colors
- **Dark Crimson** (`border-red-900`)
  - Border accents
  - Subtle separation between sections
  - Reinforces the fantasy theme

#### Text Colors
- **Primary Text** (`text-gray-100`)
  - Main text color
  - High contrast for readability
  - Clean and crisp appearance

- **Secondary Text** (`text-gray-300`)
  - Supporting text and descriptions
  - Maintains readability while creating hierarchy
  - Softer on the eyes for longer content

- **Muted Text** (`text-gray-400`)
  - Footer text and less important information
  - Maintains accessibility while de-emphasizing content

## UI Components

### Layout Structure
- **Header**
  - Fixed position for consistent navigation
  - Prominent branding with the D&D AI DM logo
  - Clean and minimal to focus on content

- **Main Content Area**
  - Flexible growth for various content lengths
  - Consistent padding and spacing
  - Container-based layout for readability

- **Footer**
  - Minimal design with essential information
  - Stays at bottom regardless of content length
  - Subtle separation from main content

### Cards and Sections
- Consistent rounded corners (`rounded-lg`)
- Subtle borders for depth
- Generous padding for content breathing room
- Clear visual hierarchy with headings

### Buttons
- **Primary Actions**
  - Large touch targets (padding: 2rem horizontal, 1rem vertical)
  - Clear hover states
  - Bold, attention-grabbing red color

- **Secondary Actions**
  - Same size as primary for consistency
  - Stone gray color to indicate secondary importance
  - Matching hover states for consistency

## UX Principles

### Typography
- **Headings**
  - Large, bold text for clear hierarchy
  - Red color for emphasis
  - Consistent spacing below

- **Body Text**
  - Comfortable line height for readability
  - Adequate contrast with background
  - Appropriate font sizes for different contexts

### Spacing
- Consistent vertical rhythm (`space-y-8`)
- Generous padding in containers
- Grid gap matching vertical rhythm
- Responsive margins and padding

### Interactions
- Smooth color transitions (200ms)
- Clear hover states on interactive elements
- Consistent button sizes and behaviors
- Predictable layout on all screen sizes

### Accessibility
- High contrast text colors
- Large touch targets
- Clear visual hierarchy
- Semantic HTML structure

## Responsive Design
- Mobile-first approach
- Flexible grid system
- Consistent spacing across breakpoints
- Maintains readability at all sizes

## Future Considerations
- Animation system for transitions and effects
- Loading states and skeletons
- Error and success states
- Toast notifications
- Modal and dialog system
- Form input styles
- Interactive dice roll animations
- Character sheet layouts
- Combat interface design
- Map and token visualization

---

This design system is a living document and will evolve as we add more features and gather user feedback. 