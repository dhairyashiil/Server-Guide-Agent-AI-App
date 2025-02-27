import {
    IRead,
    IModify,
    IPersistence,
    IHttp,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";

export async function joinUserToRoom(
    read: IRead,
    modify: IModify,
    http: IHttp,
    persistence: IPersistence,
    user: IUser,
    room: IRoom
): Promise<void> {
    // Check if the user is already in the room
    const roomMembers = await read.getRoomReader().getMembers(room.id);
    const isUserInRoom = roomMembers.some((member) => member.id === user.id);

    if (isUserInRoom) {
        console.log(
            `User ${user.username} is already in the room ${room.displayName}`
        );
        return;
    }

    // Add the user to the room
    try {
        // Use the room updater to add the user to the room
        const roomUpdater = (
            await modify.getUpdater().room(room.id, user)
        ).addMemberToBeAddedByUsername(user.username);

        // Finalize the update
        await modify.getUpdater().finish(roomUpdater);

        console.log(
            `User ${user.username} has been added to the room ${room.displayName}`
        );
    } catch (error) {
        console.error(
            `Failed to add user ${user.username} to the room ${room.displayName}:`,
            error
        );
    }
}
