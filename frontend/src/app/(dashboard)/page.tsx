'use client';

import { Briefcase, Users, FileText, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

const stats = [
  { name: 'Active Cases', value: '12', icon: Briefcase, trend: '+2 this month' },
  { name: 'Total Clients', value: '45', icon: Users, trend: '+5 this month' },
  { name: 'Documents', value: '128', icon: FileText, trend: '+12 this week' },
  { name: 'Hours This Week', value: '32', icon: Clock, trend: '+8 vs last week' },
];

const recentCases = [
  { id: '1', title: 'Smith v. Johnson', status: 'ACTIVE', updatedAt: new Date() },
  { id: '2', title: 'Estate of Williams', status: 'PENDING', updatedAt: new Date(Date.now() - 86400000) },
  { id: '3', title: 'Tech Corp Merger', status: 'ACTIVE', updatedAt: new Date(Date.now() - 172800000) },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s an overview of your practice.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{caseItem.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Updated {formatDate(caseItem.updatedAt)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      caseItem.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {caseItem.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Court Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-medium">Smith v. Johnson</p>
                  <p className="text-sm text-muted-foreground">District Court - Room 302</p>
                </div>
                <p className="text-sm font-medium">Mar 15, 2024</p>
              </div>
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-medium">Estate of Williams</p>
                  <p className="text-sm text-muted-foreground">Probate Court - Room 101</p>
                </div>
                <p className="text-sm font-medium">Mar 18, 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
