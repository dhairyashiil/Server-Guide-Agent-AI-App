import {
    IModify,
    IRead,
    IPersistence,
    IHttp,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom, RoomType } from "@rocket.chat/apps-engine/definition/rooms";
import {
    BlockBuilder,
    IBlock,
} from "@rocket.chat/apps-engine/definition/uikit";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { NotificationsController } from "./Notifications";
import { IMessageRaw } from "@rocket.chat/apps-engine/definition/messages";

export async function sendNotification(
    read: IRead,
    modify: IModify,
    user: IUser,
    room: IRoom,
    message: string,
    blocks?: BlockBuilder
): Promise<void> {
    const appUser = (await read.getUserReader().getAppUser()) as IUser;

    const msg = modify
        .getCreator()
        .startMessage()
        .setSender(appUser)
        .setRoom(room)
        .setText(message);

    if (blocks) {
        msg.setBlocks(blocks);
    }

    return read.getNotifier().notifyUser(user, msg.getMessage());
}

export async function shouldSendMessage(
    read: IRead,
    persistence: IPersistence,
    user: IUser
): Promise<boolean> {
    const notificationsController = new NotificationsController(
        read,
        persistence,
        user
    );
    const notificationStatus =
        await notificationsController.getNotificationsStatus();

    return notificationStatus ? notificationStatus.status : true;
}

export async function sendMessage(
    modify: IModify,
    room: IRoom,
    sender: IUser,
    message: string,
    blocks?: BlockBuilder | [IBlock]
): Promise<string> {
    const msg = modify
        .getCreator()
        .startMessage()
        .setSender(sender)
        .setRoom(room)
        .setGroupable(false)
        .setParseUrls(false)
        .setText(message);

    if (blocks !== undefined) {
        msg.setBlocks(blocks);
    }

    return await modify.getCreator().finish(msg);
}

export async function sendDirectMessage(
    read: IRead,
    modify: IModify,
    user: IUser,
    message: string,
    persistence?: IPersistence,
    blocks?: BlockBuilder | [IBlock]
): Promise<string> {
    const appUser = (await read.getUserReader().getAppUser()) as IUser;
    const targetRoom = (await getDirect(
        read,
        modify,
        appUser,
        user.username
    )) as IRoom;

    // const shouldSend = await shouldSendMessage(read, persistence, user);

    // if (!shouldSend) {
    //     return "";
    // }

    return await sendMessage(modify, targetRoom, appUser, message, blocks);
}

export async function getDirect(
    read: IRead,
    modify: IModify,
    appUser: IUser,
    username: string
): Promise<IRoom | undefined> {
    const usernames = [appUser.username, username];
    let room: IRoom;
    try {
        room = await read.getRoomReader().getDirectByUsernames(usernames);
    } catch (error) {
        console.log(error);
        return;
    }

    if (room) {
        return room;
    } else {
        let roomId: string;

        const newRoom = modify
            .getCreator()
            .startRoom()
            .setType(RoomType.DIRECT_MESSAGE)
            .setCreator(appUser)
            .setMembersToBeAddedByUsernames(usernames);
        roomId = await modify.getCreator().finish(newRoom);
        return await read.getRoomReader().getById(roomId);
    }
}

export async function getRoomMessages(
    room: IRoom,
    read: IRead,
    user?: IUser,
    http?: IHttp,
    addOns?: string[],
    xAuthToken?: string,
    xUserId?: string
): Promise<string> {
    const messages: IMessageRaw[] = await read
        .getRoomReader()
        .getMessages(room.id, {
            limit: 100,
            sort: { createdAt: 'asc' },
        });

    const messageTexts: string[] = [];
    for (const message of messages) {
        if (message.text) {
            messageTexts.push(
                `Message at ${message.createdAt}\n${message.sender.name}: ${message.text}\n`
            );
        }
    }
    return messageTexts.join('\n');
}

export async function getThreadMessages(
    room: IRoom,
    read: IRead,
    modify: IModify,
    user: IUser,
    http: IHttp,
    threadId: string,
    addOns: string[],
    xAuthToken: string,
    xUserId: string
): Promise<string> {
    const threadReader = read.getThreadReader();
    const thread = await threadReader.getThreadById(threadId);

    if (!thread) {
        await sendNotification(
            read,
            modify,
            user,
            room,
            `Thread not found`
        );
        throw new Error('Thread not found');
    }

    const messageTexts: string[] = [];
    for (const message of thread) {
        if (message.text) {
            messageTexts.push(`${message.sender.name}: ${message.text}`);
        }
    }

    // threadReader repeats the first message once, so here we remove it
    messageTexts.shift();
    return messageTexts.join('\n');
}