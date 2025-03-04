import {
    IAppAccessors,
    ILogger,
    IConfigurationExtend,
    IHttp,
    IRead,
    IPersistence,
    IModify,
} from "@rocket.chat/apps-engine/definition/accessors";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { IAppInfo } from "@rocket.chat/apps-engine/definition/metadata";
import { UIKitViewSubmitInteractionContext } from "@rocket.chat/apps-engine/definition/uikit";
import { ExecuteViewSubmitHandler } from "./handlers/ExecuteViewSubmitHandler";
import { PostMessageSentToBotHandler } from "./handlers/PostMessageSentToBotHandler"; // Import the new handler
import { OnboardingForm } from "./slashCommands/OnboardingForm";
import { settings } from "./settings/settings";
import { IUIKitResponse } from "@rocket.chat/apps-engine/definition/uikit";
import {
    IPostRoomUserJoined,
    IRoomUserJoinedContext,
} from "@rocket.chat/apps-engine/definition/rooms";
import { IMessage } from "@rocket.chat/apps-engine/definition/messages"; // Import the interface
import { sendDirectMessage } from "./lib/Messages";
import { ASK_OTHER_PURPOSE, WELCOME_MESSAGE } from "./constants/conversation";
import { IPostMessageSentToBot } from "@rocket.chat/apps-engine/definition/messages/IPostMessageSentToBot";
import { NewUserIntentAnalyzer } from "./slashCommands/NewUserIntentAnalyzer";
import { PersonaForm } from "./slashCommands/PersonaForm";

export class ServerGuideAgentApp
    extends App
    implements IPostRoomUserJoined, IPostMessageSentToBot
{
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async executePostRoomUserJoined(
        context: IRoomUserJoinedContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ): Promise<void> {
        const room = context.room;
        const user = context.joiningUser;

        if (room.displayName?.trim() === "Landing_Page") {
            await sendDirectMessage(read, modify, user, WELCOME_MESSAGE);
            await sendDirectMessage(read, modify, user, ASK_OTHER_PURPOSE);
        }
    }

    public async executePostMessageSentToBot(
        message: IMessage,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ): Promise<void> {
        const handler = new PostMessageSentToBotHandler(
            this,
            read,
            http,
            modify,
            persistence
        );
        await handler.executePostMessageSentToBot(
            message,
            read,
            http,
            persistence,
            modify
        );
    }

    public async executeViewSubmitHandler(
        context: UIKitViewSubmitInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ): Promise<IUIKitResponse> {
        const handler = new ExecuteViewSubmitHandler(
            this,
            read,
            http,
            modify,
            persistence
        );
        return await handler.run(context);
    }

    public async extendConfiguration(configuration: IConfigurationExtend) {
        await Promise.all([
            ...settings.map((setting) =>
                configuration.settings.provideSetting(setting)
            ),
            configuration.slashCommands.provideSlashCommand(
                new OnboardingForm(this)
            ),
            configuration.slashCommands.provideSlashCommand(
                new PersonaForm(this)
            ),
            configuration.slashCommands.provideSlashCommand(
                new NewUserIntentAnalyzer(this)
            ),
        ]);
    }
}
