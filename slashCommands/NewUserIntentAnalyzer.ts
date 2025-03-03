import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    ISlashCommand,
    ISlashCommandPreview,
    ISlashCommandPreviewItem,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import { ServerGuideAgentApp } from "../ServerGuideAgentApp";
import { getUserIntents } from "../lib/PersistenceMethods";
import {
    checkUserAuthorization,
    checkUserIsAdmin,
} from "../lib/checkUserAuthorization";
import { createIntentAnalyzerPromptByMessage } from "../constants/prompts";
import { createTextCompletion } from "../lib/createTextCompletion";
import { sendNotification } from "../lib/Messages";

export class NewUserIntentAnalyzer implements ISlashCommand {
    public constructor(private readonly app: ServerGuideAgentApp) {}
    public command = "server-guide-agent-intent-report";
    public i18nDescription = "server_guide_agent_getUserIntent_description";
    public i18nParamsExample = "";
    public providesPreview = false;

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<void> {
        const sender = context.getSender();
        const room = context.getRoom();
        const command = context.getArguments();

        const isAuthorized = await checkUserIsAdmin(
            this.app,
            read,
            modify,
            sender,
            room
        );
        if (!isAuthorized) return;

        // Temporarily
        const isAuthorized2 = await checkUserAuthorization(
            read,
            modify,
            sender
        );
        if (!isAuthorized2) return;

        // const userIntents = await getUserIntents(read, { userId: 'some-user-id' });
        // const userIntents = await getUserIntents(read, { intent: 'some-intent' });
        // const userIntents = await getUserIntents(read, {userId: user.id, intent: intentCategory,});
        const UserIntents = await getUserIntents(read);

        const intentAnalyzerPrompt = await createIntentAnalyzerPromptByMessage(
            UserIntents
        );

        let intentReport: string;

        intentReport = await createTextCompletion(
            this.app,
            http,
            intentAnalyzerPrompt,
            undefined,
            sender
        );

        await sendNotification(read, modify, sender, room, intentReport);
    }
}
