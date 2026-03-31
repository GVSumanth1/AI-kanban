import React from 'react';
import Head from 'next/head';
import { KanbanBoard } from '@/components/KanbanBoard';

export default function Home() {
  return (
    <>
      <Head>
        <title>AI-Driven Kanban Inbox</title>
        <meta name="description" content="Intelligent email management with n8n and AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="main-container">
        <KanbanBoard />
      </main>
    </>
  );
}
