import React, { useState } from 'react';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import config from './chatbotConfig';
import MessageParser from './MessageParser';
import ActionProvider from './ActionProvider';

const ChurchChatbot = () => {
  const [showBot, toggleBot] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {showBot && (
        <div className="w-80 h-96 bg-white rounded-lg shadow-lg border">
          <Chatbot
            config={config}
            messageParser={MessageParser}
            actionProvider={ActionProvider}
          />
        </div>
      )}
      <button
        className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
        onClick={() => toggleBot(!showBot)}
      >
        {showBot ? '✕' : '💬'}
      </button>
    </div>
  );
};

export default ChurchChatbot;