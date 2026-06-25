import { auth } from '@/lib/better-auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/chat/rooms
// Fetches all active chat rooms for the logged-in user
export async function GET(req: NextRequest) {
  try {
    await ensureDbConnection();
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if chat is enabled globally
    const chatEnabledSetting = await db.systemSetting.findUnique({
      where: { key: 'chat_enabled' },
    });
    const chatEnabled = chatEnabledSetting ? chatEnabledSetting.value === 'true' : true;
    if (!chatEnabled) {
      return NextResponse.json({ success: false, error: 'Chat is disabled by administrator', data: [] });
    }

    // Fetch rooms where the user is either the buyer or the seller
    const rooms = await db.chatRoom.findMany({
      where: {
        isActive: true,
        OR: [
          { buyerId: userId },
          { sellerId: userId },
        ],
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: rooms });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/chat/rooms
// Creates a new chat room or returns an existing one
export async function POST(req: NextRequest) {
  try {
    await ensureDbConnection();
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check if chat is enabled globally
    const chatEnabledSetting = await db.systemSetting.findUnique({
      where: { key: 'chat_enabled' },
    });
    const chatEnabled = chatEnabledSetting ? chatEnabledSetting.value === 'true' : true;
    if (!chatEnabled) {
      return NextResponse.json({ success: false, error: 'Chat is disabled by administrator' }, { status: 403 });
    }

    const body = await req.json();
    const { recipientId } = body;

    if (!recipientId) {
      return NextResponse.json({ success: false, error: 'Recipient ID is required' }, { status: 400 });
    }

    const currentUserId = session.user.id;

    if (currentUserId === recipientId) {
      return NextResponse.json({ success: false, error: 'Cannot chat with yourself' }, { status: 400 });
    }

    // Fetch recipient to verify role
    const recipient = await db.user.findUnique({
      where: { id: recipientId },
      select: { id: true, role: true },
    });

    if (!recipient) {
      return NextResponse.json({ success: false, error: 'Recipient not found' }, { status: 404 });
    }

    // Determine who is buyer and who is seller
    let buyerId: string;
    let sellerId: string;

    const currentUserRole = session.user.role;

    if (currentUserRole === 'buyer') {
      buyerId = currentUserId;
      sellerId = recipientId;
    } else if (recipient.role === 'buyer') {
      buyerId = recipientId;
      sellerId = currentUserId;
    } else {
      // Default fallback: assume current user is buyer, recipient is seller
      buyerId = currentUserId;
      sellerId = recipientId;
    }

    // Check if room already exists
    let room = await db.chatRoom.findUnique({
      where: {
        buyerId_sellerId: {
          buyerId,
          sellerId,
        },
      },
      include: {
        buyer: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        seller: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    // If not, create a new one
    if (!room) {
      room = await db.chatRoom.create({
        data: {
          buyerId,
          sellerId,
          lastMessage: 'بدء محادثة جديدة',
          lastMessageAt: new Date(),
        },
        include: {
          buyer: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          seller: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      });
    } else if (!room.isActive) {
      // Reactivate room if it was deactivated
      room = await db.chatRoom.update({
        where: { id: room.id },
        data: { isActive: true },
        include: {
          buyer: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          seller: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      });
    }

    return NextResponse.json({ success: true, data: room });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
