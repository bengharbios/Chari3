const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Global Plugin Architecture Documentation...');

  const docArticle = {
    title: 'دليل المطورين: بناء الإضافات (Plugin SDK)',
    titleEn: 'Developer Guide: Building Plugins (Plugin SDK)',
    slug: 'developer-plugin-sdk',
    content: `
# بناء إضافات جديدة لمنصة ChariDay (Plugin Architecture)

يعتمد نظام ChariDay على **معمارية الإضافات (Plugin Architecture)** مما يتيح لك كمطور إضافة بوابات دفع، أو شركات شحن، أو خدمات رسائل (SMS) جديدة دون الحاجة لتعديل الكود الأساسي للمنصة (Core).

## 1. الهيكل الأساسي لأي إضافة (Base Plugin)

أي إضافة يجب أن ترث من الواجهة \`BasePlugin\`:

\`\`\`typescript
export interface BasePlugin {
  id: string;          // المُعرّف الفريد للإضافة (مثلاً: 'chargily', 'stripe')
  name: string;        // اسم الإضافة
  version: string;     // رقم الإصدار
  type: PluginType;    // نوع الإضافة ('PAYMENT' | 'SHIPPING' | 'SMS' | 'MARKETING')
  
  /**
   * دالة التهيئة: تُستدعى عند تفعيل الإضافة
   * @param globalConfig الإعدادات العامة (مثل API Keys الخاصة بالمنصة)
   */
  initialize(globalConfig: any): Promise<void>;
}
\`\`\`

## 2. مثال: إضافة بوابة دفع جديدة (Payment Plugin)

لإضافة بوابة دفع جديدة، يجب عليك تطبيق الواجهة \`PaymentPlugin\` التي ترث من \`BasePlugin\`.

\`\`\`typescript
import { PaymentPlugin, PaymentRequest, PaymentResponse } from '@/lib/plugins/types';

export class MyFatoorahPlugin implements PaymentPlugin {
  id = 'myfatoorah';
  name = 'MyFatoorah Gateway';
  version = '1.0.0';
  type = 'PAYMENT' as const;
  
  private apiKey: string = '';

  async initialize(globalConfig: any): Promise<void> {
    this.apiKey = globalConfig.apiKey;
    console.log('MyFatoorah plugin initialized!');
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // 1. اتصل بـ API الخاص بـ MyFatoorah
    // 2. قم بمعالجة الدفع باستخدام request.amount و request.currency
    
    return {
      success: true,
      transactionId: 'TXN_123456',
      status: 'COMPLETED'
    };
  }
}
\`\`\`

## 3. تسجيل الإضافة في النظام (Registry)

بعد كتابة الفئة (Class) الخاصة بالإضافة، قم بإضافتها إلى \`PluginRegistry\` في ملف \`src/lib/plugins/core/PluginRegistry.ts\`.

\`\`\`typescript
import { MyFatoorahPlugin } from '../payment/MyFatoorahPlugin';

// داخل دالة التهيئة في PluginRegistry:
this.register(new MyFatoorahPlugin());
\`\`\`

## 4. إعدادات قاعدة البيانات

لا تنسَ إضافة سجل في قاعدة البيانات عبر واجهة **متجر الإضافات** أو برمجياً:

\`\`\`json
{
  "id": "myfatoorah",
  "type": "PAYMENT",
  "name": "MyFatoorah Gateway",
  "configSchema": "[{\\"key\\": \\"apiKey\\", \\"type\\": \\"string\\", \\"required\\": true}]"
}
\`\`\`

بمجرد إتمام هذه الخطوات، ستظهر الإضافة تلقائياً في صفحة **متجر الإضافات** وسيتمكن مدير النظام من تفعيلها وتوفيرها للتجار.
    `,
    contentEn: `
# Building New Plugins for ChariDay (Plugin Architecture)

ChariDay uses a **Plugin Architecture** allowing you to add new payment gateways, shipping providers, or SMS services without modifying the core platform code.

## 1. Base Plugin Structure

Every plugin must implement the \`BasePlugin\` interface:

\`\`\`typescript
export interface BasePlugin {
  id: string;          // Unique identifier (e.g., 'chargily', 'stripe')
  name: string;        // Display name
  version: string;     // Version string
  type: PluginType;    // 'PAYMENT' | 'SHIPPING' | 'SMS' | 'MARKETING'
  
  /**
   * Called when the plugin is activated
   * @param globalConfig The global settings (e.g., Platform API Keys)
   */
  initialize(globalConfig: any): Promise<void>;
}
\`\`\`

Follow the documentation in Arabic for the full implementation examples of Payment Plugins and Registry integration.
    `,
    category: 'developers',
    isPublished: true,
    sortOrder: 1,
    translations: {
      ar: {
        title: 'دليل المطورين: بناء الإضافات (Plugin SDK)'
      },
      en: {
        title: 'Developer Guide: Building Plugins (Plugin SDK)'
      }
    }
  };

  const existing = await prisma.docArticle.findUnique({
    where: { slug: docArticle.slug }
  });

  if (existing) {
    await prisma.docArticle.update({
      where: { slug: docArticle.slug },
      data: docArticle
    });
    console.log('Updated existing Plugin SDK documentation.');
  } else {
    await prisma.docArticle.create({
      data: docArticle
    });
    console.log('Created new Plugin SDK documentation.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
