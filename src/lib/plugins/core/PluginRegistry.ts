import { BasePlugin, PluginType } from '../types';

class PluginRegistry {
  private plugins: Map<string, BasePlugin> = new Map();

  /**
   * تسجيل إضافة جديدة في النظام
   */
  register(plugin: BasePlugin) {
    this.plugins.set(plugin.id, plugin);
    console.log(`[PluginRegistry] Registered plugin: ${plugin.id} (Type: ${plugin.type})`);
  }

  /**
   * الحصول على إضافة معينة عبر المعرف
   */
  getPlugin<T extends BasePlugin>(id: string): T | undefined {
    return this.plugins.get(id) as T | undefined;
  }

  /**
   * الحصول على جميع الإضافات من نوع معين
   */
  getPluginsByType(type: PluginType): BasePlugin[] {
    return Array.from(this.plugins.values()).filter(p => p.type === type);
  }

  /**
   * الحصول على جميع الإضافات المسجلة
   */
  getAllPlugins(): BasePlugin[] {
    return Array.from(this.plugins.values());
  }
}

// إنشاء مثيل وحيد (Singleton)
export const globalPluginRegistry = new PluginRegistry();
