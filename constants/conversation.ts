// Step 1: Welcome
const WELCOME_MESSAGE = `Hey there! 👋 Welcome to Rocket.Chat! 
I'm here to help you get started. Let’s find the best channels and resources for you.`;


// Step 2: Identify User Persona
const ASK_OTHER_PURPOSE = `Can you briefly describe what you're looking for?`;

const ADDED_TO_CHANNEL = `You've been added to your respective channels—enjoy and make the most of it 🚀🔥`;


const ASK_USER_PURPOSE = `What brings you here today? (Choose one or type your own reason)
1. 🔧 I'm a Rocket.Chat administrator managing a server.
2. 👩‍💻 I'm a developer or contributor looking for project details.
3. 🤝 I'm here to ask questions or get support as a user.
4. 🚀 I want to learn more about Rocket.Chat and explore.
5. ✨ Other (Please describe in a few words!)`;


// Step 3: Confirm Persona & Provide Initial Guidance
const PERSONA_RESPONSES = {
  admin: `Got it! Since you're an admin, you'll find useful discussions and troubleshooting tips in:
  - **#admin-support**: Ask questions about setting up and managing Rocket.Chat.
  - **#best-practices**: Learn tips and strategies from other admins.`,

  developer: `Great! As a developer/contributor, you’ll love these channels:
  - **#dev-contributors**: Discuss development and contributions to Rocket.Chat.
  - **#gsoc**: Learn about Google Summer of Code and how to contribute.`,

  user: `No problem! If you're looking for support, these channels will be helpful:
  - **#user-support**: Get help from the community.
  - **#faqs**: Find answers to common questions.`,

  explorer: `Awesome! Here are some good places to start:
  - **#announcements**: Stay updated with the latest news and features.
  - **#general**: Join open discussions with other members.`,

  default: `I see! Let me guide you to some general resources:
  - **#introductions**: Say hi and meet the community.
  - **#general**: Join open discussions.` 
};

// Step 3: Ask for Confirmation Before Adding to Channels
const ASK_TO_JOIN_CHANNELS = `Would you like me to automatically add you to these channels? (Yes/No)`;

// Step 4: Explain Channel Purposes
const CHANNEL_GUIDE = `Here's how you can participate in these channels:
- **#admin-support** – Ask questions about setting up and managing Rocket.Chat.
- **#dev-contributors** – Connect with developers and contribute to the project.
- **#user-support** – Get help from the community on using Rocket.Chat.
- **#announcements** – Stay updated with the latest news and features.

Feel free to introduce yourself in **#introductions**! 😊`;

// Step 5: Ask About Additional Needs
const ADDITIONAL_HELP = `Is there anything else I can help you with?
1. 📖 Learning Resources (Docs, Tutorials, Videos)
2. 🔍 More Channels & Community Spaces
3. ❓ Just Exploring for Now`;

// Step 6: Final Message & Follow-up
const FINAL_MESSAGE = `You're all set! If you ever need help, just mention me (@botname) in a message. 
Enjoy your time in Rocket.Chat! 🚀`;

// Export all messages
export {
  WELCOME_MESSAGE,
  ASK_OTHER_PURPOSE,
  ADDED_TO_CHANNEL,
  ASK_USER_PURPOSE,
  PERSONA_RESPONSES,
  ASK_TO_JOIN_CHANNELS,
  CHANNEL_GUIDE,
  ADDITIONAL_HELP,
  FINAL_MESSAGE
};
