import { Providers } from "@/components/Providers";
import { GeneralLayout } from "@/components/GeneralLayout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <GeneralLayout>
        <div className="min-h-screen bg-qoder-dark-bg-primary">
          {children}
        </div>
      </GeneralLayout>
    </Providers>
  );
}