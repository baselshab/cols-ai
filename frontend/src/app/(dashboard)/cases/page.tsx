'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function CasesPage() {
  const { data: cases, isLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      const response = await api.get('/cases');
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cases</h1>
          <p className="text-muted-foreground">Manage your legal cases</p>
        </div>
        <Button asChild>
          <Link href="/cases/new">
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Cases</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading cases...</p>
          ) : cases && cases.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case Number</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Court Date</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((caseItem: Record<string, unknown>) => (
                  <TableRow key={caseItem.id as string}>
                    <TableCell className="font-medium">{caseItem.caseNumber as string}</TableCell>
                    <TableCell>
                      <Link href={`/cases/${caseItem.id}`} className="hover:underline">
                        {caseItem.title as string}
                      </Link>
                    </TableCell>
                    <TableCell>{(caseItem.client as { name?: string })?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          caseItem.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : caseItem.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {caseItem.status as string}
                      </span>
                    </TableCell>
                    <TableCell>
                      {caseItem.courtDate ? formatDate(caseItem.courtDate as string) : 'N/A'}
                    </TableCell>
                    <TableCell>{formatDate(caseItem.updatedAt as string)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-muted-foreground">No cases found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
