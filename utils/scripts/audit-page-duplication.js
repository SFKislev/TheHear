#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function printUsage() {
    console.error("Usage: node utils/scripts/audit-page-duplication.js <url> [--json] [--min-length=35] [--top=25] [--include-short] [--no-normalize] [--save-report=path] [--phrase=\"text\"] [--buckets=head,jsonLd,nextData,nextFlight,visibleText,metaText]");
}

function parseArgs(argv) {
    const options = {
        json: false,
        minLength: 35,
        top: 25,
        includeShort: false,
        normalize: true,
        saveReport: null,
        phrase: null,
        buckets: null
    };

    let url = null;

    for (const arg of argv) {
        if (!arg.startsWith("--") && !url) {
            url = arg;
            continue;
        }

        if (arg === "--json") {
            options.json = true;
            continue;
        }

        if (arg === "--include-short") {
            options.includeShort = true;
            continue;
        }

        if (arg === "--no-normalize") {
            options.normalize = false;
            continue;
        }

        if (arg.startsWith("--min-length=")) {
            options.minLength = Number(arg.split("=")[1]);
            continue;
        }

        if (arg.startsWith("--top=")) {
            options.top = Number(arg.split("=")[1]);
            continue;
        }

        if (arg.startsWith("--save-report=")) {
            options.saveReport = arg.split("=").slice(1).join("=");
            continue;
        }

        if (arg.startsWith("--phrase=")) {
            options.phrase = arg.split("=").slice(1).join("=");
            continue;
        }

        if (arg.startsWith("--buckets=")) {
            options.buckets = new Set(
                arg
                    .split("=")[1]
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
            );
            continue;
        }

        throw new Error(`Unknown argument: ${arg}`);
    }

    if (!url) {
        throw new Error("Missing required URL argument");
    }

    if (!Number.isFinite(options.minLength) || options.minLength < 0) {
        throw new Error("Invalid --min-length value");
    }

    if (!Number.isFinite(options.top) || options.top < 1) {
        throw new Error("Invalid --top value");
    }

    return { url, options };
}

async function fetchPage(url) {
    const response = await fetch(url, {
        redirect: "follow",
        headers: {
            "user-agent": "thehear-duplication-auditor/1.0"
        }
    });

    const html = await response.text();

    return {
        url,
        finalUrl: response.url,
        status: response.status,
        contentLengthHeader: response.headers.get("content-length"),
        html
    };
}

function extractTagContent(html, tagName) {
    const regex = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
    const match = html.match(regex);
    return match ? match[1] : "";
}

function extractAllScriptContents(html, predicate) {
    const regex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
    const results = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
        const attrs = match[1] || "";
        const content = match[2] || "";
        if (predicate(attrs, content)) {
            results.push(content);
        }
    }
    return results;
}

function extractMetaInfo(headHtml) {
    const values = [];
    const items = [];

    const titleMatch = headHtml.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch) {
        const value = decodeEntities(titleMatch[1]).trim();
        if (value) {
            values.push(value);
            items.push({ key: "title", value });
        }
    }

    const metaRegex = /<meta\b([^>]*?)>/gi;
    let match;
    while ((match = metaRegex.exec(headHtml)) !== null) {
        const attrs = match[1] || "";
        const name = extractAttr(attrs, "name") || extractAttr(attrs, "property");
        const content = extractAttr(attrs, "content");
        if (!name || !content) continue;

        const lowered = name.toLowerCase();
        if (
            lowered === "description" ||
            lowered === "og:title" ||
            lowered === "og:description" ||
            lowered === "twitter:title" ||
            lowered === "twitter:description"
        ) {
            const value = decodeEntities(content).trim();
            if (value) {
                values.push(value);
                items.push({ key: lowered, value });
            }
        }
    }

    return { values, items };
}

function extractAttr(attrs, name) {
    const regex = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
    const match = attrs.match(regex);
    if (!match) return "";
    return match[2] || match[3] || match[4] || "";
}

function extractSections(html) {
    const head = extractTagContent(html, "head");
    const body = extractTagContent(html, "body");

    const jsonLdScripts = extractAllScriptContents(head + body, (attrs) =>
        /type\s*=\s*["']application\/ld\+json["']/i.test(attrs)
    );
    const nextDataScripts = extractAllScriptContents(head + body, (attrs) =>
        /id\s*=\s*["']__NEXT_DATA__["']/i.test(attrs)
    );
    const nextFlightScripts = extractAllScriptContents(head + body, (_attrs, content) =>
        content.includes("self.__next_f.push(")
    );

    const bodyHtml = body
        .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
        .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
        .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ");

    const metaInfo = extractMetaInfo(head);
    const visibleText = stripHtml(bodyHtml);

    return {
        head,
        body,
        jsonLd: jsonLdScripts.join("\n"),
        nextData: nextDataScripts.join("\n"),
        nextFlight: nextFlightScripts.join("\n"),
        bodyHtml,
        visibleText,
        metaText: metaInfo.values.join("\n"),
        metaItems: metaInfo.items
    };
}

function decodeEntities(text) {
    if (!text) return "";

    const named = {
        amp: "&",
        quot: "\"",
        apos: "'",
        lt: "<",
        gt: ">",
        nbsp: " "
    };

    return text
        .replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (_match, entity) => {
            if (entity[0] === "#") {
                const isHex = entity[1]?.toLowerCase() === "x";
                const numeric = isHex ? Number.parseInt(entity.slice(2), 16) : Number.parseInt(entity.slice(1), 10);
                return Number.isFinite(numeric) ? String.fromCodePoint(numeric) : _match;
            }
            return Object.prototype.hasOwnProperty.call(named, entity) ? named[entity] : _match;
        });
}

function normalizeText(text, options) {
    let output = text || "";
    if (options.normalize) {
        output = decodeEntities(output);
        output = output.replace(/\s+/g, " ").trim();
    }
    return output;
}

function stripHtml(htmlFragment) {
    if (!htmlFragment) return "";

    let text = htmlFragment;
    text = text.replace(/<(div|p|li|h[1-6]|article|section|br|tr|td|th)\b[^>]*>/gi, "\n");
    text = text.replace(/<\/(div|p|li|h[1-6]|article|section|tr|td|th)>/gi, "\n");
    text = text.replace(/<[^>]+>/g, " ");
    text = decodeEntities(text);
    text = text.replace(/\r/g, "");
    text = text.replace(/[ \t]+\n/g, "\n");
    text = text.replace(/\n[ \t]+/g, "\n");
    text = text.replace(/\n{2,}/g, "\n");
    return text.trim();
}

function splitVisibleText(text, options) {
    if (!text) return [];

    const lines = text
        .split("\n")
        .map((line) => normalizeText(line, options))
        .filter(Boolean);

    const candidates = [];
    for (const line of lines) {
        const localSeen = new Set();
        localSeen.add(line);
        candidates.push(line);
        const sentences = line
            .split(/(?<=[.!?])\s+/)
            .map((part) => normalizeText(part, options))
            .filter(Boolean);
        for (const sentence of sentences) {
            if (localSeen.has(sentence)) continue;
            localSeen.add(sentence);
            candidates.push(sentence);
        }
    }

    return candidates;
}

function collectStringLeaves(value, pathPrefix, output) {
    if (typeof value === "string") {
        output.push({ path: pathPrefix, value });
        return;
    }

    if (Array.isArray(value)) {
        value.forEach((item, index) => collectStringLeaves(item, `${pathPrefix}[${index}]`, output));
        return;
    }

    if (value && typeof value === "object") {
        Object.entries(value).forEach(([key, child]) => {
            const nextPath = pathPrefix ? `${pathPrefix}.${key}` : key;
            collectStringLeaves(child, nextPath, output);
        });
    }
}

function extractJsonLdStrings(jsonLdText) {
    const results = [];
    if (!jsonLdText.trim()) return results;

    const chunks = jsonLdText
        .split(/\n(?=\s*[{[])/)
        .map((item) => item.trim())
        .filter(Boolean);

    for (const chunk of chunks) {
        try {
            const parsed = JSON.parse(chunk);
            collectStringLeaves(parsed, "jsonLd", results);
        } catch {
            results.push({ path: "jsonLd.raw", value: chunk });
        }
    }

    return results;
}

function extractNextDataStrings(nextDataText) {
    const results = [];
    if (!nextDataText.trim()) return results;

    try {
        const parsed = JSON.parse(nextDataText);
        collectStringLeaves(parsed, "", results);
    } catch {
        results.push({ path: "raw", value: nextDataText });
    }

    return results;
}

function extractFlightStrings(nextFlightText) {
    const results = [];
    if (!nextFlightText.trim()) return results;

    const regex = /"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'/g;
    let match;
    let index = 0;
    while ((match = regex.exec(nextFlightText)) !== null) {
        const value = match[1] ?? match[2] ?? "";
        const unescaped = value
            .replace(/\\n/g, "\n")
            .replace(/\\r/g, "\r")
            .replace(/\\t/g, "\t")
            .replace(/\\"/g, "\"")
            .replace(/\\'/g, "'")
            .replace(/\\\\/g, "\\");
        results.push({ path: `nextFlight[${index}]`, value: unescaped });
        index += 1;
    }

    return results;
}

function buildCandidateMaps(sections, options) {
    const byText = new Map();
    const exactBucketEntries = [];

    function addCandidate(bucket, text, path = null) {
        const normalized = normalizeText(text, options);
        if (!normalized) return;
        if (!options.includeShort && normalized.length < options.minLength) return;
        if (options.buckets && !options.buckets.has(bucket)) return;

        exactBucketEntries.push({ bucket, text: normalized, path });

        if (!byText.has(normalized)) {
            byText.set(normalized, {
                text: normalized,
                count: 0,
                buckets: {},
                paths: new Set()
            });
        }

        const entry = byText.get(normalized);
        entry.count += 1;
        entry.buckets[bucket] = (entry.buckets[bucket] || 0) + 1;
        if (path) entry.paths.add(path);
    }

    splitVisibleText(sections.visibleText, options).forEach((text, index) => {
        addCandidate("visibleText", text, `visibleText[${index}]`);
    });

    sections.metaItems.forEach((item) => addCandidate("metaText", item.value, `meta.${item.key}`));

    extractJsonLdStrings(sections.jsonLd).forEach((item) => addCandidate("jsonLd", item.value, item.path));
    extractNextDataStrings(sections.nextData).forEach((item) => addCandidate("nextData", item.value, item.path));
    extractFlightStrings(sections.nextFlight).forEach((item) => addCandidate("nextFlight", item.value, item.path));

    return { byText, exactBucketEntries };
}

function findDuplicates(candidateMaps, options) {
    const duplicates = Array.from(candidateMaps.byText.values())
        .filter((entry) => entry.count > 1)
        .map((entry) => ({
            text: entry.text,
            preview: entry.text.length > 180 ? `${entry.text.slice(0, 177)}...` : entry.text,
            count: entry.count,
            wasteScore: entry.text.length * (entry.count - 1),
            buckets: entry.buckets,
            paths: Array.from(entry.paths).slice(0, 10)
        }))
        .sort((a, b) => b.wasteScore - a.wasteScore || b.count - a.count || b.text.length - a.text.length)
        .slice(0, options.top);

    return duplicates;
}

function buildHints(sections, duplicates) {
    const hints = [];
    let nextData;
    try {
        nextData = sections.nextData ? JSON.parse(sections.nextData) : null;
    } catch {
        nextData = null;
    }

    const pageProps = nextData?.props?.pageProps;
    const locale = pageProps?.locale;
    const summaries = Array.isArray(pageProps?.initialSummaries) ? pageProps.initialSummaries : [];

    if (locale === "en") {
        const hasRedundantLocaleFields = summaries.some((summary) =>
            summary && (
                typeof summary.hebrewHeadline === "string" ||
                typeof summary.hebrewSummary === "string" ||
                typeof summary.translatedHeadline === "string" ||
                typeof summary.translatedSummary === "string"
            )
        );
        if (hasRedundantLocaleFields) {
            hints.push({
                type: "locale_redundant_field",
                message: "English page serializes Hebrew or translated summary fields in __NEXT_DATA__"
            });
        }
    }

    if (locale === "heb") {
        const hasTranslatedFields = summaries.some((summary) =>
            summary && (
                typeof summary.translatedHeadline === "string" ||
                typeof summary.translatedSummary === "string"
            )
        );
        if (hasTranslatedFields) {
            hints.push({
                type: "locale_redundant_field",
                message: "Hebrew page serializes translated summary fields that are not visible in the feed UI"
            });
        }
    }

    const visibleNextOverlap = duplicates.filter((entry) => entry.buckets.visibleText && entry.buckets.nextData);
    if (visibleNextOverlap.length > 0) {
        hints.push({
            type: "cross_bucket_duplication",
            message: `${visibleNextOverlap.length} repeated strings appear in both visibleText and __NEXT_DATA__`
        });
    }

    if (sections.nextFlight.trim()) {
        hints.push({
            type: "framework_payload",
            message: "Page includes __next_f / Flight payload, which can duplicate content outside visible HTML"
        });
    }

    return hints;
}

function findPhraseMatches(sections, phrase, options) {
    if (!phrase) return [];
    const needle = normalizeText(phrase, options);
    if (!needle) return [];

    const buckets = [
        { name: "metaText", content: sections.metaText },
        { name: "jsonLd", content: sections.jsonLd },
        { name: "nextData", content: sections.nextData },
        { name: "nextFlight", content: sections.nextFlight },
        { name: "visibleText", content: sections.visibleText }
    ];

    const matches = [];

    for (const bucket of buckets) {
        const haystack = normalizeText(bucket.content, options);
        if (!haystack) continue;

        let startIndex = 0;
        while (true) {
            const idx = haystack.indexOf(needle, startIndex);
            if (idx === -1) break;
            matches.push({
                bucket: bucket.name,
                index: idx
            });
            startIndex = idx + needle.length;
        }
    }

    return matches;
}

function renderCliReport(result, options) {
    const lines = [];

    lines.push("Request Summary");
    lines.push(`URL: ${result.url}`);
    lines.push(`Final URL: ${result.finalUrl}`);
    lines.push(`Status: ${result.status}`);
    lines.push(`Content-Length header: ${result.contentLengthHeader || "n/a"}`);
    lines.push(`Total chars: ${result.sizes.htmlChars}`);
    lines.push("");
    lines.push("Section Sizes");
    lines.push(`head: ${result.sizes.headChars}`);
    lines.push(`jsonLd: ${result.sizes.jsonLdChars}`);
    lines.push(`__NEXT_DATA__: ${result.sizes.nextDataChars}`);
    lines.push(`__next_f: ${result.sizes.nextFlightChars}`);
    lines.push(`bodyHtml: ${result.sizes.bodyHtmlChars}`);
    lines.push(`visibleText: ${result.sizes.visibleTextChars}`);
    lines.push(`metaText: ${result.sizes.metaTextChars}`);

    lines.push("");
    lines.push("Top Repeated Strings");
    if (result.duplicates.length === 0) {
        lines.push("No repeated strings found with the current filters.");
    } else {
        for (const item of result.duplicates) {
            lines.push(`- "${item.preview}"`);
            lines.push(`  total: ${item.count}`);
            lines.push(`  wasteScore: ${item.wasteScore}`);
            lines.push(`  buckets: ${Object.entries(item.buckets).map(([k, v]) => `${k}=${v}`).join(", ")}`);
            if (item.paths.length > 0) {
                lines.push(`  paths: ${item.paths.join(" | ")}`);
            }
        }
    }

    lines.push("");
    lines.push("Hints");
    if (result.hints.length === 0) {
        lines.push("No heuristic duplication hints triggered.");
    } else {
        for (const hint of result.hints) {
            lines.push(`- [${hint.type}] ${hint.message}`);
        }
    }

    if (options.phrase) {
        lines.push("");
        lines.push(`Phrase Audit: "${options.phrase}"`);
        if (result.phraseMatches.length === 0) {
            lines.push("No matches.");
        } else {
            for (const match of result.phraseMatches) {
                lines.push(`- ${match.bucket} at normalized index ${match.index}`);
            }
        }
    }

    return lines.join("\n");
}

function ensureDirForFile(filePath) {
    const dir = path.dirname(path.resolve(filePath));
    fs.mkdirSync(dir, { recursive: true });
}

async function main() {
    let parsed;
    try {
        parsed = parseArgs(process.argv.slice(2));
    } catch (error) {
        printUsage();
        console.error(error.message);
        process.exit(1);
    }

    const { url, options } = parsed;

    let page;
    try {
        page = await fetchPage(url);
    } catch (error) {
        console.error(`Failed to fetch ${url}`);
        console.error(error.message);
        process.exit(1);
    }

    const sections = extractSections(page.html);
    const candidateMaps = buildCandidateMaps(sections, options);
    const duplicates = findDuplicates(candidateMaps, options);
    const hints = buildHints(sections, duplicates);
    const phraseMatches = findPhraseMatches(sections, options.phrase, options);

    const result = {
        url: page.url,
        finalUrl: page.finalUrl,
        status: page.status,
        contentLengthHeader: page.contentLengthHeader,
        sizes: {
            htmlChars: page.html.length,
            headChars: sections.head.length,
            jsonLdChars: sections.jsonLd.length,
            nextDataChars: sections.nextData.length,
            nextFlightChars: sections.nextFlight.length,
            bodyHtmlChars: sections.bodyHtml.length,
            visibleTextChars: sections.visibleText.length,
            metaTextChars: sections.metaText.length
        },
        duplicates,
        hints,
        phraseMatches
    };

    const output = options.json ? JSON.stringify(result, null, 2) : renderCliReport(result, options);

    if (options.saveReport) {
        ensureDirForFile(options.saveReport);
        fs.writeFileSync(path.resolve(options.saveReport), output, "utf8");
    }

    process.stdout.write(`${output}\n`);
}

main().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
});
