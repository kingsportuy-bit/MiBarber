import { Providers } from "@/components/Providers";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="min-h-screen bg-qoder-dark-bg-primary w-full px-2 md:px-4 flex-grow flex flex-col mt-2 md:mt-5 flex-1 min-w-0">
        <div className="max-w-6xl mx-auto w-full flex-grow flex flex-col flex-1 min-w-0">
          {children}
        </div>
      </div>
    </Providers>
  );
}