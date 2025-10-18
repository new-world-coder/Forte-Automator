'use client';

import React from 'react';
import HeaderBar from '@/components/HeaderBar';
import AgentManager from '@/components/AgentManager';

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AgentManager />
      </main>
    </div>
  );
}
