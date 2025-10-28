"use client";

import { useState } from "react";
import Head from 'next/head';
import { usePageTitle } from "@/hooks/usePageTitle";
import { WhatsAppChat } from "@/components/WhatsAppChat";

export default function WhatsAppPage() {
  // Establecer el título de la página
  usePageTitle("Barberox | WhatsApp");
  
  return (
    <>
      <Head>
        <title>Barberox | WhatsApp</title>
      </Head>
      <div className="flex flex-col h-screen w-full min-w-0">
        <WhatsAppChat />
      </div>
    </>
  );
}