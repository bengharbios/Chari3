import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createLedgerEntry } from '@/lib/ledger';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

    if (lines.length < 2) {
      return NextResponse.json({ success: false, error: 'File is empty or missing headers' }, { status: 400 });
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const requiredHeaders = ['TrackingNumber', 'Status', 'DeliveredAt', 'CodCollected', 'CarrierReference'];
    
    for (const reqHeader of requiredHeaders) {
      if (!headers.includes(reqHeader)) {
        return NextResponse.json({ 
          success: false, 
          error: `Missing required column: ${reqHeader}`,
          errors: [`Found headers: ${headers.join(', ')}`]
        }, { status: 400 });
      }
    }

    const colIdx = {
      tracking: headers.indexOf('TrackingNumber'),
      status: headers.indexOf('Status'),
      deliveredAt: headers.indexOf('DeliveredAt'),
      cod: headers.indexOf('CodCollected'),
      ref: headers.indexOf('CarrierReference'),
    };

    const parsedRows = [];
    const errors: string[] = [];

    // STRICT VALIDATION
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(c => c.trim());
      if (row.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch (expected ${headers.length}, got ${row.length})`);
        continue;
      }

      const tracking = row[colIdx.tracking];
      const status = row[colIdx.status].toUpperCase();
      const cod = parseFloat(row[colIdx.cod]);
      const ref = row[colIdx.ref];

      if (!tracking) errors.push(`Row ${i + 1}: TrackingNumber is empty`);
      if (!['DELIVERED', 'RETURNED', 'FAILED'].includes(status)) errors.push(`Row ${i + 1}: Invalid Status '${status}'`);
      if (isNaN(cod) || cod < 0) errors.push(`Row ${i + 1}: Invalid CodCollected`);
      if (!ref) errors.push(`Row ${i + 1}: CarrierReference is empty`);

      parsedRows.push({ tracking, status, cod, ref });
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Strict validation failed. Please fix the errors and try again.',
        errors 
      }, { status: 400 });
    }

    // Process valid rows
    let processedCount = 0;

    for (const row of parsedRows) {
      const shipment = await db.shipment.findUnique({
        where: { trackingNumber: row.tracking },
        include: { order: true }
      });

      if (!shipment) {
        errors.push(`Row for ${row.tracking}: Shipment not found in system`);
        continue; // Or fail entire batch, but usually ignoring unmatched ones is better. We'll skip for now.
      }

      const order = shipment.order;
      if (!order) continue;

      // Update statuses and ledger
      if (row.status === 'DELIVERED') {
        await db.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: { status: 'delivered', logisticsStage: 'delivered' }
          });
          
          await tx.shipment.update({
            where: { id: shipment.id },
            data: { status: 'delivered' }
          });

          // Payout logic (Seller earns COD - shipping fee - platform fee)
          // For simplicity, we just credit the COD amount as a placeholder for the seller's wallet
          await createLedgerEntry({
            userId: order.userId,
            amount: row.cod,
            type: 'credit',
            status: 'pending_clearance',
            description: `Order Sale (3PL Settlement: ${row.ref})`,
            referenceNumber: `3PL_${row.tracking}_DELIVERED`,
            orderId: order.id
          });
        });
        processedCount++;
      } else if (row.status === 'RETURNED' || row.status === 'FAILED') {
        await db.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: { status: 'returned', logisticsStage: 'returned' }
          });
          await tx.shipment.update({
            where: { id: shipment.id },
            data: { status: 'returned' }
          });
          // Reversal logic would go here if they were previously paid, 
          // but since they weren't delivered before, no reversal is strictly needed unless it was prepaid.
        });
        processedCount++;
      }
    }

    if (errors.length > 0 && processedCount === 0) {
       return NextResponse.json({ 
        success: false, 
        error: 'All rows failed business logic validation.',
        errors 
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, processedCount, errors: errors.length > 0 ? errors : undefined });
  } catch (error: any) {
    console.error('Error processing 3PL CSV:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
