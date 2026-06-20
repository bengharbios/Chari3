export type PluginType = 'PAYMENT' | 'SHIPPING' | 'SMS' | 'MARKETING' | 'ANALYTICS' | 'OTHER';

export interface PluginConfigField {
  key: string;
  labelAr: string;
  labelEn: string;
  type: 'string' | 'number' | 'boolean' | 'password';
  required: boolean;
  descriptionAr?: string;
  descriptionEn?: string;
}

export interface BasePlugin {
  id: string;
  name: string;
  version: string;
  type: PluginType;
  descriptionAr?: string;
  descriptionEn?: string;
  author?: string;
  
  // What fields does this plugin require globally?
  configSchema: PluginConfigField[];

  // Initialize the plugin with its global config
  initialize(globalConfig: Record<string, any>): Promise<void>;
}
