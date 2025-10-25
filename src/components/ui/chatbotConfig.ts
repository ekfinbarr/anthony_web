import { createChatBotMessage } from 'react-chatbot-kit';

const config = {
  botName: "St. Anthony Assistant",
  initialMessages: [
    createChatBotMessage("Hello! I'm the St. Anthony Church assistant. How can I help you today?", {
        widget: "options",
    }),
  ],
  customStyles: {
    botMessageBox: {
      backgroundColor: "#3b82f6",
    },
    chatButton: {
      backgroundColor: "#3b82f6",
    },
  },
};

export default config;