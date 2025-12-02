import { useState } from 'react';
import { 
  Plus, 
  MoreVertical, 
  UserCheck,
  UserX,
  Mail,
  Shield,
  Search,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Staff, StaffRole, getRoleDisplayName, getRoleColor } from '@/types/staff';
import { useDemoStaff } from '@/hooks/useStaff';
import { useToast } from '@/hooks/use-toast';

export const StaffManagementPanel = () => {
  const initialStaff = useDemoStaff();
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [staffToRemove, setStaffToRemove] = useState<Staff | null>(null);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'waiter' as StaffRole,
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const approvedStaff = staff.filter((s) => s.isApproved);
  const pendingStaff = staff.filter((s) => !s.isApproved);

  const filteredApprovedStaff = approvedStaff.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddStaff = () => {
    const newStaff: Staff = {
      id: `staff-${Date.now()}`,
      restaurantId: 'demo',
      email: formData.email,
      name: formData.name,
      role: formData.role,
      isActive: true,
      isApproved: true, // Admin-added staff are auto-approved
      createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
      updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    };

    setStaff((prev) => [...prev, newStaff]);
    setFormData({ name: '', email: '', role: 'waiter' });
    setIsAddDialogOpen(false);
    toast({
      title: 'Staff member added!',
      description: `${newStaff.name} has been added as ${getRoleDisplayName(newStaff.role)}`,
    });
  };

  const handleApproveStaff = (staffId: string) => {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === staffId
          ? { ...s, isApproved: true, approvedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any }
          : s
      )
    );
    const member = staff.find((s) => s.id === staffId);
    toast({
      title: 'Staff approved!',
      description: `${member?.name} can now access the dashboard`,
    });
  };

  const handleRejectStaff = (staffId: string) => {
    const member = staff.find((s) => s.id === staffId);
    setStaff((prev) => prev.filter((s) => s.id !== staffId));
    toast({
      title: 'Staff rejected',
      description: `${member?.name}'s access request has been denied`,
    });
  };

  const handleRemoveStaff = () => {
    if (!staffToRemove) return;
    setStaff((prev) => prev.filter((s) => s.id !== staffToRemove.id));
    toast({
      title: 'Staff removed',
      description: `${staffToRemove.name} has been removed from the team`,
    });
    setStaffToRemove(null);
  };

  const handleChangeRole = (staffId: string, newRole: StaffRole) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, role: newRole } : s))
    );
    const member = staff.find((s) => s.id === staffId);
    toast({
      title: 'Role updated',
      description: `${member?.name} is now ${getRoleDisplayName(newRole)}`,
    });
  };

  const StaffCard = ({ member, isPending = false }: { member: Staff; isPending?: boolean }) => (
    <Card className={`transition-all hover:shadow-md ${isPending ? 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/20' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={member.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              {getInitials(member.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-sm truncate">{member.name}</h3>
                <p className="text-xs text-slate-500 truncate">{member.email}</p>
              </div>
              {!isPending && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingStaff(member)}>
                      <Shield className="w-4 h-4 mr-2" />
                      Change Role
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Message
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setStaffToRemove(member)}
                      className="text-red-600"
                      disabled={member.role === 'admin'}
                    >
                      <UserX className="w-4 h-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getRoleColor(member.role)}>
                {getRoleDisplayName(member.role)}
              </Badge>
              {member.lastLoginAt && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Active
                </span>
              )}
            </div>
            {isPending && (
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={() => handleApproveStaff(member.id)}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  <UserCheck className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRejectStaff(member.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <UserX className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Staff Management</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Manage your team members and their access levels
          </p>
        </div>
        <Button 
          className="bg-gradient-to-r from-violet-500 to-purple-600"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Staff
        </Button>
      </div>

      {/* Pending Approvals */}
      {pendingStaff.length > 0 && (
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Pending Approvals
              <Badge variant="secondary" className="ml-2">{pendingStaff.length}</Badge>
            </CardTitle>
            <CardDescription>
              These staff members are waiting for access approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingStaff.map((member) => (
                <StaffCard key={member.id} member={member} isPending />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search staff by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Staff Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total Staff</p>
            <p className="text-2xl font-bold">{approvedStaff.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 dark:bg-purple-950/30 border-purple-200/50">
          <CardContent className="p-4">
            <p className="text-sm text-purple-600 dark:text-purple-400">Admins</p>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {approvedStaff.filter((s) => s.role === 'admin').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200/50">
          <CardContent className="p-4">
            <p className="text-sm text-blue-600 dark:text-blue-400">Managers</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {approvedStaff.filter((s) => s.role === 'manager').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 dark:bg-orange-950/30 border-orange-200/50">
          <CardContent className="p-4">
            <p className="text-sm text-orange-600 dark:text-orange-400">Kitchen</p>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {approvedStaff.filter((s) => s.role === 'kitchen').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/30 border-green-200/50">
          <CardContent className="p-4">
            <p className="text-sm text-green-600 dark:text-green-400">Waiters</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {approvedStaff.filter((s) => s.role === 'waiter').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Approved Staff Grid */}
      <div>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          Active Staff
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApprovedStaff.map((member) => (
            <StaffCard key={member.id} member={member} />
          ))}
        </div>
        {filteredApprovedStaff.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No staff members found</p>
          </div>
        )}
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>
              Add a new team member to your restaurant. They will have immediate access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label htmlFor="role">Role *</Label>
              <Select 
                value={formData.role} 
                onValueChange={(v: StaffRole) => setFormData({ ...formData, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="kitchen">Kitchen Staff</SelectItem>
                  <SelectItem value="waiter">Waiter</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                {formData.role === 'admin' && 'Full access to all features including staff management'}
                {formData.role === 'manager' && 'Can manage menu, orders, and tables'}
                {formData.role === 'kitchen' && 'Can view and update order status'}
                {formData.role === 'waiter' && 'Can manage orders and tables'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddStaff}
              disabled={!formData.name || !formData.email}
              className="bg-gradient-to-r from-violet-500 to-purple-600"
            >
              Add Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={!!editingStaff} onOpenChange={() => setEditingStaff(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              Update the role for {editingStaff?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Select New Role</Label>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {(['admin', 'manager', 'kitchen', 'waiter'] as StaffRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    if (editingStaff) {
                      handleChangeRole(editingStaff.id, role);
                      setEditingStaff(null);
                    }
                  }}
                  className={`
                    p-4 rounded-lg border-2 transition-all text-left
                    ${editingStaff?.role === role 
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-violet-200'
                    }
                  `}
                >
                  <p className="font-medium">{getRoleDisplayName(role)}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {role === 'admin' && 'Full access'}
                    {role === 'manager' && 'Menu & operations'}
                    {role === 'kitchen' && 'Order updates'}
                    {role === 'waiter' && 'Orders & tables'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation */}
      <AlertDialog open={!!staffToRemove} onOpenChange={() => setStaffToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Staff Member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {staffToRemove?.name} from your team? 
              They will no longer be able to access the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveStaff}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
