import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    ISlashCommand,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import { CommandUtility } from "../lib/CommandUtility";
import { ServerGuideAgentApp } from "../ServerGuideAgentApp";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";

export class OnboardingForm implements ISlashCommand {
    public constructor(private readonly app: ServerGuideAgentApp) {}
    public command = "server-guide-agent-start";
    public i18nDescription = "server_guide_agent_start_description";
    public providesPreview = false;
    public i18nParamsExample = "";

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persistence: IPersistence
    ): Promise<void> {
        const sender = context.getSender();
        const room = context.getRoom();
        const command = context.getArguments();

        await this.executeOnboardingLogic({
            sender,
            room,
            command,
            read,
            modify,
            http,
            persistence,
            context,
        });
    }

    public async executeOnboardingLogic({
        sender,
        room,
        command,
        read,
        modify,
        http,
        persistence,
        context,
    }: {
        sender: IUser;
        room: IRoom;
        command: Array<string>;
        read: IRead;
        modify: IModify;
        http: IHttp;
        persistence: IPersistence;
        context: SlashCommandContext;
    }): Promise<void> {
        if (!Array.isArray(command)) {
            return;
        }
        const commandUtility = new CommandUtility({
            sender: sender,
            room: room,
            command: command,
            context: context,
            read: read,
            modify: modify,
            http: http,
            persistence: persistence,
            app: this.app,
        });
        commandUtility.openOnboardingForm();
    }
}
