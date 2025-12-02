import { useState, useRef } from 'react';
import { 
  Copy, 
  Check,
  Download,
  ExternalLink,
  Link2,
  Printer,
  QrCode,
  Share2,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableLink, generateTableLink } from '@/types/table';
import { useToast } from '@/hooks/use-toast';

// Demo tables
const demoTables: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: `table-${i + 1}`,
  restaurantId: 'demo',
  tableNumber: (i + 1).toString(),
  displayName: `Table ${i + 1}`,
  capacity: i < 6 ? 2 : i < 10 ? 4 : 6,
  status: 'available' as const,
  section: i < 6 ? 'Main Hall' : 'Patio',
  isActive: true,
  createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
  updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
}));

const restaurantSlug = 'la-maison';

export const TableLinksPanel = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableLink | null>(null);
  const [filterSection, setFilterSection] = useState<string>('all');
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const tables = demoTables;
  const sections = [...new Set(tables.map((t) => t.section).filter(Boolean))] as string[];

  // Generate links for all tables
  const tableLinks: TableLink[] = tables.map((table) => 
    generateTableLink(table, restaurantSlug, window.location.origin)
  );

  const filteredLinks = tableLinks.filter((link) => {
    if (filterSection === 'all') return true;
    const table = tables.find((t) => t.id === link.tableId);
    return table?.section === filterSection;
  });

  const copyToClipboard = async (link: TableLink) => {
    try {
      await navigator.clipboard.writeText(link.menuUrl);
      setCopiedId(link.tableId);
      toast({
        title: 'Link copied!',
        description: `Table ${link.tableNumber} menu link copied to clipboard`,
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again or copy manually',
        variant: 'destructive',
      });
    }
  };

  const copyAllLinks = async () => {
    const allLinks = filteredLinks
      .map((link) => `Table ${link.tableNumber}: ${link.menuUrl}`)
      .join('\n');
    
    try {
      await navigator.clipboard.writeText(allLinks);
      toast({
        title: 'All links copied!',
        description: `${filteredLinks.length} table links copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const downloadLinksAsText = () => {
    const content = filteredLinks
      .map((link) => `Table ${link.tableNumber}\n${link.displayName || ''}\n${link.menuUrl}\n`)
      .join('\n---\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `table-links-${restaurantSlug}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded!',
      description: 'Table links saved to file',
    });
  };

  const downloadLinksAsCSV = () => {
    const header = 'Table Number,Display Name,Menu URL\n';
    const rows = filteredLinks
      .map((link) => `"${link.tableNumber}","${link.displayName || ''}","${link.menuUrl}"`)
      .join('\n');
    
    const content = header + rows;
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `table-links-${restaurantSlug}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded!',
      description: 'Table links saved as CSV',
    });
  };

  const printLinks = () => {
    const printContent = filteredLinks.map((link) => `
      <div style="page-break-inside: avoid; margin-bottom: 24px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h3 style="font-size: 24px; font-weight: bold; margin: 0 0 8px 0;">Table ${link.tableNumber}</h3>
        ${link.displayName ? `<p style="color: #64748b; margin: 0 0 12px 0;">${link.displayName}</p>` : ''}
        <p style="font-family: monospace; font-size: 12px; word-break: break-all; background: #f1f5f9; padding: 8px; border-radius: 4px;">
          ${link.menuUrl}
        </p>
        <p style="margin: 12px 0 0 0; font-size: 12px; color: #64748b;">
          Scan to view menu or visit the link above
        </p>
      </div>
    `).join('');

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Table Links - ${restaurantSlug}</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 24px; }
              h1 { margin-bottom: 24px; }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <h1>Table Links</h1>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Table Links</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Generate and manage menu links for each table. Share these links or create QR codes.
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label className="text-xs text-slate-500 mb-1.5 block">Base URL</Label>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}/r/${restaurantSlug}/table/`}
                  readOnly
                  className="font-mono text-sm bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={copyAllLinks}>
                <Copy className="w-4 h-4 mr-2" />
                Copy All
              </Button>
              <Button variant="outline" size="sm" onClick={downloadLinksAsText}>
                <FileText className="w-4 h-4 mr-2" />
                TXT
              </Button>
              <Button variant="outline" size="sm" onClick={downloadLinksAsCSV}>
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={printLinks}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Filter */}
      {sections.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={filterSection === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterSection('all')}
            className={filterSection === 'all' ? 'bg-gradient-to-r from-violet-500 to-purple-600' : ''}
          >
            All Tables
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

      {/* Links Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredLinks.map((link) => {
          const table = tables.find((t) => t.id === link.tableId);
          const isCopied = copiedId === link.tableId;

          return (
            <Card 
              key={link.tableId} 
              className="group hover:shadow-lg transition-all duration-200 hover:border-violet-200 dark:hover:border-violet-800"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/25">
                      #{link.tableNumber}
                    </div>
                    <div>
                      <h3 className="font-semibold">Table {link.tableNumber}</h3>
                      {link.displayName && (
                        <p className="text-xs text-slate-500">{link.displayName}</p>
                      )}
                    </div>
                  </div>
                  {table?.section && (
                    <Badge variant="outline" className="text-xs">
                      {table.section}
                    </Badge>
                  )}
                </div>

                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg mb-3">
                  <p className="font-mono text-xs text-slate-600 dark:text-slate-400 truncate">
                    {link.menuUrl}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => copyToClipboard(link)}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 mr-1 text-emerald-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTable(link)}
                  >
                    <QrCode className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={link.menuUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* QR Code Dialog */}
      <Dialog open={!!selectedTable} onOpenChange={() => setSelectedTable(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Table {selectedTable?.tableNumber} QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code to access the menu for Table {selectedTable?.tableNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedTable && (
            <div className="space-y-4">
              {/* QR Code placeholder - In production, use a QR library like qrcode.react */}
              <div className="aspect-square bg-white rounded-xl p-4 flex items-center justify-center border-2 border-dashed border-slate-200">
                <div className="text-center">
                  <QrCode className="w-24 h-24 mx-auto text-slate-300 mb-4" />
                  <p className="text-sm text-slate-500">
                    QR Code Preview
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Install qrcode.react for actual QR codes
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="font-mono text-xs text-slate-600 dark:text-slate-400 break-all">
                  {selectedTable.menuUrl}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => copyToClipboard(selectedTable)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600"
                  onClick={() => {
                    // Download QR code as image
                    toast({
                      title: 'Coming soon',
                      description: 'QR code download will be available when qrcode.react is installed',
                    });
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>

              <Separator />

              <div className="text-center">
                <p className="text-sm text-slate-500 mb-2">Quick Share</p>
                <div className="flex justify-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      window.open(`https://wa.me/?text=${encodeURIComponent(`Table ${selectedTable.tableNumber} Menu: ${selectedTable.menuUrl}`)}`, '_blank');
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    asChild
                  >
                    <a href={selectedTable.menuUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Instructions Card */}
      <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200/50 dark:border-violet-800/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Link2 className="w-5 h-5 text-violet-500" />
            How to Use Table Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
          <p>
            <strong>1. Copy the link</strong> - Each table has a unique URL that customers can visit to see the menu.
          </p>
          <p>
            <strong>2. Create QR codes</strong> - Generate QR codes that link directly to each table's menu.
          </p>
          <p>
            <strong>3. Print and display</strong> - Place QR codes on each table for easy customer access.
          </p>
          <p>
            <strong>4. Track orders</strong> - When customers order from these links, the order will automatically be associated with their table.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
