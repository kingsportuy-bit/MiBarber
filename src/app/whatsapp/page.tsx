"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { WhatsAppChat } from "@/components/WhatsAppChat";

export default function WhatsAppPage() {
  usePageTitle("Barberox | WhatsApp");

  return (
    <div className="h-full w-full flex flex-col">
      <WhatsAppChat />
    </div>
  );
}