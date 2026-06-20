const fs = require('fs');
const path = require('path');

const authLogsPath = path.join(__dirname, 'src', 'app', 'admin-secure-internal', 'security', 'auth-logs', 'page.tsx');

let auth = fs.readFileSync(authLogsPath, 'utf8');

// Add limit state to auth-logs
if (!auth.includes('const [limit, setLimit]')) {
  auth = auth.replace(
    `const [page, setPage] = useState(1);`,
    `const [page, setPage] = useState(1);\n  const [limit, setLimit] = useState(20);`
  );
  auth = auth.replace(`limit: '20'`, `limit: limit.toString()`);
  auth = auth.replace(`[page, statusFilter, methodFilter]`, `[page, limit, statusFilter, methodFilter]`);
}

// Update the pagination UI in auth-logs
const oldPagination = `<div className="flex justify-between items-center mt-4">
            <Button disabled={page === 1} onClick={() => setPage(p => p - 1)} variant="outline">
              {t('common.previous', 'Previous')}
            </Button>
            <span>{t('common.page', 'Page')} {page}</span>
            <Button disabled={logs.length < 20} onClick={() => setPage(p => p + 1)} variant="outline">
              {t('common.next', 'Next')}
            </Button>
          </div>`;

const newPagination = `<div className="flex justify-between items-center mt-4 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('common.rows_per_page', 'Rows per page:')}</span>
              <Select value={limit.toString()} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="20" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <Button disabled={page === 1} onClick={() => setPage(p => p - 1)} variant="outline">
                {t('common.previous', 'Previous')}
              </Button>
              <span className="text-sm font-medium">{t('common.page', 'Page')} {page}</span>
              <Button disabled={logs.length < limit} onClick={() => setPage(p => p + 1)} variant="outline">
                {t('common.next', 'Next')}
              </Button>
            </div>
          </div>`;

auth = auth.replace(oldPagination, newPagination);

// Fix unban text in bans/page.tsx
const bansPath = path.join(__dirname, 'src', 'app', 'admin-secure-internal', 'security', 'bans', 'page.tsx');
let bans = fs.readFileSync(bansPath, 'utf8');
bans = bans.replace(`> Unban<`, `> {t('security.unban', 'Unban')}<`); // Just in case it wasn't replaced fully

// Bans doesn't have pagination from API yet, but user asked for the row count. 
// I'll add client-side pagination to Bans since it usually doesn't exceed thousands, 
// or I'll just add the UI to be consistent. Let's add client side pagination.
if (!bans.includes('const [page, setPage]')) {
  bans = bans.replace(
    `const [bans, setBans] = useState<any[]>([]);`,
    `const [bans, setBans] = useState<any[]>([]);\n  const [page, setPage] = useState(1);\n  const [limit, setLimit] = useState(20);`
  );

  const tableBodyStart = `<TableBody>`;
  const tableBodyEnd = `</TableBody>`;
  
  // Create sliced bans
  const mapStr = `bans.map((ban) => {`;
  const newMapStr = `bans.slice((page - 1) * limit, page * limit).map((ban) => {`;
  bans = bans.replace(mapStr, newMapStr);
  
  const bansFooter = `</Table>
          </div>`;
  const bansNewFooter = `</Table>
          </div>
          <div className="flex justify-between items-center mt-4 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('common.rows_per_page', 'Rows per page:')}</span>
              <Select value={limit.toString()} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="20" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <Button disabled={page === 1} onClick={() => setPage(p => p - 1)} variant="outline">
                {t('common.previous', 'Previous')}
              </Button>
              <span className="text-sm font-medium">{t('common.page', 'Page')} {page}</span>
              <Button disabled={page * limit >= bans.length} onClick={() => setPage(p => p + 1)} variant="outline">
                {t('common.next', 'Next')}
              </Button>
            </div>
          </div>`;
  
  bans = bans.replace(bansFooter, bansNewFooter);
}

fs.writeFileSync(authLogsPath, auth, 'utf8');
fs.writeFileSync(bansPath, bans, 'utf8');

console.log('UI patched');
