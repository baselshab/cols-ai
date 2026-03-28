'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/utils';

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.id as string;

  const { data: caseData, isLoading } = useQuery({
    queryKey: ['case', caseId],
    queryFn: async () => {
      const response = await api.get(`/cases/${caseId}`);
      return response.data;
    },
    enabled: !!caseId,
  });

  if (isLoading) {
    return <div className="py-8 text-center">Loading...</div>;
  }

  if (!caseData) {
    return <div className="py-8 text-center">Case not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{caseData.title}</h1>
          <p className="text-muted-foreground">Case #{caseData.caseNumber}</p>
        </div>
        <Badge
          variant={
            caseData.status === 'ACTIVE'
              ? 'default'
              : caseData.status === 'PENDING'
              ? 'secondary'
              : 'outline'
          }
        >
          {caseData.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Case Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">{caseData.type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-medium">{caseData.client?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Court</p>
                <p className="font-medium">{caseData.courtName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Court Date</p>
                <p className="font-medium">
                  {caseData.courtDate ? formatDate(caseData.courtDate) : 'N/A'}
                </p>
              </div>
            </div>
            {caseData.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p>{caseData.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {caseData.events && caseData.events.length > 0 ? (
              <div className="space-y-4">
                {caseData.events.map((event: Record<string, unknown>) => (
                  <div key={event.id as string} className="border-l-2 border-primary pl-4">
                    <p className="font-medium">{event.title as string}</p>
                    <p className="text-sm text-muted-foreground">{event.type as string}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(event.eventDate as string)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No events yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {caseData.documents && caseData.documents.length > 0 ? (
            <div className="space-y-2">
              {caseData.documents.map((doc: Record<string, unknown>) => (
                <div
                  key={doc.id as string}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{doc.name as string}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(doc.createdAt as string)}
                    </p>
                  </div>
                  <Badge variant="outline">{doc.status as string}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No documents uploaded</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
