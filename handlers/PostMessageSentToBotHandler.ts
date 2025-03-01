import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IPostMessageSentToBot } from "@rocket.chat/apps-engine/definition/messages/IPostMessageSentToBot";
import { IMessage } from "@rocket.chat/apps-engine/definition/messages";
import { ServerGuideAgentApp } from "../ServerGuideAgentApp";
import { sendDirectMessage, sendNotification } from "../lib/Messages";
import { getRoom } from "../lib/RoomInteraction";
import { joinUserToRoom } from "../lib/addUserToRoom";
import { createRouterPromptByMessage } from "../constants/prompts";
import { createTextCompletion } from "../lib/createTextCompletion";
import {
    storeOrUpdateData,
    removeAllData,
    addRoomId,
    removeRoomId,
} from "../lib/PersistenceMethods";
import { getRoomIds } from "../lib/PersistenceMethods";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { ADDED_TO_CHANNEL } from "../constants/conversation";
import { checkUserAuthorization } from "../lib/checkUserAuthorization";

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

        const { room, error } = await getRoom(read, user.id);
        if (error || !room) {
            console.error(error || "Room not found");
            return;
        }

        console.log("room name: " + room.displayName);

        if (text && text.trim() !== "") {
            let channelNameByLlm: string;

            const prompt = await createRouterPromptByMessage(
                text,
                this.app,
            );
            channelNameByLlm = await createTextCompletion(
                this.app,
                http,
                prompt,
                room,
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
        }

        await sendDirectMessage(read, modify, user, ADDED_TO_CHANNEL);
    }
}