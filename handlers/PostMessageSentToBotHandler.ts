import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
    IUserRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IPostMessageSentToBot } from "@rocket.chat/apps-engine/definition/messages/IPostMessageSentToBot";
import { IMessage } from "@rocket.chat/apps-engine/definition/messages";
import { ServerGuideAgentApp } from "../ServerGuideAgentApp";
import { sendDirectMessage, sendNotification } from "../lib/Messages";
import { getRoom } from "../lib/RoomInteraction";
import { joinUserToRoom } from "../lib/addUserToRoom";
import { createRouterPromptByMessage, createUserIntentPromptByMessage, createValidMessagePromptByMessage } from "../constants/prompts";
import { createTextCompletion } from "../lib/createTextCompletion";
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
import { ADDED_TO_CHANNEL, AI_Error_Message, RESPONSE_FOR_INVALID_MESSAGE, RESPONSE_FOR_VALID_MESSAGE } from "../constants/conversation";
import { checkUserAuthorization } from "../lib/checkUserAuthorization";
import { IUser } from "@rocket.chat/apps-engine/definition/users";

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

        // Temporarily
        const isAuthorized = await checkUserAuthorization(read, modify, user);
        if(!isAuthorized) return;

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

            const validMessagePrompt = await createValidMessagePromptByMessage(text,
                this.app,
            );

            let yesOrNo: string;

            yesOrNo = await createTextCompletion(
                this.app,
                http,
                validMessagePrompt,
                undefined,
                user,
            );

            if(yesOrNo === "YES") {
                await sendDirectMessage(read, modify, user, RESPONSE_FOR_VALID_MESSAGE);
            }
            else if(yesOrNo === "NO") {
                await sendDirectMessage(read, modify, user, RESPONSE_FOR_INVALID_MESSAGE);
                return;
            }
            else {
                await sendDirectMessage(read, modify, user, AI_Error_Message);
                return;
            }

            let channelNameByLlm: string;

            const routerPrompt = await createRouterPromptByMessage(
                text,
                this.app,
            );
            channelNameByLlm = await createTextCompletion(
                this.app,
                http,
                routerPrompt,
                undefined,
                user,
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


            const userIntentPrompt = await createUserIntentPromptByMessage(text,
                this.app,
            );

            let intentCategory: string;

            intentCategory = await createTextCompletion(
                this.app,
                http,
                userIntentPrompt,
                undefined,
                user, 
            );

            /*
                1. TechnicalHelp  
                2. OpenSourceContributions  
                3. Networking  
                4. Learning  
                5. CasualGreeting  
                6. Other
            */

            await deleteAllUserIntents(persistence);
    
            await storeUserIntent(persistence, user.id, text, intentCategory);

            // const userIntents = await getUserIntents(read, { userId: 'some-user-id' });
            // const userIntents = await getUserIntents(read, { intent: 'some-intent' });
            const userIntents = await getUserIntents(read, { userId: user.id, intent: intentCategory });

            const userId = userIntents[0].userId
            const intent = userIntents[0].intent;
            const message = userIntents[0].message;
            const timestamp = userIntents[0].timestamp;

            const adminUsernames = await this.app.getAccessors().environmentReader.getSettings().getValueById("adminUsernames");

            // Access the IUserRead interface
            const userReader: IUserRead = read.getUserReader();

            // Retrieve the user by username
            const adminUser: IUser | undefined = await userReader.getByUsername(adminUsernames);
            
            await sendDirectMessage(read, modify, adminUser, 
                `userId: ${userId}
                intent: ${intent}
                message: ${message}
                timestamp: ${timestamp}`,
            );
        }

        await sendDirectMessage(read, modify, user, ADDED_TO_CHANNEL);
    }
}