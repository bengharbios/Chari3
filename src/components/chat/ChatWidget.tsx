'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { 
  MessageCircle, X, Send, ArrowLeft, ArrowRight, 
  Loader2, Lock, Check, CheckCheck, MessageSquare 
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ChatWidgetProps {
  storeSellerId?: string;
  storeName?: string;
}

interface ChatRoom {
  id: string;
  buyerId: string;
  sellerId: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  buyer: {
    id: string;
    name: string;
    avatar: string | null;
  };
  seller: {
    id: string;
    name: string;
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

export default function ChatWidget({ storeSellerId, storeName }: ChatWidgetProps) {
  const { locale } = useAppStore();
  const { user, isAuthenticated } = useAuthStore();
  const isAr = locale === 'ar';
  const t = (ar: string, en: string) => isAr ? ar : en;

  const [isOpen, setIsOpen] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isInitializingRoom, setIsInitializingRoom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if chat is enabled on mount
  useEffect(() => {
    fetch('/api/admin/chat-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setChatEnabled(data.chatEnabled);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch rooms when widget is opened & authenticated
  const fetchRooms = async (silent = false) => {
    if (!isAuthenticated) return;
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

  useEffect(() => {
    if (isOpen && isAuthenticated && chatEnabled) {
      fetchRooms();
      const interval = setInterval(() => {
        fetchRooms(true);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [isOpen, isAuthenticated, chatEnabled]);

  // Fetch active room messages and poll
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

  useEffect(() => {
    if (!activeRoom || !isOpen) return;

    fetchMessages(activeRoom.id);

    const interval = setInterval(() => {
      fetchMessages(activeRoom.id, true);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeRoom, isOpen]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize chat with the current store owner
  const handleStartStoreChat = async () => {
    if (!storeSellerId) return;
    setIsInitializingRoom(true);
    try {
      const res = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: storeSellerId }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveRoom(data.data);
      } else {
        toast.error(data.error || t('فشل بدء المحادثة', 'Failed to start chat'));
      }
    } catch (err) {
      console.error(err);
      toast.error(t('حدث خطأ أثناء بدء المحادثة', 'Error starting chat'));
    } finally {
      setIsInitializingRoom(false);
    }
  };

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
        setMessages((prev) => [...prev, data.data]);
        fetchRooms(true);
      } else {
        if (data.code === 'PROFANITY_BLOCKED') {
          toast.error(
            t(
              '⚠️ تم حجب رسالتك لاحتوائها على كلمات غير لائقة محظورة!',
              '⚠️ Your message was blocked for containing prohibited language!'
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

  if (!chatEnabled) return null;

  return (
    <div className="fixed bottom-6 end-6 z-[var(--z-modal)] flex flex-col items-end" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[380px] h-[500px] bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl flex flex-col mb-4 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              {activeRoom && (
                <button 
                  onClick={() => setActiveRoom(null)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors me-1"
                  title={t('رجوع للقائمة', 'Back to list')}
                >
                  {isAr ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}
                </button>
              )}
              <Avatar className="size-8 border border-white/25">
                <AvatarFallback className="bg-white/20 text-white font-bold text-xs">
                  {activeRoom 
                    ? activeRoom.seller?.name?.charAt(0) 
                    : (storeName ? storeName.charAt(0) : 'M')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-bold text-xs">
                  {activeRoom 
                    ? activeRoom.seller?.name 
                    : (storeName ? t(`محادثة ${storeName}`, `Chat with ${storeName}`) : t('رسائلي الخاصة', 'My Messages'))}
                </h4>
                <p className="text-[10px] opacity-75">
                  {activeRoom ? t('نشط الآن', 'Active now') : t('تواصل آمن وسريع', 'Secure & instant')}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="size-4.5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 flex flex-col min-h-0 bg-muted/5">
            
            {/* 1. NOT AUTHENTICATED STATE */}
            {!isAuthenticated ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                <Lock className="size-10 text-muted-foreground/40 mb-3" />
                <h4 className="font-bold text-xs text-foreground mb-1">
                  {t('تسجيل الدخول مطلوب للمراسلة', 'Sign In Required')}
                </h4>
                <p className="text-[11px] max-w-[240px] leading-relaxed mb-4">
                  {t(
                    'يرجى تسجيل الدخول لحسابك لتتمكن من التحدث مباشرة مع التجار وإتمام طلباتك.',
                    'Please sign in to chat directly with merchants and coordinate your orders.'
                  )}
                </p>
                <Button 
                  size="sm" 
                  className="font-bold text-xs px-6 bg-primary text-primary-foreground"
                  onClick={() => {
                    setIsOpen(false);
                    useAppStore.getState().setCurrentPage('login');
                  }}
                >
                  {t('سجل الدخول الآن', 'Sign In Now')}
                </Button>
              </div>
            ) : activeRoom ? (
              
              /* 2. ACTIVE CHAT ROOM SCREEN */
              <>
                {/* Messages list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {isLoadingMessages && messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="size-6 animate-spin text-primary" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
                      <MessageCircle className="size-8 text-muted-foreground/30 mb-2" />
                      <p className="text-[11px] font-semibold">{t('ابدأ المحادثة الآن!', 'Start the conversation now!')}</p>
                      <p className="text-[10px] text-center max-w-[200px] mt-0.5">{t('اكتب استفسارك وسيقوم البائع بالرد عليك.', 'Type your inquiry and the seller will respond.')}</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.senderId === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex w-full items-end gap-1.5 max-w-[85%]",
                            isOwn ? "ms-auto flex-row-reverse" : "me-auto flex-row"
                          )}
                        >
                          <div className="space-y-1">
                            <div
                              className={cn(
                                "p-2.5 rounded-2xl text-xs font-medium shadow-sm border leading-relaxed break-words",
                                isOwn
                                  ? "bg-primary text-primary-foreground border-primary rounded-ee-none"
                                  : "bg-surface text-foreground border-border rounded-es-none"
                              )}
                            >
                              {msg.content}
                            </div>
                            <div className={cn("flex items-center gap-1 text-[8px] text-muted-foreground px-1 justify-end", isOwn ? "flex-row-reverse" : "flex-row")}>
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isOwn && (
                                msg.isRead ? (
                                  <CheckCheck className="size-2.5 text-primary" />
                                ) : (
                                  <Check className="size-2.5 text-muted-foreground/50" />
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

                {/* Send Input Panel */}
                <form onSubmit={handleSendMessage} className="p-2 border-t border-border flex items-center gap-1.5 bg-background">
                  <Input
                    placeholder={t('اكتب استفسارك هنا...', 'Type your question here...')}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 h-9 text-xs border rounded-full px-3.5 focus-visible:ring-primary bg-muted/5"
                    disabled={isSending}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!inputText.trim() || isSending}
                    className="rounded-full h-9 w-9 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow"
                  >
                    {isSending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                  </Button>
                </form>
              </>
            ) : (
              
              /* 3. ROOMS LIST SCREEN */
              <div className="flex-1 flex flex-col min-h-0">
                {/* Store owner shortcut banner if browsing a store */}
                {storeSellerId && storeSellerId !== user?.id && (
                  <div className="p-3.5 bg-primary/5 border-b border-primary/10 flex flex-col gap-2 items-center text-center shrink-0">
                    <p className="text-[11px] font-bold text-foreground">
                      {t(`هل لديك استفسار بخصوص منتجات ${storeName || 'هذا المتجر'}؟`, `Have questions about ${storeName || 'this store'}'s products?`)}
                    </p>
                    <Button
                      size="sm"
                      onClick={handleStartStoreChat}
                      disabled={isInitializingRoom}
                      className="font-bold text-[10px] h-7 px-4 bg-primary text-primary-foreground shadow-sm"
                    >
                      {isInitializingRoom ? (
                        <>
                          <Loader2 className="size-3 mr-1.5 animate-spin" />
                          {t('جاري التوصيل...', 'Connecting...')}
                        </>
                      ) : (
                        <>
                          <MessageSquare className="size-3.5 mr-1.5 rtl:ml-1.5" />
                          {t('تحدث مع البائع الآن', 'Chat with Seller Now')}
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* List of past conversations */}
                <div className="flex-1 overflow-y-auto divide-y divide-border/40">
                  <div className="p-3 text-[10px] font-bold text-muted-foreground bg-muted/15 uppercase tracking-wider sticky top-0 z-10 border-b border-border/20">
                    {t('المحادثات السابقة', 'Previous Conversations')}
                  </div>
                  
                  {isLoadingRooms && rooms.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                      <Loader2 className="size-5 animate-spin text-primary mb-1.5" />
                      <span className="text-[10px]">{t('جاري تحميل المحادثات...', 'Loading conversations...')}</span>
                    </div>
                  ) : rooms.length === 0 ? (
                    <div className="py-16 px-6 text-center text-muted-foreground">
                      <MessageSquare className="size-7 mx-auto mb-2 text-muted-foreground/30" />
                      <p className="text-xs font-semibold">{t('لا توجد محادثات سابقة', 'No chats found')}</p>
                      <p className="text-[10px] mt-1">
                        {storeSellerId 
                          ? t('انقر على الزر العلوي لبدء محادثة فورية.', 'Click the button above to start chatting.')
                          : t('تصفح المتاجر للتواصل المباشر مع البائعين.', 'Browse stores to contact sellers directly.')}
                      </p>
                    </div>
                  ) : (
                    rooms.map((room) => {
                      const sellerName = room.seller?.name || t('تاجر شاري داي', 'CharyDay Merchant');
                      const initials = sellerName.charAt(0);
                      
                      return (
                        <button
                          key={room.id}
                          onClick={() => setActiveRoom(room)}
                          className="w-full p-3.5 flex items-start gap-3 transition-colors text-start hover:bg-muted/30"
                        >
                          <Avatar className="size-9 border">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                              <h4 className="font-bold text-[11px] truncate text-foreground">{sellerName}</h4>
                              {room.lastMessageAt && (
                                <span className="text-[8px] text-muted-foreground">
                                  {new Date(room.lastMessageAt).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate leading-relaxed">
                              {room.lastMessage || t('لا توجد رسائل', 'No messages')}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 border border-white/10",
          isOpen ? "rotate-90 bg-slate-800 dark:bg-slate-900 hover:bg-slate-800" : ""
        )}
        title={t('تواصل مع البائعين', 'Contact Sellers')}
      >
        {isOpen ? (
          <X className="size-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="size-6" />
          </div>
        )}
      </button>
    </div>
  );
}
