import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { UIKitViewSubmitInteractionContext } from "@rocket.chat/apps-engine/definition/uikit";
import { ServerGuideAgentApp } from "../ServerGuideAgentApp";
import { sendNotification } from "../lib/Messages";
import { getRoom } from "../lib/RoomInteraction";
import { Modals } from "../definitions/ModalsEnum";
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

export class ExecuteViewSubmitHandler {
    constructor(
        private readonly app: ServerGuideAgentApp,
        private readonly read: IRead,
        private readonly http: IHttp,
        private readonly modify: IModify,
        private readonly persistence: IPersistence
    ) {}

    public async run(context: UIKitViewSubmitInteractionContext) {
        const { user, view } = context.getInteractionData();

        if (!user) {
            return {
                success: false,
                error: "No user found",
            };
        }

        const modalId = view.id;

        switch (modalId) {
            case Modals.OnboardingForm:
                return await this.handleOnboardingFormModal(context);
            default:
                return {
                    success: false,
                    error: "Unknown modal ID",
                };
        }
    }

    private async handleOnboardingFormModal(
        context: UIKitViewSubmitInteractionContext
    ) {
        const { user, view } = context.getInteractionData();

        const { room, error } = await getRoom(this.read, user.id);
        if (error || !room) {
            return {
                success: false,
                error: error || "Room not found",
            };
        }

        const onboardingMessage =
            view.state?.["onboardingMessageId"]["onboardingMessageId"] || "";
        const selectOption =
            view.state?.["selectOptionId"]["selectOptionId"] || "";

        if(onboardingMessage.trim() !== "") {
            let channelNameByLlm: string;
            
            const prompt = await createRouterPromptByMessage(this.app, onboardingMessage);
            channelNameByLlm = await createTextCompletion(
                this.app,
                room,
                user,
                this.http,
                prompt,
            );
            
            const regex = /\["#(\w+)"\]/;
            const match = channelNameByLlm.match(regex);
            const channelName = match?.[1];
            
            if(channelName) {
                const channelNameRoom = await this.read.getRoomReader().getByName(channelName);
                
                if (!channelNameRoom) { 
                    console.error(`Room with name "${channelName}" not found`);
                }
                else {
                    try {
                        await joinUserToRoom(
                            this.read, 
                            this.modify, 
                            this.http, 
                            this.persistence, 
                            user, 
                            channelNameRoom, 
                        );
                        console.log(`User ${user.username} has been added to the room ${channelNameRoom.displayName}`);
                    } catch (error) {
                        console.error(`Failed to add user ${user.username} to the room ${channelNameRoom.displayName}:`, error);
                        return {
                            success: false,
                            error: "Failed to add user to the room",
                        };
                    }
                }
            }   
        }
        
        if (Array.isArray(selectOption)) {
            for (const option of selectOption) {
                let targetRoomName = "";
                switch (option) {
                    case "gsoc":
                        targetRoomName = "gsoc2025";
                        break;
                    case "support":
                        targetRoomName = "support";
                        break;
                    case "connectAdmins":
                        targetRoomName = "admins";
                        break;
                    default:
                        console.log(`Unknown option: ${option}`);
                        return {
                            success: false,
                            error: `Unknown option: ${option}`,
                        };
                }

                const targetRoom = await this.read.getRoomReader().getByName(targetRoomName);
                if (!targetRoom) {
                    console.error(`Room with name "${targetRoomName}" not found`);
                }
                else {
                    
                    try {
                        await joinUserToRoom(
                            this.read, 
                            this.modify, 
                            this.http, 
                            this.persistence, 
                            user, 
                            targetRoom 
                        );
                        console.log(`User ${user.username} has been added to the room ${targetRoom.displayName}`);
                    } catch (error) {
                        console.error(`Failed to add user ${user.username} to the room ${targetRoom.displayName}:`, error);
                        return {
                            success: false,
                            error: "Failed to add user to the room",
                        };
                    }
                }
            }
        }
        
        await sendNotification(
            this.read,
            this.modify,
            user,
            room,
            `You are added to your respective channels, Have fun!`
        );

        return {
            success: true,
            ...view,
        };
    }
}
