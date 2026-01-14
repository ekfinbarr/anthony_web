import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
});

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatbotConfig {
  churchName: string;
  location: string;
  pastorName: string;
  serviceTimes: string[];
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
}

// Church-specific configuration
const CHURCH_CONFIG: ChatbotConfig = {
  churchName: "St. Anthony, Gbaja",
  location: "Gbaja, Lagos, Nigeria",
  pastorName: "Very. Rev. Msgr. Bernard Okodua",
  serviceTimes: [
    "Sunday: 7:00 AM, 9:00 AM, 5:00 PM",
    "Wednesday: 7:00 PM (Bible Study)",
    "Saturday: 4:00 PM - 5:00 PM (Confession)"
  ],
  contactInfo: {
    phone: "(555) 123-4567",
    email: "info@stanthonygbaja.org",
    address: "123 Church Street, Gbaja, Lagos"
  }
};

// System prompt for the church chatbot
const SYSTEM_PROMPT = `You are a helpful AI assistant for ${CHURCH_CONFIG.churchName}, a Catholic church located in ${CHURCH_CONFIG.location}. 

Our Parish Priest is ${CHURCH_CONFIG.pastorName}.

Service Times:
${CHURCH_CONFIG.serviceTimes.join('\n')}

Contact Information:
- Phone: ${CHURCH_CONFIG.contactInfo.phone}
- Email: ${CHURCH_CONFIG.contactInfo.email}
- Address: ${CHURCH_CONFIG.contactInfo.address}

You should help visitors and members with:
- Service times and schedules
- Church events and activities
- General Catholic teachings and prayers
- Directions and contact information
- Ministry information
- Sacrament preparation (Baptism, Confirmation, Marriage, etc.)
- Prayer requests (respond with compassion)
- Church facilities and services

Guidelines:
- Be warm, welcoming, and compassionate
- Use appropriate Catholic terminology
- Provide accurate information about our church
- For urgent matters, direct them to contact the church directly
- For complex theological questions, suggest speaking with our pastor
- Always maintain a respectful and prayerful tone
- If you don't know specific information about our church, be honest and suggest contacting us directly

Remember, you represent our church community, so embody our values of love, faith, and service.`;

export class ChurchChatbotService {
  private messages: ChatMessage[] = [];

  constructor() {
    // Initialize with system message
    this.messages = [{
      id: 'system',
      role: 'system',
      content: SYSTEM_PROMPT,
      timestamp: new Date()
    }];
  }

  async sendMessage(userMessage: string): Promise<ChatMessage> {
    try {
      // Add user message to conversation
      const userChatMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      };
      
      this.messages.push(userChatMessage);

      // Prepare messages for OpenAI (exclude system message from conversation display)
      const conversationMessages = this.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        // The OpenAI SDK expects a typed message array; we avoid `any` to satisfy lint.
        messages: conversationMessages as unknown as Array<{ role: string; content: string }>,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const assistantResponse = completion.choices[0]?.message?.content || 
        "I apologize, but I'm having trouble responding right now. Please contact our church office directly.";

      // Add assistant response to conversation
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      };

      this.messages.push(assistantMessage);

      return assistantMessage;
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      
      // Fallback response
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm experiencing technical difficulties. Please contact our church office at " + 
                CHURCH_CONFIG.contactInfo.phone + " for immediate assistance.",
        timestamp: new Date()
      };

      this.messages.push(fallbackMessage);
      return fallbackMessage;
    }
  }

  getConversationHistory(): ChatMessage[] {
    // Return all messages except system message for display
    return this.messages.filter(msg => msg.role !== 'system');
  }

  clearConversation(): void {
    // Keep only the system message
    this.messages = this.messages.filter(msg => msg.role === 'system');
  }

  // Predefined quick responses for common questions
  getQuickResponses(): Array<{ question: string; response: string }> {
    return [
      {
        question: "What are your service times?",
        response: CHURCH_CONFIG.serviceTimes.join('\n')
      },
      {
        question: "How can I contact the church?",
        response: `You can reach us at:\nPhone: ${CHURCH_CONFIG.contactInfo.phone}\nEmail: ${CHURCH_CONFIG.contactInfo.email}\nAddress: ${CHURCH_CONFIG.contactInfo.address}`
      },
      {
        question: "Who is the pastor?",
        response: `Our Parish Priest is ${CHURCH_CONFIG.pastorName}.`
      },
      {
        question: "Where is the church located?",
        response: `We're located at ${CHURCH_CONFIG.contactInfo.address} in ${CHURCH_CONFIG.location}.`
      }
    ];
  }
}

export const chatbotService = new ChurchChatbotService();