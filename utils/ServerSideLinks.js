import { countries } from "@/utils/sources/countries";

// Server-side headline links for SEO
export function ServerHeadlineLinks({ headlines, locale, country, date }) {
    if (!headlines || headlines.length === 0) return null;
    
    // Filter out internal links to prevent 404s
    const validExternalHeadlines = headlines.filter(headline => {
        if (!headline.link) return false;
        
        // Check if link points to our own domain
        const isInternalLink = headline.link.includes('thehear.org') || 
                              headline.link.includes('www.thehear.org') ||
                              headline.link.startsWith('/');
        
        return !isInternalLink;
    });
    
    if (validExternalHeadlines.length === 0) return null;
    
    return (
        <div style={{ display: 'none' }}>
            {/* Hidden server-rendered links for crawlers - external only */}
            {validExternalHeadlines.map((headline) => (
                <a 
                    key={headline.id}
                    href={headline.link}
                    rel="noopener noreferrer"
                    aria-hidden="true"
                >
                    {headline.headline}
                </a>
            ))}
        </div>
    );
}

// Server-side country navigation for SEO (Flag menu links)
export function ServerCountryNavigation({ locale, currentCountry }) {
    return (
        <div style={{ display: 'none' }}>
            {/* Hidden server-rendered country navigation for crawlers */}
            {Object.keys(countries)
                .filter(country => country !== currentCountry) // Exclude current country
                .filter(country => {
                    // Temporarily exclude UAE as destination to prevent errors
                    // (UAE will only appear if someone is currently ON UAE and needs to navigate away, 
                    // but that's already filtered out by the first filter)
                    return country !== 'uae';
                })
                .map(country => (
                    <a 
                        key={country}
                        href={`https://www.thehear.org/${locale}/${country}`}
                        aria-hidden="true"
                    >
                        {countries[country].english} News
                    </a>
                ))}
            {/* Always include global link unless we're already on global */}
            {currentCountry !== 'global' && (
                <a 
                    href={`https://www.thehear.org/${locale}/global`}
                    aria-hidden="true"
                >
                    Global News
                </a>
            )}
        </div>
    );
}

// Server-side yesterday navigation for SEO (Yesterday summary link)
export function ServerYesterdayNavigation({ locale, country }) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const day = String(yesterday.getDate()).padStart(2, '0');
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const year = yesterday.getFullYear();
    const dateString = `${day}-${month}-${year}`;
    
    return (
        <div style={{ display: 'none' }}>
            {/* Hidden server-rendered yesterday navigation for crawlers */}
            <a 
                href={`https://www.thehear.org/${locale}/${country}/${dateString}`}
                aria-hidden="true"
            >
                {country} news yesterday ({dateString})
            </a>
        </div>
    );
}


// Server-side date navigation for SEO (Previous/Next day links)
export function ServerDateNavigation({ locale, country, date }) {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const today = new Date();
    
    function createDateString(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }
    
    return (
        <div style={{ display: 'none' }}>
            {/* Hidden server-rendered date navigation for crawlers */}
            <a 
                href={`https://www.thehear.org/${locale}/${country}/${createDateString(yesterday)}`}
                aria-hidden="true"
            >
                Previous day: {createDateString(yesterday)}
            </a>
            
            {tomorrow <= today && (
                <a 
                    href={`https://www.thehear.org/${locale}/${country}/${createDateString(tomorrow)}`}
                    aria-hidden="true"
                >
                    Next day: {createDateString(tomorrow)}
                </a>
            )}
            
            <a 
                href={`https://www.thehear.org/${locale}/${country}`}
                aria-hidden="true"
            >
                Back to current: {country}
            </a>
        </div>
    );
}

// Server-side about content for SEO (About menu content)
export function ServerAboutContent({ locale }) {
    if (locale === 'heb') {
        return (
            <div style={{ display: 'none' }}>
                {/* Hidden server-rendered about content for crawlers - Hebrew */}
                <div aria-hidden="true" lang="he" dir="rtl">
                <p>המאזין הוא לוח כותרות וארכיון. הוא מציג את הכותרות הראשיות של עיתונים רבים, זה לצד זה, בזמן אמת וללא עריכה.</p>
        
        <h2>חדר המבצעים</h2>
        <p>המאזין הוא חדר מבצעים לחדשות. כמו דוכן עיתונים המשתנה ללא הרף, המאזין מאפשר לכם לראות את החדשות כשהן מתפתחות, על פני מקורות ומדינות.</p>
        
        <h2>הנוף כולו</h2>
        <p>המאזין לא נערך ולא מותאם אישית. במקום לנסות לבחור חלקים ופיסות שעשויות לעניין אתכם, הוא מנסה לתת תמונה של הנוף כולו. במקום לקבל החלטות עריכה משלו, הוא מקשיב להחלטות של עורכים אנושיים לגבי מה שמהווה &ldquo;הסיפור הראשי&rdquo; הראוי לתשומת לבכם. בזה, המאזין הוא צובר חדשות אובייקטיבי.</p>
        
        <h2>ארכיון כותרות</h2>
        <p>המאזין הוא <strong>ארכיון כותרות</strong> מקיף של כותרות ראשיות. הוא מאפשר למשתמשים לנווט אחורה בזמן כדי להציג מחדש את החדשות כשהן התפתחו. הוא מתעד היסטוריה כשהיא קורה. כמו ארכיון עיתונים היסטורי, המאזין הוא ספריה ואוסף של <strong>כותרות חדשות</strong> מעיתונים דיגיטליים.</p>
        
        <h2>חדשות בינלאומיות בזמן אמת</h2>
        <p>המאזין מציג <strong>חדשות בינלאומיות</strong> מ-20 מדיות, ומאפשר מעקב אחר התפתחויות גלובליות כשהן קורות. הפלטפורמה מתעדכנת ברציפות ומביאה את החדשות העולמיות המשמעותיות ביותר.</p>
        
        <h2>דוכן עיתונים חושב</h2>
        <p>המאזין לא רק מציג את הכותרות, אלא גם קורא אותן: הוא משובץ בבינה מלאכותית לכל אורכו. עם סקירות, סיכומים ודוחות הממוקמים אסטרטגית ומתעדכנים ברציפות, המאזין עוזר לקורא לעכל את הכותרות הרבות כשהן מתגלות. עם סקירות יומיות, הוא גם כותב היסטוריה כשהיא מתפתחת. המאזין הוא דוכן עיתונים מצויד במוח.</p>
        
        <h2>מגדל בבל</h2>
        <p>המאזין מתרגם כותרות בזמן אמת ומביא <strong>חדשות מהעולם</strong> ישירות אליכם. הוא הופך את נוף החדשות במדינות רבות לנגיש מיידית בעברית ובאנגלית, ללא בחירה או פרשנות. הוא מסיר מחסומי שפה ונותן מבט לא מסונן על מה שנדון כרגע ברחבי כדור הארץ.</p>
        
        <h2>גישה לחדשות מהעולם</h2>
        <p>עם המאזין תוכלו לעקוב אחר <strong>חדשות מהעולם</strong> ללא מחסומי שפה, עם תרגום אוטומטי של <strong>כותרות חדשות</strong> ממקורות בינלאומיים. הפלטפורמה מאפשרת הבנה מיידית של מגמות חדשותיות גלובליות.</p>
        
        <h2>הדבר האחד</h2>
        <p>המאזין מציג <strong>כותרות חדשות</strong> ראשיות מכל העולם. בבלגן וההמולה של העולם, הכותרת הראשית היא בחירת העורך של הסיפור החשוב ביותר שקורה עכשיו: הכותרת הראשית היא הדבר האחד. המאזין הוא מטא-עיתון שעשוי אך ורק מדברים אחדים כאלה, מאורגנים ומוקשרים.</p>
        
        <h2>מכונת הקשר</h2>
        <p>המאזין מעמיד את הכותרות בהקשר. הוא עושה זאת על ידי הצבת הכותרות ביחס זו לזו, לקודמותיהן, ולעמיתותיהן הגלובליות. במאזין, כל עץ נראה על רקע היער.</p>
        
        <h2>חדשות סביבתיות</h2>
        <p>המאזין נועד להתקיים בשקט, ברקע, במסך השני שלכם. הוא מאפשר למשתמשים לעקוב אחר החדשות מרחוק, עם תחושה בריאה של ריחוק, וללא גלילה.</p>
        
        <p>המאזין זמין עבור 20 מדינות.</p>
        
        <span>חדשות בינלאומיות, חדשות מהעולם, ארכיון כותרות, כותרות חדשות, צובר חדשות, ארכיון כותרות, דוכן עיתונים, לוח חדשות, כותרות ראשיות, עיתונים, חדשות בזמן אמת, חדר מבצעים חדשותי, צובר חדשות אובייקטיבי, ארכיון עיתונים היסטורי, חדשות AI, סיכומי חדשות, תרגום כותרות, מטא-עיתון, הקשר חדשותי, חדשות סביבתיות</span>
   
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'none' }}>
            {/* Hidden server-rendered about content for crawlers - English */}
            <div aria-hidden="true" lang="en">
                <p>The Hear is headline dashboard and archive. It displays the main headlines of many newspapers, side by side, in real time and without curation.</p>
                
                <h2>The Operations Room</h2>
                <p>The Hear is a news operation room. Like a constantly-changing news-stand, the Hear lets you see the news as they evolve, across sources and across countries.</p>
                
                <h2>The Landscape as a Whole</h2>
                <p>The Hear is not curated and not personalized. Instead of trying to select the bits and pieces that might interest you, it attempts to give a view of the landscape as a whole. Instead of making its own editorial decisions, it listens to the decisions made by human editors as to what constitutes &ldquo;the main story&rdquo; worthy of your attention. In this, the Hear is an objective news aggregator.</p>
                
                <h2>A Headline Archive</h2>
                <p>The Hear is an archive of main headlines. It lets users navigate back in time to replay the news as they unfolded. It records history as it happened. Like a historic newspaper archive, the Hear is a library and collection of the main headlines of digital newspapers.</p>
                
                <h2>A thinking Newsstand</h2>
                <p>The Hear doesn&apos;t just display the headlines, but also reads them: it is embedded with AI throughout. With strategically placed and continuously updating overviews, summaries and reports, the Hear helps the reader digest the many headlines as they unravel. With daily overviews, it also writes history as it unfolds. The Hear is a news-stand equipped with a brain.</p>
                
                <h2>The Tower of Babel</h2>
                <p>The Hear translates headlines in real-time. It makes the news landscape in many countries immediately accessible in English, without selection or commentary. It lifts language barriers and gives an unfiltered view of what is currently being discussed around planet earth.</p>
                
                <h2>The One-Thing</h2>
                <p>the Hear displays main headlines. In the fuss and hubbub of the world, the main headline is the editor&apos;s choice of the single most important story happening now: the main headline is the one-thing. The Hear is a meta-newspaper made solely of such one-things, organized and contextualized.</p>
                
                <h2>A Context Machine</h2>
                <p>The Hear contextualizes the headlines. It does this by placing the headlines in relation to each other, to their predecessors, and to their global peers. In the Hear, each tree is seen against the background of the forest.</p>
                
                <h2>Ambient News</h2>
                <p>The Hear is meant to exist quietly, in the background, on your second screen. It allows users to follow the news from a distance, with a healthy sense of aloofness, and without scrolling.</p>
                
                <p>The Hear is Available for 20 Countries.</p>
                
                <span>news aggregator, headline archive, newsstand, news dashboard, main headlines, newspapers, real time news, news operation room, objective news aggregator, historic newspaper archive, AI news, news summaries, translate headlines, meta-newspaper, news context, ambient news</span>
            </div>
        </div>
    );
}

// Server-side country-specific SEO content (H1/H2 structure)
export function ServerCountrySEOContent({ locale, country, date }) {
    const countryData = countries[country] || {};
    const countryName = locale === 'heb' ? countryData.hebrew || country : countryData.english || country;
    
    // Handle global page differently
    if (country === 'global') {
        if (locale === 'heb') {
            return (
                <div style={{ display: 'none' }}>
                    {/* Hidden server-rendered global SEO content for crawlers - Hebrew */}
                    <div aria-hidden="true" lang="he" dir="rtl">
                        <h1>כותרות עולמיות | לוח חדשות חי</h1>
                        <h2>כותרות עיתוני חדשות מרחבי העולם, מתעדכנות לאורך היום</h2>
                        <h3>כותרות חדשות ממדינות רבות, מתעדכנות בזמן אמת</h3>
                        <p>חדשות מתהוות וכותרות מכל רחבי העולם. ה-Hear אוסף כותרות ראשיות מעיתונים ומקורות חדשות ברחבי העולם, ומספק תמונה מקיפה של אירועים עולמיים מתפתחים.</p>
                    </div>
                </div>
            );
        }
        return (
            <div style={{ display: 'none' }}>
                {/* Hidden server-rendered global SEO content for crawlers - English */}
                <div aria-hidden="true" lang="en">
                    <h1>Global Headlines | Live news dashboard </h1>
                    <h2>International news from major newspapers worldwide, updated throughout the day</h2>
                    <h3>World news headlines from multiple countries, updated in real time</h3>
                    <p>Breaking news and headlines from around the globe. The Hear aggregates main headlines from newspapers and news sources worldwide, providing a comprehensive view of global current events and developing stories.</p>
                </div>
            </div>
        );
    }
    
    // Handle historical date pages differently
    if (date) {
        const formattedDate =
            locale === 'heb'
                ? date.toLocaleDateString('he-IL').replace(/\//g, '.')
                : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        if (locale === 'heb') {
            return (
                <div style={{ display: 'none' }}>
                    {/* Hidden server-rendered historical SEO content for crawlers - Hebrew */}
                    <div aria-hidden="true" lang="he" dir="rtl">
                        <h1>{`ארכיון כותרות ${countryName} ל-${formattedDate} | ארכיון עיתונים דיגיטלי`}</h1>
                        <h2>{`כותרות היסטוריות מעיתוני ${countryName} מ-${formattedDate}, כפי שהתפתחו`}</h2>
                        <h3>{`ארכיון עיתונים דיגיטלי: חדשות ${countryName} מ-${formattedDate}`}</h3>
                        <p>צפו מחדש בחדשות מ{countryName} מ-{formattedDate}. ארכיון עיתונים דיגיטלי השומר על הכותרות הראשיות כפי שהופיעו והתפתחו לאורך היום, ומאפשר תיעוד היסטורי של איך התרחשו האירועים בזמן אמת.</p>
                    </div>
                </div>
            );
        }
        return (
            <div style={{ display: 'none' }}>
                {/* Hidden server-rendered historical SEO content for crawlers - English */}
                <div aria-hidden="true" lang="en">
                    <h1>{`Archive of ${countryName} Headlines for ${formattedDate} | Digital Newspaper Archive`}</h1>
                    <h2>{`Historic headlines from ${countryName} newspapers on ${formattedDate}, as they unfolded`}</h2>
                    <h3>{`Digital newspaper archive: ${countryName} news from ${formattedDate}`}</h3>
                    <p>Replay the news from {countryName} on {formattedDate}. A digital newspaper archive that preserves the main headlines as they appeared and developed throughout the day, offering a historical record of how events unfolded in real time.</p>
                </div>
            </div>
        );
    }
    
    // Current country pages
    if (locale === 'heb') {
        return (
            <div style={{ display: 'none' }}>
                {/* Hidden server-rendered country SEO content for crawlers - Hebrew */}
                <div aria-hidden="true" lang="he" dir="rtl">
                    <h1>{`כותרות חיות מ${countryName} | לוח חדשות וארכיון`}</h1>
                    <h2>{`חדשות עדכניות מעיתוני ${countryName}, מתעדכנות לאורך היום`}</h2>
                    <h3>{`כותרות חדשות ${countryName} בזמן אמת`}</h3>
                    <p>חדשות מתעדכנות וכותרות מ{countryName}. המאזין אוסף כותרות ראשיות מעיתונים ומקורות חדשות ברחבי {countryName}, ומספק תמונה מקיפה של אירועים עדכניים וסיפורים מתפתחים.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div style={{ display: 'none' }}>
            {/* Hidden server-rendered country SEO content for crawlers - English */}
            <div aria-hidden="true" lang="en">
                <h1>{`Live Headlines from ${countryName} | a news dashboard and archive`}</h1>
                <h2>{`Current news from ${countryName} newspapers, updated throughout the day`}</h2>
                <h3>{`${countryName} news headlines in real time`}</h3>
                <p>breaking news and headlines from {countryName}. The Hear is a news aggregator that displays main headlines from newspapers in {countryName}, providing a birds eye view of breaking news, current events and developing stories; the top stories in the news from {countryName} today.</p>
            </div>
        </div>
    );
} 