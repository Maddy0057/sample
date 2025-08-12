'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { trpc } from '../utils/trpc';
import Message from './Message';

export default function ChatInterface() {
  const { user } = useUser();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);
  const [errorText, setErrorText] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const historyQuery = trpc.chat.getChatHistory.useQuery();
  const chatHistory = historyQuery.data || [];

  const generateTextMutation = trpc.chat.generateText.useMutation();
  const generateImageMutation = trpc.chat.generateImage.useMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [chatHistory, optimisticMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    setInput('');
    setIsLoading(true);

    const now = new Date().toISOString();
    const optimisticUserMsg = { id: `tmp-${now}`, role: 'user' as const, content: userInput, created_at: now };
    const optimisticModelMsg = { id: `tmp-model-${now}`, role: 'model' as const, content: 'Thinking... (generating response)', created_at: now };
    setOptimisticMessages((prev) => [...prev, optimisticUserMsg, optimisticModelMsg]);

    try {
      if (userInput.startsWith('/imagine ')) {
        const prompt = userInput.substring(9);
        await generateImageMutation.mutateAsync({ prompt });
      } else {
        await generateTextMutation.mutateAsync({ prompt: userInput });
      }
      await historyQuery.refetch();
      setOptimisticMessages([]);
    } catch (error: any) {
      console.error('Error generating response:', error);
      setErrorText(error?.message || 'Failed to generate a response. Please try again.');
      await historyQuery.refetch();
    } finally {
      setIsLoading(false);
    }
  };

  const messages = [...chatHistory, ...optimisticMessages];

  return (
    <>
      {/* Header */}
      <div className="chat-header">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-chat-dots-fill" aria-hidden="true"></i>
            <h1 className="m-0">ChatGPT Clone</h1>
          </div>
          <div className="d-flex align-items-center gap-2">
            <small className="text-light opacity-75 d-none d-sm-inline">{user?.email}</small>
            <a href="/api/auth/logout" className="btn btn-sm btn-outline-light d-flex align-items-center gap-1" title="Logout">
              <i className="bi bi-box-arrow-right" aria-hidden="true"></i>
              <span className="d-none d-sm-inline">Logout</span>
            </a>
          </div>
        </div>
      </div>

      {errorText && (
        <div className="alert alert-warning m-3 py-2 px-3" role="alert">{errorText}</div>
      )}

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((message, index) => (
          <Message key={message.id ?? index} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Type your message... (use /imagine for images)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className="btn btn-send" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              <i className="bi bi-send" aria-hidden="true"></i>
            )}
          </button>
        </div>
      </form>
    </>
  );
}
