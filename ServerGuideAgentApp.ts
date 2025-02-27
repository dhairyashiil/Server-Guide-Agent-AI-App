import {
    IAppAccessors,
    ILogger,
    IConfigurationExtend, 
    IHttp, 
    IRead,
    IPersistence, 
    IModify,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { UIKitViewSubmitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { ExecuteViewSubmitHandler } from './handlers/ExecuteViewSubmitHandler';
import { OnboardingForm } from './slashCommands/OnboardingForm';
import { settings } from './settings/settings';
import { IUIKitResponse } from '@rocket.chat/apps-engine/definition/uikit';
import { IPostRoomUserJoined, IRoomUserJoinedContext } from '@rocket.chat/apps-engine/definition/rooms';
import { UIKitBlockInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { StartupType } from '@rocket.chat/apps-engine/definition/scheduler';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { generateTriggerId } from './lib/generateTriggerId';
import { CommandUtility } from './lib/CommandUtility';
import { sendNotification } from './lib/Messages';

export class ServerGuideAgentApp extends App implements IPostRoomUserJoined {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async executePostRoomUserJoined(
		context: IRoomUserJoinedContext,
		read: IRead,
		http: IHttp,
		persistence: IPersistence,
		modify: IModify,
	): Promise<void> {
		const room = context.room;
		const user = context.joiningUser;
	
		if (room.displayName?.trim() === "Landing_Page") {
			await sendNotification(
				read,
				modify,
				user,
				room,
				`Type /server-guide-agent-start and press enter to connect to respective channels`
			);
		}
	}

    public async executeViewSubmitHandler(
        context: UIKitViewSubmitInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify,
    ): Promise<IUIKitResponse> {
        const handler = new ExecuteViewSubmitHandler(this, read, http, modify, persistence);
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
        ]);
    }
}