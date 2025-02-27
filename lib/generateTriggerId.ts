export function generateTriggerId(): string {
    const charset =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let triggerId = "";

    for (let i = 0; i < 17; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        triggerId += charset[randomIndex];
    }

    return triggerId;
}
