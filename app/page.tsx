'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect } from 'react';
import ChatInterface from '../components/ChatInterface';
import AuthButtons from '../components/AuthButtons';

export default function Home() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="mobile-container">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mobile-container">
        <div className="chat-header">
          <h1>ChatGPT Clone</h1>
        </div>
        <AuthButtons />
      </div>
    );
  }

  return (
    <div className="mobile-container">
      <ChatInterface />
    </div>
  );
}
