
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Visitor {
  id: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  device: string;
  referrer: string;
}

interface VisitorTableProps {
  visitors: Visitor[];
}

const VisitorTable = ({ visitors }: VisitorTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(visitors.length / itemsPerPage);

  const paginatedVisitors = visitors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="p-6 pb-4">
        <h3 className="font-semibold text-gray-900">Recent Visitors</h3>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Referrer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedVisitors.map((visitor) => (
              <TableRow key={visitor.id}>
                <TableCell className="font-medium">{visitor.timestamp}</TableCell>
                <TableCell>{visitor.ipAddress}</TableCell>
                <TableCell>{visitor.location}</TableCell>
                <TableCell>{visitor.device}</TableCell>
                <TableCell className="max-w-xs truncate">{visitor.referrer}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline" 
              size="icon"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorTable;
