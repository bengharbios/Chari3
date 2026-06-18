'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Search, Ban, History, Calendar, Smartphone, Globe, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

export default function AuthLogsPage() {
  const { t, locale } = useTranslation();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(methodFilter !== 'all' && { method: methodFilter }),
      });
      const res = await fetch(`/api/admin/security/auth-logs?${query}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (error) {
      toast.error('Error fetching auth logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, limit, statusFilter, methodFilter]);

  const handleBan = async (type: string, value: string) => {
    if (!confirm(t('security.ban_list', 'Ban this entity?'))) return;
    try {
      const res = await fetch('/api/admin/security/bans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, value, reason: 'Banned from Auth Logs', duration: 'permanent' })
      });
      if (res.ok) {
        toast.success('Banned successfully');
        fetchLogs();
      }
    } catch (error) {
      toast.error('Error banning');
    }
  };

  const getStatusBadge = (status: string) => {
    const map: any = {
      pending: { color: 'bg-yellow-500', label: t('security.statuses.pending', 'Pending') },
      verified: { color: 'bg-blue-500', label: t('security.statuses.verified', 'Verified') },
      registered: { color: 'bg-green-500', label: t('security.statuses.registered', 'Registered') },
      banned: { color: 'bg-red-500', label: t('security.statuses.banned', 'Banned') },
      failed: { color: 'bg-gray-500', label: t('security.statuses.failed', 'Failed') },
    };
    const s = map[status] || { color: 'bg-gray-500', label: status };
    return <Badge className={`${s.color} text-white border-none`}>{s.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('security.auth_logs', 'Auth Logs')}</h1>
          <p className="text-muted-foreground">{t('security.auth_logs_desc', 'Monitor all OTP and registration attempts')}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('security.search_ip_identifier', 'Search by IP or Identifier...')}
                className="pr-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder={t('security.col_status', 'Status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('security.status_all', 'All Statuses')}</SelectItem>
                <SelectItem value="pending">{t('security.statuses.pending', 'Pending')}</SelectItem>
                <SelectItem value="verified">{t('security.statuses.verified', 'Verified')}</SelectItem>
                <SelectItem value="registered">{t('security.statuses.registered', 'Registered')}</SelectItem>
                <SelectItem value="banned">{t('security.statuses.banned', 'Banned')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder={t('security.col_method', 'Method')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('security.method_all', 'All Methods')}</SelectItem>
                <SelectItem value="phone">{t('security.methods.sms', 'SMS')}</SelectItem>
                <SelectItem value="email">{t('security.methods.email', 'Email')}</SelectItem>
                <SelectItem value="whatsapp">{t('security.methods.whatsapp', 'WhatsApp')}</SelectItem>
                <SelectItem value="telegram">{t('security.methods.telegram', 'Telegram')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('security.col_date', 'Date')}</TableHead>
                  <TableHead>{t('security.col_identifier', 'Identifier')}</TableHead>
                  <TableHead>{t('security.col_method', 'Method')}</TableHead>
                  <TableHead>{t('security.col_location', 'Location')}</TableHead>
                  <TableHead>{t('security.col_ip', 'IP')}</TableHead>
                  <TableHead>{t('security.col_device', 'Device')}</TableHead>
                  <TableHead>{t('security.col_status', 'Status')}</TableHead>
                  <TableHead>{t('security.col_actions', 'Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {t('security.no_logs', 'No logs found')}
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.createdAt), 'dd MMM yyyy, HH:mm')}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.identifier}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.method}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          <span>{log.countryCode || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                      <TableCell>
                        <div className="max-w-[150px] truncate text-xs" title={log.userAgent}>
                          {log.deviceType || 'Unknown'} - {log.userAgent?.substring(0, 20)}...
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleBan('ip', log.ipAddress)} title="Ban IP">
                            <ShieldAlert className="h-4 w-4 text-red-500" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleBan(log.method === 'email' ? 'email' : 'phone', log.identifier)} title="Ban Identifier">
                            <Ban className="h-4 w-4 text-orange-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
              <Button disabled={logs.length < limit} onClick={() => setPage(p => p + 1)} variant="outline">
                {t('common.next', 'Next')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
