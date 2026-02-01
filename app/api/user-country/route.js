import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const headerList = await headers();
    const country = headerList.get('x-user-country') || 'us';

    return NextResponse.json(
        { country },
        { headers: { 'Cache-Control': 'private, no-store, max-age=0, must-revalidate' } }
    );
}
