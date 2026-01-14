class MessageParser {
  actionProvider: {
    greet: () => void;
    handleMassTimes: () => void;
    handleLocation: () => void;
    handleContact: () => void;
    handleDonations: () => void;
    handleEvents: () => void;
    handleVolunteer: () => void;
    handleSermons: () => void;
    handleYouthMinistry: () => void;
    handleAdultMinistry: () => void;
    handleOutreach: () => void;
    handleLeadership: () => void;
    handleMission: () => void;
    handlePriest: () => void;
    handleConfession: () => void;
    handlePrayer: () => void;
    handleClinic: () => void;
    handleBaptism: () => void;
    handleWedding: () => void;
    handleFuneral: () => void;
    handleFAQ: () => void;
    handleNews: () => void;
    handleHarvest: () => void;
    handleThanks: () => void;
    handleBye: () => void;
    handleDefault: () => void;
  };
  state: unknown;

  constructor(actionProvider: MessageParser["actionProvider"], state: unknown) {
    this.actionProvider = actionProvider;
    this.state = state;
  }

  parse(message: string) {
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes("hello") || lowerCaseMessage.includes("hi")) {
      this.actionProvider.greet();
    } else if (lowerCaseMessage.includes("mass") || lowerCaseMessage.includes("service")) {
      this.actionProvider.handleMassTimes();
    } else if (lowerCaseMessage.includes("location") || lowerCaseMessage.includes("address")) {
      this.actionProvider.handleLocation();
    } else if (lowerCaseMessage.includes("contact") || lowerCaseMessage.includes("phone")) {
      this.actionProvider.handleContact();
    } else if (lowerCaseMessage.includes("donation") || lowerCaseMessage.includes("give")) {
      this.actionProvider.handleDonations();
    } else if (lowerCaseMessage.includes("event") || lowerCaseMessage.includes("upcoming")) {
      this.actionProvider.handleEvents();
    } else if (lowerCaseMessage.includes("volunteer") || lowerCaseMessage.includes("help")) {
      this.actionProvider.handleVolunteer();
    } else if (lowerCaseMessage.includes("sermon") || lowerCaseMessage.includes("message")) {
      this.actionProvider.handleSermons();
    } else if (lowerCaseMessage.includes("youth") || lowerCaseMessage.includes("children")) {
      this.actionProvider.handleYouthMinistry();
    } else if (lowerCaseMessage.includes("adult") || lowerCaseMessage.includes("group")) {
      this.actionProvider.handleAdultMinistry();
    } else if (lowerCaseMessage.includes("outreach") || lowerCaseMessage.includes("community")) {
      this.actionProvider.handleOutreach();
    } else if (lowerCaseMessage.includes("leadership")) {
      this.actionProvider.handleLeadership();
    } else if (lowerCaseMessage.includes("mission")) {
      this.actionProvider.handleMission();
    } else if (lowerCaseMessage.includes("priest")) {
      this.actionProvider.handlePriest();
    } else if (lowerCaseMessage.includes("confession")) {
      this.actionProvider.handleConfession();
    } else if (lowerCaseMessage.includes("prayer")) {
      this.actionProvider.handlePrayer();
    } else if (lowerCaseMessage.includes("clinic")) {
      this.actionProvider.handleClinic();
    } else if (lowerCaseMessage.includes("baptism")) {
      this.actionProvider.handleBaptism();
    } else if (lowerCaseMessage.includes("wedding")) {
      this.actionProvider.handleWedding();
    } else if (lowerCaseMessage.includes("funeral")) {
      this.actionProvider.handleFuneral();
    } else if (lowerCaseMessage.includes("faq")) {
      this.actionProvider.handleFAQ();
    } else if (lowerCaseMessage.includes("news")) {
      this.actionProvider.handleNews();
    } else if (lowerCaseMessage.includes("harvest")) {
      this.actionProvider.handleHarvest();
    } else if (lowerCaseMessage.includes("bye")) {
      this.actionProvider.handleBye();
    } else if (lowerCaseMessage.includes("thank")) {
      this.actionProvider.handleThanks();
    } else if (lowerCaseMessage.includes("goodbye")) {
      this.actionProvider.handleBye();
    } else if (lowerCaseMessage.includes("what")) {
      this.actionProvider.handleDefault();
    } else if (lowerCaseMessage.includes("how")) {
      this.actionProvider.handleDefault();
    } else if (lowerCaseMessage.includes("when")) {
      this.actionProvider.handleDefault();
    } else if (lowerCaseMessage.includes("where")) {
      this.actionProvider.handleDefault();
    } else if (lowerCaseMessage.includes("why")) {
      this.actionProvider.handleDefault();
    } else if (lowerCaseMessage.includes("who")) {
      this.actionProvider.handleDefault();
    } else if (lowerCaseMessage.includes("cancel")) {
      this.actionProvider.handleDefault();
    }
    else {
      this.actionProvider.handleDefault();
    }
  }
}

export default MessageParser;