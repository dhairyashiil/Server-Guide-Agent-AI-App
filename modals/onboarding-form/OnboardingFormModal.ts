import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { UIKitInteractionContext } from "@rocket.chat/apps-engine/definition/uikit/UIKitInteractionContext";
import { IUIKitModalViewParam } from "@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder";
import { TextObjectType } from "@rocket.chat/apps-engine/definition/uikit/blocks";
import {
    RocketChatAssociationRecord,
    RocketChatAssociationModel,
} from "@rocket.chat/apps-engine/definition/metadata";
import { IOnboardingFormPersistenceData } from "../../definitions/ExecutorProps";
import {
    getInteractionRoomData,
    storeInteractionRoomData,
} from "../../lib/RoomInteraction";
import { Modals } from "../../definitions/ModalsEnum";
import { t } from "../../i18n/translation";

export async function OnboardingFormModal({
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
    const room =
        slashCommandContext?.getRoom() ||
        uiKitContext?.getInteractionData().room;
    const user =
        slashCommandContext?.getSender() ||
        uiKitContext?.getInteractionData().user;

    let onboardingMessage = "";
    let onboardingOption: string[] = [];

    if (user?.id) {
        let roomId: string;

        if (room?.id) {
            roomId = room.id;
            await storeInteractionRoomData(persistence, user.id, roomId);
        } else {
            roomId = (
                await getInteractionRoomData(
                    read.getPersistenceReader(),
                    user.id
                )
            ).roomId;
        }
        const assoc = new RocketChatAssociationRecord(
            RocketChatAssociationModel.ROOM,
            roomId
        );
        const data = (await read
            .getPersistenceReader()
            .readByAssociation(assoc)) as IOnboardingFormPersistenceData[];

        if (data && data.length > 0) {
            onboardingMessage = data[0].onboarding_message;
            onboardingOption = data[0].onboarding_options;
        }
    }

    const blocks = modify.getCreator().getBlockBuilder();

    blocks.addInputBlock({
        label: {
            text: t("onboarding_form_select_options_title"),
            type: TextObjectType.PLAINTEXT,
        },
        element: blocks.newMultiStaticElement({
            actionId: "selectOptionId",
            initialValue: onboardingOption,
            options: [
                {
                    value: "connectAdmins",
                    text: {
                        type: TextObjectType.PLAINTEXT,
                        text: "Connect with other Rocket.Chat server administrators",
                        emoji: true,
                    },
                },
                {
                    value: "support",
                    text: {
                        type: TextObjectType.PLAINTEXT,
                        text: "Looking to resolve problem or receive support information.",
                        emoji: true,
                    },
                },
                {
                    value: "gsoc",
                    text: {
                        type: TextObjectType.PLAINTEXT,
                        text: "Looking for GSoC Program",
                        emoji: true,
                    },
                },
            ],
        }),
        blockId: "selectOptionId",
    });

    blocks.addInputBlock({
        label: {
            text: t("onboarding_form_message_title"),
            type: TextObjectType.PLAINTEXT,
        },
        element: blocks.newPlainTextInputElement({
            actionId: "onboardingMessageId",
            multiline: true,
            initialValue: onboardingMessage,
            placeholder: {
                text: t("onboarding_form_message_placeholder"),
                type: TextObjectType.PLAINTEXT,
            },
        }),
        blockId: "onboardingMessageId",
    });

    return {
        id: Modals.OnboardingForm,
        title: blocks.newPlainTextObject(t("onboarding_form_modal_title")),
        submit: blocks.newButtonElement({
            text: blocks.newPlainTextObject(t("submit")),
        }),
        blocks: blocks.getBlocks(),
    };
}
