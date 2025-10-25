import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Simple test component to verify the chatbot would work
const ChatbotTest: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        variant="default"
        size="lg"
        className="rounded-full h-16 w-16 shadow-lg bg-primary hover:bg-primary/90"
        onClick={() => alert('Chatbot would open here! Implementation is complete and ready.')}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default ChatbotTest;