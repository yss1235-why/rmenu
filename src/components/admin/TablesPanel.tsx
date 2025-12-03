import { useState } from 'react';
import { 
  Plus, 
  MoreVertical, 
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit2,
  RefreshCw,
  QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Table, TableStatus } from '@/types/table';
import { useTables } from '@/hooks/useTables';
import { useToast } from '@/hooks/use-toast';

const RESTAURANT_ID = import.meta.env.VITE_RESTAURANT_ID || 'demo';

const statusConfig: Record<TableStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircle }> = {
  available: { 
    label: 'Available', 
    color: 'text-success',
    bgColor: 'bg-success/10 dark:bg-success/20',
    icon: CheckCircle 
  },
  occupied: { 
    label: 'Occupied', 
    color: 'text-primary',
    bgColor: 'bg-primary/10 dark:bg-primary/20',
    icon: Users 
  },
  reserved: { 
    label: 'Reserved', 
    color: 'text-warning',
    bgColor: 'bg-warning/10 dark:bg-warning/20',
    icon: Clock 
  },
  cleaning: { 
    label: 'Cleaning', 
    color: 'text-info',
    bgColor: 'bg-info/10 dark:bg-info/20',
    icon: RefreshCw 
  },
};

export const TablesPanel = () => {
  const { toast } = useToast();
  const { 
    tables, 
    loading, 
    error, 
    createTable, 
    updateStatus, 
    deleteTable,
    bulkCreateTables,
    sections 
  } = useTables({ restaurantId: RESTAURANT_ID });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [filterSection, setFilterSection] = useState<string>('all');

  // Form state
  const [newTable, setNewTable] = useState({
    tableNumber: '',
    displayName: '',
    capacity: '4',
    section: '',
  });

  const [bulkForm, setBulkForm] = useState({
    startNumber: '',
    endNumber: '',
    capacity: '4',
    section: '',
  });

  const filteredTables = tables.filter((table) => {
    if (filterSection === 'all') return true;
    return table.section === filterSection;
  });

  const handleAddTable = async () => {
    try {
      await createTable({
        tableNumber: newTable.tableNumber,
        displayName: newTable.displayName || `Table ${newTable.tableNumber}`,
        capacity: parseInt(newTable.capacity),
        section: newTable.section || undefined,
      });
      
      setNewTable({ tableNumber: '', displayName: '', capacity: '4', section: '' });
      setIsAddDialogOpen(false);
      
      toast({
        title: 'Table Created',
        description: `Table ${newTable.tableNumber} has been added.`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create table.',
      });
    }
  };

  const handleBulkCreate = async () => {
    const start = parseInt(bulkForm.startNumber);
    const end = parseInt(bulkForm.endNumber);
    const capacity = parseInt(bulkForm.capacity);

    try {
      await bulkCreateTables(start, end, capacity, bulkForm.section || undefined);
      
      setBulkForm({ startNumber: '', endNumber: '', capacity: '4', section: '' });
      setBulkDialogOpen(false);
      
      toast({
        title: 'Tables Created',
        description: `Created tables ${start} to ${end}.`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create tables.',
      });
    }
  };

  const handleUpdateStatus = async (tableId: string, status: TableStatus) => {
    try {
      await updateStatus(tableId, status);
      toast({
        title: 'Status Updated',
        description: `Table status changed to ${statusConfig[status].label}.`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update table status.',
      });
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    try {
      await deleteTable(tableId);
      toast({
        title: 'Table Deleted',
        description: 'Table has been removed.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete table.',
      });
    }
  };

  const stats = {
    total: tables.length,
    available: tables.filter((t) => t.status === 'available').length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
    reserved: tables.filter((t) => t.status === 'reserved').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-violet-500" />
        <span className="ml-2 text-slate-500">Loading tables...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p className="text-red-600">Failed to load tables</p>
        <p className="text-sm text-slate-500">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Table Management</h2>
        <div className="flex gap-2">
          <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Bulk Create
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Create Tables</DialogTitle>
                <DialogDescription>
                  Create multiple tables at once by specifying a range.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startNumber">Start Number</Label>
                    <Input
                      id="startNumber"
                      type="number"
                      value={bulkForm.startNumber}
                      onChange={(e) => setBulkForm({ ...bulkForm, startNumber: e.target.value })}
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endNumber">End Number</Label>
                    <Input
                      id="endNumber"
                      type="number"
                      value={bulkForm.endNumber}
                      onChange={(e) => setBulkForm({ ...bulkForm, endNumber: e.target.value })}
                      placeholder="10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bulkCapacity">Capacity (seats)</Label>
                  <Select 
                    value={bulkForm.capacity} 
                    onValueChange={(v) => setBulkForm({ ...bulkForm, capacity: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 seats</SelectItem>
                      <SelectItem value="4">4 seats</SelectItem>
                      <SelectItem value="6">6 seats</SelectItem>
                      <SelectItem value="8">8 seats</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bulkSection">Section (optional)</Label>
                  <Input
                    id="bulkSection"
                    value={bulkForm.section}
                    onChange={(e) => setBulkForm({ ...bulkForm, section: e.target.value })}
                    placeholder="Main Hall, Patio, etc."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleBulkCreate}
                  disabled={!bulkForm.startNumber || !bulkForm.endNumber}
                  className="bg-primary hover:bg-primary/90"
                >
                  Create Tables
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-violet-500 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Table
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Table</DialogTitle>
                <DialogDescription>
                  Create a new table for your restaurant.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="tableNumber">Table Number *</Label>
                  <Input
                    id="tableNumber"
                    value={newTable.tableNumber}
                    onChange={(e) => setNewTable({ ...newTable, tableNumber: e.target.value })}
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={newTable.displayName}
                    onChange={(e) => setNewTable({ ...newTable, displayName: e.target.value })}
                    placeholder="Table 1"
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity (seats)</Label>
                  <Select 
                    value={newTable.capacity} 
                    onValueChange={(v) => setNewTable({ ...newTable, capacity: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 seats</SelectItem>
                      <SelectItem value="4">4 seats</SelectItem>
                      <SelectItem value="6">6 seats</SelectItem>
                      <SelectItem value="8">8 seats</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="section">Section (optional)</Label>
                  <Input
                    id="section"
                    value={newTable.section}
                    onChange={(e) => setNewTable({ ...newTable, section: e.target.value })}
                    placeholder="Main Hall, Patio, etc."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleAddTable}
                  disabled={!newTable.tableNumber}
                  className="bg-gradient-to-r from-violet-500 to-purple-600"
                >
                  Add Table
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Tables</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-success/10 dark:bg-success/5 border-success/20">
          <CardContent className="p-4">
            <p className="text-sm text-success">Available</p>
            <p className="text-2xl font-bold text-success">{stats.available}</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 dark:bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <p className="text-sm text-primary">Occupied</p>
            <p className="text-2xl font-bold text-primary">{stats.occupied}</p>
          </CardContent>
        </Card>
        <Card className="bg-warning/10 dark:bg-warning/5 border-warning/20">
          <CardContent className="p-4">
            <p className="text-sm text-warning">Reserved</p>
            <p className="text-2xl font-bold text-warning">{stats.reserved}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      {sections.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={filterSection === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterSection('all')}
            className={filterSection === 'all' ? 'bg-primary' : ''}
          >
            All
          </Button>
          {sections.map((section) => (
            <Button
              key={section}
              variant={filterSection === section ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterSection(section)}
              className={filterSection === section ? 'bg-primary' : ''}
            >
              {section}
            </Button>
          ))}
        </div>
      )}

      {/* Tables Grid */}
      {filteredTables.length === 0 ? (
        <div className="text-center py-12">
          <QrCode className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-600">No Tables</h3>
          <p className="text-slate-500">Add your first table to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredTables.map((table) => {
            const config = statusConfig[table.status];
            const StatusIcon = config.icon;

            return (
              <Card key={table.id} className="relative hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleUpdateStatus(table.id, 'available')}>
                          <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                          Set Available
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(table.id, 'occupied')}>
                          <Users className="w-4 h-4 mr-2 text-violet-500" />
                          Set Occupied
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(table.id, 'reserved')}>
                          <Clock className="w-4 h-4 mr-2 text-amber-500" />
                          Set Reserved
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(table.id, 'cleaning')}>
                          <RefreshCw className="w-4 h-4 mr-2 text-blue-500" />
                          Set Cleaning
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setEditingTable(table)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTable(table.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm truncate">{table.displayName}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Users className="w-3 h-3" />
                      <span>{table.capacity} people</span>
                    </div>
                    <Badge className={`${config.color} ${config.bgColor} border-0`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                    {table.section && (
                      <p className="text-xs text-slate-400">{table.section}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
