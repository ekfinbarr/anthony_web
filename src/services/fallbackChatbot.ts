import { ChatMessage } from './openai';
import { addressLine, contactLines, officeContact, scheduleLines } from '@/config/parishFacts';
import { formatService, otherServices } from '@/config/parish';
import { site } from '@/config/site';

const bullet = (lines: string[]) => lines.map((line) => `• ${line}`).join('\n');
const confessions = otherServices.find((service) => service.name === 'Confessions');
const PRIEST_NAME = 'Very Rev. Fr. Sylvester Tolulope Oladunjoye';
const MASS_TIMES_ANSWER = `Our Mass times are:\n${bullet(scheduleLines)}`;

// Fallback FAQ responses for when OpenAI is not available
const FAQ_RESPONSES: Record<string, string> = {
  // Mass times (keep "service times" as a synonym key for visitor queries)
  'service times': MASS_TIMES_ANSWER,
  'mass times': MASS_TIMES_ANSWER,
  'when do you meet': `We celebrate Mass on:\n${bullet(scheduleLines)}`,

  // Contact information
  'contact': `You can reach us at:\n${bullet(contactLines)}`,
  'phone': site.telephone ? `Our phone number is ${site.telephone}` : `You can reach ${officeContact}, or send a message from our Contact page.`,
  'email': `Our email address is ${site.email}`,
  'address': `We are located at ${addressLine}`,
  'location': `${site.name} is located at ${addressLine}`,

  // Parish priest (keep "pastor" as a synonym key for visitor queries)
  'pastor': `Our Parish Priest is ${PRIEST_NAME}. He serves our parish with dedication and pastoral care.`,
  'priest': `Our Parish Priest is ${PRIEST_NAME}.`,

  // General church information
  'about': 'St. Anthony Catholic Church, Gbaja is a Catholic parish in Surulere, Lagos, Nigeria. We gather for the celebration of the Mass, the sacraments, fellowship, and works of charity.',
  'welcome': 'Welcome to St. Anthony Catholic Church, Gbaja! We are a warm and welcoming Catholic parish. Whether you are visiting for the first time or seeking a parish home, you will find a place here.',

  // Sacraments
  'baptism': `We offer Baptism preparation for infants and adults. Please contact ${officeContact} to arrange a meeting with our parish priest.`,
  'confirmation': 'Confirmation preparation is available for candidates. Please contact the parish office for more information.',
  'marriage': 'We offer marriage preparation. Couples should contact our parish office at least 6 months before their planned wedding date.',
  'confession': confessions ? `Confessions are heard on ${formatService(confessions)}.` : `Please contact ${officeContact} for confession times.`,

  // Activities and ministries
  'ministries': 'We have various ministries including Youth Ministry, Women\'s Ministry, Men\'s Ministry, Choir, and Community Outreach. Contact us to learn how you can get involved!',
  'youth': 'Our Youth Ministry meets every Friday at 6:30 PM in the Youth Hall. All young people are welcome!',
  'choir': 'Our choir practices every Thursday at 7:00 PM in the Music Room. New members are always welcome!',

  // Prayer requests
  'prayer': 'We would be honored to pray for you. You can submit prayer requests by contacting our parish office, speaking with our parish priest, or using our website contact form.',
  'pray': 'We believe in the power of prayer. Please share your prayer intentions with us, and our community will keep you in our prayers.',

  // Events
  'events': 'We have regular events including Bible studies, fellowship dinners, youth activities, and special celebrations. Check our events page for upcoming activities!',

  // Default responses for unclear questions
  'help': 'I\'m here to help you with information about St. Anthony, Gbaja. You can ask me about:\n• Mass times\n• Contact information\n• Our parish priest and staff\n• Sacraments and ministries\n• Upcoming events\n• Prayer requests',
};

export class FallbackChatbotService {
  private messages: ChatMessage[] = [];

  constructor() {
    // Initialize with system message (for consistency)
    this.messages = [{
      id: 'system',
      role: 'system',
      content: 'Fallback chatbot service',
      timestamp: new Date()
    }];
  }

  async sendMessage(userMessage: string): Promise<ChatMessage> {
    // Add user message to conversation
    const userChatMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    this.messages.push(userChatMessage);

    // Process the message and generate a response
    const response = this.generateResponse(userMessage);

    // Add assistant response to conversation
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date()
    };

    this.messages.push(assistantMessage);

    // Simulate some delay for realism
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    return assistantMessage;
  }

  private generateResponse(userMessage: string): string {
    const message = userMessage.toLowerCase().trim();

    // Check for greeting
    if (this.containsAny(message, ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'])) {
      return "Hello! Welcome to St. Anthony, Gbaja. I'm here to help you with information about our church. How can I assist you today?";
    }

    // Check for thanks
    if (this.containsAny(message, ['thank', 'thanks', 'appreciate'])) {
      return "You're very welcome! Is there anything else I can help you with about our church?";
    }

    // Check for goodbye
    if (this.containsAny(message, ['bye', 'goodbye', 'see you', 'have a good'])) {
      return "God bless you! We hope to see you at St. Anthony, Gbaja soon. Have a wonderful day!";
    }

    // Look for FAQ matches
    for (const [key, response] of Object.entries(FAQ_RESPONSES)) {
      if (this.containsKeywords(message, key)) {
        return response;
      }
    }

    // Check for question words
    if (this.containsAny(message, ['what', 'when', 'where', 'who', 'how', 'why', '?'])) {
      return `I'd be happy to help answer your question! For detailed information, please contact ${officeContact}. Our staff can provide you with specific details about our church community.`;
    }

    // Default response
    return `Thank you for your message! I'm a simple assistant here to help with basic information about St. Anthony, Gbaja. For detailed questions or specific needs, please contact ${officeContact} or visit us in person. Our staff would be delighted to assist you personally!`;
  }

  private containsAny(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  private containsKeywords(text: string, keywords: string): boolean {
    const keywordList = keywords.split(' ');
    return keywordList.some(keyword => text.includes(keyword));
  }

  getConversationHistory(): ChatMessage[] {
    return this.messages.filter(msg => msg.role !== 'system');
  }

  clearConversation(): void {
    this.messages = this.messages.filter(msg => msg.role === 'system');
  }

  getQuickResponses(): Array<{ question: string; response: string }> {
    return [
      {
        question: "What are your Mass times?",
        response: FAQ_RESPONSES['mass times']
      },
      {
        question: "How can I contact the church?",
        response: FAQ_RESPONSES['contact']
      },
      {
        question: "Who is the parish priest?",
        response: FAQ_RESPONSES['priest']
      },
      {
        question: "Tell me about your ministries",
        response: FAQ_RESPONSES['ministries']
      }
    ];
  }
}

export const fallbackChatbotService = new FallbackChatbotService();
