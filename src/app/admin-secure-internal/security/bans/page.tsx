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
import { Loader2, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function BansPage() {
  const { t, locale } = useTranslation();
  const [bans, setBans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states for new ban
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBan, setNewBan] = useState({ type: 'ip', value: '', reason: '', duration: '24h' });

  const fetchBans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/security/bans');
      const data = await res.json();
      if (data.success) {
        setBans(data.data);
      }
    } catch (error) {
      toast.error('Error fetching bans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBans();
  }, []);

  const handleCreateBan = async () => {
    try {
      const res = await fetch('/api/admin/security/bans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBan)
      });
      if (res.ok) {
        toast.success('Ban added');
        setIsModalOpen(false);
        setNewBan({ type: 'ip', value: '', reason: '', duration: '24h' });
        fetchBans();
      }
    } catch (error) {
      toast.error('Error creating ban');
    }
  };

  const handleUnban = async (id: string) => {
    if (!confirm('Are you sure you want to unban this entity?')) return;
    try {
      const res = await fetch(`/api/admin/security/bans/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Unbanned successfully');
        fetchBans();
      }
    } catch (error) {
      toast.error('Error unbanning');
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('security.ban_list', 'Ban List')}</h1>
          <p className="text-muted-foreground">Manage blocked IPs, devices, and users</p>
        </div>
        <Button onClick={() => setIsModalOpen(!isModalOpen)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Ban
        </Button>
      </div>

      {isModalOpen && (
        <Card className="mb-6">
          <CardHeader><CardTitle>Create New Ban</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Select value={newBan.type} onValueChange={(v) => setNewBan({ ...newBan, type: v, value: '' })}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ip">IP Address</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="device">Device</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                </SelectContent>
              </Select>
              {newBan.type === 'country' ? (
                <Select value={newBan.value} onValueChange={(v) => setNewBan({ ...newBan, value: v })}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Select Country" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DZ">🇩🇿 Algeria</SelectItem>
                    <SelectItem value="SA">🇸🇦 Saudi Arabia</SelectItem>
                    <SelectItem value="AE">🇦🇪 United Arab Emirates</SelectItem>
                    <SelectItem value="EG">🇪🇬 Egypt</SelectItem>
                    <SelectItem value="MA">🇲🇦 Morocco</SelectItem>
                    <SelectItem value="TN">🇹🇳 Tunisia</SelectItem>
                    <SelectItem value="QA">🇶🇦 Qatar</SelectItem>
                    <SelectItem value="KW">🇰🇼 Kuwait</SelectItem>
                    <SelectItem value="BH">🇧🇭 Bahrain</SelectItem>
                    <SelectItem value="OM">🇴🇲 Oman</SelectItem>
                    <SelectItem value="JO">🇯🇴 Jordan</SelectItem>
                    <SelectItem value="LB">🇱🇧 Lebanon</SelectItem>
                    <SelectItem value="FR">🇫🇷 France</SelectItem>
                    <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
                    <SelectItem value="US">🇺🇸 United States</SelectItem>
                    <SelectItem value="CN">🇨🇳 China</SelectItem>
                    <SelectItem value="RU">🇷🇺 Russia</SelectItem>
                    <SelectItem value="IN">🇮🇳 India</SelectItem>
                    <SelectItem value="IL">🇮🇱 Israel</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  className="flex-1"
                  placeholder="Value to block (e.g. 192.168.1.1)"
                  value={newBan.value}
                  onChange={(e) => setNewBan({ ...newBan, value: e.target.value })}
                />
              )}
            </div>
            <div className="flex gap-4">
              <Input
                className="flex-1"
                placeholder="Reason for ban (optional)"
                value={newBan.reason}
                onChange={(e) => setNewBan({ ...newBan, reason: e.target.value })}
              />
              <Select value={newBan.duration} onValueChange={(v) => setNewBan({ ...newBan, duration: v })}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Duration" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="1w">1 Week</SelectItem>
                  <SelectItem value="1m">1 Month</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateBan}>Submit Ban</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Expires At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : bans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No banned entities found
                    </TableCell>
                  </TableRow>
                ) : (
                  bans.map((ban) => {
                    const expired = isExpired(ban.expiresAt);
                    return (
                      <TableRow key={ban.id} className={expired ? 'opacity-50 bg-gray-50/50' : ''}>
                        <TableCell>
                          <Badge variant="outline" className="uppercase">{ban.type}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{ban.value}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{ban.reason || '-'}</TableCell>
                        <TableCell>
                          {ban.expiresAt ? format(new Date(ban.expiresAt), 'dd MMM yyyy, HH:mm') : 'Permanent'}
                        </TableCell>
                        <TableCell>
                          {expired ? (
                            <Badge variant="secondary">Expired</Badge>
                          ) : (
                            <Badge className="bg-red-500 hover:bg-red-600">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleUnban(ban.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4 mr-1" /> Unban
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
