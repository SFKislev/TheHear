import {
  Alexandria,
  Amiri,
  Lalezar,
  Noto_Sans_Devanagari,
  Noto_Sans_JP,
  Noto_Sans_SC,
  Oswald,
  Palanquin_Dark,
  Rubik,
} from 'next/font/google';

export const amiri = Amiri({
  weight: ['400', '700'],
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-amiri',
});

export const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-jp',
  adjustFontFallback: false,
});

export const notoSansSC = Noto_Sans_SC({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sc',
  adjustFontFallback: false,
});

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

export const lalezar = Lalezar({
  weight: '400',
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-lalezar',
});

export const alexandria = Alexandria({
  weight: ['400', '700'],
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-alexandria',
  adjustFontFallback: false,
});
