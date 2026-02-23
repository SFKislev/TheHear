import { countryToAlpha2 } from 'country-to-iso';
import { NextResponse } from 'next/server';
import { countries } from './utils/sources/countries';

// Mapping from ISO country codes to your available countries
const countryCodeToSlug = {
  'IL': 'israel',
  'CN': 'china', 
  'FI': 'finland',
  'FR': 'france',
  'DE': 'germany',
  'IN': 'india',
  'IR': 'iran',
  'IT': 'italy',
  'JP': 'japan',
  'LB': 'lebanon',
  'NL': 'netherlands',
  'PS': 'palestine',
  'PL': 'poland',
  'RU': 'russia',
  'ES': 'spain',
  'TR': 'turkey',
  'GB': 'uk',
  'US': 'us',
  'UA': 'ukraine',
  'AE': 'uae'
};

function getUserCountry(request) {
  // Try various headers that might contain country information
  const headers = request.headers;
  
  // In development, check if this is localhost
  const isLocalhost = request.nextUrl.hostname === 'localhost' || request.nextUrl.hostname === '127.0.0.1';
  
  // Vercel provides country in this header
  let countryCode = headers.get('x-vercel-ip-country');
  
  // Cloudflare provides country in this header
  if (!countryCode) {
    countryCode = headers.get('cf-ipcountry');
  }
  
  // Development mode: simulate Israel for testing
  if (!countryCode && isLocalhost) {
    // You can change this to test different countries in development
    countryCode = 'IL'; // Simulate Israel for local development
  }
  
  // Fallback: default to US if we can't detect
  if (!countryCode) {
    countryCode = 'US';
  }
  
  // Map to your available countries
  const availableCountry = countryCodeToSlug[countryCode];
  
  // If the user's country isn't in your list, default to 'us'
  return availableCountry || 'us';
}

async function getCountry(code) {
  if (code == 'global') return 'global';
  if (code == 'uae') return 'United Arab Emirates';

  const countryNames = Object.keys(countries);
  if (countryNames.includes(code)) return code;
  let foundCountry = countryNames.find(c => c.toLowerCase().replace(' ', '') === code.toLowerCase().replace(' ', ''));
  if (foundCountry) return foundCountry;
  foundCountry = countryNames.find(c => countryToAlpha2(c) === countryToAlpha2(code));
  if (foundCountry) return foundCountry;
  return false;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Exclude _next, api routes & files with extension
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const segments = pathname.split('/').filter(Boolean);
  const searchParams = request.nextUrl.search || '';
  const isLocale = (value) => value === 'en' || value === 'heb';

  // Handle root path - redirect based on user location
  if (segments.length === 0) {
    const userCountry = getUserCountry(request);
    // Special case: Israel should redirect to Hebrew version
    const locale = userCountry === 'israel' ? 'heb' : 'en';
    return NextResponse.redirect(new URL(`/${locale}/${userCountry}`, request.url));
  }

  // Normalize invalid locale prefixes: /{invalid-locale}/{country-or-global}/... -> /en/{country-or-global}/...
  if (segments.length >= 2 && !isLocale(segments[0])) {
    const candidate = segments[1];
    const validTarget = await getCountry(candidate);
    if (validTarget) {
      const remainder = segments.slice(2).join('/');
      const normalizedPath = `/en/${validTarget}${remainder ? `/${remainder}` : ''}${searchParams}`;
      return NextResponse.redirect(new URL(normalizedPath, request.url));
    }
  }

  // Path with locale: /locale/country
  if (segments.length >= 2 && isLocale(segments[0])) {
    const locale = segments[0];
    const countryCandidate = segments[1];
    const valid = await getCountry(countryCandidate);
    if (valid) {
      // Validate date for archive pages (before hitting expensive page functions)
      if (segments.length >= 3 && segments[2].match(/^\d{2}-\d{2}-\d{4}$/)) {
        const dateStr = segments[2];
        const [day, month, year] = dateStr.split('-').map(Number);

        // Basic validation
        const date = new Date(year, month - 1, day);
        const today = new Date();

        // Check if date is valid
        if (isNaN(date.getTime()) ||
            date.getDate() !== day ||
            date.getMonth() !== month - 1 ||
            date.getFullYear() !== year) {
          // Invalid date format - redirect to country page
          return NextResponse.redirect(new URL(`/${locale}/${valid}`, request.url));
        }

        // Check if date is in the future
        if (date > today) {
          // Future date - redirect to country page
          return NextResponse.redirect(new URL(`/${locale}/${valid}`, request.url));
        }

        // Check if date is before country launch (July 2024 earliest)
        const earliestDate = new Date(2024, 6, 1); // July 1, 2024
        if (date < earliestDate) {
          // Too old - redirect to country page
          return NextResponse.redirect(new URL(`/${locale}/${valid}`, request.url));
        }
      }

      // Special case: redirect Hebrew search routes to English
      if (locale === 'heb' && segments[2] === 'search') {
        const searchParams = request.nextUrl.search; // Preserve query parameters
        return NextResponse.redirect(new URL(`/en/${valid}/search${searchParams}`, request.url));
      }

      // Special case: redirect mobile users from search routes to root page
      if (segments[2] === 'search') {
        const userAgent = request.headers.get('user-agent') || '';
        const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        
        if (isMobile) {
          return NextResponse.redirect(new URL(`/${locale}/${valid}`, request.url));
        }
      }
      
      if (valid !== countryCandidate) {
        return NextResponse.redirect(new URL(`/${locale}/${valid}`, request.url));
      } else {
        // Add user's detected country to response headers
        const userCountry = getUserCountry(request);
        const response = NextResponse.next();
        response.headers.set('x-user-country', userCountry);

        // Force cache headers for archive pages (date pattern in URL)
        // const archivePattern = /^\/(en|heb)\/[^\/]+\/\d{2}-\d{2}-\d{4}(\/feed)?$/;
        // if (archivePattern.test(pathname)) {
        //   response.headers.set(
        //     'Cache-Control',
        //     'public, s-maxage=86400, stale-while-revalidate=604800, immutable'
        //   );
        // }

        return response;
      }
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Path without locale: /country (or other segments)
  if (segments.length >= 1) {
    const countryCandidate = segments[0];
    const valid = await getCountry(countryCandidate);
    if (valid) {
      const acceptLanguage = request.headers.get('accept-language') || '';
      const locale = acceptLanguage.trim().toLowerCase().startsWith('he') ? 'heb' : 'en';
      return NextResponse.redirect(new URL(`/${locale}/${valid}`, request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next).*)']
};
