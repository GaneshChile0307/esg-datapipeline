import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const STRATEGY_FILE = path.join(process.cwd(), 'data', 'selected-strategy.json');

export async function GET() {
  try {
    const data = await fs.readFile(STRATEGY_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json(null);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.variant || !body.content) {
      return NextResponse.json(
        { error: 'Missing variant or content' },
        { status: 400 }
      );
    }

    const data = {
      variant: body.variant,
      content: body.content,
      savedAt: new Date().toISOString(),
    };

    await fs.writeFile(STRATEGY_FILE, JSON.stringify(data, null, 2));
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error saving strategy selection:', error);
    return NextResponse.json(
      { error: 'Failed to save strategy' },
      { status: 500 }
    );
  }
}
