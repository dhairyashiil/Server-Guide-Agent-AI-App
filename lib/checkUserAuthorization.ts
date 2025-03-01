import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { sendDirectMessage, sendNotification } from "./Messages";
import { IModify, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IUser } from "@rocket.chat/apps-engine/definition/users";

export async function checkUserAuthorization(
    read: IRead,
    modify: IModify,
    user: IUser,
    room?: IRoom,
) {
    const authorizedUsers = [
        "lidet",
        "luffy",
        "srijna",
        "dhairyashil",
        "dhairyashil.shinde",
    ];

    if (!authorizedUsers.includes(user.username)) {
        if(room) {
            await sendNotification(
                read,
                modify,
                user,
                room,
                `You are not authorized to use this command, ask Admin to give you access!`
            );
        }
        else {
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
