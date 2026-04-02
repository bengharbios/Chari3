import { NextResponse } from 'next/server';

export async function GET() {
  const analytics = {
    totalRevenue: 284750,
    totalOrders: 1234,
    totalProducts: 567,
    totalUsers: 8901,
    revenueChange: 12.5,
    ordersChange: 8.3,
    productsChange: -2.1,
    usersChange: 15.7,
    revenueByMonth: [
      { month: 'يناير', revenue: 18500 },
      { month: 'فبراير', revenue: 22300 },
      { month: 'مارس', revenue: 28400 },
      { month: 'أبريل', revenue: 25600 },
      { month: 'مايو', revenue: 31200 },
      { month: 'يونيو', revenue: 29800 },
      { month: 'يوليو', revenue: 34500 },
      { month: 'أغسطس', revenue: 32100 },
      { month: 'سبتمبر', revenue: 27800 },
      { month: 'أكتوبر', revenue: 35200 },
      { month: 'نوفمبر', revenue: 38900 },
      { month: 'ديسمبر', revenue: 42500 },
    ],
    ordersByStatus: [
      { status: 'pending', count: 45 },
      { status: 'confirmed', count: 32 },
      { status: 'processing', count: 78 },
      { status: 'shipped', count: 156 },
      { status: 'delivered', count: 890 },
      { status: 'cancelled', count: 23 },
      { status: 'returned', count: 10 },
    ],
  };

  return NextResponse.json(analytics);
}
