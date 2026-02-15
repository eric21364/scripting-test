import { sshExecuteCommand } from "./ssh";
import { load as yamlLoad } from "../module/js-yaml";
import { getProfile } from "../pages/setting";

const { stackPath } = getProfile().compose as {
  stackPath: string;
};

export async function getAllStacks(): Promise<any> {
  const result = await sshExecuteCommand(
    `cd ${stackPath};
        for dir in */; do
            state=$(cd "$dir" && (docker compose ps --format '{{.State}}' 2>/dev/null | head -n 1));
            echo "\${dir%/} \${state:-paused}";
        done`
  );

  if (result === undefined) return [];

  const containers = result
    .split("\n") // 按行分割
    .filter(Boolean) // 过滤空行
    .map((line) => {
      const [name, status] = line.split(" ");
      return { name, status };
    });

  return containers;
}

export async function setDockerStatus(
  stackName: string,
  serviceName: string,
  status: string,
  commend: "restart" | "start" | "stop" | "update"
) {
  let cmd = `cd ${stackPath}/${stackName} && docker compose ${commend} ${serviceName}`;
  if (commend === "update")
    cmd = `cd ${stackPath}/${stackName} && docker compose pull ${serviceName} ${
      status === "running" ? `&& docker compose start ${serviceName}` : ""
    }`;
  await sshExecuteCommand(cmd);
}

export async function getDockerComposeJson(stackName: string) {
  const filePath = stackPath + "/" + stackName + "/compose.yaml";
  const content = await sshExecuteCommand(`cat ${filePath}`);
  return yamlLoad(content);
}

export async function getDockerComposeYaml(stackName: string): Promise<string> {
  const filePath = stackPath + "/" + stackName + "/compose.yaml";
  const content = await sshExecuteCommand(`cat ${filePath} || echo ""`);
  if (content === undefined) return "";
  return content;
}

export async function getDockerStatus(stackName: string, serviceName: string) {
  // const command = `${dockerPath} inspect -f '{{.State.Status}}' ${containerName}`;
  const command = `cd ${stackPath}/${stackName} && docker compose ps --format "{{.State}}" ${serviceName}`;
  const content = await sshExecuteCommand(command);
  return content;
}

export async function editDockerComposeYaml(
  stackName: string,
  content: string
) {
  const filePath = stackPath + "/" + stackName + "/compose.yaml";
  await sshExecuteCommand(`printf "%s" "${content}" > ${filePath}`);
}
