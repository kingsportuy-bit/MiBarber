"use client";

export function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col pb-16 md:pb-0 min-h-screen">
      <div className="flex-grow flex flex-col justify-center min-h-[calc(100vh-80px)]">
        {children}
      </div>
    </div>
  );
}