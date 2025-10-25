import { ChatMessage } from './openai';

// Fallback FAQ responses for when OpenAI is not available
const FAQ_RESPONSES: Record<string, string> = {
  // Service times
  'service times': 'Our service times are:\n• Sunday: 7:00 AM, 9:00 AM, 5:00 PM\n• Wednesday: 7:00 PM (Bible Study)\n• Saturday: 4:00 PM - 5:00 PM (Confession)',
  'mass times': 'Our Mass times are:\n• Sunday: 7:00 AM, 9:00 AM, 5:00 PM\n• Wednesday: 7:00 PM (Bible Study)\n• Saturday: 4:00 PM - 5:00 PM (Confession)',
  'when do you meet': 'We meet for worship on:\n• Sunday: 7:00 AM, 9:00 AM, 5:00 PM\n• Wednesday: 7:00 PM (Bible Study)\n• Saturday: 4:00 PM - 5:00 PM (Confession)',
  
  // Contact information
  'contact': 'You can reach us at:\n• Phone: (555) 123-4567\n• Email: info@stanthonygbaja.org\n• Address: 123 Church Street, Gbaja, Lagos',
  'phone': 'Our phone number is (555) 123-4567',
  'email': 'Our email address is info@stanthonygbaja.org',
  'address': 'We are located at 123 Church Street, Gbaja, Lagos, Nigeria',
  'location': 'St. Anthony Catholic Church is located at 123 Church Street, Gbaja, Lagos, Nigeria',
  
  // Pastor information
  'pastor': 'Our Parish Priest is Very. Rev. Msgr. Bernard Okodua. He has been serving our community with dedication and love.',
  'priest': 'Our Parish Priest is Very. Rev. Msgr. Bernard Okodua.',
  
  // General church information
  'about': 'St. Anthony, Gbaja is a vibrant Catholic church community located in Lagos, Nigeria. We are committed to spreading God\'s love through worship, fellowship, and service.',
  'welcome': 'Welcome to St. Anthony, Gbaja! We are a warm and welcoming Catholic community. Whether you\'re visiting for the first time or looking for a church home, you\'ll find a place here.',
  
  // Sacraments
  'baptism': 'We offer baptism preparation classes for infants and adults. Please contact our parish office at (555) 123-4567 to schedule a meeting with our pastor.',
  'confirmation': 'Confirmation classes are available for young adults. Please speak with our youth minister or contact the parish office for more information.',
  'marriage': 'We offer marriage preparation programs. Couples should contact our parish office at least 6 months before their planned wedding date.',
  'confession': 'Confession is available on Saturdays from 4:00 PM to 5:00 PM in our reconciliation room.',
  
  // Activities and ministries
  'ministries': 'We have various ministries including Youth Ministry, Women\'s Ministry, Men\'s Ministry, Choir, and Community Outreach. Contact us to learn how you can get involved!',
  'youth': 'Our Youth Ministry meets every Friday at 6:30 PM in the Youth Hall. All young people are welcome!',
  'choir': 'Our choir practices every Thursday at 7:00 PM in the Music Room. New members are always welcome!',
  
  // Prayer requests
  'prayer': 'We would be honored to pray for you. You can submit prayer requests by contacting our parish office, speaking with our pastor, or using our website contact form.',
  'pray': 'We believe in the power of prayer. Please share your prayer intentions with us, and our community will keep you in our prayers.',
  
  // Events
  'events': 'We have regular events including Bible studies, fellowship dinners, youth activities, and special celebrations. Check our events page for upcoming activities!',
  
  // Default responses for unclear questions
  'help': 'I\'m here to help you with information about St. Anthony, Gbaja. You can ask me about:\n• Service times\n• Contact information\n• Our pastor and staff\n• Sacraments and ministries\n• Upcoming events\n• Prayer requests',
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
      return "I'd be happy to help answer your question! For detailed information, please contact our parish office at (555) 123-4567 or email info@stanthonygbaja.org. Our staff can provide you with specific details about our church community.";
    }

    // Default response
    return "Thank you for your message! I'm a simple assistant here to help with basic information about St. Anthony, Gbaja. For detailed questions or specific needs, please contact our parish office at (555) 123-4567 or visit us in person. Our staff would be delighted to assist you personally!";
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
        question: "What are your service times?",
        response: FAQ_RESPONSES['service times']
      },
      {
        question: "How can I contact the church?",
        response: FAQ_RESPONSES['contact']
      },
      {
        question: "Who is the pastor?",
        response: FAQ_RESPONSES['pastor']
      },
      {
        question: "Tell me about your ministries",
        response: FAQ_RESPONSES['ministries']
      }
    ];
  }
}

export const fallbackChatbotService = new FallbackChatbotService();