export function formatMessageTime(date) {
    return new Date(date).toLocalTimeString("en-US",{
        hour: '2-digit',
        minutes: '2-digit',
        hour12: false
    })
}