import { z } from 'zod';

export const maxDuration = 30;

const deepSeekResponseSchema = z.object({
    choices: z.array(
        z.object({
            message: z.object({
                content: z.string(),
            }),
        })
    ).min(1),
});

const translationSchema = z.object({
    headline: z.string(),
    subtitle: z.string().optional().default(''),
});

function extractJsonPayload(content) {
    if (!content || typeof content !== 'string') {
        throw new Error('DeepSeek returned an empty translation payload');
    }

    const fencedMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = fencedMatch ? fencedMatch[1] : content;
    const firstBrace = candidate.indexOf('{');
    const lastBrace = candidate.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
        throw new Error('DeepSeek did not return valid JSON');
    }

    return candidate.slice(firstBrace, lastBrace + 1);
}

export async function POST(req) {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
        return Response.json({ error: 'Missing DEEPSEEK_API_KEY' }, { status: 500 });
    }

    const { headline, subtitle, locale } = await req.json();
    const targetLang = locale === 'heb' ? 'Hebrew' : 'English';

    const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            temperature: 0,
            messages: [
                {
                    role: 'system',
                    content: 'You are a translation engine. Return only compact JSON with keys "headline" and "subtitle". Do not add markdown or explanation.',
                },
                {
                    role: 'user',
                    content: `Translate the following news headline and subtitle into natural-sounding ${targetLang}. Prioritize fluency over word-for-word accuracy, preserve names, places, and specific facts, and do not add commentary.\n\nHeadline: ${headline || ''}\nSubtitle: ${subtitle || ''}`,
                },
            ],
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        return Response.json({ error: 'DeepSeek translation failed', details: errorText }, { status: response.status });
    }

    const result = deepSeekResponseSchema.parse(await response.json());
    const rawContent = result.choices[0].message.content;
    const parsedTranslation = translationSchema.parse(JSON.parse(extractJsonPayload(rawContent)));

    return Response.json({
        headline: parsedTranslation.headline,
        subtitle: subtitle ? parsedTranslation.subtitle : '',
    });
}
