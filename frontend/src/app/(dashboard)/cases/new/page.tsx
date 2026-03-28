'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { caseSchema, CreateCaseInput } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function NewCasePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCaseInput>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      type: 'CIVIL',
    },
  });

  const onSubmit = async (data: CreateCaseInput) => {
    setIsLoading(true);
    try {
      await api.post('/cases', data);
      toast.success('Case created successfully');
      router.push('/cases');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create case');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Case</h1>
        <p className="text-muted-foreground">Create a new legal case</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="caseNumber">Case Number</Label>
                <Input
                  id="caseNumber"
                  placeholder="CASE-2024-001"
                  {...register('caseNumber')}
                />
                {errors.caseNumber && (
                  <p className="text-sm text-destructive">{errors.caseNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Case Type</Label>
                <select
                  id="type"
                  {...register('type')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="CIVIL">Civil</option>
                  <option value="CRIMINAL">Criminal</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="FAMILY">Family</option>
                  <option value="LABOR">Labor</option>
                  <option value="ADMINISTRATIVE">Administrative</option>
                </select>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Smith v. Johnson"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientId">Client</Label>
              <Input
                id="clientId"
                placeholder="Select or enter client ID"
                {...register('clientId')}
              />
              {errors.clientId && (
                <p className="text-sm text-destructive">{errors.clientId.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="courtDate">Court Date (Optional)</Label>
                <Input
                  id="courtDate"
                  type="date"
                  {...register('courtDate')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courtName">Court Name (Optional)</Label>
                <Input
                  id="courtName"
                  placeholder="District Court"
                  {...register('courtName')}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Case'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
