# AI Chatbot Implementation

## Overview

This implementation adds an intelligent OpenAI GPT-4 powered chatbot to the St. Anthony Church website. The chatbot provides:

- 24/7 support for church information
- Intelligent responses to faith-related questions
- Service times and event information
- Contact details and directions
- Fallback FAQ system when OpenAI is unavailable

## Features

### 🤖 AI-Powered Responses
- Uses OpenAI GPT-4 for natural, contextual responses
- Church-specific knowledge base
- Warm, welcoming tone appropriate for a church community
- Handles complex theological and practical questions

### 🔄 Fallback System
- Comprehensive FAQ system when OpenAI API is unavailable
- Pattern matching for common questions
- Maintains functionality without external dependencies

### 🎨 Modern UI/UX
- Floating chat button with notification indicator
- Smooth animations using Framer Motion
- Mobile-responsive design
- Typing indicators and message timestamps
- Quick response buttons for common questions

### ⚙️ Configuration
- Environment-based API key management
- Automatic fallback to FAQ mode
- Customizable church information
- Rate limiting and error handling

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the project root:

```env
# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# Chatbot Configuration
VITE_CHATBOT_ENABLED=true
```

### 2. OpenAI API Key Setup

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Add the key to your `.env.local` file

### 3. Church Information Customization

Edit `src/services/openai.ts` to update church-specific information:

```typescript
const CHURCH_CONFIG: ChatbotConfig = {
  churchName: "Your Church Name",
  location: "Your Location",
  pastorName: "Your Pastor Name",
  serviceTimes: [
    "Sunday: 9:00 AM & 11:00 AM",
    "Wednesday: 7:00 PM (Bible Study)"
  ],
  contactInfo: {
    phone: "Your Phone Number",
    email: "your@email.com",
    address: "Your Address"
  }
};
```

## Usage

### For Users
1. Click the floating chat button in the bottom-right corner
2. Type questions about the church, services, or faith
3. Use quick response buttons for common questions
4. Clear conversation history with the reset button

### For Administrators
- Monitor usage through OpenAI dashboard
- Update church information in configuration files
- Customize responses by modifying the system prompt

## File Structure

```
src/
├── components/chat/
│   └── Chatbot.tsx          # Main chatbot component
├── hooks/
│   └── useChatbot.ts        # Chatbot logic hook
├── services/
│   ├── openai.ts            # OpenAI service
│   └── fallbackChatbot.ts   # FAQ fallback service
└── App.tsx                  # Chatbot integration
```

## API Costs

OpenAI GPT-4 pricing (as of 2024):
- Input tokens: $0.03 per 1K tokens
- Output tokens: $0.06 per 1K tokens
- Typical conversation: ~$0.01-0.05 per exchange

Monthly estimated costs for a church:
- Light usage (100 conversations): $1-5
- Medium usage (500 conversations): $5-25
- Heavy usage (1000+ conversations): $25-100

## Security Considerations

- API keys are environment-based and not committed to version control
- Client-side API usage (acceptable for church use case)
- For production, consider implementing server-side proxy
- Rate limiting built into OpenAI API

## Fallback Mode

When OpenAI API is unavailable, the chatbot automatically switches to FAQ mode:
- Pattern-matching responses
- Comprehensive question coverage
- Church-specific information
- Graceful degradation

## Customization Options

### Response Tone
Modify the system prompt in `openai.ts` to adjust the chatbot's personality and responses.

### Quick Responses
Update the `getQuickResponses()` method to change suggested questions.

### UI Styling
Customize the chatbot appearance by modifying the Tailwind classes in `Chatbot.tsx`.

### Additional Features
- Add typing delays for more realistic responses
- Implement conversation history storage
- Add multi-language support
- Integrate with church management systems

## Troubleshooting

### Common Issues

1. **Chatbot not appearing**
   - Check if `VITE_CHATBOT_ENABLED=true` in environment
   - Ensure the component is imported in `App.tsx`

2. **OpenAI API errors**
   - Verify API key is correct and has sufficient credits
   - Check network connectivity
   - Monitor OpenAI status page

3. **Fallback mode always active**
   - Ensure API key is properly set
   - Check environment variable name matches `VITE_OPENAI_API_KEY`

### Error Handling
The chatbot includes comprehensive error handling:
- Network failures gracefully fall back to error messages
- Invalid API responses show helpful error messages
- Automatic retry mechanisms for transient failures

## Future Enhancements

Potential improvements for future versions:
- Voice message support
- Integration with church calendar
- Prayer request management
- Multi-language support
- Analytics and usage tracking
- Integration with church management software

## Support

For technical support or questions about the chatbot implementation:
1. Check the troubleshooting section above
2. Review OpenAI API documentation
3. Contact your development team
4. Submit issues through your project management system