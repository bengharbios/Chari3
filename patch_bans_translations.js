const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'admin-secure-internal', 'security', 'bans', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace strings
content = content.replace(
  `Manage blocked IPs, devices, and users`,
  `{t('security.ban_list_desc', 'Manage blocked IPs, devices, and users')}`
);
content = content.replace(
  `Add New Ban`,
  `{t('security.add_ban', 'Add New Ban')}`
);
content = content.replace(
  `Create New Ban`,
  `{t('security.add_ban_title', 'Create New Ban')}`
);
content = content.replace(
  `placeholder="Type"`,
  `placeholder={t('security.ban_type', 'Type')}`
);
content = content.replace(
  `IP Address</SelectItem>`,
  `{t('security.type_ip', 'IP Address')}</SelectItem>`
);
content = content.replace(
  `Phone</SelectItem>`,
  `{t('security.type_phone', 'Phone')}</SelectItem>`
);
content = content.replace(
  `Email</SelectItem>`,
  `{t('security.type_email', 'Email')}</SelectItem>`
);
content = content.replace(
  `Device</SelectItem>`,
  `{t('security.type_device', 'Device')}</SelectItem>`
);
content = content.replace(
  `Country</SelectItem>`,
  `{t('security.type_country', 'Country')}</SelectItem>`
);
content = content.replace(
  `placeholder="Select Country"`,
  `placeholder={t('security.ban_target', 'Select Country')}`
);
content = content.replace(
  `placeholder="Value to block (e.g. 192.168.1.1)"`,
  `placeholder={t('security.ban_target', 'Value to block (e.g. 192.168.1.1)')}`
);
content = content.replace(
  `placeholder="Reason for ban (optional)"`,
  `placeholder={t('security.ban_reason', 'Reason for ban (optional)')}`
);
content = content.replace(
  `placeholder="Duration"`,
  `placeholder={t('security.ban_duration', 'Duration')}`
);
content = content.replace(
  `1 Hour</SelectItem>`,
  `{t('security.duration_1h', '1 Hour')}</SelectItem>`
);
content = content.replace(
  `24 Hours</SelectItem>`,
  `{t('security.duration_24h', '24 Hours')}</SelectItem>`
);
content = content.replace(
  `1 Week</SelectItem>`,
  `{t('security.duration_1w', '1 Week')}</SelectItem>`
);
content = content.replace(
  `1 Month</SelectItem>`,
  `{t('security.duration_1m', '1 Month')}</SelectItem>`
);
content = content.replace(
  `Permanent</SelectItem>`,
  `{t('security.duration_permanent', 'Permanent')}</SelectItem>`
);
content = content.replace(
  `>Submit Ban<`,
  `>{t('security.save', 'Submit Ban')}<`
);

content = content.replace(
  `<TableHead>Type</TableHead>`,
  `<TableHead>{t('security.col_type', 'Type')}</TableHead>`
);
content = content.replace(
  `<TableHead>Value</TableHead>`,
  `<TableHead>{t('security.col_target', 'Value')}</TableHead>`
);
content = content.replace(
  `<TableHead>Reason</TableHead>`,
  `<TableHead>{t('security.col_reason', 'Reason')}</TableHead>`
);
content = content.replace(
  `<TableHead>Expires At</TableHead>`,
  `<TableHead>{t('security.col_expires', 'Expires At')}</TableHead>`
);
content = content.replace(
  `<TableHead>Status</TableHead>`,
  `<TableHead>{t('security.col_status', 'Status')}</TableHead>`
);
content = content.replace(
  `<TableHead>Action</TableHead>`,
  `<TableHead>{t('security.col_actions', 'Action')}</TableHead>`
);

content = content.replace(
  `No banned entities found`,
  `{t('security.no_logs', 'No banned entities found')}`
);
content = content.replace(
  `Expired</Badge>`,
  `{t('common.expired', 'Expired')}</Badge>`
);
content = content.replace(
  `Active</Badge>`,
  `{t('common.active', 'Active')}</Badge>`
);
content = content.replace(
  `> Unban<`,
  `> {t('security.unban', 'Unban')}<`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('bans page translations patched');
