---
title: RHCSA 学习笔记：红帽认证核心知识点
date: 2024-09-02
---

RHCSA（EX200）考的是在 RHEL 上实际动手的能力，不是背选择题。考试全程在真机上操作，题目就是日常运维里会遇到的任务。这篇是我备考时整理的核心知识点。

## systemd：服务和定时任务

systemd 是最常考的部分，基本每个任务都离不开它。

- **服务管理**：`systemctl start/stop/restart/status <服务>`，开机自启是 `systemctl enable/disable`。注意 `enable` 只管开机自启，不管现在是不是在运行。
- **查看日志**：`journalctl -u <服务>` 看某个服务的日志，`-f` 实时跟随，`--since "1 hour ago"` 限定时间范围。
- **定时任务**：除了 cron，RHEL 更推荐用 systemd timer。一个 timer 配一个 service 文件，`systemctl list-timers` 可以看到下次执行时间。timer 的好处是能看到执行历史和输出，cron 出问题只能翻邮件。
- **目标（target）**：`systemctl get-default` 看默认启动目标，`set-default multi-user.target` 切换。图形界面和多用户模式的切换是常考题。

## SELinux：别关，学会用

很多人第一反应是把 SELinux 关掉，考试里关掉会直接扣分。正确做法是学会看它在拦什么：

- **看状态**：`getenforce` 看当前模式，`sestatus` 看详细配置。模式应该是 Enforcing。
- **看日志**：被拦的操作会记在 `/var/log/audit/audit.log` 里，`ausearch -m avc -ts recent` 可以直接查最近的拒绝记录。
- **改上下文**：文件权限不对时用 `chcon` 临时改，`semanage fcontext -a -t <类型> <路径>` 加永久规则，再 `restorecon -Rv <路径>` 生效。
- **布尔值**：服务需要额外权限时先查布尔值，比如 `getsebool -a | grep httpd`，`setsebool -P <布尔值> on` 永久打开。`-P` 不加的话重启就失效。

记住一个原则：SELinux 报错先看日志，确认是策略问题再改上下文，不要上来就 `setenforce 0`。

## 存储管理

- **分区和文件系统**：`fdisk` / `parted` 分区，`mkfs.xfs` 格式化，XFS 是 RHEL 默认文件系统。
- **LVM**：物理卷（PV）→ 卷组（VG）→ 逻辑卷（LV）三层。常用命令：`pvcreate`、`vgcreate`、`lvcreate -L 5G -n <名字> <卷组>`，扩容用 `lvextend -r -L +2G <逻辑卷>`，`-r` 会自动扩展文件系统。考试经常考在线扩容，记住别漏 `-r`。
- **交换分区**：`swapon -s` 看当前交换区，`fstab` 里加一行可以开机自动挂载。
- **挂载**：`mount` 临时挂，写进 `/etc/fstab` 才是永久挂载。改完 fstab 先跑 `mount -a` 验证，写错了机器起不来。

## 用户和组管理

- **建用户**：`useradd <用户名>`，`passwd <用户名>` 设密码。`useradd -G <组>` 直接加进附加组。
- **密码策略**：`chage -l <用户名>` 看密码过期设置，`chage -M 90 <用户名>` 设 90 天过期。
- **权限**：除了 rwx 三组权限，还要会 ACL。`setfacl -m u:<用户>:rw <文件>` 给单个用户加权限，`getfacl <文件>` 查看。ACL 在多用户协作的目录里很常用。
- **sudo**：`visudo` 编辑配置，给用户或者组加 `NOPASSWD` 要小心，考试里按题目要求写就行。

## 网络和防火墙

- **nmcli**：RHEL 用 NetworkManager，`nmcli connection show` 看连接，`nmcli connection modify <连接> ipv4.addresses 192.168.1.10/24` 改 IP，改完 `nmcli connection up <连接>` 生效。
- **firewalld**：`firewall-cmd --list-all` 看当前规则，`--add-service=http --permanent` 放行服务，`--add-port=8080/tcp --permanent` 放行端口。注意 `--permanent` 只改配置，不立即生效，要再跑 `firewall-cmd --reload`。
- **主机名**：`hostnamectl set-hostname <名字>`，改完顺手检查 `/etc/hosts`。

## 备考建议

- **多动手**：每个知识点在虚拟机上实际敲一遍，光看书记不住。RHEL 9 可以免费申请开发者订阅，装个虚拟机就能练。
- **熟悉环境**：考试是命令行，没有图形界面帮忙，`man` 命令可以查参数，但时间有限，别指望现查现学。
- **按题意做事**：题目要求什么就做什么，不要多做，也不要用取巧的办法绕过。比如题目说用 SELinux 上下文解决，就不要去关 SELinux。
- **检查**：做完一题花十秒验证一下，服务是不是 running，文件权限对不对，比最后统一检查省时间。
