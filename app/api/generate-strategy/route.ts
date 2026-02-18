import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Choose implementation: 'gemini' or 'mock'
const STRATEGY_MODE = process.env.GEMINI_API_KEY ? 'gemini' : 'mock';

// Initialize Gemini AI (only if API key is available)
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// OPTION 1: Real AI Strategy Generation using Google Gemini
async function generateStrategiesWithAI(data: {
  company_name: string;
  reporting_year: number;
  scope1_tco2e: number;
  scope2_tco2e: number;
  scope3_tco2e?: number;
}) {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  const total = data.scope1_tco2e + data.scope2_tco2e + (data.scope3_tco2e || 0);
  
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
  
  const prompt = `You are an ESG (Environmental, Social, and Governance) consultant. Generate THREE different ESG strategy variants for the following company data:

Company: ${data.company_name}
Reporting Year: ${data.reporting_year}
Scope 1 Emissions: ${data.scope1_tco2e} tCO₂e
Scope 2 Emissions: ${data.scope2_tco2e} tCO₂e
${data.scope3_tco2e ? `Scope 3 Emissions: ${data.scope3_tco2e} tCO₂e\n` : ''}Total Emissions: ${total} tCO₂e

Generate exactly THREE variants in the following format. Each variant MUST reference the specific emission numbers provided above:

1. SHORT (2-4 sentences): Brief summary with key action points
2. NEUTRAL (5-8 sentences): Balanced strategy with medium detail
3. DETAILED: Comprehensive strategy with structured sections including current state analysis, short-term actions (0-12 months), medium-term initiatives (1-3 years), and long-term goals (3-5 years)

Format your response EXACTLY as JSON with this structure:
{
  "short": "your short strategy here",
  "neutral": "your neutral strategy here", 
  "detailed": "your detailed strategy here"
}

Make sure strategies are specific, actionable, and reference the actual emission numbers.`;

  try {
    console.log('\n📤 Sending prompt to Gemini AI...');
    console.log('Company:', data.company_name);
    console.log('Emissions:', {
      scope1: data.scope1_tco2e,
      scope2: data.scope2_tco2e,
      scope3: data.scope3_tco2e,
      total
    });
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('\n📥 Raw Gemini AI Response:');
    console.log('─────────────────────────────────────────');
    console.log(text);
    console.log('─────────────────────────────────────────\n');
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const strategies = JSON.parse(jsonText);
    
    console.log('✅ Parsed Strategies:');
    console.log('Short length:', strategies.short?.length, 'chars');
    console.log('Neutral length:', strategies.neutral?.length, 'chars');
    console.log('Detailed length:', strategies.detailed?.length, 'chars');
    console.log('\n');
    
    return strategies;
  } catch (error) {
    console.error('❌ Gemini API error:', error);
    console.log('⚠️ Falling back to mock strategies\n');
    // Fallback to mock if AI fails
    return generateStrategiesMock(data);
  }
}

// OPTION 2: Mock strategy generation (fallback/demo without API key)
function generateStrategiesMock(data: {
  company_name: string;
  reporting_year: number;
  scope1_tco2e: number;
  scope2_tco2e: number;
  scope3_tco2e?: number;
}) {
  console.log('\n📝 Using Mock Strategy Generation');
  console.log('Company:', data.company_name);
  console.log('Emissions:', {
    scope1: data.scope1_tco2e,
    scope2: data.scope2_tco2e,
    scope3: data.scope3_tco2e
  });
  
  const total = data.scope1_tco2e + data.scope2_tco2e + (data.scope3_tco2e || 0);
  
  const strategies = {
    short: `${data.company_name} reported ${total.toFixed(2)} tCO₂e total emissions in ${data.reporting_year}. Focus on reducing Scope ${data.scope1_tco2e > data.scope2_tco2e ? '1' : '2'} emissions through energy efficiency improvements and renewable energy adoption.`,
    
    neutral: `For ${data.reporting_year}, ${data.company_name} recorded total emissions of ${total.toFixed(2)} tCO₂e, comprising ${data.scope1_tco2e.toFixed(2)} tCO₂e in Scope 1 and ${data.scope2_tco2e.toFixed(2)} tCO₂e in Scope 2${data.scope3_tco2e ? `, plus ${data.scope3_tco2e.toFixed(2)} tCO₂e in Scope 3` : ''}. To achieve meaningful reduction, we recommend implementing a phased approach: transitioning to renewable energy sources, optimizing operational efficiency, and engaging suppliers in sustainability initiatives. Setting science-based targets aligned with a 1.5°C pathway will demonstrate commitment to climate action.`,
    
    detailed: `## Comprehensive ESG Strategy for ${data.company_name} (${data.reporting_year})

**Current Emissions Profile:**
- Scope 1 (Direct): ${data.scope1_tco2e.toFixed(2)} tCO₂e (${((data.scope1_tco2e/total)*100).toFixed(1)}%)
- Scope 2 (Energy): ${data.scope2_tco2e.toFixed(2)} tCO₂e (${((data.scope2_tco2e/total)*100).toFixed(1)}%)
${data.scope3_tco2e ? `- Scope 3 (Value Chain): ${data.scope3_tco2e.toFixed(2)} tCO₂e (${((data.scope3_tco2e/total)*100).toFixed(1)}%)\n` : ''}- **Total: ${total.toFixed(2)} tCO₂e**

**Strategic Recommendations:**

1. **Immediate Actions (0-12 months):**
   - Conduct comprehensive energy audit of all facilities
   - Switch to 100% renewable energy procurement for purchased electricity
   - Implement LED lighting and HVAC optimization
   - Establish baseline metrics and monitoring systems

2. **Medium-term Initiatives (1-3 years):**
   - Invest in on-site renewable energy (solar panels, wind)
   - Electrify vehicle fleet and logistics operations
   - Engage top suppliers in emissions reduction programs
   - Achieve ISO 14001 environmental management certification

3. **Long-term Transformation (3-5 years):**
   - Set Science-Based Targets aligned with 1.5°C pathway
   - Achieve carbon neutrality through verified offsets
   - Integrate circular economy principles into product design
   - Publish annual sustainability reports with third-party verification

**Expected Impact:** These measures could reduce total emissions by 40-60% by ${data.reporting_year + 5}, positioning ${data.company_name} as an industry leader in climate action.`
  };
  
  console.log('✅ Mock strategies generated');
  console.log('Short length:', strategies.short.length, 'chars');
  console.log('Neutral length:', strategies.neutral.length, 'chars');
  console.log('Detailed length:', strategies.detailed.length, 'chars\n');
  
  return strategies;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.company_name || !body.reporting_year || 
        body.scope1_tco2e === undefined || body.scope2_tco2e === undefined) {
      return NextResponse.json(
        { error: 'Missing required ESG data' },
        { status: 400 }
      );
    }

    // Generate strategies using selected mode
    let strategies;
    if (STRATEGY_MODE === 'gemini' && genAI) {
      console.log('🤖 Using Google Gemini AI for strategy generation');
      strategies = await generateStrategiesWithAI(body);
    } else {
      console.log('📝 Using mock strategy generation (set GEMINI_API_KEY to use AI)');
      strategies = generateStrategiesMock(body);
    }
    
    return NextResponse.json({
      ...strategies,
      mode: STRATEGY_MODE, // Let frontend know which mode was used
    });
  } catch (error) {
    console.error('Error generating strategies:', error);
    return NextResponse.json(
      { error: 'Failed to generate strategies' },
      { status: 500 }
    );
  }
}
