import { auth } from '@/lib/better-auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/chat/messages?roomId=...
// Fetches message history for a specific room and marks unread messages as read
export async function GET(req: NextRequest) {
  try {
    await ensureDbConnection();
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json({ success: false, error: 'Room ID is required' }, { status: 400 });
    }

    const currentUserId = session.user.id;

    // Verify room existence and that current user is a participant
    const room = await db.chatRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ success: false, error: 'Chat room not found' }, { status: 404 });
    }

    if (room.buyerId !== currentUserId && room.sellerId !== currentUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized participant' }, { status: 403 });
    }

    // Mark messages sent by the other user as read
    await db.chatMessage.updateMany({
      where: {
        roomId,
        senderId: { not: currentUserId },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    // Fetch messages
    const messages = await db.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/chat/messages
// Sends a new message in a room with profanity filtering
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
    const { roomId, content } = body;

    if (!roomId || !content?.trim()) {
      return NextResponse.json({ success: false, error: 'Room ID and message content are required' }, { status: 400 });
    }

    const currentUserId = session.user.id;

    // Verify room existence and that current user is a participant
    const room = await db.chatRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ success: false, error: 'Chat room not found' }, { status: 404 });
    }

    if (room.buyerId !== currentUserId && room.sellerId !== currentUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized participant' }, { status: 403 });
    }

    // Profanity / Blacklist Filter
    const blacklistSetting = await db.systemSetting.findUnique({
      where: { key: 'chat_blacklist' },
    });
    const blacklistRaw = blacklistSetting ? blacklistSetting.value : '';
    const blacklist = blacklistRaw ? blacklistRaw.split(',').map((w) => w.trim().toLowerCase()).filter(Boolean) : [];

    let isFlagged = false;
    let flaggedReason = null;
    const lowerContent = content.toLowerCase();

    const matchedWords = blacklist.filter((word) => lowerContent.includes(word));

    if (matchedWords.length > 0) {
      isFlagged = true;
      flaggedReason = `Contains blacklisted words: ${matchedWords.join(', ')}`;
      
      return NextResponse.json({
        success: false,
        error: 'Message contains prohibited language / تحتوي الرسالة على كلمات غير لائقة محظورة',
        code: 'PROFANITY_BLOCKED',
        matchedWords
      }, { status: 400 });
    }

    // Create message
    const message = await db.chatMessage.create({
      data: {
        roomId,
        senderId: currentUserId,
        content: content.trim(),
        isFlagged,
        flaggedReason,
      },
    });

    // Update room's last message cache and updatedAt timestamp
    await db.chatRoom.update({
      where: { id: roomId },
      data: {
        lastMessage: content.trim(),
        lastMessageAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
