const fs = require('fs');
const path = require('path');

function patchTranslation(locale, newData) {
  const filePath = path.join(__dirname, 'src', 'lib', 'i18n', 'dictionaries', `${locale}.json`);
  let content = fs.readFileSync(filePath, 'utf8');
  let data = JSON.parse(content);
  data['security'] = newData;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`${locale}.json patched`);
}

patchTranslation('ar', {
  "section_title": "الأمان والدخول",
  "auth_logs": "سجلات المصادقة",
  "ban_list": "قائمة الحظر",
  "ban_types": {
    "ip": "عنوان IP",
    "phone": "رقم الهاتف",
    "email": "البريد الإلكتروني",
    "device": "الجهاز",
    "country": "الدولة"
  },
  "ban_duration": {
    "1h": "ساعة واحدة",
    "24h": "24 ساعة",
    "1w": "أسبوع",
    "1m": "شهر",
    "custom": "تاريخ مخصص",
    "permanent": "حظر دائم"
  },
  "statuses": {
    "active": "نشط",
    "expired": "منتهي",
    "pending": "قيد الانتظار",
    "verified": "تم التحقق",
    "registered": "مسجل",
    "failed": "فشل",
    "banned": "محظور"
  }
});

patchTranslation('en', {
  "section_title": "Security & Access",
  "auth_logs": "Auth Logs",
  "ban_list": "Ban List",
  "ban_types": {
    "ip": "IP Address",
    "phone": "Phone Number",
    "email": "Email Address",
    "device": "Device",
    "country": "Country"
  },
  "ban_duration": {
    "1h": "1 Hour",
    "24h": "24 Hours",
    "1w": "1 Week",
    "1m": "1 Month",
    "custom": "Custom Date",
    "permanent": "Permanent"
  },
  "statuses": {
    "active": "Active",
    "expired": "Expired",
    "pending": "Pending",
    "verified": "Verified",
    "registered": "Registered",
    "failed": "Failed",
    "banned": "Banned"
  }
});
