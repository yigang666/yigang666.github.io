---
title: "RHCSA Study Notes: Key Concepts for Red Hat Certification"
date: 2024-09-02
---

The RHCSA (EX200) tests hands-on ability on RHEL, not multiple-choice memorization. The whole exam is performed on real machines, and every task mirrors something you'd do in daily operations. These are the core topics from my preparation.

## systemd: services and scheduled tasks

systemd comes up in almost every task.

- **Service management**: `systemctl start/stop/restart/status <service>`; `systemctl enable/disable` controls start at boot. Note that `enable` only affects boot behavior, not whether the service is running right now.
- **Logs**: `journalctl -u <service>` shows a service's logs, `-f` follows live, `--since "1 hour ago"` limits the time range.
- **Timers**: besides cron, RHEL favors systemd timers. A timer pairs with a service file, and `systemctl list-timers` shows the next run time. Timers are better than cron for visibility — you can see execution history and output, while a failed cron job only leaves an email.
- **Targets**: `systemctl get-default` shows the default boot target; `systemctl set-default multi-user.target` switches it. Switching between graphical and multi-user mode is a common exam question.

## SELinux: don't turn it off, learn to use it

The first instinct is to disable SELinux — doing so in the exam costs points. The right approach is to find out what it's blocking:

- **Check status**: `getenforce` shows the current mode, `sestatus` shows the details. It should be Enforcing.
- **Check logs**: denied operations are recorded in `/var/log/audit/audit.log`; `ausearch -m avc -ts recent` lists recent denials directly.
- **Fix contexts**: use `chcon` for a temporary context change, and `semanage fcontext -a -t <type> <path>` plus `restorecon -Rv <path>` for a permanent rule.
- **Booleans**: when a service needs extra permissions, check the booleans first, e.g. `getsebool -a | grep httpd`, then `setsebool -P <boolean> on` to enable permanently. Without `-P`, the change is lost on reboot.

One rule: when SELinux reports an error, check the logs first and confirm it's a policy issue before changing contexts. Don't start with `setenforce 0`.

## Storage management

- **Partitions and filesystems**: `fdisk` / `parted` for partitioning, `mkfs.xfs` for formatting. XFS is the RHEL default filesystem.
- **LVM**: three layers — physical volumes (PV) → volume groups (VG) → logical volumes (LV). Common commands: `pvcreate`, `vgcreate`, `lvcreate -L 5G -n <name> <vg>`; extend online with `lvextend -r -L +2G <lv>` — the `-r` flag resizes the filesystem automatically. Online extension is a frequent exam task; don't forget `-r`.
- **Swap**: `swapon -s` shows current swap; an entry in `fstab` mounts it at boot.
- **Mounting**: `mount` mounts temporarily; only `/etc/fstab` makes it permanent. After editing fstab, run `mount -a` to verify — a typo there can prevent the machine from booting.

## Users and groups

- **Creating users**: `useradd <user>`, then `passwd <user>` to set a password. `useradd -G <group>` adds supplementary groups at creation.
- **Password policy**: `chage -l <user>` shows expiry settings; `chage -M 90 <user>` sets a 90-day expiry.
- **Permissions**: beyond the rwx triplets, know ACLs. `setfacl -m u:<user>:rw <file>` grants a single user access; `getfacl <file>` shows the ACLs. ACLs are common in shared directories.
- **sudo**: edit with `visudo`. Be careful with `NOPASSWD`; in the exam, just follow the question.

## Networking and firewall

- **nmcli**: RHEL uses NetworkManager. `nmcli connection show` lists connections; `nmcli connection modify <conn> ipv4.addresses 192.168.1.10/24` changes an IP; apply with `nmcli connection up <conn>`.
- **firewalld**: `firewall-cmd --list-all` shows current rules; `--add-service=http --permanent` allows a service, `--add-port=8080/tcp --permanent` allows a port. `--permanent` only changes the stored config — run `firewall-cmd --reload` to apply it.
- **Hostname**: `hostnamectl set-hostname <name>`, and check `/etc/hosts` afterwards.

## Exam tips

- **Practice by doing**: run every topic in a VM — reading alone doesn't stick. RHEL 9 is available free with a developer subscription, so a practice VM costs nothing.
- **Know the environment**: the exam is command-line only, no GUI to help. `man` can confirm a flag, but time is limited — don't plan on learning things on the spot.
- **Do what the question asks**: nothing more, nothing less. Don't work around a requirement with a shortcut. If the question says to solve it with SELinux contexts, don't disable SELinux.
- **Verify as you go**: after each task, spend ten seconds checking — is the service running, are the file permissions right? That beats a single check at the end.
