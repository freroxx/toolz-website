import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// Target the open-source community tracker for Google Play Certified Devices
const GOOGLE_DEVICE_DATA_URL = 'https://raw.githubusercontent.com/androidtrackers/certified-android-devices/main/by_model.json';

export async function GET(request: NextRequest) {
  // 1. Secure the cron endpoint so public users can't spam it
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // 2. Fetch the upstream raw model mapping data
    const response = await fetch(GOOGLE_DEVICE_DATA_URL);
    if (!response.ok) throw new Error('Failed to fetch Google device index');
    
    const rawData = await response.json(); // Format: { "SM-S928B": [{ "brand": "Samsung", "name": "Galaxy S24 Ultra" }] }
    
    const optimizedPipeline = kv.pipeline();
    let optimizedCount = 0;

    // 3. Transform and strip down the raw payload 
    for (const [modelCode, devices] of Object.entries(rawData)) {
      if (Array.isArray(devices) && devices.length > 0) {
        const primaryDevice = devices[0];
        const marketingName = `${primaryDevice.brand} ${primaryDevice.name}`;
        
        // Key: "device:SM-S928B" -> Value: "Samsung Galaxy S24 Ultra"
        optimizedPipeline.set(`device:${modelCode.toLowerCase().trim()}`, marketingName);
        optimizedCount++;
      }
    }

    // 4. Atomically commit the dictionary batch to Redis memory storage
    await optimizedPipeline.exec();

    return NextResponse.json({ 
      success: true, 
      message: `Successfully sync'd ${optimizedCount} Android device definitions.` 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
