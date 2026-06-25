'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { 
  MessageSquare, Send, Check, CheckCheck, Loader2, 
  Search, ShieldAlert 
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ChatRoom {
  id: string;
  buyerId: string;
  sellerId: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  buyer: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  seller: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export default function SellerChatTab() {
  const { locale } = useAppStore();
  const { user } = useAuthStore();
  const isAr = locale === 'ar';
  const t = (ar: string, en: string) => isAr ? ar : en;

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all chat rooms
  const fetchRooms = async (silent = false) => {
    if (!silent) setIsLoadingRooms(true);
    try {
      const res = await fetch('/api/chat/rooms');
      const data = await res.json();
      if (data.success) {
        setRooms(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setIsLoadingRooms(false);
    }
  };

  // Fetch messages for active room
  const fetchMessages = async (roomId: string, silent = false) => {
    if (!silent) setIsLoadingMessages(true);
    try {
      const res = await fetch(`/api/chat/messages?roomId=${roomId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setIsLoadingMessages(false);
    }
  };

  // Poll for rooms and active room messages
  useEffect(() => {
    fetchRooms();
    const interval = setInterval(() => {
      fetchRooms(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeRoom) return;

    fetchMessages(activeRoom.id);

    // Poll active room messages every 3 seconds for fast real-time chat feeling
    const interval = setInterval(() => {
      fetchMessages(activeRoom.id, true);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeRoom]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRoom || isSending) return;

    const messageContent = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: activeRoom.id,
          content: messageContent,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Append locally immediately for speed
        setMessages((prev) => [...prev, data.data]);
        fetchRooms(true);
      } else {
        if (data.code === 'PROFANITY_BLOCKED') {
          toast.error(
            t(
              '⚠️ عذراً، تم حجب الرسالة لاحتوائها على كلمات غير لائقة محظورة!',
              '⚠️ Sorry, message blocked because it contains prohibited language!'
            )
          );
        } else {
          toast.error(data.error || t('فشل إرسال الرسالة', 'Failed to send message'));
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(t('حدث خطأ أثناء الإرسال', 'Error sending message'));
    } finally {
      setIsSending(false);
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const buyerName = room.buyer?.name || '';
    return buyerName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-[calc(100vh-220px)] min-h-[500px] border border-border bg-background/50 backdrop-blur-xl rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Sidebar - Rooms list */}
      <div className="w-full md:w-80 border-e border-border flex flex-col h-full bg-muted/10 shrink-0">
        {/* Search header */}
        <div className="p-4 border-b border-border space-y-3 bg-background/30">
          <h3 className="font-black text-sm text-foreground flex items-center gap-2">
            <MessageSquare className="size-4 text-primary" />
            {t('محادثات العملاء', 'Customer Chats')}
          </h3>
          <div className="relative">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 size-4 text-muted-foreground" />
            <Input
              placeholder={t('البحث عن عميل...', 'Search customer...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9 text-xs h-9 bg-background/80"
            />
          </div>
        </div>

        {/* Rooms Scroll Area */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/40">
          {isLoadingRooms && rooms.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-primary mb-2" />
              <span className="text-xs">{t('جاري تحميل المحادثات...', 'Loading chats...')}</span>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="py-12 px-4 text-center text-muted-foreground">
              <MessageSquare className="size-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-xs font-semibold">{t('لا توجد محادثات نشطة', 'No active chats')}</p>
              <p className="text-[10px] mt-1">{t('سوف تظهر رسائل العملاء هنا بمجرد مراسلتك.', 'Customer messages will appear here once they text you.')}</p>
            </div>
          ) : (
            filteredRooms.map((room) => {
              const isSelected = activeRoom?.id === room.id;
              const displayName = room.buyer?.name || t('عميل شاري داي', 'CharyDay Customer');
              const initials = displayName.charAt(0);
              
              return (
                <button
                  key={room.id}
                  onClick={() => setActiveRoom(room)}
                  className={cn(
                    "w-full p-4 flex items-start gap-3 transition-all text-start hover:bg-muted/35",
                    isSelected ? "bg-primary/5 border-s-4 border-primary hover:bg-primary/5" : ""
                  )}
                >
                  <Avatar className="size-10 border shadow-sm">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-xs truncate text-foreground">{displayName}</h4>
                      {room.lastMessageAt && (
                        <span className="text-[9px] text-muted-foreground">
                          {new Date(room.lastMessageAt).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate leading-relaxed">
                      {room.lastMessage || t('لا توجد رسائل بعد', 'No messages yet')}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main chat window */}
      <div className="flex-1 flex flex-col h-full bg-background">
        {activeRoom ? (
          <>
            {/* Active Room Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/5">
              <div className="flex items-center gap-3">
                <Avatar className="size-9 border">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    {activeRoom.buyer?.name?.charAt(0) || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-xs text-foreground">
                    {activeRoom.buyer?.name || t('عميل شاري داي', 'CharyDay Customer')}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">{activeRoom.buyer?.email}</p>
                </div>
              </div>
            </div>

            {/* Messages Pane */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/5">
              {isLoadingMessages && messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="size-6 animate-spin text-primary" />
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex w-full items-end gap-2 max-w-[85%]",
                        isOwn ? "ms-auto flex-row-reverse" : "me-auto flex-row"
                      )}
                    >
                      {/* Avatar */}
                      {!isOwn && (
                        <Avatar className="size-7 shrink-0 border">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
                            {activeRoom.buyer?.name?.charAt(0) || 'C'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      {/* Bubble */}
                      <div className="space-y-1">
                        <div
                          className={cn(
                            "p-3 rounded-2xl text-xs font-medium shadow-sm border leading-relaxed break-words",
                            isOwn
                              ? "bg-primary text-primary-foreground border-primary rounded-ee-none"
                              : "bg-surface text-foreground border-border rounded-es-none"
                          )}
                        >
                          {msg.content}
                        </div>
                        <div className={cn("flex items-center gap-1 text-[9px] text-muted-foreground px-1 justify-end", isOwn ? "flex-row-reverse" : "flex-row")}>
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isOwn && (
                            msg.isRead ? (
                              <CheckCheck className="size-3 text-primary" />
                            ) : (
                              <Check className="size-3 text-muted-foreground/60" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-border flex items-center gap-2 bg-background">
              <Input
                placeholder={t('اكتب رسالة هنا...', 'Type a message here...')}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 h-10 text-xs border rounded-full px-4 focus-visible:ring-primary bg-muted/10"
                disabled={isSending}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputText.trim() || isSending}
                className="rounded-full h-10 w-10 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              >
                {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </Button>
            </form>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-muted-foreground">
            <div className="p-4 bg-muted/40 rounded-full mb-3 text-primary/70">
              <MessageSquare className="size-8" />
            </div>
            <h4 className="font-black text-sm text-foreground mb-1">{t('مراسلات المتجر والعملاء', 'Store Messaging')}</h4>
            <p className="text-xs text-center max-w-sm leading-normal">
              {t(
                'اختر محادثة من القائمة الجانبية للتواصل المباشر والآمن مع العملاء والرد على استفساراتهم.',
                'Select a conversation from the sidebar to chat directly and securely with customers and answer their inquiries.'
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
