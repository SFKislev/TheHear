/**
 * API Route to trigger IndexNow submission
 *
 * This endpoint can be called whenever content is updated to instantly
 * notify Bing and other search engines about changes.
 *
 * POST /api/indexnow
 * Body: { urls: ["https://www.thehear.org/page1", ...] }
 */

export async function POST(request) {
    try {
        const { urls } = await request.json();

        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return Response.json(
                { error: 'URLs array is required' },
                { status: 400 }
            );
        }

        const INDEXNOW_KEY = '257bd493-6f33-4794-9014-6e0c079e01f9';

        const payload = {
            host: "www.thehear.org",
            key: INDEXNOW_KEY,
            keyLocation: `https://www.thehear.org/${INDEXNOW_KEY}.txt`,
            urlList: urls
        };

        const response = await fetch('https://api.indexnow.org/IndexNow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(payload)
        });

        if (response.status === 200 || response.status === 202) {
            return Response.json({
                success: true,
                submitted: urls.length,
                message: 'URLs submitted to IndexNow successfully'
            });
        } else {
            return Response.json({
                success: false,
                status: response.status,
                message: 'IndexNow submission failed'
            }, { status: response.status });
        }

    } catch (error) {
        console.error('IndexNow API error:', error);
        return Response.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}
