import composerize from "../module/composerize";

export function composeize(dockerRunCommand: string) {
    return composerize(dockerRunCommand, "", "latest").split("\n").slice(1).join("\n");
}
