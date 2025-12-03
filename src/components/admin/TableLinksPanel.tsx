import { useState } from 'react';
import { 
  QrCode, 
  Download, 
  Copy, 
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTables } from '@/hooks/useTables';
import { useToast } from '@/hooks/use-toast';
import { TableLink } from '@/types/table';

const RESTAURANT_ID = import.meta.env.VITE_RESTAURANT_ID || 'demo';
const RESTAURANT_SLUG = import.meta.env.VITE_RESTAURANT_SLUG || 'restaurant';
const BASE_URL = import.meta.env.VITE_APP_URL || window.location.origin;

export const TableLinksPanel = () => {
  const { toast } = useToast();
  const { tables, loading, error, generateTableLinks } = useTables({ 
    restaurantId: RESTAURANT_ID,
    restaurantSlug: RESTAURANT_SLUG 
  });

  const [selectedTable, setSelectedTable] = useState<TableLink | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Generate links for all tables
  const tableLinks = generateTableLinks();

  // Filter based on search
  const filteredLinks = tableLinks.filter(link =>
    link.tableNumber.includes(searchQuery) ||
    link.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: 'Link copied to clipboard.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to copy to clipboard.',
      });
    }
  };

  const downloadQRCode = (tableLink: TableLink) => {
    // Generate QR code URL using a free QR code API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(tableLink.fullUrl)}`;
    
    // Create download link
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `table-${tableLink.tableNumber}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Downloading...',
      description: `QR code for Table ${tableLink.tableNumber} is downloading.`,
    });
  };

  const downloadAllQRCodes = () => {
    // For each table, trigger download
    tableLinks.forEach((link, index) => {
      setTimeout(() => {
        downloadQRCode(link);
      }, index * 500); // Stagger downloads
    });

    toast({
      title: 'Downloading All',
      description: `${tableLinks.length} QR codes are being downloaded.`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-violet-500" />
        <span className="ml-2 text-slate-500">Loading table links...</span>
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
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Table QR Links</h2>
          <p className="text-sm text-slate-500">
            Generate and download QR codes for each table
          </p>
        </div>
        {tableLinks.length > 0 && (
          <Button onClick={downloadAllQRCodes} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download All QR Codes
          </Button>
        )}
      </div>

      {/* Search */}
      <Input
        placeholder="Search tables..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />

      {/* Table Links Grid */}
      {filteredLinks.length === 0 ? (
        <div className="text-center py-12">
          <QrCode className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-600">No Tables</h3>
          <p className="text-slate-500">Create tables first to generate QR codes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredLinks.map((link) => (
            <Card key={link.tableId} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{link.displayName}</h3>
                    <p className="text-xs text-slate-500">Table #{link.tableNumber}</p>
                  </div>
                  <Badge variant="outline" className="bg-violet-50 text-violet-700">
                    <QrCode className="w-3 h-3 mr-1" />
                    QR Ready
                  </Badge>
                </div>

                {/* QR Code Preview */}
                <div className="bg-white rounded-lg p-4 mb-3 flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(link.fullUrl)}`}
                    alt={`QR Code for Table ${link.tableNumber}`}
                    className="w-32 h-32"
                  />
                </div>

                {/* URL Preview */}
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 mb-3">
                  <p className="text-xs text-slate-500 truncate font-mono">
                    {link.fullUrl}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => copyToClipboard(link.fullUrl)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => downloadQRCode(link)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    QR
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => setSelectedTable(link)}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table Detail Dialog */}
      <Dialog open={!!selectedTable} onOpenChange={() => setSelectedTable(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedTable?.displayName}</DialogTitle>
            <DialogDescription>
              Table #{selectedTable?.tableNumber} QR Code and Link
            </DialogDescription>
          </DialogHeader>

          {selectedTable && (
            <div className="space-y-4 py-4">
              {/* Large QR Code */}
              <div className="bg-white rounded-lg p-6 flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(selectedTable.fullUrl)}`}
                  alt={`QR Code for Table ${selectedTable.tableNumber}`}
                  className="w-64 h-64"
                />
              </div>

              {/* Full URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Full URL</label>
                <div className="flex gap-2">
                  <Input
                    value={selectedTable.fullUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(selectedTable.fullUrl)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => downloadQRCode(selectedTable)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600"
                  onClick={() => window.open(selectedTable.fullUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Link
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Usage Instructions */}
      <Card className="bg-slate-50 dark:bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Printer className="w-5 h-5" />
            How to Use
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-400 list-decimal list-inside">
            <li>Download the QR code for each table</li>
            <li>Print the QR codes on table tents, stickers, or menus</li>
            <li>Place them on the corresponding tables</li>
            <li>Customers can scan to view the menu and place orders</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};
