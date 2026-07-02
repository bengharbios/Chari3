'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Shield, UserCircle, Store, Truck, LayoutDashboard, 
  Settings, CheckCircle2, XCircle, Trash2, Edit2, Key, Info
} from 'lucide-react';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { PERMISSION_CATEGORIES } from '@/lib/permissions';

type Role = {
  id: string;
  key: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  color: string;
  permissions: string[];
  isSystem: boolean;
  targetEntity: string;
  _count: { users: number };
};

export default function RolesManagement({ locale }: { locale: string }) {
  const isAr = locale === 'ar';
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newRole, setNewRole] = useState({
    key: '',
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    targetEntity: 'SELLER',
    permissions: [] as string[]
  });

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/roles');
      const data = await res.json();
      if (data.success) {
        setRoles(data.roles);
      }
    } catch (err) {
      console.error(err);
      toast.error(isAr ? 'حدث خطأ أثناء جلب الأدوار' : 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleTogglePermission = (key: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key]
    }));
  };

  const handleToggleCategory = (category: typeof PERMISSION_CATEGORIES[0]) => {
    const categoryKeys = category.permissions.map(p => p.key);
    const hasAll = categoryKeys.every(k => newRole.permissions.includes(k));
    
    setNewRole(prev => {
      if (hasAll) {
        // Remove all
        return { ...prev, permissions: prev.permissions.filter(p => !categoryKeys.includes(p)) };
      } else {
        // Add missing
        const newPerms = [...prev.permissions];
        categoryKeys.forEach(k => {
          if (!newPerms.includes(k)) newPerms.push(k);
        });
        return { ...prev, permissions: newPerms };
      }
    });
  };

  const handleCreateRole = async () => {
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRole,
          color: '#3B82F6', // Default blue
          icon: 'Shield',
        })
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success(isAr ? 'تم إنشاء الدور بنجاح' : 'Role created successfully');
        setIsDialogOpen(false);
        setNewRole({
          key: '', nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', targetEntity: 'SELLER', permissions: []
        });
        fetchRoles();
      } else {
        toast.error(data.error || 'Failed to create role');
      }
    } catch (err) {
      toast.error(isAr ? 'خطأ في الاتصال' : 'Connection error');
    }
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'ADMIN': return <Shield className="h-4 w-4" />;
      case 'SELLER': return <Store className="h-4 w-4" />;
      case 'SUPPLIER': return <LayoutDashboard className="h-4 w-4" />;
      case 'LOGISTICS': return <Truck className="h-4 w-4" />;
      default: return <UserCircle className="h-4 w-4" />;
    }
  };

  const entities = ['SELLER', 'SUPPLIER', 'LOGISTICS', 'ADMIN'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isAr ? 'الأدوار والصلاحيات' : 'Roles & Permissions'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAr ? 'إدارة الهيكل التنظيمي والصلاحيات المخصصة' : 'Manage organizational structure and custom permissions'}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {isAr ? 'دور جديد' : 'New Role'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isAr ? 'إنشاء دور ديناميكي جديد' : 'Create New Dynamic Role'}</DialogTitle>
              <DialogDescription>
                {isAr ? 'تحديد اسم الدور وصلاحياته بدقة' : 'Define role name and fine-grained permissions'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>{isAr ? 'المفتاح البرمجي (Key)' : 'Role Key (Unique)'}</Label>
                <Input 
                  placeholder="e.g. branch_manager" 
                  value={newRole.key}
                  onChange={e => setNewRole({...newRole, key: e.target.value.toLowerCase()})}
                />
                <p className="text-xs text-muted-foreground">
                  {isAr ? 'حروف إنجليزية صغيرة بدون مسافات' : 'Lowercase letters, no spaces'}
                </p>
              </div>
              <div className="space-y-2">
                <Label>{isAr ? 'نطاق الدور (Target Entity)' : 'Target Entity'}</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={newRole.targetEntity}
                  onChange={e => setNewRole({...newRole, targetEntity: e.target.value})}
                >
                  <option value="SELLER">{isAr ? 'متجر (SELLER)' : 'Store (SELLER)'}</option>
                  <option value="SUPPLIER">{isAr ? 'مورد (SUPPLIER)' : 'Supplier (SUPPLIER)'}</option>
                  <option value="LOGISTICS">{isAr ? 'شركة شحن (LOGISTICS)' : 'Logistics (LOGISTICS)'}</option>
                  <option value="ADMIN">{isAr ? 'إدارة المنصة (ADMIN)' : 'Platform Admin (ADMIN)'}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>{isAr ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                <Input 
                  value={newRole.nameAr}
                  onChange={e => setNewRole({...newRole, nameAr: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
                <Input 
                  value={newRole.nameEn}
                  onChange={e => setNewRole({...newRole, nameEn: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Key className="h-5 w-5" /> 
                {isAr ? 'تخصيص الصلاحيات' : 'Customize Permissions'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PERMISSION_CATEGORIES.map(category => {
                  const categoryKeys = category.permissions.map(p => p.key);
                  const selectedCount = categoryKeys.filter(k => newRole.permissions.includes(k)).length;
                  const isAllSelected = selectedCount === categoryKeys.length;

                  return (
                    <Card key={category.key} className="overflow-hidden border-muted">
                      <div 
                        className={`bg-muted/50 p-3 border-b flex items-center justify-between cursor-pointer hover:bg-muted transition-colors ${isAllSelected ? 'bg-primary/10 border-primary/20' : ''}`}
                        onClick={() => handleToggleCategory(category)}
                      >
                        <div className="flex items-center gap-2 font-medium">
                          {isAr ? category.labelAr : category.labelEn}
                        </div>
                        <Badge variant={isAllSelected ? 'default' : 'secondary'}>
                          {selectedCount} / {categoryKeys.length}
                        </Badge>
                      </div>
                      <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
                        {category.permissions.map(perm => {
                          const isSelected = newRole.permissions.includes(perm.key);
                          return (
                            <div 
                              key={perm.key} 
                              className="flex items-start space-x-2 space-x-reverse cursor-pointer"
                              onClick={() => handleTogglePermission(perm.key)}
                            >
                              <div className={`mt-0.5 rounded border h-4 w-4 flex items-center justify-center ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-input'}`}>
                                {isSelected && <CheckCircle2 className="h-3 w-3" />}
                              </div>
                              <div className="grid gap-1.5 leading-none px-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                  {isAr ? perm.labelAr : perm.labelEn}
                                </label>
                                <p className="text-xs text-muted-foreground">
                                  {isAr ? perm.descriptionAr : perm.descriptionEn}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handleCreateRole} disabled={!newRole.key || !newRole.nameAr || newRole.permissions.length === 0}>
                {isAr ? 'حفظ الدور' : 'Save Role'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="SELLER" className="w-full">
        <TabsList className="mb-4">
          {entities.map(entity => (
            <TabsTrigger key={entity} value={entity} className="flex items-center gap-2">
              {getEntityIcon(entity)}
              {entity}
            </TabsTrigger>
          ))}
        </TabsList>

        {entities.map(entity => (
          <TabsContent key={entity} value={entity} className="space-y-4">
            {loading ? (
              <div className="h-32 flex items-center justify-center">
                <span className="animate-pulse">{isAr ? 'جاري التحميل...' : 'Loading...'}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.filter(r => r.targetEntity === entity || (entity === 'SELLER' && !r.targetEntity)).map(role => (
                  <Card key={role.id} className="relative overflow-hidden">
                    {role.isSystem && (
                      <div className="absolute top-0 right-0 left-auto rtl:right-auto rtl:left-0 bg-secondary px-2 py-1 text-[10px] font-bold tracking-wider rounded-bl-lg rtl:rounded-bl-none rtl:rounded-br-lg">
                        SYSTEM
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: role.color + '20', color: role.color }}>
                          {getEntityIcon(role.targetEntity)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{isAr ? role.nameAr : role.nameEn}</CardTitle>
                          <CardDescription className="text-xs font-mono">{role.key}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-sm">
                          <span className="text-muted-foreground">{isAr ? 'الصلاحيات:' : 'Permissions:'}</span>
                          <span className="font-bold ml-1 mr-1">{role.permissions.length}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">{isAr ? 'المستخدمين:' : 'Users:'}</span>
                          <span className="font-bold ml-1 mr-1">{role._count?.users || 0}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit2 className="h-4 w-4 mr-1 ml-1" />
                          {isAr ? 'تعديل' : 'Edit'}
                        </Button>
                        {!role.isSystem && (
                          <Button variant="destructive" size="sm" className="px-2">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {roles.filter(r => r.targetEntity === entity || (entity === 'SELLER' && !r.targetEntity)).length === 0 && (
                  <div className="col-span-full py-8 text-center text-muted-foreground flex flex-col items-center">
                    <Info className="h-12 w-12 text-muted mb-2" />
                    <p>{isAr ? 'لا توجد أدوار مخصصة لهذا النطاق' : 'No roles found for this entity'}</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
