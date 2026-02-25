import React from 'react';
import Divider from '@mui/material/Divider';
import { ExpandLess, ExpandMore, OpenInNew } from '@mui/icons-material';
import InnerLink from '@/components/InnerLink';

export default function ReadMore({ expanded, onToggle }) {
    const [expandedSections, setExpandedSections] = React.useState({});

    const handleSectionToggle = (index) => {
        setExpandedSections(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const sections = [
        {
            title: '⇢ The Operations Room',
            text: `The Hear is a news operation room. Like a constantly-changing news-stand, <em>the Hear</em> lets you see the news as they evolve, across sources and across countries.`
        },
        {
            title: '⇢ The Landscape as a Whole',
            text: `The Hear is not curated and not personalized. <br/>Instead of trying to select the bits and pieces that might interest <b>you</b>, it attempts to give a view of the landscape as a whole. Instead of making its own editorial decisions, it listens to the decisions made by human editors as to what constitutes “the main story” worthy of your attention. <br/>In this, <em>the Hear</em> is an objective news aggregator.`
        },
        {
            title: '⇢ A Headline Archive',
            text: `The Hear is an archive of main headlines. It lets users navigate back in time to replay the news as they unfolded. It records history as it happened. Like a historic newspaper archive, <em>the Hear</em> is a library and collection of the main headlines of digital newspapers.
            <br/><br/>
            <video 
                class="w-full rounded-sm" 
                autoplay 
                loop 
                muted 
                preload="metadata"
            >
                <source src="/landing/the-Hear-NYTimes-15s.webm" type="video/webm" />
                Your browser does not support the video tag.
            </video>`
        },
        {
            title: '⇢ A thinking Newsstand',
            text: `The Hear doesn’t just display the headlines, but also reads them: it is embedded with AI throughout. With strategically placed and continuously updating overviews, summaries and reports, the Hear helps the reader digest the many headlines as they unravel. With daily overviews, it also writes history as it unfolds. The Hear is a news-stand equipped with a brain.`
        },
        {
            title: '⇢ The Tower of Babel',
            text: `The Hear translates headlines in real-time. It makes the news landscape in many countries immediately accessible in English, without selection or commentary. It lifts language barriers and gives an unfiltered view of what is currently being discussed around planet earth.`
        },
        {
            title: '⇢ The One-Thing',
            text: `<em>the Hear</em> displays main headlines. In the fuss and hubbub of the world, the main headline is the editor’s choice of the single most important story happening now: the main headline is the <b>one-thing</b>. The Hear is a meta-newspaper made solely of such one-things, organized and contextualized.`
        },
        {
            title: '⇢ A Context Machine',
            text: `The Hear contextualizes the headlines. It does this by placing the headlines in relation to each other, to their predecessors, and to their global peers. <br/>In <em>the Hear</em>, each tree is seen against the background of the forest.`
        },
        {
            title: '⇢ Ambient News',
            text: `The Hear is meant to exist quietly, in the background, on your second screen. It allows users to follow the news from a distance, with a healthy sense of aloofness, and without scrolling.`
        }
    ].filter(section => section.title !== '');

    return (
        <div>
            {expanded && (
                <div className="mb-2">
                    {sections.map((section, index) => (
                        <React.Fragment key={index}>
                            <div className="mb-2">
                                <div
                                    onClick={() => handleSectionToggle(index)}
                                    className="flex items-center cursor-pointer hover:[&>p]:underline hover:[&>p]:underline-offset-2 mt-2 mb-1"
                                >
                                    <p className="text-sm font-['Geist'] flex-1 font-medium">
                                        {section.title}
                                    </p>
                                    {expandedSections[index] ? (
                                        <ExpandLess style={{ fontSize: '16px' }} />
                                    ) : (
                                        <ExpandMore style={{ fontSize: '16px' }} />
                                    )}
                                </div>

                                {expandedSections[index] && (
                                    <p
                                        className="font-['Geist'] text-sm leading-6 mb-2"
                                        dangerouslySetInnerHTML={{
                                            __html: section.text
                                                .replace(/The Hear/g, '<span class="font-medium">The Hear</span>')
                                                .replace(/<em>the Hear<\/em>/g, '<span class="font-medium">the Hear</span>')
                                        }}
                                    />
                                )}
                            </div>

                            {index < sections.length - 1 && (
                                <Divider className="border-dotted border-[rgba(0,0,0,0.2)]" />
                            )}
                        </React.Fragment>
                    ))}

                    <Divider className="border-dotted border-[rgba(0,0,0,0.2)] mt-2" />

                    <p className="font-['Geist'] text-sm leading-6 mt-2 mb-2">
                        The Hear is Available for 20 Countries.
                    </p>

                    <Divider className="border-dotted border-[rgba(0,0,0,0.2)] mb-2" />
                </div>
            )}

            <div
                onClick={onToggle}
                className={`flex items-center justify-between cursor-pointer ${open ? 'mt-2' : 'mt-2'} text-gray-800 hover:opacity-70`}
            >
                <div className="flex items-center">
                    <p className="text-sm font-['Geist'] mr-2 flex items-center">
                        ⇢ Read {expanded ? 'less' : 'more'}
                    </p>
                    {expanded ? (
                        <ExpandLess style={{ fontSize: '16px' }} />
                    ) : (
                        <ExpandMore style={{ fontSize: '16px' }} />
                    )}
                </div>
                <InnerLink 
                    href="/about" 
                    onClick={(e) => e.stopPropagation()}
                    className="opacity-60 hover:opacity-100 transition-opacity"
                >
                    <OpenInNew style={{ fontSize: '14px' }} />
                </InnerLink>
            </div>
        </div>
    );
};