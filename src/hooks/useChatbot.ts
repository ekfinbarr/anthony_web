import { useState, useCallback, useRef, useEffect } from 'react';
import { chatbotService, ChatMessage, isOpenAIEnabled } from '@/services/openai';
import { fallbackChatbotService } from '@/services/fallbackChatbot';
import { officeContact } from '@/config/parishFacts';

export interface UseChatbotReturn {
  messages: ChatMessage[];
  sendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  isTyping: boolean;
  clearConversation: () => void;
  quickResponses: Array<{ question: string; response: string }>;
  usingFallback: boolean;
}

/** Opening message; wording depends on whether the AI assistant is configured. */
const createWelcomeMessage = (hasOpenAIKey: boolean): ChatMessage => {
  return {
    id: 'welcome',
    role: 'assistant',
    content: hasOpenAIKey 
      ? `Welcome to St. Anthony Catholic Church, Gbaja!

I'm your parish assistant. I can help with Mass times, sacraments, events, and other information about our Catholic parish community.

How can I assist you today?`
      : `Welcome to St. Anthony Catholic Church, Gbaja!

I'm here to help with Mass times, sacraments, events, and basic information about our parish.

How can I assist you today?`,
    timestamp: new Date()
  };
};

export const useChatbot = (): UseChatbotReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createWelcomeMessage(isOpenAIEnabled)]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check if OpenAI is available
  const hasOpenAIKey = isOpenAIEnabled;

  // Choose the appropriate service
  const currentService = hasOpenAIKey ? chatbotService : fallbackChatbotService;

  // The OpenAI key is fixed at build time, so this never changes during a session.
  const usingFallback = !hasOpenAIKey;


  const sendMessage = useCallback(async (userMessage: string) => {
    if (isLoading || !userMessage.trim()) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsLoading(true);
    setIsTyping(true);

    try {
      // Add user message immediately to UI
      const userChatMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: userMessage.trim(),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userChatMessage]);

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      // Send message to appropriate chatbot service
      const assistantResponse = await currentService.sendMessage(userMessage.trim());

      // Add assistant response to UI
      setMessages(prev => [...prev, assistantResponse]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to UI
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, but I'm having trouble responding right now. Please try again or contact ${officeContact}.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  }, [isLoading, currentService]);

  const clearConversation = useCallback(() => {
    currentService.clearConversation();
    
    // Reset to welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome-' + Date.now(),
      role: 'assistant',
      content: `Welcome back! How can I help you today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [currentService]);

  const quickResponses = currentService.getQuickResponses();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    messages,
    sendMessage,
    isLoading,
    isTyping,
    clearConversation,
    quickResponses,
    usingFallback
  };
};