import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'esg-data.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

export async function GET() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    // If file doesn't exist, return empty data
    return NextResponse.json(null);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.company_name || !body.reporting_year || 
        body.scope1_tco2e === undefined || body.scope2_tco2e === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate that numbers are actually numbers
    if (typeof body.scope1_tco2e !== 'number' || typeof body.scope2_tco2e !== 'number') {
      return NextResponse.json(
        { error: 'Scope emissions must be numbers' },
        { status: 400 }
      );
    }

    // Add metadata
    const data = {
      ...body,
      id: Date.now().toString(),
      updatedAt: new Date().toISOString(),
    };

    await ensureDataDir();
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    );
  }
}
