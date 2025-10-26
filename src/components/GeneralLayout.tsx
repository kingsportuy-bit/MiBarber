import { QoderFooter } from "@/components/QoderFooter";
import { ConfiguracionWrapper } from "@/components/ConfiguracionWrapper";

export function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full px-2 md:px-4 flex-grow flex flex-col mt-2 md:mt-5 flex-1 min-w-0 bg-qoder-dark-bg-primary">
      <div className="max-w-6xl mx-auto w-full flex-grow flex flex-col flex-1 min-w-0">
        <ConfiguracionWrapper>
          <div className="flex-grow flex flex-col flex-1 min-w-0">
            {children}
          </div>
        </ConfiguracionWrapper>
      </div>
      <QoderFooter />
    </div>
  );
}