import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 1. Create or Find Country
    let country = await db.country.findUnique({
      where: { code: 'DZ' }
    });
    
    if (!country) {
      country = await db.country.create({
        data: {
          code: 'DZ',
          nameAr: 'الجزائر',
          nameEn: 'Algeria',
          currency: 'DZD',
          phonePrefix: '+213',
          isActive: true
        }
      });
    }

    // 2. Fetch JSON from GitHub
    const res = await fetch('https://raw.githubusercontent.com/S450R1/algeria-cities-2025/main/json/cities.json');
    if (!res.ok) {
      return NextResponse.json({ success: false, error: 'Failed to fetch cities from Github' }, { status: 500 });
    }
    const data = await res.json();
    
    const wilayas = data.wilayas || [];
    const communes = data.communes || [];

    // 3. Seed States (Wilayas)
    // We will keep a map of stateCode -> stateId
    const stateMap = new Map<string, string>();
    
    for (const w of wilayas) {
      const code = String(w.wilaya_id);
      let state = await db.state.findFirst({
        where: { code, countryId: country.id }
      });
      
      const defaultPrice = w.wilaya_id > 48 ? 800 : 500; // Reasonable shipping cost default
      
      if (!state) {
        state = await db.state.create({
          data: {
            code,
            nameAr: w.wilaya_name_arabic,
            nameEn: w.wilaya_name_latin,
            defaultPrice,
            isActive: true,
            countryId: country.id
          }
        });
      } else {
        // Update names just in case
        state = await db.state.update({
          where: { id: state.id },
          data: {
            nameAr: w.wilaya_name_arabic,
            nameEn: w.wilaya_name_latin
          }
        });
      }
      stateMap.set(code, state.id);
    }

    // 4. Seed Cities (Communes) in batches
    const existingCities = await db.city.findMany({
      select: { nameAr: true, stateId: true }
    });
    
    const existingSet = new Set(
      existingCities.map(c => `${c.stateId}_${c.nameAr}`)
    );

    const citiesToCreate: { nameAr: string; nameEn: string; stateId: string; isActive: boolean }[] = [];
    
    for (const c of communes) {
      const stateId = stateMap.get(String(c.wilaya_id));
      if (!stateId) continue;
      
      const key = `${stateId}_${c.commune_name_arabic}`;
      if (!existingSet.has(key)) {
        citiesToCreate.push({
          nameAr: c.commune_name_arabic,
          nameEn: c.commune_name_latin,
          stateId,
          isActive: true
        });
      }
    }

    // Create cities in chunks of 100
    const chunkSize = 100;
    let createdCount = 0;
    for (let i = 0; i < citiesToCreate.length; i += chunkSize) {
      const chunk = citiesToCreate.slice(i, i + chunkSize);
      await db.city.createMany({
        data: chunk
      });
      createdCount += chunk.length;
    }

    return NextResponse.json({
      success: true,
      message: 'Algeria administrative data seeded successfully',
      stats: {
        totalWilayas: wilayas.length,
        totalCommunes: communes.length,
        newCitiesCreated: createdCount
      }
    });
  } catch (error) {
    console.error('[seed-algeria GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
