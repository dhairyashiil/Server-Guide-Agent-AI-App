import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { ServerGuideAgentApp } from '../ServerGuideAgentApp';
import { ExecutorProps } from '../definitions/ExecutorProps';
import { OnboardingFormModal } from '../modals/index';

export class CommandUtility {
	sender: IUser;
	room: IRoom;
	command: string[];
	context: SlashCommandContext;
	read: IRead;
	modify: IModify;
	http: IHttp;
	persistence: IPersistence;
	app: ServerGuideAgentApp;

	constructor(props: ExecutorProps) {
		this.sender = props.sender;
		this.room = props.room;
		this.command = props.command;
		this.context = props.context;
		this.read = props.read;
		this.modify = props.modify;
		this.http = props.http;
		this.persistence = props.persistence;
		this.app = props.app;
	}

	private async openModal(modalCreator: Function) {
		const triggerId = this.context.getTriggerId() as string;
		const user = this.context.getSender();

		const contextualbarBlocks = await modalCreator({
			modify: this.modify,
			read: this.read,
			persistence: this.persistence,
			http: this.http,
			slashCommandContext: this.context,
			uiKitContext: undefined,
		});

		await this.modify.getUiController().openModalView(contextualbarBlocks, { triggerId }, user);
	}

	public async openOnboardingForm() {
		await this.openModal(OnboardingFormModal);
	}
}
