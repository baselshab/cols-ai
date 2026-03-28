import { create } from 'zustand';

interface TenantState {
  tenantId: string | null;
  tenantName: string | null;
  setTenant: (tenantId: string, tenantName?: string) => void;
}

export const useTenantStore = create<TenantState>()((set) => ({
  tenantId: null,
  tenantName: null,
  setTenant: (tenantId, tenantName) => set({ tenantId, tenantName }),
}));
