'use client';

import { useUser } from '@auth0/nextjs-auth0/client';

export default function AuthButtons() {
  const { user } = useUser();

  if (user) {
    return (
      <div className="auth-buttons">
        <p className="mb-3">Welcome, {user.name || user.email}!</p>
        <a href="/api/auth/logout" className="btn btn-outline-danger btn-auth">
          Logout
        </a>
      </div>
    );
  }

  return (
    <div className="auth-buttons">
      <h2 className="mb-4">Welcome to ChatGPT Clone</h2>
      <p className="mb-4 text-muted">
        A mobile-first AI chat application built with modern web technologies.
      </p>
      <a href="/api/auth/login" className="btn btn-primary btn-auth">
        Login to Continue
      </a>
    </div>
  );
}
