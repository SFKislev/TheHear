// Next.js optimized Google Fonts
// These replace the @import statements in globals.css for better performance
import {
  Roboto,
  Amiri,
  Geist,
  Noto_Sans_JP,  // Keep this one - lightest Japanese font (2 weights only)
  Noto_Sans_SC,
  Noto_Sans_Devanagari,
  Oswald,
  Rubik,
  Lalezar,
  Alexandria,
  Palanquin_Dark,
  // RocknRoll_One,  // REMOVED - Japanese fonts add 291KB CSS hurting SEO
  // Sawarabi_Gothic,  // REMOVED - Japanese fonts add 291KB CSS hurting SEO
  // Potta_One,  // REMOVED - Japanese fonts add 291KB CSS hurting SEO
  // Kiwi_Maru,  // REMOVED - Japanese fonts add 291KB CSS hurting SEO
  // Dela_Gothic_One,  // REMOVED - Japanese fonts add 291KB CSS hurting SEO
  // ZCOOL_KuaiLe,  // REMOVED - Chinese fonts add 175KB CSS hurting SEO
  // ZCOOL_QingKe_HuangYou  // REMOVED - Chinese fonts add 175KB CSS hurting SEO
} from 'next/font/google';

// Main fonts
export const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-roboto',
});

export const amiri = Amiri({
  weight: ['400', '700'],
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-amiri',
});

export const geist = Geist({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
});

// Japanese fonts - LIMITED WEIGHTS to reduce bundle size
export const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700'], // Only regular and bold
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-jp',
  adjustFontFallback: false, // Disable to reduce CSS size
});

// Japanese fonts - REMOVED 5 fonts (RocknRoll, Sawarabi, Potta, Kiwi, Dela)
// These added 291KB of render-blocking CSS, killing desktop PageSpeed score (41 vs 98 local)
// Keeping only Noto_Sans_JP (2 weights) - sufficient for Japan pages
/*
export const rocknRollOne = RocknRoll_One({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rocknroll',
});

export const sawarabiGothic = Sawarabi_Gothic({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sawarabi',
});

export const pottaOne = Potta_One({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-potta',
});

export const kiwiMaru = Kiwi_Maru({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-kiwi',
});

export const delaGothicOne = Dela_Gothic_One({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dela',
});
*/

// Chinese fonts - REDUCED to 1 font (was 3) to fix render-blocking CSS
// Keeping only Noto Sans SC (most reliable, 2 weights)
export const notoSansSC = Noto_Sans_SC({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sc',
  adjustFontFallback: false,
});

// Chinese fonts - REMOVED 2 fonts (ZCOOL KuaiLe, ZCOOL QingKe)
// These added 175KB of render-blocking CSS
/*
export const zcoolKuaiLe = ZCOOL_KuaiLe({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-zcool-kuaile',
});

export const zcoolQingKe = ZCOOL_QingKe_HuangYou({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-zcool-qingke',
});
*/

// Indian fonts - LIMITED WEIGHTS
export const notoSansDevanagari = Noto_Sans_Devanagari({
  weight: ['400', '700'],
  subsets: ['latin', 'devanagari'],
  display: 'swap',
  variable: '--font-noto-devanagari',
  adjustFontFallback: false,
});

export const palanquinDark = Palanquin_Dark({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'devanagari'],
  display: 'swap',
  variable: '--font-palanquin',
});

// Russian fonts
export const oswald = Oswald({
  weight: ['200', '300', '400', '500', '600', '700'],
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-oswald',
});

export const rubik = Rubik({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin', 'cyrillic', 'hebrew'],
  display: 'swap',
  variable: '--font-rubik',
});

// Arabic fonts
export const lalezar = Lalezar({
  weight: '400',
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-lalezar',
});

export const alexandria = Alexandria({
  weight: ['400', '700'], // Reduced weights
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-alexandria',
  adjustFontFallback: false,
});

// CRITICAL: Only load essential fonts globally to avoid massive CSS bundles
// International fonts should be loaded per-page as needed
export const fontVariables = [
  roboto.variable,  // Main body font
  geist.variable,   // UI font
  // All other fonts are commented out - load them per-page/per-country instead
  // This reduces the global CSS bundle from 400KB+ to ~50KB
  // amiri.variable,
  // notoSansJP.variable,
  // rocknRollOne.variable,
  // sawarabiGothic.variable,
  // pottaOne.variable,
  // kiwiMaru.variable,
  // delaGothicOne.variable,
  // notoSansSC.variable,
  // zcoolKuaiLe.variable,
  // zcoolQingKe.variable,
  // notoSansDevanagari.variable,
  // palanquinDark.variable,
  // oswald.variable,
  // rubik.variable,
  // lalezar.variable,
  // alexandria.variable,
].join(' ');
