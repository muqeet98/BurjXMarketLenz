// src/screens/HomeScreen/constants.ts
import { iconPath } from '../../constants/Icons';
import { wp } from '../../utils/Responsiveness';

// Types
export type CategoryTab = 'featured' | 'topGainers' | 'topLosers';

export interface Tab {
    icon: any;
    name: string;
    category: CategoryTab;
}

// Tabs configuration
export const TABS: Tab[] = [
    { 
        icon: iconPath?.starIcon, 
        name: 'Featured', 
        category: 'featured' 
    },
    { 
        icon:iconPath?.Rocket, 
        name: 'Top Gainers', 
        category: 'topGainers' 
    },
    { 
        icon: iconPath?.RedFlag, 
        name: 'Top Losers', 
        category: 'topLosers' 
    },
];

// UI dimensions
export const ITEM_HEIGHT = wp(20) + 40; // Height of a coin list item
export const FEATURED_ITEM_WIDTH = wp(46); // Width of featured horizontal cards
export const INITIAL_RENDER_COUNT = 5; // Initial number of items to render
export const END_REACHED_THRESHOLD = 0.2; // When to load more items

// Data constants
export const DEBOUNCE_DELAY = 300; // ms to wait before executing search
export const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes cache expiration
export const REFRESH_INTERVAL = 30000; // 30 seconds between price refreshes
export const INITIAL_FETCH_SIZE = 15; // Number of items per page

// Storage
export const DATA_PERSISTENCE_KEY = 'CACHED_CRYPTO_DATA';