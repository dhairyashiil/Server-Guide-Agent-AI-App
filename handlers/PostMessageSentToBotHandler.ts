import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
    IUserRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IPostMessageSentToBot } from "@rocket.chat/apps-engine/definition/messages/IPostMessageSentToBot";
import {
    IMessage,
    IMessageRaw,
} from "@rocket.chat/apps-engine/definition/messages";
import { ServerGuideAgentApp } from "../ServerGuideAgentApp";
import { sendDirectMessage, sendNotification } from "../lib/Messages";
import { getRoom } from "../lib/RoomInteraction";
import { joinUserToRoom } from "../lib/addUserToRoom";
import {
    createRouterPromptByMessage,
    createUserIntentPromptByMessage,
    createValidMessagePromptByMessage,
} from "../constants/prompts";
import {
    createTextCompletion,
    createTextCompletionGroq,
} from "../lib/createTextCompletion";
import {
    storeOrUpdateData,
    removeAllData,
    addRoomId,
    removeRoomId,
    storeUserIntent,
    getUserIntents,
    deleteAllUserIntents,
} from "../lib/PersistenceMethods";
import { getRoomIds } from "../lib/PersistenceMethods";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import {
    ADDED_TO_CHANNEL,
    AI_Error_Message,
    RESPONSE_FOR_INVALID_MESSAGE,
    RESPONSE_FOR_VALID_MESSAGE,
} from "../constants/conversation";
import { checkUserAuthorization } from "../lib/checkUserAuthorization";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import {
    createPersonaIdentificationPrompt,
    createPersonaRecommendationPrompt,
    createServerContextPrompt,
    createWelcomeMessageRecommendationPrompt,
    createWelcomeMessageIdentificationPrompt,
    createChannelsIdentificationPrompt,
    createServerRuleIdentificationPrompt,
    createEtiquetteIdentificationPrompt,
    createUsageIdentificationPrompt,
    createChecklistIdentificationPrompt,
    createServerRuleRecommendationPrompt,
    createEtiquetteRecommendationPrompt,
    createUsageRecommendationPrompt,
    createChecklistRecommendationPrompt,
} from "../constants/prompts/app-setup-prompts/prompts";
import {
    createAnswerIdentificationPrompt,
    createChannelSuggestionPrompt,
    createGraphToolCallingPrompt,
    createPersonaMappingPrompt,
    createQuestionCreationPrompt,
    createReportDataAggregationPrompt,
    createReportDataCreationPrompt,
    createSummaryReportPrompt,
    createWelcomeMessageForUserPrompt,
} from "../constants/prompts/onboarding-prompts/prompts";

export class PostMessageSentToBotHandler implements IPostMessageSentToBot {
    constructor(
        private readonly app: ServerGuideAgentApp,
        private readonly read: IRead,
        private readonly http: IHttp,
        private readonly modify: IModify,
        private readonly persistence: IPersistence
    ) {}

    public async executePostMessageSentToBot(
        message: IMessage,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ): Promise<void> {
        const user = message.sender;
        const text = message.text;

        const room = message.room;
        const messages: IMessageRaw[] = await read
            .getRoomReader()
            .getMessages(room.id, {
                limit: 100,
                sort: { createdAt: "asc" },
            });
        const messageTexts: string[] = [];
        for (const message of messages) {
            if (message.text) {
                messageTexts.push(
                    `Message at ${message.createdAt}\n${message.sender.name}: ${message.text}\n`
                );
            }
        }
        const messagesString = messageTexts.join("\n");
        console.log("messagesString: " + messagesString);

        // Temporarily
        const isAuthorized = await checkUserAuthorization(read, modify, user);
        if (!isAuthorized) return;

        console.log("user: " + user.name);
        console.log("text: " + text);

        if (!user) {
            console.error("No user found in the message");
            return;
        }

        /*
        const { room, error } = await getRoom(read, user.id);
        if (error || !room) {
            console.error(error || "Room not found");
            return;
        }

        console.log("room name: " + room.displayName);
        */

        if (text && text.trim() !== "") {
            const context =
            "This server is for company internal communication, customer support, and community discussions. It will have around 1500 users, with semi-formal communication. People will mostly share project updates, documents, and feedback.";
            const allPersonas =
            "1. IT Team, Team relying on the server for various workflow activities 2. Community, Open-source enthusiasts, GSoC candidates, and FOSS users 3. Partners, Resellers of Rocket.Chat performing sales, support, and liaising with the IT Team 4. Prospects, Individuals exploring Rocket.Chat tool independently or negotiating with the sales team 5. Customers, Paying customers using the server to facilitate communication with Rocket.Chats team";
            
            /*
            await sendDirectMessage(read, modify, user, "WELCOME MESSAGE: ");
            const WelcomeMessageForUserPrompt =
                createWelcomeMessageForUserPrompt(text);
            const WelcomeMessageForUserByLLM = await createTextCompletionGroq(
                http,
                WelcomeMessageForUserPrompt
            );
            await sendDirectMessage(
                read,
                modify,
                user,
                WelcomeMessageForUserByLLM
            );

            await sendDirectMessage(
                read,
                modify,
                user,
                "DYNAMIC QUESTION FROM LLM: "
            );
            const QuestionCreationPrompt = createQuestionCreationPrompt(
                allPersonas,
                context
            );
            const QuestionCreationByLLM = await createTextCompletionGroq(
                http,
                QuestionCreationPrompt
            );
            await sendDirectMessage(read, modify, user, QuestionCreationByLLM);
            */

            const questionsArr = '["What is your primary role in the company: IT team member, community contributor, partner representative, prospect, or customer?","Will your activities on the server focus more on project updates, customer support, or community discussions?","How often do you expect to share documents or feedback with others on the server?","Are you more likely to be working on internal projects, collaborating with external partners, or seeking support from the community?"]';
            
            /*
            const AnswerPrompt = createAnswerIdentificationPrompt(
                allPersonas,
                questionsArr,
                text,
                context
            );
            const AnswerByLLM = await createTextCompletionGroq(
                http,
                AnswerPrompt
            );
            await sendDirectMessage(read, modify, user, AnswerByLLM);
            */
            

            const answersArr = '["IT team member", "project updates and community discussions", "rarely", "internal projects and collaborating with external partners"]';
            
            /*
            const PersonaMappingPrompt = createPersonaMappingPrompt(
                allPersonas,
                questionsArr,
                answersArr
            );
            const PersonaMappingByLLM = await createTextCompletionGroq(
                http,
                PersonaMappingPrompt
            );
            await sendDirectMessage(read, modify, user, PersonaMappingByLLM);
            */

            
            const manyPersonas = "IT Team, Partners";
            const allChannels = `IT Team Channels "#frontend - A space dedicated to discussing front-end development, including UI/UX design, frameworks (React, Angular, etc.), and web performance improvements. ", "#devops - For DevOps-related conversations, including automation, CI/CD pipelines, infrastructure as code, cloud deployments, and server management. ", "#it-support - A channel for internal IT support requests, troubleshooting, and resolving tech issues across the company. ", "#incident-response - For managing critical incidents and outages. This is where the IT team coordinates to identify, troubleshoot, and resolve issues in real-time. ", "#project-[name] (e.g., #project-server-migration) - A project-specific channel for all discussions related to a particular initiative, such as server migrations, software upgrades, or feature development.,
            Partner Channels:[
            "#partner-collaboration - A collaborative space for working with external partners on joint projects, sharing updates, and coordinating efforts across teams. ", "#client-communication - For all communication regarding client needs, updates, and project progress. Used to ensure smooth interactions between internal teams and clients.", "#business-revenue - Focused on discussions around business goals, revenue strategies, and opportunities for growth in partnership with external collaborators.", "#partner-feedback - A space to gather and discuss feedback from partners on products, services, or processes, ensuring continuous improvement in partner relationships.", "#sales-ops - For discussing sales operations, including pipeline management, lead tracking, and sales performance with partners. This channel helps align sales efforts and targets."]
            `;

            /*
            const ChannelSuggestionPrompt = createChannelSuggestionPrompt(
                context,
                manyPersonas,
                allChannels
            );
            const ChannelSuggestionByLLM = await createTextCompletionGroq(
                http,
                ChannelSuggestionPrompt
            );
            await sendDirectMessage(read, modify, user, ChannelSuggestionByLLM);
            */

            await sendDirectMessage(
                read,
                modify,
                user,
                "REPORT DATA OF USER: "
            );
            const ReportDataCreationPrompt =
                createReportDataCreationPrompt(messagesString);
            const ReportDataCreationByLLM = await createTextCompletionGroq(
                http,
                ReportDataCreationPrompt
            );
            await sendDirectMessage(
                read,
                modify,
                user,
                ReportDataCreationByLLM
            );
            

            /*
            const ReportDataAggregationPrompt =
                createReportDataAggregationPrompt(text);
            const ReportDataAggregationByLLM = await createTextCompletionGroq(
                http,
                ReportDataAggregationPrompt
            );
            await sendDirectMessage(
                read,
                modify,
                user,
                ReportDataAggregationByLLM
            );
            */

            /*
            const GraphToolCallingPrompt = createGraphToolCallingPrompt(text);
            const GraphToolCallingByLLM = await createTextCompletionGroq(
                http,
                GraphToolCallingPrompt
            );
            await sendDirectMessage(read, modify, user, GraphToolCallingByLLM);

            const SummaryReportPrompt = createSummaryReportPrompt(text);
            const SummaryReportByLLM = await createTextCompletionGroq(
                http,
                SummaryReportPrompt
            );
            await sendDirectMessage(read, modify, user, SummaryReportByLLM);
            */

            /*
            const validMessagePrompt = await createValidMessagePromptByMessage(
                text,
                this.app
            );

            let yesOrNo: string;

            yesOrNo = await createTextCompletion(
                this.app,
                http,
                validMessagePrompt,
                undefined,
                user
            );

            if (yesOrNo === "YES") {
                await sendDirectMessage(
                    read,
                    modify,
                    user,
                    RESPONSE_FOR_VALID_MESSAGE
                );
            } else if (yesOrNo === "NO") {
                await sendDirectMessage(
                    read,
                    modify,
                    user,
                    RESPONSE_FOR_INVALID_MESSAGE
                );
                return;
            } else {
                await sendDirectMessage(read, modify, user, AI_Error_Message);
                return;
            }

            let channelNameByLlm: string;

            const routerPrompt = await createRouterPromptByMessage(
                text,
                this.app
            );
            channelNameByLlm = await createTextCompletion(
                this.app,
                http,
                routerPrompt,
                undefined,
                user
            );

            console.log("channelNameByLlm: " + channelNameByLlm);

            const regex = /\["#(\w+)"\]/;
            const match = channelNameByLlm.match(regex);
            const channelName = match?.[1];

            console.log("channelName: " + channelName);
            if (channelName) {
                const channelNameRoom = await read
                    .getRoomReader()
                    .getByName(channelName);

                if (!channelNameRoom) {
                    console.error(`Room with name "${channelName}" not found`);
                } else {
                    try {
                        await joinUserToRoom(
                            read,
                            modify,
                            http,
                            persistence,
                            user,
                            channelNameRoom
                        );
                        console.log(
                            `User ${user.username} has been added to the room ${channelNameRoom.displayName}`
                        );
                    } catch (error) {
                        console.error(
                            `Failed to add user ${user.username} to the room ${channelNameRoom.displayName}:`,
                            error
                        );
                        return;
                    }
                }
            }

            const userIntentPrompt = await createUserIntentPromptByMessage(
                text,
                this.app
            );

            let intentCategory: string;

            intentCategory = await createTextCompletion(
                this.app,
                http,
                userIntentPrompt,
                undefined,
                user
            );

            
                // 1. TechnicalHelp  
                // 2. OpenSourceContributions  
                // 3. Networking  
                // 4. Learning  
                // 5. CasualGreeting  
                // 6. Other
            

            await storeUserIntent(persistence, user.id, text, intentCategory);
            await sendDirectMessage(read, modify, user, ADDED_TO_CHANNEL);
            */
        }
    }
}
