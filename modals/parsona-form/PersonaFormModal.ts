import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { UIKitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionContext';
import { IUIKitModalViewParam } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';
import { TextObjectType } from '@rocket.chat/apps-engine/definition/uikit/blocks';
import { RocketChatAssociationRecord, RocketChatAssociationModel } from '@rocket.chat/apps-engine/definition/metadata';
import { getInteractionRoomData, storeInteractionRoomData } from '../../lib/RoomInteraction';
import { Modals } from '../../definitions/ModalsEnum';
import { t } from '../../i18n/translation';

export async function PersonaFormModal({
	modify,
	read,
	persistence,
	slashCommandContext,
	uiKitContext,
}: {
	modify: IModify;
	read: IRead;
	persistence: IPersistence;
	http: IHttp;
	slashCommandContext?: SlashCommandContext;
	uiKitContext?: UIKitInteractionContext;
}): Promise<IUIKitModalViewParam> {
	const room = slashCommandContext?.getRoom() || uiKitContext?.getInteractionData().room;
	const user = slashCommandContext?.getSender() || uiKitContext?.getInteractionData().user;

	let personaMessage = '';
	let personaTime = '';
	let personaDays: string[] = [];
	let personaToggle = 'off';

	if (user?.id) {
		let roomId: string;

		if (room?.id) {
			roomId = room.id;
			await storeInteractionRoomData(persistence, user.id, roomId);
		} else {
			roomId = (await getInteractionRoomData(read.getPersistenceReader(), user.id)).roomId;
		}
	}

	const blocks = modify.getCreator().getBlockBuilder();

	blocks.addInputBlock({
		label: {
			text: t('persona_toggle_title'),
			type: TextObjectType.PLAINTEXT,
		},
		element: blocks.newStaticSelectElement({
			actionId: 'personaToggle',
			initialValue: personaToggle ?? 'off',
			options: [
				{
					value: 'on',
					text: {
						type: TextObjectType.PLAINTEXT,
						text: 'On',
					},
				},
				{
					value: 'off',
					text: {
						type: TextObjectType.PLAINTEXT,
						text: 'Off',
					},
				},
			],
		}),
		blockId: 'personaToggle',
	});

	blocks.addInputBlock({
		label: {
			text: t('persona_message_title'),
			type: TextObjectType.PLAINTEXT,
		},
		element: blocks.newPlainTextInputElement({
			actionId: 'personaMessage',
			multiline: true,
			initialValue: personaMessage,
			placeholder: {
				text: t('persona_message_placeholder'),
				type: TextObjectType.PLAINTEXT,
			},
		}),
		blockId: 'personaMessage',
	});

	blocks.addInputBlock({
		label: {
			text: t('persona_select_days_title'),
			type: TextObjectType.PLAINTEXT,
		},
		element: blocks.newMultiStaticElement({
			actionId: 'selectDays',
			initialValue: personaDays,
			options: [
				{
					value: 'monday',
					text: {
						type: TextObjectType.PLAINTEXT,
						text: 'Monday',
						emoji: true,
					},
				},
				{
					value: 'tuesday',
					text: {
						type: TextObjectType.PLAINTEXT,
						text: 'Tuesday',
						emoji: true,
					},
				},
				{
					value: 'wednesday',
					text: {
						type: TextObjectType.PLAINTEXT,
						text: 'Wednesday',
						emoji: true,
					},
				},
				{
					value: 'thursday',
					text: {
						type: TextObjectType.PLAINTEXT,
						text: 'Thursday',
						emoji: true,
					},
				},
				{
					value: 'friday',
					text: {
						type: TextObjectType.PLAINTEXT,
						text: 'Friday',
						emoji: true,
					},
				},
				{
					value: 'saturday',
					text: {
						type: TextObjectType.PLAINTEXT,
						text: 'Saturday',
						emoji: true,
					},
				},
				{
					value: 'sunday',
					text: {
						type: TextObjectType.PLAINTEXT,
						text: 'Sunday',
						emoji: true,
					},
				},
			],
		}),
		blockId: 'selectDays',
	});

	blocks.addInputBlock({
		label: {
			text: t('persona_time_title'),
			type: TextObjectType.PLAINTEXT,
		},
		element: blocks.newPlainTextInputElement({
			actionId: 'personaTime',
			initialValue: personaTime,
			placeholder: {
				text: '24-hour format',
				type: TextObjectType.PLAINTEXT,
			},
		}),
		blockId: 'personaTime',
	});

	return {
		id: Modals.PersonaForm,
		title: blocks.newPlainTextObject(t('persona_modal_title')),
		submit: blocks.newButtonElement({
			text: blocks.newPlainTextObject(t('submit')),
		}),
		blocks: blocks.getBlocks(),
	};
}
