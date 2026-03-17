'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/axios';

export default function TenantLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { tenant: string };
}) {
  const [tenantBrand, setTenantBrand] = useState<any>(null);

  useEffect(() => {
    apiClient.get(`/tenants/slug/${params.tenant}`)
      .then(res => {
        setTenantBrand(res.data.brand);
      })
      .catch(() => {
        // Fallback colors
        setTenantBrand({ 
          primaryColor: '#2563eb', 
          secondaryColor: '#f8fafc' 
        });
      });
  }, [params.tenant]);

  const style = {
    '--primary-color': tenantBrand?.primaryColor || '#2563eb',
    '--secondary-color': tenantBrand?.secondaryColor || '#f8fafc',
  } as React.CSSProperties;

  return (
    <div style={style}>
      {children}
    </div>
  );
}
