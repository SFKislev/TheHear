/**
 * Responsive grid configuration for the global card layout
 * This centralizes all responsive grid logic for easier maintenance
 */

// Define grid column configuration for different breakpoints
// Matching your custom breakpoints from tailwind.config.mjs
export const gridColumns = {
  default: 'grid-cols-2',
  xs: 'xs:grid-cols-2',
  sm: 'sm:grid-cols-2',
  md: 'md:grid-cols-4',
  lg: 'lg:grid-cols-6',
  xl: 'xl:grid-cols-6',
  fhd: 'fhd:grid-cols-8',
  qhd: 'qhd:grid-cols-12'
};

// Get the combined grid column classes
export const getGridColumnClasses = () => {
  return Object.values(gridColumns).join(' ');
};

/**
 * Get column span classes for a card based on its index and breakpoint
 * @param {number} index - The index of the card in the grid
 * @returns {string} - Tailwind classes for column spanning
 */
export const getCardSpanClasses = (index) => {
  // Small screens (default)
  const smallScreenSpan = (index === 0 || index === 5 || index === 12 || index === 19) ? 'col-span-2' : 'col-span-1';
  
  // Medium screens (md: 1024px+)
  const mediumScreenSpan = index === 0 ? 'md:col-span-4' : 'md:col-span-2';
  
  // Large screens (lg: 1366px+)
  const largeScreenSpan = [0, 1].includes(index) 
    ? 'lg:col-span-3' 
    : 'lg:col-span-2';
  
  // Extra large screens (xl: 1600px+)
  const xlScreenSpan = [0, 1, 8, 9].includes(index) 
    ? 'xl:col-span-3' 
    : 'xl:col-span-2';
  
  // Full HD screens (fhd: 1920px+)
  const fhdScreenSpan = [0, 1, 14, 15].includes(index) 
    ? 'fhd:col-span-4' 
    : 'fhd:col-span-2';
  
  // QHD/4K screens (qhd: 2560px+)
  const qhdScreenSpan = index === 0 
    ? 'qhd:col-span-6' 
    : index >= 11
      ? 'qhd:col-span-2'
      : 'qhd:col-span-3';
  return `${smallScreenSpan} ${mediumScreenSpan} ${largeScreenSpan} ${xlScreenSpan} ${fhdScreenSpan} ${qhdScreenSpan}`;
}; 