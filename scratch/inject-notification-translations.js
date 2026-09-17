const fs = require('fs');
const path = require('path');

const locales = ['ar', 'en', 'fr'];
const dictPath = path.join(__dirname, '../src/lib/i18n/dictionaries');

const translations = {
  ar: {
    urgency: {
      urgent: "عاجل جدًا",
      high: "هام",
      normal: "عادي",
      low: "منخفض"
    },
    timeAgo: {
      now: "الآن",
      minutes: "منذ %minutes% دقيقة",
      hours: "منذ %hours% ساعة",
      days: "منذ %days% يوم"
    }
  },
  en: {
    urgency: {
      urgent: "Urgent",
      high: "High",
      normal: "Normal",
      low: "Low"
    },
    timeAgo: {
      now: "Just now",
      minutes: "%minutes% minutes ago",
      hours: "%hours% hours ago",
      days: "%days% days ago"
    }
  },
  fr: {
    urgency: {
      urgent: "Urgent",
      high: "Haute",
      normal: "Normale",
      low: "Basse"
    },
    timeAgo: {
      now: "À l'instant",
      minutes: "Il y a %minutes% min",
      hours: "Il y a %hours% h",
      days: "Il y a %days% jours"
    }
  }
};

locales.forEach(locale => {
  const file = path.join(dictPath, `${locale}.json`);
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    
    if (!data.notifications) {
      data.notifications = {};
    }
    
    // Inject the new namespaces
    data.notifications.urgency = translations[locale].urgency;
    data.notifications.timeAgo = translations[locale].timeAgo;
    
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log(`Updated ${locale}.json successfully.`);
  }
});
