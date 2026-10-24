import OpenAI from 'openai';
import { addressLine, officeContact, scheduleLines } from '@/config/parishFacts';
import { site } from '@/config/site';

/**
 * SECURITY: any VITE_* variable is embedded in the public JavaScript bundle.
 * The OpenAI key is therefore only read in development builds; production builds
 * compile it out and the chatbot uses the rule-based fallback. To offer the AI
 * assistant in production, proxy requests through the backend (AnthonyServer)
 * and keep the key server-side.
 */
const OPENAI_API_KEY: string | undefined = import.meta.env.DEV ? import.meta.env.VITE_OPENAI_API_KEY : undefined;

const PLACEHOLDER_KEYS = ['your_openai_api_key_here', 'sk-your-development-key-here'];

export const isOpenAIEnabled = Boolean(OPENAI_API_KEY && !PLACEHOLDER_KEYS.includes(OPENAI_API_KEY));

// Initialize OpenAI client (development only)
const openai = isOpenAIEnabled
  ? new OpenAI({ apiKey: OPENAI_API_KEY, dangerouslyAllowBrowser: true })
  : null;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatbotConfig {
  churchName: string;
  location: string;
  parishPriestName: string;
  massTimes: string[];
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
}

// Church-specific configuration
const CHURCH_CONFIG: ChatbotConfig = {
  churchName: "St. Anthony Catholic Church, Gbaja",
  location: "Gbaja, Surulere, Lagos, Nigeria",
  parishPriestName: "Very Rev. Fr. Sylvester Tolulope Oladunjoye",
  massTimes: scheduleLines,
  contactInfo: {
    phone: site.telephone ?? "not published — please email the parish office",
    email: site.email,
    address: addressLine
  }
};

// System prompt for the church chatbot
const SYSTEM_PROMPT = `You are a helpful AI assistant for ${CHURCH_CONFIG.churchName}, a Catholic parish located in ${CHURCH_CONFIG.location}. 

Our Parish Priest is ${CHURCH_CONFIG.parishPriestName}.

Mass Times:
${CHURCH_CONFIG.massTimes.join('\n')}

Contact Information:
- Phone: ${CHURCH_CONFIG.contactInfo.phone}
- Email: ${CHURCH_CONFIG.contactInfo.email}
- Address: ${CHURCH_CONFIG.contactInfo.address}

You should help visitors and members with:
- Mass times and parish schedules
- Parish events and activities
- General Catholic teachings and prayers
- Directions and contact information
- Ministry information
- Sacrament preparation (Baptism, Confirmation, Eucharist, Confession, Marriage, etc.)
- Prayer requests (respond with compassion)
- Parish facilities

Guidelines:
- Be warm, welcoming, and compassionate
- Use Catholic liturgical terminology: say "Mass" (not "service"), "Parish Priest" or "priest" (not "pastor"), "homily" (not "sermon" when referring to the Mass)
- Provide accurate information about our parish
- For urgent matters, direct them to contact the parish office directly
- For complex theological questions, suggest speaking with our parish priest
- Always maintain a respectful and prayerful tone
- If you don't know specific information about our parish, be honest and suggest contacting us directly

Remember, you represent our Catholic parish community, so embody the values of faith, charity, and communion.`;

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

      if (!openai) throw new Error('OpenAI is not configured');

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
        content: `I'm sorry, I'm experiencing technical difficulties. Please contact ${officeContact} for assistance.`,
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
        question: "What are your Mass times?",
        response: CHURCH_CONFIG.massTimes.join('\n')
      },
      {
        question: "How can I contact the church?",
        response: `You can reach us at:\nPhone: ${CHURCH_CONFIG.contactInfo.phone}\nEmail: ${CHURCH_CONFIG.contactInfo.email}\nAddress: ${CHURCH_CONFIG.contactInfo.address}`
      },
      {
        question: "Who is the parish priest?",
        response: `Our Parish Priest is ${CHURCH_CONFIG.parishPriestName}.`
      },
      {
        question: "Where is the church located?",
        response: `We're located at ${CHURCH_CONFIG.contactInfo.address} in ${CHURCH_CONFIG.location}.`
      }
    ];
  }
}

export const chatbotService = new ChurchChatbotService();