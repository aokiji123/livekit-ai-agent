import * as React from 'react';
import { headers } from 'next/headers';
import { SessionProvider } from '@/components/app/session-provider';
import { getAppConfig } from '@/lib/utils';

export default async function ComponentsLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);

  return (
    <SessionProvider appConfig={appConfig}>
      <div className="bg-muted/20 min-h-svh p-8">
        <div className="mx-auto max-w-3xl space-y-8">
          <main className="space-y-20">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
