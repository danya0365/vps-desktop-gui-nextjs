/**
 * MockTerminalRepository
 * Mock implementation of ITerminalRepository for development and testing
 * Following Clean Architecture - Infrastructure Layer
 */

import { ITerminalRepository } from "@/src/application/repositories/ITerminalRepository";

export class MockTerminalRepository implements ITerminalRepository {
  private mockCommands: Record<string, string> = {
    help: `Available commands:
  ls          - List directory contents
  pwd         - Print working directory
  whoami      - Print current user
  uname       - Print system information
  df          - Display disk space usage
  free        - Display memory usage
  uptime      - Show system uptime
  top         - Display running processes
  docker ps   - List Docker containers
  clear       - Clear terminal
  exit        - Close connection`,
    whoami: `root`,
    uname: `Linux vps-server 5.15.0-generic #1 SMP x86_64 GNU/Linux`,
    "uname -a": `Linux vps-server 5.15.0-generic #1 SMP Tue Jan 28 10:00:00 UTC 2025 x86_64 x86_64 x86_64 GNU/Linux`,
    df: `Filesystem     1K-blocks      Used Available Use% Mounted on
/dev/sda1      52428800   5242880  47185920  10% /
tmpfs           8388608         0   8388608   0% /dev/shm
/dev/sdb1     104857600  10485760  94371840  10% /data`,
    "df -h": `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G  5.0G   45G  10% /
tmpfs           8.0G     0  8.0G   0% /dev/shm
/dev/sdb1       100G   10G   90G  10% /data`,
    free: `              total        used        free      shared  buff/cache   available
Mem:       32768000    18432000     8192000      256000     6144000    13824000
Swap:       4194304      524288     3670016`,
    "free -h": `              total        used        free      shared  buff/cache   available
Mem:           31Gi        18Gi       7.8Gi       250Mi       5.8Gi        13Gi
Swap:         4.0Gi       512Mi       3.5Gi`,
    uptime: ` 10:45:32 up 30 days,  4:22,  1 user,  load average: 0.42, 0.38, 0.35`,
    top: `top - 10:45:32 up 30 days,  4:22,  1 user,  load average: 0.42, 0.38, 0.35
Tasks: 128 total,   1 running, 127 sleeping,   0 stopped,   0 zombie
%Cpu(s):  5.2 us,  2.1 sy,  0.0 ni, 92.3 id,  0.2 wa,  0.0 hi,  0.2 si,  0.0 st
MiB Mem :  32000.0 total,   8000.0 free,  18000.0 used,   6000.0 buff/cache
MiB Swap:   4096.0 total,   3500.0 free,    596.0 used.  13500.0 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
    1 root      20   0  168936  12284   8820 S   0.0   0.0   0:03.81 systemd
  245 root      20   0   47928  14320  11532 S   0.3   0.0   0:15.43 nginx
  389 mysql     20   0 1854332 524288  32768 S   1.2   1.6   5:42.15 mysqld
  512 www-data  20   0  256128  65536  24576 S   0.5   0.2   2:18.92 php-fpm`,
    "docker ps": `CONTAINER ID   IMAGE          COMMAND                  STATUS          PORTS                    NAMES
a1b2c3d4e5f6   nginx:latest   "nginx -g 'daemon of…"   Up 15 days      0.0.0.0:80->80/tcp       web-proxy
b2c3d4e5f6a1   mysql:8.0      "docker-entrypoint.s…"   Up 15 days      0.0.0.0:3306->3306/tcp   database
c3d4e5f6a1b2   redis:alpine   "docker-entrypoint.s…"   Up 7 days       0.0.0.0:6379->6379/tcp   cache`,
    hostname: `vps-server`,
    "cat /etc/os-release": `PRETTY_NAME="Ubuntu 22.04.3 LTS"
NAME="Ubuntu"
VERSION_ID="22.04"
VERSION="22.04.3 LTS (Jammy Jellyfish)"
ID=ubuntu
ID_LIKE=debian`,
  };

  // Mock filesystem structure
  private mockFs: Record<string, string[]> = {
    "/": ["bin", "dev", "etc", "home", "lib", "media", "mnt", "opt", "proc", "root", "run", "sbin", "srv", "sys", "tmp", "usr", "var"],
    "/home": ["user1", "user2"],
    "/var": ["log", "www", "lib"],
    "/etc": ["nginx", "ssh", "passwd", "hosts"],
  };

  async executeCommand(serverId: string, command: string, cwd: string): Promise<{ output: string; cwd: string }> {
    await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));

    const trimmedCmd = command.trim();
    const lowerCmd = trimmedCmd.toLowerCase();
    let newCwd = cwd;

    // Handle cd command
    if (lowerCmd.startsWith("cd ")) {
      const target = trimmedCmd.substring(3).trim();
      if (target === "/" || target === "~") {
        newCwd = "/";
      } else if (target === "..") {
        const parts = cwd.split("/").filter(Boolean);
        parts.pop();
        newCwd = "/" + parts.join("/");
      } else if (target.startsWith("/")) {
        newCwd = target;
      } else {
        newCwd = cwd === "/" ? `/${target}` : `${cwd}/${target}`;
      }
      return { output: "", cwd: newCwd };
    }

    // Handle pwd
    if (lowerCmd === "pwd") {
      return { output: cwd, cwd };
    }

    // Handle ls
    if (lowerCmd === "ls" || lowerCmd === "ls -la" || lowerCmd === "ls -l") {
      const contents = this.mockFs[cwd] || this.mockFs["/"];
      return { output: contents.join("   "), cwd };
    }

    // Handle other known commands
    if (this.mockCommands[lowerCmd]) {
      return { output: this.mockCommands[lowerCmd], cwd };
    }

    if (lowerCmd.startsWith("echo ")) {
      return { output: command.substring(5), cwd };
    }

    if (lowerCmd === "date") {
      return { output: new Date().toString(), cwd };
    }

    return { output: `bash: ${command.split(" ")[0]}: command not found`, cwd };
  }
}
