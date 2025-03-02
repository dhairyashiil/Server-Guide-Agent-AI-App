import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { sendDirectMessage, sendNotification } from "./Messages";
import {
    IModify,
    IRead,
    IUserRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { ServerGuideAgentApp } from "../ServerGuideAgentApp";

export async function checkUserAuthorization(
    read: IRead,
    modify: IModify,
    user: IUser,
    room?: IRoom
) {
    const authorizedUsers = [
        "lidet",
        "luffy",
        "srijna",
        "dhairyashil",
        "dhairyashil.shinde",
    ];

    if (!authorizedUsers.includes(user.username)) {
        if (room) {
            await sendNotification(
                read,
                modify,
                user,
                room,
                `You are not authorized to use this command, ask Admin to give you access!`
            );
        } else {
            await sendDirectMessage(
                read,
                modify,
                user,
                "You are not authorized to use this bot, ask Admin to give you access!"
            );
        }
        return false;
    }

    return true;
}

export async function checkUserIsAdmin(
    app: ServerGuideAgentApp,
    read: IRead,
    modify: IModify,
    user: IUser,
    room: IRoom
) {
    const adminUsernames = await app
        .getAccessors()
        .environmentReader.getSettings()
        .getValueById("adminUsernames");
    const authorizedUsers = adminUsernames.split(",");

    if (!authorizedUsers.includes(user.username)) {
        await sendNotification(
            read,
            modify,
            user,
            room,
            `You are not authorized to use this command, only Admins have the access!`
        );

        return false;
    }

    return true;
}
