const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'admin-secure-internal', 'security', 'auth-logs', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace hardcoded strings
content = content.replace(
  `placeholder="Search by IP or Identifier..."`,
  `placeholder={t('security.search_ip_identifier', 'Search by IP or Identifier...')}`
);

content = content.replace(
  `Monitor all OTP and registration attempts`,
  `{t('security.auth_logs_desc', 'Monitor all OTP and registration attempts')}`
);

content = content.replace(
  `<SelectItem value="all">All Statuses</SelectItem>`,
  `<SelectItem value="all">{t('security.status_all', 'All Statuses')}</SelectItem>`
);

content = content.replace(
  `<SelectItem value="all">All Methods</SelectItem>`,
  `<SelectItem value="all">{t('security.method_all', 'All Methods')}</SelectItem>`
);

content = content.replace(
  `<TableHead>Date</TableHead>`,
  `<TableHead>{t('security.col_date', 'Date')}</TableHead>`
);
content = content.replace(
  `<TableHead>Identifier</TableHead>`,
  `<TableHead>{t('security.col_identifier', 'Identifier')}</TableHead>`
);
content = content.replace(
  `<TableHead>Method</TableHead>`,
  `<TableHead>{t('security.col_method', 'Method')}</TableHead>`
);
content = content.replace(
  `<TableHead>Location</TableHead>`,
  `<TableHead>{t('security.col_location', 'Location')}</TableHead>`
);
content = content.replace(
  `<TableHead>IP</TableHead>`,
  `<TableHead>{t('security.col_ip', 'IP')}</TableHead>`
);
content = content.replace(
  `<TableHead>Device</TableHead>`,
  `<TableHead>{t('security.col_device', 'Device')}</TableHead>`
);
content = content.replace(
  `<TableHead>Status</TableHead>`,
  `<TableHead>{t('security.col_status', 'Status')}</TableHead>`
);
content = content.replace(
  `<TableHead>Actions</TableHead>`,
  `<TableHead>{t('security.col_actions', 'Actions')}</TableHead>`
);

content = content.replace(
  `No logs found`,
  `{t('security.no_logs', 'No logs found')}`
);

content = content.replace(
  `Previous`,
  `{t('common.previous', 'Previous')}`
);
content = content.replace(
  `Next`,
  `{t('common.next', 'Next')}`
);
content = content.replace(
  `<span>Page {page}</span>`,
  `<span>{t('common.page', 'Page')} {page}</span>`
);

content = content.replace(
  `placeholder="Status"`,
  `placeholder={t('security.col_status', 'Status')}`
);
content = content.replace(
  `placeholder="Method"`,
  `placeholder={t('security.col_method', 'Method')}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('auth-logs page translations patched');
