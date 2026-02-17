export function formatPrice(price: string): string {
    const num = parseInt(price.replace(/,/g, ""), 10);
    if (isNaN(num)) return price;
    return num.toLocaleString();
}

export function getApiStatusIcon(status: string): string {
    switch (status) {
        case "Healthy":
        case "Online":
            return "checkmark.circle.fill";
        case "Blocked":
            return "exclamationmark.triangle.fill";
        case "Suspended":
            return "xmark.circle.fill";
        default:
            return "questionmark.circle";
    }
}

export function getApiStatusColor(status: string): string {
    switch (status) {
        case "Healthy":
        case "Online":
            return "systemGreen";
        case "Blocked":
            return "systemOrange";
        case "Suspended":
            return "systemRed";
        default:
            return "systemGray";
    }
}
