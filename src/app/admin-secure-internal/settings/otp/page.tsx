'use client';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { ShieldCheck, Save, Loader2, Mail, Send, MessageSquare, Smartphone, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function OtpSettingsPage() {
  const { locale } = useTranslation();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Email Settings
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('');

  // Telegram Settings
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [botToken, setBotToken] = useState('');
  const [botUsername, setBotUsername] = useState('');

  const [customGatewayEnabled, setCustomGatewayEnabled] = useState(false);
  const [customGatewayUrl, setCustomGatewayUrl] = useState('');
  const [customGatewayToken, setCustomGatewayToken] = useState('');
  const [smsTemplate, setSmsTemplate] = useState('رمز التحقق الخاص بك هو: {otp} (صالح لمدة 5 دقائق)');

  // WhatsApp Gateway Settings
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [whatsappToken, setWhatsappToken] = useState('');
  const [whatsappTemplate, setWhatsappTemplate] = useState('رمز التحقق الخاص بك هو: {otp} (صالح لمدة 5 دقائق)');

  // Captcha Settings (Cloudflare Turnstile)
  const [captchaEnabled, setCaptchaEnabled] = useState(true);
  const [captchaSiteKey, setCaptchaSiteKey] = useState('');
  const [captchaSecretKey, setCaptchaSecretKey] = useState('');

  // General Auth Options
  const [allowPhoneSkip, setAllowPhoneSkip] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();

        if (data.success && data.settings) {
          const s = data.settings;
          setEmailEnabled(s.otp_email_enabled === 'true');
          setSmtpHost(s.otp_smtp_host || '');
          setSmtpPort(s.otp_smtp_port || '587');
          setSmtpUser(s.otp_smtp_user || '');
          setSmtpPass(s.otp_smtp_pass || '');
          setSmtpFrom(s.otp_smtp_from || '');

          setTelegramEnabled(s.otp_telegram_enabled === 'true');
          setBotToken(s.otp_telegram_bot_token || '');
          setBotUsername(s.otp_telegram_bot_username || '');

          setCustomGatewayEnabled(s.otp_custom_gateway_enabled === 'true');
          setCustomGatewayUrl(s.otp_custom_gateway_url || '');
          setCustomGatewayToken(s.otp_custom_gateway_token || '');
          setSmsTemplate(s.otp_sms_template || 'رمز التحقق الخاص بك هو: {otp} (صالح لمدة 5 دقائق)');

          setWhatsappEnabled(s.otp_whatsapp_enabled === 'true');
          setWhatsappUrl(s.otp_whatsapp_url || '');
          setWhatsappToken(s.otp_whatsapp_token || '');
          setWhatsappTemplate(s.otp_whatsapp_template || 'رمز التحقق الخاص بك هو: {otp} (صالح لمدة 5 دقائق)');

          setCaptchaEnabled(s.auth_captcha_enabled !== 'false');
          setCaptchaSiteKey(s.auth_captcha_site_key || '');
          setCaptchaSecretKey(s.auth_captcha_secret_key || '');

          setAllowPhoneSkip(s.auth_allow_phone_skip !== 'false');
        }
      } catch (error) {
        console.error('Failed to load OTP settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            otp_email_enabled: emailEnabled.toString(),
            otp_smtp_host: smtpHost,
            otp_smtp_port: smtpPort,
            otp_smtp_user: smtpUser,
            otp_smtp_pass: smtpPass,
            otp_smtp_from: smtpFrom,
            otp_telegram_enabled: telegramEnabled.toString(),
            otp_telegram_bot_token: botToken,
            otp_telegram_bot_username: botUsername,
            otp_custom_gateway_enabled: customGatewayEnabled.toString(),
            otp_custom_gateway_url: customGatewayUrl,
            otp_custom_gateway_token: customGatewayToken,
            otp_sms_template: smsTemplate,
            otp_whatsapp_enabled: whatsappEnabled.toString(),
            otp_whatsapp_url: whatsappUrl,
            otp_whatsapp_token: whatsappToken,
            otp_whatsapp_template: whatsappTemplate,
            auth_captcha_enabled: captchaEnabled.toString(),
            auth_captcha_site_key: captchaSiteKey,
            auth_captcha_secret_key: captchaSecretKey,
            auth_allow_phone_skip: allowPhoneSkip.toString(),
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          locale === 'ar' ? 'تم حفظ إعدادات الـ OTP بنجاح' : 'OTP settings saved successfully'
        );
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error(
        locale === 'ar' ? 'فشل حفظ الإعدادات' : 'Failed to save settings'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    const toastId = toast.loading(locale === 'ar' ? 'جاري فحص الاتصال بالخادم...' : 'Testing SMTP connection...');
    try {
      const res = await fetch('/api/admin/settings/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: smtpHost,
          port: smtpPort,
          user: smtpUser,
          pass: smtpPass,
          from: smtpFrom
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(locale === 'ar' ? 'نجاح! الاتصال يعمل وتم إرسال رسالة تجريبية للإيميل' : 'Success! Connection works and test email sent', { id: toastId });
      } else {
        toast.error(data.error || 'Failed to connect', { id: toastId });
      }
    } catch (error: any) {
      toast.error('Network Error: ' + error.message, { id: toastId });
    }
  };

  const handleTestSms = async () => {
    if (!customGatewayUrl) {
      toast.error(locale === 'ar' ? 'الرجاء إدخال رابط الـ Webhook أولاً' : 'Please enter the Webhook URL first');
      return;
    }
    const phone = window.prompt(locale === 'ar' ? 'أدخل رقم الهاتف لتجربة استلام الرسالة (بما في ذلك رمز الدولة، مثلاً +971501234567)' : 'Enter phone number to receive test SMS (e.g., +971501234567)');
    if (!phone) return;

    const toastId = toast.loading(locale === 'ar' ? 'جاري إرسال رسالة تجريبية...' : 'Sending test SMS...');
    try {
      const res = await fetch('/api/admin/settings/test-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: customGatewayUrl,
          token: customGatewayToken,
          template: smsTemplate,
          phone: phone
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(locale === 'ar' ? 'نجاح! تم إرسال الطلب لبوابة الهاتف' : 'Success! Request sent to SMS Gateway', { id: toastId });
      } else {
        toast.error(data.error || 'Failed to send SMS', { id: toastId });
      }
    } catch (error: any) {
      toast.error('Network Error: ' + error.message, { id: toastId });
    }
  };

  const handleTestTelegram = async () => {
    toast.info('سيتم إرسال رسالة تجريبية لتليجرام قريباً (قيد التطوير)');
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-brand" />
        <p className="text-sm font-semibold text-muted-foreground">
          {locale === 'ar' ? 'جاري تحميل إعدادات التوثيق...' : 'Loading Auth settings...'}
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div dir={dir} className="space-y-6 text-start max-w-5xl">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="h-6 w-6 text-brand" />
        <div>
          <h1 className="text-2xl font-black">
            {locale === 'ar' ? 'إعدادات الدخول والمصادقة (OTP)' : 'Auth & OTP Settings'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {locale === 'ar' 
              ? 'التحكم في بوابات الإرسال وخيارات التحقق من رقم الهاتف والإيميل' 
              : 'Manage delivery gateways and phone/email verification options'}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Auth Flow Options */}
        <Card className="card-surface">
          <CardHeader className="border-b pb-4 mb-4">
            <CardTitle className="text-lg font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand" />
                {locale === 'ar' ? 'حماية التسجيل والكابتشا (Captcha)' : 'Registration Security & Captcha'}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-muted-foreground hover:text-foreground">
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    {locale === 'ar' 
                      ? 'استخدام Cloudflare Turnstile المجاني لمنع البوتات والهجمات الوهمية لاستنزاف رسائل الـ OTP. لمزيد من المعلومات راجع ' 
                      : 'Use free Cloudflare Turnstile to prevent bots and OTP SMS bombing attacks. For more info, see '}
                    <a href="https://chariday.com/docs/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {locale === 'ar' ? 'التوثيقات' : 'docs'}
                    </a>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Switch 
                checked={captchaEnabled} 
                onCheckedChange={setCaptchaEnabled} 
                className="data-[state=checked]:bg-brand"
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">{locale === 'ar' ? 'Site Key (مفتاح الموقع)' : 'Site Key'}</label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="0x4A..."
                  value={captchaSiteKey}
                  onChange={(e) => setCaptchaSiteKey(e.target.value)}
                  className="w-full bg-surface border border-border/80 rounded-xl px-4 py-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">{locale === 'ar' ? 'Secret Key (المفتاح السري)' : 'Secret Key'}</label>
                <input
                  type="password"
                  dir="ltr"
                  placeholder="0x4A..."
                  value={captchaSecretKey}
                  onChange={(e) => setCaptchaSecretKey(e.target.value)}
                  className="w-full bg-surface border border-border/80 rounded-xl px-4 py-2"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border mt-4">
              <div>
                <p className="font-bold text-foreground">
                  {locale === 'ar' ? 'السماح بتخطي رقم الهاتف مؤقتاً' : 'Allow skipping phone number temporarily'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[80%]">
                  {locale === 'ar' 
                    ? 'في حال التفعيل، يمكن للمستخدم التسجيل بالإيميل وتأجيل تفعيل رقم الهاتف.' 
                    : 'If enabled, users can register with email and defer phone verification.'}
                </p>
              </div>
              <Switch 
                checked={allowPhoneSkip} 
                onCheckedChange={setAllowPhoneSkip} 
                className="data-[state=checked]:bg-brand"
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card className="card-surface">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500" />
                {locale === 'ar' ? 'إعدادات البريد الإلكتروني (Email OTP)' : 'Email OTP Settings'}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-muted-foreground hover:text-foreground">
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {locale === 'ar' ? 'إعدادات SMTP لإرسال الكود للبريد الإلكتروني.' : 'SMTP settings for sending email OTPs.'}
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </div>
            <Switch 
              checked={emailEnabled} 
              onCheckedChange={setEmailEnabled} 
              className="data-[state=checked]:bg-blue-500"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">{locale === 'ar' ? 'خادم SMTP' : 'SMTP Host'}</label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="smtp.resend.com"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full bg-surface border border-border/80 rounded-xl px-4 py-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">{locale === 'ar' ? 'المنفذ' : 'Port'}</label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="587"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  className="w-full bg-surface border border-border/80 rounded-xl px-4 py-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">{locale === 'ar' ? 'اسم المستخدم / API Key' : 'SMTP User'}</label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="resend"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  className="w-full bg-surface border border-border/80 rounded-xl px-4 py-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">{locale === 'ar' ? 'كلمة المرور' : 'SMTP Password'}</label>
                <input
                  type="password"
                  dir="ltr"
                  placeholder="re_..."
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  className="w-full bg-surface border border-border/80 rounded-xl px-4 py-2"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold">{locale === 'ar' ? 'الإيميل المُرسِل (From)' : 'From Email'}</label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="no-reply@chariday.com"
                  value={smtpFrom}
                  onChange={(e) => setSmtpFrom(e.target.value)}
                  className="w-full bg-surface border border-border/80 rounded-xl px-4 py-2"
                />
              </div>
            </div>
            {emailEnabled && (
              <Button variant="outline" onClick={handleTestEmail} className="mt-2 w-full md:w-auto text-blue-500 border-blue-200">
                <Send className="w-4 h-4 mx-2" />
                {locale === 'ar' ? 'إرسال إيميل تجريبي' : 'Send Test Email'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Telegram Settings */}
        <Card className="card-surface">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-500" />
                {locale === 'ar' ? 'إعدادات بوت تليجرام (Telegram OTP)' : 'Telegram Bot Settings'}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-muted-foreground hover:text-foreground">
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {locale === 'ar' ? 'مفتاح البوت لإرسال الـ OTP مجاناً لرقم الهاتف.' : 'Bot Token to send free phone OTP.'}
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </div>
            <Switch 
              checked={telegramEnabled} 
              onCheckedChange={setTelegramEnabled} 
              className="data-[state=checked]:bg-sky-500"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">{locale === 'ar' ? 'Bot Token' : 'Bot Token'}</label>
                <input
                  type="password"
                  dir="ltr"
                  placeholder="123456:ABC-DEF..."
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="w-full bg-surface border border-border/80 rounded-xl px-4 py-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">{locale === 'ar' ? 'معرف البوت (Username)' : 'Bot Username'}</label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="ChariDayBot"
                  value={botUsername}
                  onChange={(e) => setBotUsername(e.target.value)}
                  className="w-full bg-surface border border-border/80 rounded-xl px-4 py-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  بدون الـ @، يستخدم لبناء رابط t.me الخاص بالبوت
                </p>
              </div>
            </div>
            {telegramEnabled && (
              <Button variant="outline" onClick={handleTestTelegram} className="mt-2 w-full md:w-auto text-sky-500 border-sky-200">
                <Send className="w-4 h-4 mx-2" />
                {locale === 'ar' ? 'اختبار بوت تليجرام' : 'Test Telegram Bot'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Custom SMS Gateway Settings */}
        <Card className="card-surface">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-orange-500" />
                {locale === 'ar' ? 'البوابة المخصصة (Custom SMS/WhatsApp Gateway)' : 'Custom SMS/WhatsApp Gateway'}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-muted-foreground hover:text-foreground">
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    {locale === 'ar' ? 'ربط شريحة هاتفك الخاصة (Android) أو سيرفر واتساب لإرسال الرسائل محلياً. ' : 'Connect your own Android SIM or WhatsApp API to send local messages. '}
                    <a href="https://chariday.com/docs/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {locale === 'ar' ? 'اقرأ الدليل' : 'Read Guide'}
                    </a>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </div>
            <Switch 
              checked={customGatewayEnabled} 
              onCheckedChange={setCustomGatewayEnabled} 
              className="data-[state=checked]:bg-orange-500"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">{locale === 'ar' ? 'رابط الـ Webhook (API URL)' : 'Webhook API URL'}</label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="http://192.168.1.5:8080/v1/sms/send"
                  value={customGatewayUrl}
                  onChange={(e) => setCustomGatewayUrl(e.target.value)}
                  className="w-full bg-surface border border-border/80 rounded-xl px-4 py-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">{locale === 'ar' ? 'رمز المصادقة (Auth Token)' : 'Auth Token'}</label>
                <input
                  type="password"
                  dir="ltr"
                  placeholder="Bearer token or secret..."
                  value={customGatewayToken}
                  onChange={(e) => setCustomGatewayToken(e.target.value)}
                  className="w-full bg-surface border border-border/80 rounded-xl px-4 py-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {locale === 'ar' ? 'سيتم إرساله كـ Authorization Header (اختياري)' : 'Sent as Authorization Header (Optional)'}
                </p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold">{locale === 'ar' ? 'صيغة الرسالة (SMS Template)' : 'SMS Template'}</label>
                <textarea
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                  rows={2}
                  value={smsTemplate}
                  onChange={(e) => setSmsTemplate(e.target.value)}
                  className="w-full bg-surface border border-border/80 rounded-xl px-4 py-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {locale === 'ar' ? 'استخدم المتغير {otp} مكان الرمز. مثال: رمز التأكيد هو {otp}' : 'Use {otp} as a variable. Example: Your verification code is {otp}'}
                </p>
              </div>
            </div>
            {customGatewayEnabled && (
              <Button variant="outline" onClick={handleTestSms} className="mt-2 w-full md:w-auto text-orange-500 border-orange-200">
                <Send className="w-4 h-4 mx-2" />
                {locale === 'ar' ? 'اختبار بوابة SMS' : 'Test SMS Gateway'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* WhatsApp Gateway Settings */}
        <Card className="card-surface">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-500" />
                {locale === 'ar' ? 'بوابة الواتساب (WhatsApp Gateway)' : 'WhatsApp Gateway'}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-muted-foreground hover:text-foreground">
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    {locale === 'ar' ? 'ربط سيرفر n8n أو WhatsApp API الرسمي.' : 'Connect n8n server or official WhatsApp API.'}
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </div>
            <Switch 
              checked={whatsappEnabled} 
              onCheckedChange={setWhatsappEnabled} 
              className="data-[state=checked]:bg-green-500"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">{locale === 'ar' ? 'رابط الـ Webhook (API URL)' : 'Webhook API URL'}</label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="https://your-n8n.com/webhook/whatsapp"
                  value={whatsappUrl}
                  onChange={(e) => setWhatsappUrl(e.target.value)}
                  className="w-full bg-surface border border-border/80 rounded-xl px-4 py-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">{locale === 'ar' ? 'رمز المصادقة (Auth Token)' : 'Auth Token'}</label>
                <input
                  type="password"
                  dir="ltr"
                  placeholder="Bearer token or secret..."
                  value={whatsappToken}
                  onChange={(e) => setWhatsappToken(e.target.value)}
                  className="w-full bg-surface border border-border/80 rounded-xl px-4 py-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {locale === 'ar' ? 'سيتم إرساله كـ Authorization Header' : 'Sent as Authorization Header'}
                </p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold">{locale === 'ar' ? 'صيغة الرسالة (WhatsApp Template)' : 'WhatsApp Template'}</label>
                <textarea
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                  rows={2}
                  value={whatsappTemplate}
                  onChange={(e) => setWhatsappTemplate(e.target.value)}
                  className="w-full bg-surface border border-border/80 rounded-xl px-4 py-2"
                />
              </div>
            </div>
            {whatsappEnabled && (
              <Button variant="outline" onClick={() => toast.info('جاري إرسال طلب تجريبي للواتساب')} className="mt-2 w-full md:w-auto text-green-500 border-green-200">
                <Send className="w-4 h-4 mx-2" />
                {locale === 'ar' ? 'اختبار بوابة الواتساب' : 'Test WhatsApp Gateway'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pt-4 pb-12">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="gradient-brand text-navy font-bold gap-2 px-8"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
