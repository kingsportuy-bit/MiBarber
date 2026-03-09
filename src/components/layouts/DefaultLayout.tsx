"use client";

import { QoderFooter } from "@/components/QoderFooter";

export function DefaultLayout({
  children,
  onRefresh,
  noPadding,
  hideFooter
}: {
  children: React.ReactNode;
  onRefresh: () => void;
  noPadding?: boolean;
  hideFooter?: boolean;
}) {
  return (
    <div
      className={`dashboard ${hideFooter ? '' : 'pb-20 md:pb-0'}`}
      style={{
        marginLeft: 'var(--sidebar-width, 0px)',
        ...(noPadding ? { padding: 0, height: '100vh', overflow: 'hidden' } : {})
      }}
    >
      {/* Sidebar offset only on desktop */}
      <style jsx>{`
        @media (max-width: 767px) {
          .dashboard {
            margin-left: 0 !important;
          }
        }
        ${noPadding ? `
          .dashboard { padding: 0 !important; margin-top: 0 !important; }
          .dashboard-content { padding: 0 !important; padding-top: 0 !important; height: 100%; display: flex; flex-direction: column; overflow: hidden; }
        ` : ''}
      `}</style>
      <div className="dashboard-content" style={noPadding ? { padding: 0, height: '100%', flex: 1, overflow: 'hidden' } : {}}>
        <div className={`flex-grow flex flex-col flex-1 min-w-0 ${noPadding ? 'h-full' : ''}`}>
          {children}
        </div>
      </div>
      {!hideFooter && <QoderFooter />}
    </div>
  );
}
