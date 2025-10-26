"use client";

import { useState } from "react";
import Head from 'next/head';
import { usePageTitle } from "@/hooks/usePageTitle";
import { WhatsAppChat } from "@/components/WhatsAppChat";

export default function WhatsAppPage() {
  // Establecer el título de la página
  usePageTitle("MiBarber | WhatsApp");
  
  return (
    <>
      <Head>
        <title>MiBarber | WhatsApp</title>
      </Head>
      <div className="flex flex-col h-full w-full min-w-0">
        <div className="flex-grow h-full min-w-0">
          <WhatsAppChat />
        </div>
      </div>
    </>
  );
}