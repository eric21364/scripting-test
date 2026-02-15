export function formatMemory(memory: number) {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let index = 0;
    while (memory >= 1024 && index < units.length - 1) {
        memory /= 1024;
        index++;
    }
    return `${memory.toFixed(2)} ${units[index]}`;
}
