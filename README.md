### AX1803 WebAdmin Source Code

AX1803 is Tenda AX3 CMCC spec version.

AX1803 banned many feature like vpn(very old pptp version)、remoteweb、cloudapp(andlink instea), some we can try change DOM Element's id to achieve it. This source code can help us, even upload it to router to persist the changes.

It has super admin account CMCCAdmin(just like other modems), we can use it open telnet via `goform/telnet`.

After we connect the gw, use `sh` to access root shell, then use `tfp -pl tarfile <tftpd host>` to upload file to our storage. Also mtd firmware dump file can be uploaded.

