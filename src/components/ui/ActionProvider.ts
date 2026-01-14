import { createChatBotMessage } from 'react-chatbot-kit';

type ChatbotState = {
    messages: unknown[];
    [key: string]: unknown;
};

type CreateMessageFn = (...args: unknown[]) => unknown;
type SetStateFn = (updater: (prev: ChatbotState) => ChatbotState) => void;

class ActionProvider {
    createChatBotMessage: CreateMessageFn;
    setState: SetStateFn;
    createClientMessage: CreateMessageFn;

    constructor(createChatBotMessage: CreateMessageFn, setStateFunc: SetStateFn, createClientMessage: CreateMessageFn) {
        this.createChatBotMessage = createChatBotMessage;
        this.setState = setStateFunc;
        this.createClientMessage = createClientMessage;
    }

    // parse(message: string) {
    //     const lowerCaseMessage = message.toLowerCase();

    //     if (lowerCaseMessage.includes("hello") || lowerCaseMessage.includes("hi")) {
    //         this.actionProvider.greet();
    //     } else if (lowerCaseMessage.includes("mass") || lowerCaseMessage.includes("service")) {
    //         this.actionProvider.handleMassTimes();
    //     } else if (lowerCaseMessage.includes("location") || lowerCaseMessage.includes("address")) {
    //         this.actionProvider.handleLocation();
    //     } else if (lowerCaseMessage.includes("contact") || lowerCaseMessage.includes("phone")) {
    //         this.actionProvider.handleContact();
    //     } else if (lowerCaseMessage.includes("donation") || lowerCaseMessage.includes("give")) {
    //         this.actionProvider.handleDonations();
    //     } else if (lowerCaseMessage.includes("event") || lowerCaseMessage.includes("upcoming")) {
    //         this.actionProvider.handleEvents();
    //     } else if (lowerCaseMessage.includes("volunteer") || lowerCaseMessage.includes("help")) {
    //         this.actionProvider.handleVolunteer();
    //     } else if (lowerCaseMessage.includes("sermon") || lowerCaseMessage.includes("message")) {
    //         this.actionProvider.handleSermons();
    //     } else if (lowerCaseMessage.includes("youth") || lowerCaseMessage.includes("children")) {
    //         this.actionProvider.handleYouthMinistry();
    //     } else if (lowerCaseMessage.includes("adult") || lowerCaseMessage.includes("group")) {
    //         this.actionProvider.handleAdultMinistry();
    //     } else if (lowerCaseMessage.includes("outreach") || lowerCaseMessage.includes("community")) {
    //         this.actionProvider.handleOutreach();
    //     } else if (lowerCaseMessage.includes("leadership")) {
    //         this.actionProvider.handleLeadership();
    //     } else if (lowerCaseMessage.includes("mission")) {
    //         this.actionProvider.handleMission();
    //     } else if (lowerCaseMessage.includes("priest")) {
    //         this.actionProvider.handlePriest();
    //     } else if (lowerCaseMessage.includes("confession")) {
    //         this.actionProvider.handleConfession();
    //     } else if (lowerCaseMessage.includes("prayer")) {
    //         this.actionProvider.handlePrayer();
    //     } else if (lowerCaseMessage.includes("clinic")) {
    //         this.actionProvider.handleClinic();
    //     } else if (lowerCaseMessage.includes("baptism")) {
    //         this.actionProvider.handleBaptism();
    //     } else if (lowerCaseMessage.includes("wedding")) {
    //         this.actionProvider.handleWedding();
    //     } else if (lowerCaseMessage.includes("funeral")) {
    //         this.actionProvider.handleFuneral();
    //     } else if (lowerCaseMessage.includes("faq")) {
    //         this.actionProvider.handleFAQ();
    //     } else if (lowerCaseMessage.includes("news")) {
    //         this.actionProvider.handleNews();
    //     } else if (lowerCaseMessage.includes("contact")) {
    //         this.actionProvider.handleContact();
    //     } else if (lowerCaseMessage.includes("harvest")) {
    //         this.actionProvider.handleHarvest();
    //     }
    //     else if (lowerCaseMessage.includes("thank")) {
    //         this.actionProvider.handleDefault();
    //     } else if (lowerCaseMessage.includes("bye")) {
    //         this.actionProvider.handleDefault();
    //     } else if (lowerCaseMessage.includes("thanks")) {
    //         this.actionProvider.handleDefault();
    //     } else if (lowerCaseMessage.includes("goodbye")) {
    //         this.actionProvider.handleDefault();
    //     } else if (lowerCaseMessage.includes("what")) {
    //         this.actionProvider.handleDefault();
    //     } else if (lowerCaseMessage.includes("how")) {
    //         this.actionProvider.handleDefault();
    //     } else if (lowerCaseMessage.includes("when")) {
    //         this.actionProvider.handleDefault();
    //     } else if (lowerCaseMessage.includes("where")) {
    //         this.actionProvider.handleDefault();
    //     } else if (lowerCaseMessage.includes("why")) {
    //         this.actionProvider.handleDefault();
    //     } else if (lowerCaseMessage.includes("who")) {
    //         this.actionProvider.handleDefault();
    //     } else if (lowerCaseMessage.includes("help")) {
    //         this.actionProvider.handleDefault();
    //     } else if (lowerCaseMessage.includes("cancel")) {
    //         this.actionProvider.handleDefault();
    //     }
    //     else {
    //         this.actionProvider.handleDefault();
    //     }
    // }
    greet = () => {
        const message = this.createChatBotMessage("Hello! Welcome to St. Anthony Church. How can I assist you today?");
        this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, message],
        }));
    };

    handleMassTimes = () => {
        const message = this.createChatBotMessage("Our Mass times are:\n• Sunday: 9:00 AM & 11:00 AM\n• Wednesday: 7:00 PM\n\nWe also have other services throughout the week. Would you like more information?");
        this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, message],
        }));
    };

    handleLocation = () => {
        const message = this.createChatBotMessage("St. Anthony Church is located at:\n123 Church Street\nGbaja, Nigeria\n\nWe'd love to have you visit us!");
        this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, message],
        }));
    };

    handleContact = () => {
        const message = this.createChatBotMessage("You can contact us:\n• Phone: (555) 123-4567\n• Email: info@stantony.org\n• Visit our Contact page for more details");
        this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, message],
        }));
    };

    handleDonations = () => {
        const message = this.createChatBotMessage("We appreciate your generosity! You can make donations through our website or visit us in person. Every contribution helps support our community and ministries.");
        this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, message],
        }));
    };

    handleDefault = () => {
        const message = this.createChatBotMessage("I'm here to help with information about St. Anthony Church. You can ask me about mass times, location, contact information, donations, or any other church-related questions!");
        this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, message],
        }));
    };

    handleEvents = () => {
        const message = this.createChatBotMessage("We have various events throughout the year including community outreach, youth programs, and special services. Please check our Events page for the latest updates and schedules.");
        this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, message],
        }));
    };

    handleVolunteer = () => {
        const message = this.createChatBotMessage("We welcome volunteers to join our ministries and community service projects. Please visit our Volunteer page to learn more about opportunities and how to get involved.");
        this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, message],
        }));
    };

    handleSermons = () => {
        const message = this.createChatBotMessage("You can find our latest sermons on our Sermons page. We regularly upload recordings and transcripts for your spiritual growth and reflection.");
        this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, message],
        }));
    };

    handleYouthMinistry = () => {
        const message = this.createChatBotMessage("Our Youth Ministry offers programs and activities for children and teenagers to grow in faith and community. Please visit our Ministries page for more information.");
        this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, message],
        }));
    };

    handleAdultMinistry = () => {
        const message = this.createChatBotMessage("Our Adult Ministry provides various groups and activities for adults to engage in fellowship and spiritual growth. Check out our Ministries page for details.");
        this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, message],
        }));
    };

    handleOutreach = () => {
        const message = this.createChatBotMessage("We are committed to serving our community through various outreach programs. Visit our Outreach page to learn how you can get involved.");
        this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, message],
        }));
    };

    handleLeadership = () => {
        const message = this.createChatBotMessage("Our church leadership team is dedicated to guiding our parish community. You can find more information about our leaders on the Leadership section of our About page.");
        this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, message],
        }));
    };

    handleMission = () => {
        const message = this.createChatBotMessage("St. Anthony Church is dedicated to serving God and our community through worship, education, and outreach. Learn more about our mission on the About page.");
        this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, message],
        }));
    };

    handlePriest = () => {
        const message = this.createChatBotMessage("Our priests are here to serve you. You can find information about our clergy on the Leadership section of our About page.");
        this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, message],
        }));
    };

    handleConfession = () => {
        const message = this.createChatBotMessage("Confession is available every Saturday from 4:00 PM to 5:00 PM and by appointment. Please visit our Sacraments page for more details.");
        this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, message],
        }));
    };

    handlePrayer = () => {
        const message = this.createChatBotMessage("We offer various prayer services throughout the week. You can also submit prayer requests through our Prayer page.");
        this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, message],
        }));
    };

    handleClinic = () => {
        const message = this.createChatBotMessage("Our church clinic provides basic health services to the community. Please visit our Clinic page for more information on services and hours.");
        this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, message],
        }));
    };

    handleBaptism = () => {
        const message = this.createChatBotMessage("Baptism is a sacred sacrament in our church. Please visit our Sacraments page for information on how to prepare and schedule a baptism.");
        this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, message],
        }));
    };

    handleWedding = () => {
        const message = this.createChatBotMessage("We would be honored to host your wedding at St. Anthony Church. Please visit our Sacraments page for details on the wedding preparation process.");
        this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, message],
        }));
    };
    
    handleFuneral = () => {
        const message = this.createChatBotMessage("We offer funeral services to honor and remember your loved ones. Please contact our church office for assistance and visit our Sacraments page for more information.");
        this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, message],
        }));
    };

    handleFAQ = () => {
        const message = this.createChatBotMessage("You can find answers to common questions on our FAQ page. If you have a specific question, feel free to ask me!");
        this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, message],
        }));
    };

    handleNews = () => {
        const message = this.createChatBotMessage("Stay updated with the latest news and announcements by visiting our News page.");
        this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, message],
        }));
    };

    handleHarvest = () => {
        const message = this.createChatBotMessage("Our annual Harvest Festival is a time of celebration and community. Please visit our Events page for details on the next festival.");
        this.setState((prev: ChatbotState) => ({
            ...prev,
            messages: [...prev.messages, message],
        }));
    };
    
}

export default ActionProvider;