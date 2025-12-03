import { useState } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  Shield,
  ChefHat,
  User,
  Mail,
  RefreshCw,
  AlertCircle,
  Users
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
import { Staff, StaffRole, getRoleDisplayName, getRoleColor } from '@/types/staff';
import { useStaff } from '@/hooks/useStaff';
import { useToast } from '@/hooks/use-toast';

const RESTAURANT_ID = import.meta.env.VITE_RESTAURANT_ID || 'demo';

const roleIcons: Record<StaffRole, typeof Shield> = {
  admin: Shield,
  manager: User,
  kitchen: ChefHat,
  waiter: User,
};

export const StaffManagementPanel = () => {
  const { toast } = useToast();
  const { 
    staffMembers, 
    loading, 
    error,
    approveStaff,
    updateStaffRole,
    deactivateStaff,
    addStaff
  } = useStaff({ restaurantId: RESTAURANT_ID });

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [roleChangeStaff, setRoleChangeStaff] = useState<Staff | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'waiter' as StaffRole,
  });

  // Separate approved and pending staff
  const approvedStaff = staffMembers.filter(s => s.isApproved && s.isActive);
  const pendingStaff = staffMembers.filter(s => !s.isApproved && s.isActive);

  // Filter based on search
  const filteredApprovedStaff = approvedStaff.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAddStaff = async () => {
    try {
      await addStaff({
        name: formData.name,
        email: formData.email,
        role: formData.role,
      });

      setFormData({ name: '', email: '', role: 'waiter' });
      setIsAddDialogOpen(false);

      toast({
        title: 'Staff Added',
        description: `${formData.name} has been added as ${getRoleDisplayName(formData.role)}.`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add staff member.',
      });
    }
  };

  const handleApprove = async (staffId: string, staffName: string) => {
    try {
      await approveStaff(staffId);
      toast({
        title: 'Staff Approved',
        description: `${staffName} now has access to the dashboard.`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to approve staff member.',
      });
    }
  };

  const handleReject = async (staffId: string, staffName: string) => {
    try {
      await deactivateStaff(staffId);
      toast({
        title: 'Request Rejected',
        description: `${staffName}'s access request has been rejected.`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reject staff member.',
      });
    }
  };

  const handleRoleChange = async (newRole: StaffRole) => {
    if (!roleChangeStaff) return;

    try {
      await updateStaffRole(roleChangeStaff.id, newRole);
      toast({
        title: 'Role Updated',
        description: `${roleChangeStaff.name} is now ${getRoleDisplayName(newRole)}.`,
      });
      setRoleChangeStaff(null);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update role.',
      });
    }
  };

  const handleDeactivate = async (staffId: string, staffName: string) => {
    try {
      await deactivateStaff(staffId);
      toast({
        title: 'Staff Deactivated',
        description: `${staffName}'s access has been revoked.`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to deactivate staff member.',
      });
    }
  };

  // Staff Card Component
  const StaffCard = ({ member, isPending = false }: { member: Staff; isPending?: boolean }) => {
    const RoleIcon = roleIcons[member.role];
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={member.photoURL} />
              <AvatarFallback className={`${getRoleColor(member.role)} text-white`}>
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold truncate">{member.name}</h3>
                {!isPending && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setRoleChangeStaff(member)}>
                        <RoleIcon className="w-4 h-4 mr-2" />
                        Change Role
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeactivate(member.id, member.name)}
                        className="text-red-600"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Deactivate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              
              <p className="text-sm text-slate-500 truncate flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {member.email}
              </p>
              
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getRoleColor(member.role)}>
                  <RoleIcon className="w-3 h-3 mr-1" />
                  {getRoleDisplayName(member.role)}
                </Badge>
              </div>
            </div>
          </div>

          {isPending && (
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button 
                size="sm" 
                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                onClick={() => handleApprove(member.id, member.name)}
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1 text-red-600 hover:bg-red-50"
                onClick={() => handleReject(member.id, member.name)}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-violet-500" />
        <span className="ml-2 text-slate-500">Loading staff...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p className="text-red-600">Failed to load staff</p>
        <p className="text-sm text-slate-500">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Staff Management</h2>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-gradient-to-r from-violet-500 to-purple-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Staff
        </Button>
      </div>

      {/* Pending Approvals */}
      {pendingStaff.length > 0 && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
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
        {filteredApprovedStaff.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-600">No Staff Members</h3>
            <p className="text-slate-500">Add your first staff member to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApprovedStaff.map((member) => (
              <StaffCard key={member.id} member={member} />
            ))}
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
      <Dialog open={!!roleChangeStaff} onOpenChange={() => setRoleChangeStaff(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              Update role for {roleChangeStaff?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              {(['admin', 'manager', 'kitchen', 'waiter'] as StaffRole[]).map((role) => {
                const RoleIcon = roleIcons[role];
                const isSelected = roleChangeStaff?.role === role;
                return (
                  <Button
                    key={role}
                    variant={isSelected ? 'default' : 'outline'}
                    className={isSelected ? 'bg-gradient-to-r from-violet-500 to-purple-600' : ''}
                    onClick={() => handleRoleChange(role)}
                  >
                    <RoleIcon className="w-4 h-4 mr-2" />
                    {getRoleDisplayName(role)}
                  </Button>
                );
              })}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleChangeStaff(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
