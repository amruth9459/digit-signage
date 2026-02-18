import { themes } from '../src/themes.js';

// --- Helper Data ---

const ADJECTIVES = ['Premium', 'Organic', 'Handcrafted', 'Artisan', 'Authentic', 'Luxury', 'Heritage', 'Sustainable'];
const NOUNS = ['Selection', 'Collection', 'Reserve', 'Harvest', 'Edition', 'Choice', 'Essentials', 'Pantry'];

// --- AI Logic ---

/**
 * Simulates generating a theme based on a text prompt.
 * Uses simple keyword matching to map to existing themes.
 * If no match, returns a "smart" fallback or a random variation.
 */
export const generateThemeFromPrompt = (prompt) => {
    const p = prompt.toLowerCase();

    // 1. Keyword Matching to Existing Themes
    if (p.includes('forest') || p.includes('nature') || p.includes('green')) return themes.forest_rainfall;
    if (p.includes('ocean') || p.includes('blue') || p.includes('water') || p.includes('calm')) return themes.ocean_depths;
    if (p.includes('desert') || p.includes('sun') || p.includes('warm') || p.includes('orange')) return themes.desert_dusk;
    if (p.includes('dark') || p.includes('black') || p.includes('luxury') || p.includes('gold')) return themes.dark_luxury;
    if (p.includes('light') || p.includes('white') || p.includes('clean') || p.includes('minimal')) return themes.minimalist_white;
    if (p.includes('pantry') || p.includes('kitchen') || p.includes('home')) return themes.nordic_light;
    if (p.includes('future') || p.includes('tech') || p.includes('neon') || p.includes('cyber')) return themes.midnight_future;

    // 2. "AI" Generative Fallback (Procedural Generation)
    // If we don't match, let's create a custom theme object on the fly!
    const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16);

    return {
        background: '#1a1a1a',
        textPrimary: '#ffffff',
        textSecondary: randomColor(),
        listDivider: randomColor(),
        headerGradient: `linear-gradient(to right, ${randomColor()}, ${randomColor()})`,
        // ... (We would fill the rest with safe defaults in a real app)
        // For now, let's just return a safe default if no match
        ...themes.dark_luxury
    };
};

/**
 * Simulates generating marketing copy for a product.
 */
export const generateMarketingCopy = (productName) => {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];

    return {
        title: `${adj} ${productName}`,
        offer: `${noun} • Limited Time`
    };
};

/**
 * Returns a placeholder image URL for "AI Generated" images.
 * In a real app, this would call DALL-E / Midjourney.
 */
export const generateImagePlaceholder = (prompt) => {
    // Return a high-quality Unsplash source based on keywords
    const keyword = prompt.split(' ')[0] || 'product';
    return `https://source.unsplash.com/800x600/?${encodeURIComponent(keyword)},food,product`;
};
