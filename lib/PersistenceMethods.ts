import {
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    RocketChatAssociationRecord,
    RocketChatAssociationModel,
} from "@rocket.chat/apps-engine/definition/metadata";
import { generateUUID } from "./GenerateUUID";

export async function storeOrUpdateData(
    persistence: IPersistence,
    read: IRead,
    roomId: string,
    key: string,
    data: string
): Promise<void> {
    const assoc = new RocketChatAssociationRecord(
        RocketChatAssociationModel.ROOM,
        roomId
    );
    const existingData = await read
        .getPersistenceReader()
        .readByAssociation(assoc);

    if (existingData && existingData.length > 0) {
        const storedData = existingData[0];
        storedData[key] = data;
        await persistence.updateByAssociation(assoc, storedData);
    } else {
        const newData = { [key]: data };
        await persistence.createWithAssociation(newData, assoc);
    }
}

export async function removeAllData(
    persistence: IPersistence,
    read: IRead,
    roomId: string
): Promise<void> {
    const assoc = new RocketChatAssociationRecord(
        RocketChatAssociationModel.ROOM,
        roomId
    );
    const data = await read.getPersistenceReader().readByAssociation(assoc);

    for (const record of data) {
        await persistence.removeByAssociation(assoc);
    }
}

const ROOM_IDS_KEY = "agile_room_id";

async function getStoredRoomIds(read: IRead): Promise<string[]> {
    const assoc = new RocketChatAssociationRecord(
        RocketChatAssociationModel.MISC,
        ROOM_IDS_KEY
    );
    const storedData = await read
        .getPersistenceReader()
        .readByAssociation(assoc);
    return storedData.length > 0 ? storedData[0][ROOM_IDS_KEY] : [];
}

async function updateStoredRoomIds(
    persistence: IPersistence,
    roomIds: string[]
): Promise<void> {
    const assoc = new RocketChatAssociationRecord(
        RocketChatAssociationModel.MISC,
        ROOM_IDS_KEY
    );
    await persistence.removeByAssociation(assoc);
    const newData = { [ROOM_IDS_KEY]: roomIds };
    await persistence.createWithAssociation(newData, assoc);
}

export async function addRoomId(
    persistence: IPersistence,
    read: IRead,
    roomId: string
): Promise<void> {
    const storedData = await getStoredRoomIds(read);
    const roomIds = storedData || [];

    if (!roomIds.includes(roomId)) {
        roomIds.push(roomId);
        await updateStoredRoomIds(persistence, roomIds);
    }
}

export async function removeRoomId(
    persistence: IPersistence,
    read: IRead,
    roomId: string
): Promise<void> {
    const storedData = await getStoredRoomIds(read);
    let roomIds = storedData || [];

    roomIds = roomIds.filter((id: string) => id !== roomId);
    await updateStoredRoomIds(persistence, roomIds);
}

export async function getRoomIds(read: IRead): Promise<string[]> {
    const storedData = await getStoredRoomIds(read);
    return storedData || [];
}

// ======================================

export interface UserIntent {
    id: string; // Unique identifier
    userId: string;
    intent: string; // e.g., "Technical Help"
    message: string; // Original user message
    timestamp: Date;
}

// Store User Intent
export async function storeUserIntent(
    persistence: IPersistence,
    userId: string,
    message: string,
    intent: string
): Promise<void> {
    const association = new RocketChatAssociationRecord(
        RocketChatAssociationModel.MISC,
        "user_intents"
    );

    const intentData: UserIntent = {
        id: generateUUID(),
        userId,
        intent,
        message,
        timestamp: new Date(),
    };

    await persistence.createWithAssociation(intentData, association);
}

// Get All User Intents
export async function getUserIntents(
    read: IRead,
    filter?: { userId?: string; intent?: string }
): Promise<UserIntent[]> {
    const association = new RocketChatAssociationRecord(
        RocketChatAssociationModel.MISC,
        "user_intents"
    );

    const results = await read
        .getPersistenceReader()
        .readByAssociation(association);

    return results
        .map((record) => record as UserIntent)
        .filter((intent) => {
            if (!filter) return true;
            if (filter.userId && intent.userId !== filter.userId) return false;
            if (filter.intent && intent.intent !== filter.intent) return false;
            return true;
        });
}

// Delete All Intents
export async function deleteAllUserIntents(
    persistence: IPersistence
): Promise<void> {
    const association = new RocketChatAssociationRecord(
        RocketChatAssociationModel.MISC,
        "user_intents"
    );

    await persistence.removeByAssociation(association);
}

// Delete Specific Intent by ID
export async function deleteUserIntentById(
    persistence: IPersistence,
    read: IRead,
    intentId: string
): Promise<void> {
    const association = new RocketChatAssociationRecord(
        RocketChatAssociationModel.MISC,
        "user_intents"
    );

    // Step 1: Fetch all intents
    const intents = await read
        .getPersistenceReader()
        .readByAssociation(association);

    // Step 2: Filter out the intent to delete
    const filteredIntents = intents.filter((record) => {
        const intent = record as UserIntent;
        return intent.id !== intentId;
    });

    // Step 3: Remove all records associated with the key
    await persistence.removeByAssociation(association);

    // Step 4: Recreate the remaining records
    for (const record of filteredIntents) {
        await persistence.createWithAssociation(record, association);
    }
}

// Delete Intents by User
export async function deleteIntentsByUserId(
    persistence: IPersistence,
    read: IRead,
    userId: string
): Promise<void> {
    const association = new RocketChatAssociationRecord(
        RocketChatAssociationModel.MISC,
        "user_intents"
    );

    // Step 1: Fetch all intents
    const intents = await read
        .getPersistenceReader()
        .readByAssociation(association);

    // Step 2: Filter out intents for the specified user
    const filteredIntents = intents.filter((record) => {
        const intent = record as UserIntent;
        return intent.userId !== userId;
    });

    // Step 3: Remove all records associated with the key
    await persistence.removeByAssociation(association);

    // Step 4: Recreate the remaining records
    for (const record of filteredIntents) {
        await persistence.createWithAssociation(record, association);
    }
}

// Get Intent Distribution
export async function getIntentDistribution(
    read: IRead
): Promise<Record<string, number>> {
    const intents = await getUserIntents(read);

    return intents.reduce((acc, intent) => {
        acc[intent.intent] = (acc[intent.intent] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
}

// Get Timeline Data
export async function getIntentTimeline(
    read: IRead,
    timeUnit: "hourly" | "daily" | "weekly"
): Promise<Array<{ period: string; count: number }>> {
    const intents = await getUserIntents(read);

    // Group intents by time period
    const grouped = intents.reduce((acc, intent) => {
        const date = new Date(intent.timestamp);
        let dateKey: string;

        switch (timeUnit) {
            case "hourly":
                dateKey = date.toISOString().slice(0, 13); // YYYY-MM-DDTHH
                break;
            case "daily":
                dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
                break;
            case "weekly":
                const startOfWeek = new Date(date);
                startOfWeek.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
                dateKey = startOfWeek.toISOString().split("T")[0]; // YYYY-MM-DD
                break;
            default:
                throw new Error(`Unsupported time unit: ${timeUnit}`);
        }

        acc[dateKey] = (acc[dateKey] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Transform the grouped data into an array of objects
    return Object.entries(grouped).map(([period, count]) => ({
        period,
        count,
    }));
}

// // Get daily timeline
// const dailyTimeline = await getIntentTimeline(read, "daily");

// // Get weekly timeline
// const weeklyTimeline = await getIntentTimeline(read, "weekly");

// // Get hourly timeline
// const hourlyTimeline = await getIntentTimeline(read, "hourly");
