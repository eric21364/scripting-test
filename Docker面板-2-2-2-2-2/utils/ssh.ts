import { getProfile } from "../pages/setting";

let ssh: SSHClient | null = null;

async function getSSH(): Promise<SSHClient | null> {
  if (ssh) return ssh;

  const profile = getProfile();

  const { host, port, username, password } = profile.ssh;

  if (!host || !port || !username || !password) {
    return null;
  }

  ssh = await SSHClient.connect({
    host,
    port,
    authenticationMethod: SSHAuthenticationMethod.passwordBased(
      username as string,
      password as string
    ),
    reconnect: "always",
  });

  return ssh;
}

export async function sshExecuteCommand(cmd: string) {
  const client = await getSSH();
  if (client === null) return;
  return client.executeCommand(cmd, { inShell: true });
}

// export async function closeSSH() {
//     if (ssh) {
//         await ssh.close();
//         ssh = null;
//         connected = false;
//     }
// }
