import { NextResponse } from 'next/server';
import { seedReviewData } from '@/lib/seed';

/**
 * POST /api/admin/seed
 * Seeds the database with demo users and verification records.
 * Call this once to populate the admin review queue.
 */
export async function POST() {
  try {
    await seedReviewData();
    return NextResponse.json({ success: true, message: 'Seed data created successfully' });
  } catch (error) {
    console.error('[POST /api/admin/seed]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed data' },
      { status: 500 }
    );
  }
}
