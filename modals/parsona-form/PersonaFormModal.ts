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

	let personaName = '';
	let personaDescription = '';
	let personaChannels = '';
	let personaResources = '';
	let personaMessageAfterClassification = '';

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
			text: t('persona_name_title'),
			type: TextObjectType.PLAINTEXT,
		},
		element: blocks.newPlainTextInputElement({
			actionId: 'personaName',
			initialValue: personaName,
			placeholder: {
				text: t('persona_name_placeholder'),
				type: TextObjectType.PLAINTEXT,
			},
		}),
		blockId: 'personaName',
	});

	blocks.addInputBlock({
		label: {
			text: t('persona_description_title'),
			type: TextObjectType.PLAINTEXT,
		},
		element: blocks.newPlainTextInputElement({
			actionId: 'personaDescription',
			multiline: true,
			initialValue: personaDescription,
			placeholder: {
				text: t('persona_description_placeholder'),
				type: TextObjectType.PLAINTEXT,
			},
		}),
		blockId: 'personaDescription',
	});

    blocks.addDividerBlock();

    blocks.addInputBlock({
		label: {
			text: t('persona_channels_title'),
			type: TextObjectType.PLAINTEXT,
		},
		element: blocks.newPlainTextInputElement({
			actionId: 'personaChannels',
			multiline: true,
			initialValue: personaChannels,
			placeholder: {
				text: t('persona_channels_placeholder'),
				type: TextObjectType.PLAINTEXT,
			},
		}),
		blockId: 'personaChannels',
	});



    blocks.addInputBlock({
		label: {
			text: t('persona_resources_title'),
			type: TextObjectType.PLAINTEXT,
		},
		element: blocks.newPlainTextInputElement({
			actionId: 'personaResources',
			multiline: true,
			initialValue: personaResources,
			placeholder: {
				text: t('persona_resources_placeholder'),
				type: TextObjectType.PLAINTEXT,
			},
		}),
		blockId: 'personaResources',
	});

    blocks.addDividerBlock();

    blocks.addInputBlock({
		label: {
			text: t('persona_message_after_classification_title'),
			type: TextObjectType.PLAINTEXT,
		},
		element: blocks.newPlainTextInputElement({
			actionId: 'personaMessageAfterClassification',
			multiline: true,
			initialValue: personaMessageAfterClassification,
			placeholder: {
				text: t('persona_message_after_classification_placeholder'),
				type: TextObjectType.PLAINTEXT,
			},
		}),
		blockId: 'personaMessageAfterClassification',
	});

    /*
    blocks.addSectionBlock({
        text: blocks.newPlainTextObject('Welcome to the Rocket.Chat UI Kit!'),
        accessory: blocks.newButtonElement({
            text: blocks.newPlainTextObject('Click Me'),
            actionId: 'click_me'
        })
    });

    blocks.addImageBlock({
        // imageUrl: 'https://example.com/image.png',
        imageUrl: 'https://avatars.githubusercontent.com/u/93669429?v=4',
        altText: 'Example Image'
    });


    blocks.addDividerBlock();


    blocks.addContextBlock({
        elements: [
            blocks.newMarkdownTextObject('*Additional information*'),
            blocks.newImageElement({
                imageUrl: 'https://avatars.githubusercontent.com/u/93669429?v=4',
                altText: 'Icon'
            })
        ]
    });
    */

	return {
		id: Modals.PersonaForm,
		title: blocks.newPlainTextObject(t('persona_modal_title')),
		submit: blocks.newButtonElement({
			text: blocks.newPlainTextObject(t('submit')),
		}),
		blocks: blocks.getBlocks(),
	};
}
