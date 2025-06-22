import { NextResponse } from 'next/server';
import { getQuote } from '@/services/zerodha';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const instrument = searchParams.get('instrument');

    if (!instrument) {
        return NextResponse.json({ message: 'Instrument query parameter is required' }, { status: 400 });
    }

    try {
        const quote = await getQuote(instrument);

        if (!quote || !quote.last_price) {
             return NextResponse.json({ message: 'Could not fetch quote' }, { status: 404 });
        }

        // Return a format consistent with the performance chart data points
        const tick = {
            date: new Date().toISOString(),
            value: quote.last_price,
        };
        
        return NextResponse.json(tick);

    } catch (error) {
        console.error("Error fetching quote:", error);
        return NextResponse.json({ message: 'Error fetching quote' }, { status: 500 });
    }
}
