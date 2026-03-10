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
        ...(noPadding ? { padding: 0, height: '100dvh', overflow: 'hidden', marginTop: 0, marginBottom: 0, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 } : {})
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
          .dashboard { padding: 0 !important; margin-top: 0 !important; margin-bottom: 0 !important; height: 100dvh !important; position: fixed !important; top: 0; left: 0; right: 0; bottom: 0; }
          .dashboard-content { padding: 0 !important; padding-top: 0 !important; height: 100% !important; display: flex !important; flex-direction: column !important; overflow: hidden !important; }
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
