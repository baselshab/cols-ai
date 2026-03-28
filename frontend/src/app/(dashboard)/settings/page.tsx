'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <div className="rounded-md border bg-muted/50 px-3 py-2">{user?.name || 'N/A'}</div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="rounded-md border bg-muted/50 px-3 py-2">{user?.email || 'N/A'}</div>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="rounded-md border bg-muted/50 px-3 py-2">{user?.role || 'N/A'}</div>
              </div>
              <div className="space-y-2">
                <Label>Tenant ID</Label>
                <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm">{user?.tenantId || 'N/A'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how COLS looks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
              >
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
              >
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('system')}
              >
                System
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Notification settings coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
