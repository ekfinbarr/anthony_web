import { useState, useCallback, useRef, useEffect } from 'react';
import { chatbotService, ChatMessage } from '@/services/openai';
import { fallbackChatbotService } from '@/services/fallbackChatbot';

export interface UseChatbotReturn {
  messages: ChatMessage[];
  sendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  isTyping: boolean;
  clearConversation: () => void;
  quickResponses: Array<{ question: string; response: string }>;
  usingFallback: boolean;
}

export const useChatbot = (): UseChatbotReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check if OpenAI is available
  const hasOpenAIKey = Boolean(import.meta.env.VITE_OPENAI_API_KEY && 
    import.meta.env.VITE_OPENAI_API_KEY !== 'your_openai_api_key_here' &&
    import.meta.env.VITE_OPENAI_API_KEY !== 'sk-your-development-key-here');

  // Choose the appropriate service
  const currentService = hasOpenAIKey ? chatbotService : fallbackChatbotService;

  useEffect(() => {
    setUsingFallback(!hasOpenAIKey);
  }, [hasOpenAIKey]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: hasOpenAIKey 
        ? `Welcome to St. Anthony, Gbaja! 🏛️ 

I'm your AI assistant, powered by advanced technology to help you with information about our church, service times, events, and answer any questions you might have about our faith community.

How can I assist you today?`
        : `Welcome to St. Anthony, Gbaja! 🏛️ 

I'm here to help you with basic information about our church, service times, events, and our community.

How can I assist you today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [hasOpenAIKey]);

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
        content: "I apologize, but I'm having trouble responding right now. Please try again or contact our church office directly at (555) 123-4567.",
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