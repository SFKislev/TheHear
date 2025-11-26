// Fully SSR - no client-side JS needed for static content
import React from 'react';
import EnglishFonts, { Typography_English } from "@/utils/typography/EnglishFonts";
import Image from 'next/image';
import FlagIcon from "@/components/FlagIcon";
import { countries } from "@/utils/sources/countries";
import DynamicLogo from "@/components/Logo";
import DynamicLogoSmall from "@/components/Logo-small";
import Link from 'next/link';
// import { sources, RandomSampleCards } from "./SampleCards";  // Comment out this import
import InnerLink from '@/components/InnerLink';

const styleTheHear = (text) => {
  return text.replace(/\bthe hear\b/gi, (match) => 
    `<span style='font-weight: 500;'>${match}</span>`
  ).replace(/<b>(.*?)<\/b>/g, (match, content) => 
    `<b style='color:black; background-color: yellow; font-weight: 500;'>${content}</b>`
  );
};

const imageCards = [
  {
    // image: "/landing/newsroom-s.png",
    // imageAlt: "Operations Room",
    title: "The Operation Room",
    subtitle: styleTheHear("the Hear is a <b>news operation room</b>: it displays the main headlines of many newspapers, side by side and in real time. Like a <b>constantly changing newsstand</b>, it lets you monitor the news as they evolve, across countries and sources.")
  },
  {
    image: "/landing/landscape-s.png",
    imageAlt: "Media Landscape",
    title: "The Landscape as a Whole",
    subtitle: styleTheHear("The Hear is <b>not curated</b> and not personalized. Instead of trying to select the bits and pieces that might interest <i>you</i>, it attempts to give an overview of the landscape as a whole. Instead of making its own editorial decisions, it listens to the <b>decisions made by human editors</b> as to what constitutes 'the main story' worthy of your attention. <br><br> In this, the Hear is an objective news aggregator.")
  },
  {
    // image: "/landing/archive-s.png",
    // imageAlt: "Headline Archive",
    title: "A Headline Archive",
    subtitle: styleTheHear("The Hear is an archive of main headlines. <br><br>With a <b>time-machine interface</b>, it lets users navigate back in time to replay the news as they unfolded. It records <b>history as it happened</b>. Like a historic newspaper archive, the Hear is a library and collection of the main headlines of digital newspapers.")
  },
  {
    // image: "/landing/newsstand.png",
    // imageAlt: "Headline Archive",
    title: "A Newsstand with a Brain",
    subtitle: styleTheHear("The Hear doesn't just display the headlines, but also reads them: it is <b>embedded with AI</b> throughout. With continuously updating overviews, summaries and reports, the Hear helps the reader digest the many headlines as they unravel. With daily overviews, it also <b>chronicles history</b> as it unfolds. The Hear is a newsstand equipped with a brain.")
  },
  {
    image: "/landing/babel.png",
    imageAlt: "The Tower of Babel",
    title: "The Global Media",
    subtitle: styleTheHear("The Hear <b>translates headlines in real-time</b>. It makes the news landscape in many countries immediately accessible in English, without selection, manipulation or commentary. It gives an unfiltered view of what is currently being discussed by legacy media, around planet earth.")
  },
  {
    image: "/landing/oneThing.png",
    imageAlt: "The One-Thing",
    title: "The One-Thing",
    subtitle: styleTheHear("the Hear displays main headlines. In the fuss and hubbub of the world, the main headline is the editor's choice of the <b>single most important story</b> happening now: the main headline is the one-thing. The Hear is a meta-newspaper made solely of such one-things, organized and contextualized.")
  },
  {
    image: "/landing/Bubble.png",
    imageAlt: "A bubble",
    title: "A Negative Filter Bubble",
    subtitle: styleTheHear("The Hear is a collection of perspectives. It positions “far-right” and “radical left” headlines side by side, without judgement, creating a negative filter bubble. The Hear contextualizes the headlines through contrast.")
  },
  {
    // image: "/landing/ambient.png",
    // imageAlt: "Ambient News",
    title: "Ambient News",
    subtitle: styleTheHear("The Hear is meant to exist quietly, in the background, on your second screen. It allows users to follow <b>the news from a distance</b>, with a healthy sense of aloofness, and without scrolling.")
  },
  {
    title: "Methodology"
  },
  {
    title: "A Public Good",
    subtitle: styleTheHear("The Hear operates under a small <b>independent nonprofit organization</b>. It tracks, aggregates and archives headlines without making its own independent editorial decisions. It is a headline monitoring machine, maintained as a public good.")
  },
];

// Create a separate component for the countries list
const CountriesList = ({ typographyStyle }) => {
  return (
    <div className="md:col-span-8">
      <div className="h-full bg-gray-100 rounded-sm p-2 hover:bg-gray-200 transition-colors">
        <div className="p-6">
          <h2 
            className="text-xl font-semibold mb-10"
            style={typographyStyle}
          >
            The Hear is available for 20 countries.
          </h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(countries).map(([id, country]) => (
              <InnerLink
                key={id} 
                href={id.toLowerCase() === 'uk' ? '/en/uk' : `/en/${id}`}
                className="no-underline text-inherit"
              >
                <div className="flex items-center gap-3">
                  <FlagIcon country={id} />
                  <div className="text-xs font-medium">{country.english}</div>
                  <span className="text-xs text-gray-300">|</span>
                </div>
              </InnerLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LandingPageContent({ randomSeed }) {
  // Use random seed to select typography (server-side, but varies per request)
  // If no seed provided, use first typography as fallback
  const typographyIndex = randomSeed
    ? randomSeed % Typography_English.length
    : 0;
  const typography = Typography_English[typographyIndex];

  // No need to split the final card anymore
  const nonFinalCards = imageCards;

  // Split cards to insert sample cards after "The Landscape as a Whole"
  const firstGroup = nonFinalCards.slice(0, 2); // First two cards
  const secondGroup = nonFinalCards.slice(2); // Rest of the cards

  // Fixed typography style for SSR
  const typographyStyle = {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize,
    lineHeight: typography.lineHeight,
    fontWeight: typography.fontWeight,
    fontStyle: typography.fontStyle || 'normal',
    direction: typography.direction
  };

  return (
    <div className="w-full bg-white overflow-x-hidden overflow-y-auto custom-scrollbar pt-12">
      <EnglishFonts />
      
      <div className="w-full md:w-[70%] md:min-w-[800px] md:max-w-[1200px] p-5 overflow-visible mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Logo - Centered and alone in its row */}
          <div className="col-span-1 md:col-span-12 flex justify-center">
            <div className="h-full bg-white">
              <div className="no-underline">
                {/* Mobile Logo */}
                <div className="block md:hidden">
                  <DynamicLogoSmall locale="en" showDivider={false} mobileReducedPadding={true} />
                </div>
                {/* Desktop Logo */}
                <div className="hidden md:block">
                  <DynamicLogo locale="en" showDivider={false} />
                </div>
              </div>
            </div>
          </div>

          {/* Title Card - Spanning full row (3 cards) */}
          <div className="col-span-1 md:col-span-12">
            <div className="h-full bg-gray-100 rounded-sm p-10 hover:bg-gray-200 transition-colors">
              <h1
                className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2 text-center"
                style={typographyStyle}
              >
                <span className="text-blue">The Hear</span> is a news observatory.
              </h1>
              <p className="text-sm text-gray-700 font-normal text-center">
                {/* Main headline description */}
              </p>
            </div>
          </div>

          {/* First Group of Cards */}
          {firstGroup.map((card, index) => (
            <React.Fragment key={`first-group-${index}`}>
              {card.image && (
                <div className="hidden md:block col-span-1 md:col-span-4">
                  <div className="h-full bg-gray-100 rounded-sm flex items-center hover:bg-gray-200 transition-colors">
                    <div className="w-full p-6">
                      <div className="w-full flex justify-center items-center">
                        <Image 
                          src={card.image} 
                          alt={card.imageAlt} 
                          width={200} 
                          height={150} 
                          className="w-full max-w-[200px] h-auto"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="col-span-1 md:col-span-4">
                <div className="h-full bg-gray-100 rounded-sm p-2 hover:bg-gray-200 transition-colors">
                  <div className="p-4">
                    <h2 
                      className="text-xl font-semibold mb-10"
                      style={typographyStyle}
                    >
                      {card.title}
                    </h2>
                    <div 
                      className="text-sm leading-relaxed text-gray-800 prose prose-blue font-['Geist']"
                      dangerouslySetInnerHTML={{ __html: card.subtitle }}
                    />
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}

          {/* Second Group of Cards */}
          {secondGroup.map((card, index) => {
            // Check if this is one of the last two cards that need special column spans
            const isSecondToLast = index === secondGroup.length - 2; // "Methodology"
            const isLast = index === secondGroup.length - 1; // "A Public Good"
            
            let colSpan = "md:col-span-4"; // default
            
            if (isSecondToLast) {
              colSpan = "md:col-span-4"; // span 1 column (4 out of 12)
            } else if (isLast) {
              colSpan = "md:col-span-8"; // span 2 columns (8 out of 12)
            }
            
            return (
              <React.Fragment key={`second-group-${index}`}>
                {card.image && (
                  <div className="hidden md:block col-span-1 md:col-span-4">
                    <div className="h-full bg-gray-100 rounded-sm flex items-center hover:bg-gray-200 transition-colors">
                      <div className="w-full p-6">
                        <div className="w-full flex justify-center items-center">
                          <Image 
                            src={card.image} 
                            alt={card.imageAlt} 
                            width={200} 
                            height={150} 
                            className="w-full max-w-[200px] h-auto"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className={`col-span-1 ${colSpan} ${card.title === "Methodology" ? "hidden md:block" : ""}`}>
                  <div className={`h-full rounded-sm p-2 transition-colors ${
                    card.title === "Methodology" 
                      ? "bg-white hover:bg-gray-50 flex items-center justify-center" 
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}>
                    {card.title === "Methodology" ? (
                      <InnerLink href="/methodology" className="no-underline">
                        <div className="text-center p-4 cursor-pointer">
                          <h2 
                            className="text-xl font-semibold text-gray-800"
                            style={typographyStyle}
                          >
                            ⟵ {card.title}
                          </h2>
                        </div>
                      </InnerLink>
                    ) : (
                      <div className="p-6">
                        <h2 
                          className="text-xl font-semibold mb-10"
                          style={typographyStyle}
                        >
                          {card.title}
                        </h2>
                        {card.subtitle && (
                          <div 
                            className="text-sm leading-relaxed text-gray-800 prose prose-blue font-['Geist']"
                            dangerouslySetInnerHTML={{ __html: card.subtitle }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
          
          {/* Countries List - spans 8 columns */}
          <div className="col-span-1 md:col-span-8">
            <CountriesList typographyStyle={typographyStyle} />
          </div>

          {/* Welcome Card */}
          <div className="col-span-1 md:col-span-4 h-full bg-[#223052] hover:bg-[#495A7F] rounded-sm p-2 flex items-center justify-center cursor-pointer transition-colors">
            <InnerLink href="/en/us" className="no-underline">
              <div className="text-center p-4">
                <h2
                  className="text-xl font-semibold text-white"
                  style={typographyStyle}
                >
                  to The Hear ⟶
                </h2>
              </div>
            </InnerLink>
          </div>
        </div>
      </div>
    </div>
  );
}