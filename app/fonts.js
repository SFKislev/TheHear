// Next.js optimized Google Fonts
// These replace the @import statements in globals.css for better performance
import {
  Roboto,
  Amiri,
  Geist,
  Noto_Sans_JP,
  Noto_Sans_SC,
  Noto_Sans_Devanagari,
  Oswald,
  Rubik,
  Lalezar,
  Alexandria,
  Palanquin_Dark,
  RocknRoll_One,
  Sawarabi_Gothic,
  Potta_One,
  Kiwi_Maru,
  Dela_Gothic_One,
  ZCOOL_KuaiLe,
  ZCOOL_QingKe_HuangYou
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

// Chinese fonts - LIMITED WEIGHTS
export const notoSansSC = Noto_Sans_SC({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sc',
  adjustFontFallback: false,
});

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
