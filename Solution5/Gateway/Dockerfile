#Depending on the operating system of the host machines(s) that will build or run the containers, the image specified in the FROM statement may need to be changed.
#For more information, please see http://aka.ms/containercompat 

FROM microsoft/aspnet:4.7.2-windowsservercore-ltsc2016
ARG source
WORKDIR /inetpub/wwwroot
COPY ${source:-obj/Docker/publish} .

ADD https://download.microsoft.com/download/C/9/E/C9E8180D-4E51-40A6-A9BF-776990D8BCA9/rewrite_amd64.msi /install/rewrite_amd64.msi
RUN Start-Process msiexec.exe -ArgumentList '/i', 'c:\install\rewrite_amd64.msi', '/quiet', '/norestart' -NoNewWindow -Wait

ADD https://download.microsoft.com/download/E/9/8/E9849D6A-020E-47E4-9FD0-A023E99B54EB/requestRouter_amd64.msi /install/requestRouter_amd64.msi
RUN Start-Process msiexec.exe -ArgumentList '/i', 'c:\install\requestRouter_amd64.msi', '/quiet', '/norestart' -NoNewWindow -Wait

RUN powershell Set-WebConfigurationProperty -pspath 'MACHINE/WEBROOT/APPHOST'  -filter "system.webServer/proxy" -name "enabled" -value "True"
