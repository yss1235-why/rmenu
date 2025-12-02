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
  RefreshCw
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

const statusConfig: Record<TableStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircle }> = {
  available: { 
    label: 'Available', 
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    icon: CheckCircle 
  },
  occupied: { 
    label: 'Occupied', 
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30',
    icon: Users 
  },
  reserved: { 
    label: 'Reserved', 
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    icon: Clock 
  },
  cleaning: { 
    label: 'Cleaning', 
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    icon: RefreshCw 
  },
};

// Demo tables
const demoTables: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: `table-${i + 1}`,
  restaurantId: 'demo',
  tableNumber: (i + 1).toString(),
  displayName: `Table ${i + 1}`,
  capacity: i < 6 ? 2 : i < 10 ? 4 : 6,
  status: ['available', 'occupied', 'available', 'reserved', 'cleaning', 'available'][i % 6] as TableStatus,
  section: i < 6 ? 'Main Hall' : 'Patio',
  isActive: true,
  createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
  updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
}));

export const TablesPanel = () => {
  const [tables, setTables] = useState<Table[]>(demoTables);
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

  const sections = [...new Set(tables.map((t) => t.section).filter(Boolean))] as string[];

  const filteredTables = tables.filter((table) => {
    if (filterSection === 'all') return true;
    return table.section === filterSection;
  });

  const updateTableStatus = (tableId: string, status: TableStatus) => {
    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId ? { ...table, status } : table
      )
    );
  };

  const handleAddTable = () => {
    const table: Table = {
      id: `table-${Date.now()}`,
      restaurantId: 'demo',
      tableNumber: newTable.tableNumber,
      displayName: newTable.displayName || `Table ${newTable.tableNumber}`,
      capacity: parseInt(newTable.capacity),
      status: 'available',
      section: newTable.section || undefined,
      isActive: true,
      createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
      updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    };

    setTables((prev) => [...prev, table].sort((a, b) => parseInt(a.tableNumber) - parseInt(b.tableNumber)));
    setNewTable({ tableNumber: '', displayName: '', capacity: '4', section: '' });
    setIsAddDialogOpen(false);
  };

  const handleBulkCreate = () => {
    const start = parseInt(bulkForm.startNumber);
    const end = parseInt(bulkForm.endNumber);
    const capacity = parseInt(bulkForm.capacity);

    const newTables: Table[] = [];
    for (let i = start; i <= end; i++) {
      newTables.push({
        id: `table-${Date.now()}-${i}`,
        restaurantId: 'demo',
        tableNumber: i.toString(),
        displayName: `Table ${i}`,
        capacity,
        status: 'available',
        section: bulkForm.section || undefined,
        isActive: true,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
      });
    }

    setTables((prev) => [...prev, ...newTables].sort((a, b) => parseInt(a.tableNumber) - parseInt(b.tableNumber)));
    setBulkForm({ startNumber: '', endNumber: '', capacity: '4', section: '' });
    setBulkDialogOpen(false);
  };

  const handleDeleteTable = (tableId: string) => {
    setTables((prev) => prev.filter((t) => t.id !== tableId));
  };

  const stats = {
    total: tables.length,
    available: tables.filter((t) => t.status === 'available').length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
    reserved: tables.filter((t) => t.status === 'reserved').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Tables</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage restaurant tables and their status</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Bulk Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Add Tables</DialogTitle>
                <DialogDescription>Create multiple tables at once</DialogDescription>
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
                  <Label htmlFor="bulkCapacity">Capacity</Label>
                  <Select value={bulkForm.capacity} onValueChange={(v) => setBulkForm({ ...bulkForm, capacity: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 people</SelectItem>
                      <SelectItem value="4">4 people</SelectItem>
                      <SelectItem value="6">6 people</SelectItem>
                      <SelectItem value="8">8 people</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bulkSection">Section (Optional)</Label>
                  <Input
                    id="bulkSection"
                    value={bulkForm.section}
                    onChange={(e) => setBulkForm({ ...bulkForm, section: e.target.value })}
                    placeholder="e.g., Main Hall, Patio"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleBulkCreate} className="bg-gradient-to-r from-violet-500 to-purple-600">
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
                <DialogDescription>Create a new table for your restaurant</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="tableNumber">Table Number</Label>
                  <Input
                    id="tableNumber"
                    value={newTable.tableNumber}
                    onChange={(e) => setNewTable({ ...newTable, tableNumber: e.target.value })}
                    placeholder="e.g., 1, 2, A1"
                  />
                </div>
                <div>
                  <Label htmlFor="displayName">Display Name (Optional)</Label>
                  <Input
                    id="displayName"
                    value={newTable.displayName}
                    onChange={(e) => setNewTable({ ...newTable, displayName: e.target.value })}
                    placeholder="e.g., Window Seat, VIP Booth"
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Select value={newTable.capacity} onValueChange={(v) => setNewTable({ ...newTable, capacity: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 people</SelectItem>
                      <SelectItem value="4">4 people</SelectItem>
                      <SelectItem value="6">6 people</SelectItem>
                      <SelectItem value="8">8 people</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="section">Section (Optional)</Label>
                  <Input
                    id="section"
                    value={newTable.section}
                    onChange={(e) => setNewTable({ ...newTable, section: e.target.value })}
                    placeholder="e.g., Main Hall, Patio"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddTable} className="bg-gradient-to-r from-violet-500 to-purple-600">
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
            <p className="text-sm text-slate-500">Total Tables</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/50">
          <CardContent className="p-4">
            <p className="text-sm text-emerald-600 dark:text-emerald-400">Available</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.available}</p>
          </CardContent>
        </Card>
        <Card className="bg-violet-50 dark:bg-violet-950/30 border-violet-200/50">
          <CardContent className="p-4">
            <p className="text-sm text-violet-600 dark:text-violet-400">Occupied</p>
            <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">{stats.occupied}</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200/50">
          <CardContent className="p-4">
            <p className="text-sm text-amber-600 dark:text-amber-400">Reserved</p>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.reserved}</p>
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
            className={filterSection === 'all' ? 'bg-gradient-to-r from-violet-500 to-purple-600' : ''}
          >
            All
          </Button>
          {sections.map((section) => (
            <Button
              key={section}
              variant={filterSection === section ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterSection(section)}
              className={filterSection === section ? 'bg-gradient-to-r from-violet-500 to-purple-600' : ''}
            >
              {section}
            </Button>
          ))}
        </div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredTables.map((table) => {
          const config = statusConfig[table.status];
          const StatusIcon = config.icon;

          return (
            <Card 
              key={table.id} 
              className={`relative overflow-hidden transition-all hover:shadow-lg ${config.bgColor}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color} bg-white dark:bg-slate-800`}>
                    <span className="font-bold text-sm">#{table.tableNumber}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => updateTableStatus(table.id, 'available')}>
                        <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                        Set Available
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateTableStatus(table.id, 'occupied')}>
                        <Users className="w-4 h-4 mr-2 text-violet-500" />
                        Set Occupied
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateTableStatus(table.id, 'reserved')}>
                        <Clock className="w-4 h-4 mr-2 text-amber-500" />
                        Set Reserved
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateTableStatus(table.id, 'cleaning')}>
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
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTables.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">No tables found. Add your first table!</p>
        </div>
      )}
    </div>
  );
};
