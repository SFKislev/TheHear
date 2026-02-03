// Fully SSR - static methodology content
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

const introCards = [
  {
    title: "The Hear is a live news observatory and headlines archive.",
    span: 4
  },
  {
    title: "Live",
    span: 2
  },
  {
    title: "Archive",
    span: 2
  }
];

const liveSubtitleCard = {
  subtitle: styleTheHear("Live mode monitors headlines in real time"),
  span: 2
};

const archiveSubtitleCard = {
  subtitle: styleTheHear("Archive mode chronicles headlines"),
  span: 2
};

const liveDetailCards = [
  {
    subtitle: styleTheHear("<b>Live monitoring:</b> Headlines are crawled and updated every few minutes. New headlines appear automatically, highlighted in red."),
    span: 1
  },
  {
    subtitle: styleTheHear("<b>Main headlines:</b> The Hear only tracks main headlines: the large text at the top of the news site. It gives breadth, not depth. It cannot handle flat sites without hierarchy."),
    span: 1
  },
  {
    subtitle: styleTheHear("<b>Source order:</b> Users can change the order in which the sources are displayed to reflect perceived ideological bias. The bias scales were suggested by an AI, so should be treated with caution."),
    span: 1
  },
  // {
  //   type: "image",
  //   src: "/landing/order.png",
  //   span: 1
  // },
  {
    subtitle: styleTheHear("<b>Translation:</b> Live translations use the Gemini flash lite family of models, for speed. It can make mistakes."),
    span: 1
  },
  {
    subtitle: styleTheHear("<b>Wide coverage:</b> The Hear tracks country-specific news landscapes. Each landscape is covered widely, from the most conservative to the most liberal. We try tracking all major recognized news outlets, without selection. If a site isn't tracked, it is likely it prevents automated tracking: we respect robots.txt files."),
    span: 1
  },
  {
    subtitle: styleTheHear("<b>Overviews:</b> Ongoing overviews are written, in real time, in English and the local language. The language can be toggled. The overviews are written by an AI that reads all the current headlines, without human supervision. The overviews are written by Gemini based on the prompt below."),
    span: 1
  },
  {
    subtitle: styleTheHear('<b>Global page:</b> The Hear has separate pages for live coverage of individual countries, and <a href="/en/global" target="_blank" rel="noopener noreferrer">a global view</a>. Unlike the country pages, the global view displays no actual headlines. Instead, it displays the constantly updating AI generated ongoing overviews, side by side, alongside a similar global overview.'),
    span: 1
  },
  {
    subtitle: styleTheHear("<b>Levels of abstraction:</b> The Hear creates a pyramid of headlines. The ongoing overviews create a meta-headline out of live headlines, and the global page creates a meta-meta-headline out of many meta-headlines."),
    span: 1
  }
];

const archiveDetailCards = [
  {
    subtitle: styleTheHear("<b>Time-Slider:</b> The time machine interface allows for navigation in time. This is a core feature, and users are encouraged to fiddle with it."),
    span: 1
  },
  {
    type: "video",
    src: "/landing/TheHear-Scroll-11s-700px.webm",
    span: 1
  },

  // {
  //   type: "video",
  //   src: "/landing/the-Hear-NYTimes-15s.webm",
  //   span: 1
  // },
  {
    subtitle: styleTheHear("<b>Individual Time-Sliders:</b> Each source card can be navigated individually, with its own time-machine slider. Each individual headline is timestamped for birth and death."),
    span: 1
  },
  {
    subtitle: styleTheHear("<b>Snapshots:</b> The archives function as a collection of snapshots: while news sites can later change their text, the Hear fixes this ephemera and lets users replay it, as it originally appeared."),
    span: 1
  },
  {
    subtitle: styleTheHear('<b>Search:</b> The Hear has collected millions of headlines since it started tracking the news in late 2024. These archives can be searched in the <a href="/en/us/search" target="_blank" rel="noopener noreferrer">search page for each country</a>. Vector search, allowing to cluster semantically related headlines, is in the works.'),
    span: 1
  },
  {
    subtitle: styleTheHear("<b>Daily Overview:</b> Navigating to previous dates, a daily overview is added to the array of ongoing overviews. It too was generated by an AI, at the end of that day, having read all of that days' headlines. The daily overview narrates the full days' media coverage. It too is not supervised by humans."),
    span: 1
  },
  {
    subtitle: styleTheHear('<b>Archives:</b> <a href="/en/us/history/2025/05" target="_blank" rel="noopener noreferrer">Monthly archives</a> are created for individual countries. They are based on the generated daily title - \'the day of …\' - and allow for a quick glance at the history of a given month, in a given news space.'),
    span: 1
  },
  {
    subtitle: styleTheHear('<b>Global Date Archives:</b> Similarly, each date has a <a href="/en/global/history/2025/08/26" target="_blank" rel="noopener noreferrer">global archive page</a>, based on the generated daily titles, allowing for a comparative view of that day from different perspectives.<br> The archives do not display historic headlines, but link to the individual pages that do.'),
    span: 1
  }
];



export default function LandingPageContent({ randomSeed }) {
  // Use random seed to select typography (server-side, but varies per request)
  // If no seed provided, use first typography as fallback
  const typographyIndex = randomSeed
    ? randomSeed % Typography_English.length
    : 0;
  const typography = Typography_English[typographyIndex];

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Logo - Centered and alone in its row */}
          <div className="col-span-1 md:col-span-4 flex justify-center">
            <div className="h-full bg-white">
              <div className="no-underline">
                <DynamicLogoSmall locale="en" showDivider={false} />
              </div>
            </div>
          </div>
          




          {/* Intro Cards */}
          {introCards.map((card, index) => (
            <div 
              key={`intro-${index}`}
              className={`col-span-1 md:col-span-${card.span}`}
            >
              <div className={`h-full rounded-sm p-2 transition-colors flex items-center justify-center ${
                card.title === "Archive" ? "bg-off-white hover:bg-amber-100" : "bg-gray-100 hover:bg-gray-200"
              }`}>
                <div className="text-center p-6">
                  {index === 0 ? (
                    <h1
                      className="text-xl font-semibold"
                      style={typographyStyle}
                    >
                      {card.title}
                    </h1>
                  ) : (
                    <h2 
                      className="text-xl font-semibold"
                      style={typographyStyle}
                    >
                      {card.title}
                    </h2>
                  )}
                  {card.subtitle && (
                    <div 
                      className="text-sm leading-relaxed text-gray-800 prose prose-blue font-['Geist'] mt-4"
                      dangerouslySetInnerHTML={{ __html: card.subtitle }}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Live Subtitle Card */}
          <div className="col-span-1 md:col-span-2">
            <div className="h-full bg-gray-100 rounded-sm p-2 hover:bg-gray-200 transition-colors flex items-center justify-center">
              <div className="text-center p-6">
                <div 
                  className="text-sm leading-relaxed text-gray-800 prose prose-blue font-['Geist']"
                  dangerouslySetInnerHTML={{ __html: liveSubtitleCard.subtitle }}
                />
              </div>
            </div>
          </div>

          {/* Archive Subtitle Card */}
          <div className="col-span-1 md:col-span-2">
            <div className="h-full bg-off-white rounded-sm p-2 hover:bg-amber-100 transition-colors flex items-center justify-center">
              <div className="text-center p-6">
                <div 
                  className="text-sm leading-relaxed text-gray-800 prose prose-blue font-['Geist']"
                  dangerouslySetInnerHTML={{ __html: archiveSubtitleCard.subtitle }}
                />
              </div>
            </div>
          </div>

          {/* Live Detail Cards - positioned below Live card */}
          <div className="col-span-1 md:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              {liveDetailCards.map((card, index) => (
                <div 
                  key={`live-${index}`}
                  className="col-span-1"
                >
                  {card.type === "image" ? (
                    <div className="h-full bg-white rounded-sm p-2 hover:bg-gray-50 transition-colors flex items-center justify-center">
                      <div className="w-full h-full flex items-center justify-center">
                        <Image 
                          src={card.src}
                          alt="Source order interface"
                          width={200} 
                          height={150} 
                          className="w-4/5 h-auto max-h-full object-contain"
                        />
                      </div>
                    </div>
                  ) : (
                <div className="h-full bg-gray-100 rounded-sm p-2 hover:bg-gray-200 transition-colors">
                      <div className="p-6">
                    <div 
                      className="text-sm leading-relaxed text-gray-800 prose prose-blue font-['Geist']"
                      dangerouslySetInnerHTML={{ __html: card.subtitle }}
                    />
                  </div>
                </div>
                  )}
              </div>
              ))}
            </div>
          </div>

          {/* Archive Detail Cards - positioned below Archive card */}
          <div className="col-span-1 md:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              {archiveDetailCards.map((card, index) => (
                <div 
                  key={`archive-${index}`}
                  className="col-span-1"
                >
                  {card.type === "video" ? (
                    <div className="h-full bg-white rounded-sm p-2 hover:bg-gray-50 transition-colors flex items-center justify-center">
                      <div className="w-full h-full flex items-center justify-center">
                        <video 
                          src={card.src}
                          autoPlay
                          loop
                          muted
                          className="w-full h-auto max-h-full object-contain"
                        />
                      </div>
                      </div>
                    ) : (
                    <div className="h-full bg-off-white rounded-sm p-2 hover:bg-amber-100 transition-colors">
                      <div className="p-6">
                          <div 
                            className="text-sm leading-relaxed text-gray-800 prose prose-blue font-['Geist']"
                            dangerouslySetInnerHTML={{ __html: card.subtitle }}
                          />
                      </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>

          {/* Overview Prompt Card - spans all 4 columns */}
          <div className="col-span-1 md:col-span-4">
            <div className="h-full bg-gray-100 rounded-sm p-2 hover:bg-gray-200 transition-colors">
              <div className="p-6">
                {/* <h2 
                  className="text-xl font-semibold mb-4"
                  style={typographyStyle}
                >
                  Overview Generating Prompt
                </h2> */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                     <div className="col-span-1 md:col-span-4">
                     <div 
                       className="text-xs text-gray-800 mb-2"
                       dangerouslySetInnerHTML={{ __html: styleTheHear("<b>Overview generation prompt</b>: In the name of transparency we share a substantial bulk from the Hear's overview generation prompt, our special sauce:") }}
                     />
                   </div>
                  <div className="col-span-1">
                    <div 
                      className="text-xs leading-relaxed text-gray-600 prose prose-blue font-mono"
                      dangerouslySetInnerHTML={{ __html: styleTheHear(`"You are an editorial priority analyst who reads the main headlines of newspapers from <span style='color: #9ca3af'>{Country}</span>. You have a background in anthropology, international relations and sociology. Based on the attached headlines, provide a short 50-70 word overview of what's being currently discussed in the <span style='color: #9ca3af'>{Country}</span> media, in simple English, for a well-informed reader.`) }}
                    />
                  </div>
                  <div className="col-span-1">
                    <div 
                      className="text-xs leading-relaxed text-gray-600 prose prose-blue font-mono"
                      dangerouslySetInnerHTML={{ __html: styleTheHear(`• Your focus is on editorial decisions: the main headlines reflect what the editors think is the single most important story of the moment.<br><br>• Be straightforward and to the point, without introductions.<br><br>• Stick to the facts. The headlines and previous overviews are the only source of truth.<br><br>• Assume a well-informed reader, with prior knowledge of the topics at hand: assume you're mid conversation.<br><br>• Do not mention too many topics in your overview: try to focus on 1-2 recurring themes across sources. What does the local media collectively consider the most important story?`) }}
                    />
                  </div>
                  <div className="col-span-1">
                    <div 
                      className="text-xs leading-relaxed text-gray-600 font-mono"
                      dangerouslySetInnerHTML={{ __html: styleTheHear(`• Be somewhat distant, and report on the reporting.<br><br>• Avoid adjectives, and stick to facts. Not every development is "significant" and not every meeting is "crucial". Do not dramatize.<br><br>• You are a critical reader of the news: keep in mind what you know of the political and ideological biases of the different sources. For countries without free press, avoid echoing the headlines at face value. you are a critical reader, not a stenographer.<br><br>• The summaries should build on each other: notice the previous summary and continue it. Two summaries cannot be identical. They should evolve, in both headline and content.`) }}
                    />
                  </div>
                  <div className="col-span-1">
                    <div 
                      className="text-xs leading-relaxed text-gray-600 font-mono"
                      dangerouslySetInnerHTML={{ __html: styleTheHear(`• Remember not to state the obvious - (i.e. "the headlines discuss several topics", "each paper reports from its bias", etc).<br><br>• Pay special attention to new headlines: mention what has changed since the previous overview.<br><br>• You are analyzing what this media ecosystem, at this moment, considers the most important story worthy of readers' attention. This is more of an editorial priority analysis than a general news summary. You are not answering the question "what is going on?", but "what do different editors think is the most important thing going on?"`) }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Card - spans 1 column */}
          <div className="col-span-1 md:col-span-1 h-full bg-white hover:bg-gray-50 rounded-sm p-2 flex items-center justify-center cursor-pointer transition-colors">
            <InnerLink href="/about" className="no-underline">
              <div className="text-center p-4">
                <h2
                  className="text-xl font-semibold text-gray-800"
                  style={typographyStyle}
                >
                  ⟵ About
                </h2>
              </div>
            </InnerLink>
          </div>

          {/* Countries List - spans 3 columns */}
          <div className="col-span-1 md:col-span-3 h-full">
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
        </div>
      </div>
    </div>
  );
}
