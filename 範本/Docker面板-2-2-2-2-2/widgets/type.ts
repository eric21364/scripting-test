export interface DockerInfoData {
    Name: string;
    Version: string;
    CPUs: number;
    Memory: number;
    Containers: number;
    Running: number;
    Stopped: number;
    Images: number;
    OperatingSystem: string;
    OSType: string;
    Architecture: string;
}

export const dockerInfoCmd = `docker info --format '{
    "Name": "{{.Name}}",
    "Version": "{{.ServerVersion}}",
    "CPUs": {{.NCPU}},
    "Memory": {{.MemTotal}},
    "Containers": {{.Containers}},
    "Running": {{.ContainersRunning}},
    "Stopped": {{.ContainersStopped}},
    "Images": {{.Images}},
    "OperatingSystem": "{{.OperatingSystem}}",
    "OSType": "{{.OSType}}",
    "Architecture": "{{.Architecture}}"
}'`;
