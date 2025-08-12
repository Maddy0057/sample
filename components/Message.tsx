'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageProps {
  message: {
    id: string;
    role: 'user' | 'model';
    content: string;
    created_at: string;
  };
}

export default function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';
  const isImageGeneration = message.content.startsWith('/imagine ');
  const isImageResponse = message.content.startsWith('Generated image:');

  const imageUrl = isImageResponse ? message.content.replace('Generated image: ', '') : null;

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const textBody = (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
    </div>
  );

  return (
    <div className={`message ${isUser ? 'user' : 'model'} fade-in`}>
      <div className="message-content">
        {isImageGeneration ? (
          <div>
            <div className="text-muted mb-2">
              <small>🎨 Image Generation Request</small>
            </div>
            <div>{message.content.substring(9)}</div>
          </div>
        ) : isImageResponse ? (
          <div>
            <div className="text-muted mb-2">
              <small>🖼️ Generated Image</small>
            </div>
            <img
              src={imageUrl!}
              alt="AI Generated"
              className="message-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        ) : (
          isUser ? (
            textBody
          ) : (
            <span className="reveal-vertical">{textBody}</span>
          )
        )}

        <div className="mt-2">
          <small className="text-muted">{formatTime(message.created_at)}</small>
        </div>
      </div>
    </div>
  );
}
