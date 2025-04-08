import { IHttp } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { sendNotification } from "./Messages";

export async function createTextCompletion(
    app: App,
    http: IHttp,
    prompt: string,
    room?: IRoom,
    user?: IUser,
): Promise<string> {
    const model = await app
        .getAccessors()
        .environmentReader.getSettings()
        .getValueById("model");
    const url = `http://${model}/v1`;

    console.log("usl:", url);

    const body = {
        model,
        messages: [
            {
                role: "system",
                content: prompt,
            },
        ],
        temperature: 0,
    };

    const response = await http.post(url + "/chat/completions", {
        headers: {
            "Content-Type": "application/json",
        },
        content: JSON.stringify(body),
    });

    if (!response.content) {
        // await sendNotification(
        //     this.read,
        //     this.modify,
        //     user,
        //     room,
        //     `Something is wrong with AI. Please try again later`
        // );
        console.log("Something is wrong with AI. Please try again later");

        throw new Error("Something is wrong with AI. Please try again later");
    }

    return JSON.parse(response.content).choices[0].message.content;
}

export async function createTextCompletionGroq(
    http: IHttp,
    prompt: string,
): Promise<string> {
    
    const url = `https://api.groq.com/openai/v1`;
    const apiKeyGroq = '';
    
    // const model = 'mistral-saba-24b';
    // const model = `llama-3.2-11b-vision-preview`;
    const model = "llama-3.3-70b-versatile";
    // const model = "llama-3.1-8b-instant";
    // const model = "llama3-8b-8192";

    const body = {
        model,
        messages: [
            {
                role: "system",
                content: prompt,
            },
        ],
        temperature: 0,
    };

    const response = await http.post(url + "/chat/completions", {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKeyGroq}`,
        },
        content: JSON.stringify(body),
    });

    if (!response.content) {
        throw new Error("Something is wrong with AI. Please try again later");
    }

    return response.data.choices[0].message.content;
}


export async function sendRequestToGroqLLM(messages: string): Promise<string> {
    const apiEndpoint = "https://api.groq.com/openai/v1/chat/completions";
    const apiKey = "";

    const requestBody = {
        messages: messages,
        model: "llama-3.3-70b-versatile",
        // model: "llama-3.1-8b-instant",
        // model: "llama3-8b-8192",
    };

    try {
        const response = await this.http.post(apiEndpoint, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            data: requestBody,
        });

        if (response.statusCode !== 200) {
            throw new Error(`API error: ${response.statusCode}`);
        }

        return response.data;
    } catch (error) {
        throw new Error(`Unexpected error: ${error}`);
    }
}