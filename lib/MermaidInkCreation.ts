interface Server {
    name: string;
    description: string;
}

interface Persona {
    name: string;
    description: string;
}

interface Channel {
    name: string;
    description: string;
}

// Relationships: Define which personas belong to which server, and which channels belong to which persona.
interface Relationships {
    serverPersonas: Map<string, string[]>; // ServerName -> PersonaNames[]
    personaChannels: Map<string, string[]>; // PersonaName -> ChannelNames[]
}

function generateServerLine(server: Server): string {
    return `flowchart TD\n    %% Server: ${server.description}\n    ${server.name}["${server.name}"]`;
}

function generatePersonaLines(
    serverName: string,
    personas: Persona[],
    serverPersonas: Map<string, string[]>
): string {
    let code = "";
    const personaNames = serverPersonas.get(serverName) || [];

    personas.forEach((persona) => {
        if (personaNames.includes(persona.name)) {
            code += `\n    %% Persona: ${persona.description}`;
            code += `\n    ${serverName} --> ${persona.name}["${persona.name}"]`;
        }
    });
    return code;
}

function generateChannelLines(
    personas: Persona[],
    channels: Channel[],
    personaChannels: Map<string, string[]>
): string {
    let code = "";
    personas.forEach((persona) => {
        const channelNames = personaChannels.get(persona.name) || [];
        channels.forEach((channel) => {
            if (channelNames.includes(channel.name)) {
                code += `\n    %% Channel: ${channel.description}`;
                code += `\n    ${persona.name} --> ${channel.name}["${channel.name}"]`;
            }
        });
    });
    return code;
}

function generateFullDiagram(
    server: Server,
    personas: Persona[],
    channels: Channel[],
    relationships: Relationships
): string {
    return (
        generateServerLine(server) +
        generatePersonaLines(
            server.name,
            personas,
            relationships.serverPersonas
        ) +
        generateChannelLines(personas, channels, relationships.personaChannels)
    );
}

const server: Server = { name: "Auth-Service", description: "Handles auth" };

const personas: Persona[] = [
    { name: "Admin", description: "Manages security" },
    { name: "User", description: "End-user" },
];

const channels: Channel[] = [
    { name: "Email", description: "Alerts" },
    { name: "Slack", description: "Team comms" },
    { name: "SMS", description: "2FA" },
];

const relationships: Relationships = {
    serverPersonas: new Map([["Auth-Service", ["Admin", "User"]]]),
    personaChannels: new Map([
        ["Admin", ["Email", "Slack"]],
        ["User", ["SMS"]],
    ]),
};

const diagram = generateFullDiagram(server, personas, channels, relationships);
console.log(diagram);

// Encode for mermaid.ink
const encoded = encodeURIComponent(diagram);
const url = `https://mermaid.ink/svg/${encoded}`;