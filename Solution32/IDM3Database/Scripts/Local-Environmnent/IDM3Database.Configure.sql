GO
:setvar AdministratorName "admin"
:setvar AdministratorEmail "kiryl.baryshnikau@bd.com"
:setvar EnvironmentName "localhost"
:setvar CertificateThumbprint "‎C076647E94B998AF15F07B4113D498C49D789366"
:setvar medview_web "17443"
:setvar idm_sts "15443"
:setvar idm_admin "13443"
:setvar idm_federationmanager "00000"

GO
:on error exit
GO
/*
Detect SQLCMD mode and disable script execution if SQLCMD mode is not supported.
To re-enable the script after enabling SQLCMD mode, execute the following:
SET NOEXEC OFF; 
*/
:setvar __IsSqlCmdEnabled "True"
GO
IF N'$(__IsSqlCmdEnabled)' NOT LIKE N'True'
    BEGIN
        PRINT N'SQLCMD mode must be enabled to successfully execute this script.';
        SET NOEXEC ON;
    END


GO


PRINT N'Overwrite [idm].[SecurityTokenServiceConfiguration] for [$(EnvironmentName)]...';
GO

SET IDENTITY_INSERT [idm].[SecurityTokenServiceConfiguration] ON

MERGE INTO [idm].[SecurityTokenServiceConfiguration] AS [Target]
USING (VALUES
  (1,1,N'',N'$(CertificateThumbprint)',N'$(CertificateThumbprint)',N'$(CertificateThumbprint)',N'https://localhost:$(idm_sts)/ids/',N'https://localhost:$(idm_sts)','00:30:00.0000000',1,35,'01:00:00.0000000',N'$(AdministratorEmail)',N'$(AdministratorEmail)',1,15,0,NULL,0,NULL,0,1,1,15,1,0,0)
) AS [Source] ([SecurityTokenServiceConfigurationId],[EnableIDSLogs],[AppName],[SigningCert],[PIIEncryptionCert],[CookieCert],[IssuerUri],[Realm],[CookieExpiration],[CookieSlide],[AccountInactivityLockoutDurationInDays],[GlobalTokenLifetime],[AdminNotificationEmail],[AdminContactEmail],[EnableEmailNotifications],[MinimumPasswordLength],[EmailAsUsername],[ConfidentialityClickThroughText],[ConfidentialityClickThroughEnable],[ConfidentialityBannerText],[ConfidentialityBannerEnable],[EncryptionEnabled],[EnablePostSignOutAutoRedirect],[PostSignOutAutoRedirectDelay],[RequireSsl],[PasswordReveal],[RequireSignOutPrompt])
ON ([Target].[SecurityTokenServiceConfigurationId] = [Source].[SecurityTokenServiceConfigurationId])
WHEN MATCHED AND (
	NULLIF([Source].[EnableIDSLogs], [Target].[EnableIDSLogs]) IS NOT NULL OR NULLIF([Target].[EnableIDSLogs], [Source].[EnableIDSLogs]) IS NOT NULL OR 
	NULLIF([Source].[AppName], [Target].[AppName]) IS NOT NULL OR NULLIF([Target].[AppName], [Source].[AppName]) IS NOT NULL OR 
	NULLIF([Source].[SigningCert], [Target].[SigningCert]) IS NOT NULL OR NULLIF([Target].[SigningCert], [Source].[SigningCert]) IS NOT NULL OR 
	NULLIF([Source].[PIIEncryptionCert], [Target].[PIIEncryptionCert]) IS NOT NULL OR NULLIF([Target].[PIIEncryptionCert], [Source].[PIIEncryptionCert]) IS NOT NULL OR 
	NULLIF([Source].[CookieCert], [Target].[CookieCert]) IS NOT NULL OR NULLIF([Target].[CookieCert], [Source].[CookieCert]) IS NOT NULL OR 
	NULLIF([Source].[IssuerUri], [Target].[IssuerUri]) IS NOT NULL OR NULLIF([Target].[IssuerUri], [Source].[IssuerUri]) IS NOT NULL OR 
	NULLIF([Source].[Realm], [Target].[Realm]) IS NOT NULL OR NULLIF([Target].[Realm], [Source].[Realm]) IS NOT NULL OR 
	NULLIF([Source].[CookieExpiration], [Target].[CookieExpiration]) IS NOT NULL OR NULLIF([Target].[CookieExpiration], [Source].[CookieExpiration]) IS NOT NULL OR 
	NULLIF([Source].[CookieSlide], [Target].[CookieSlide]) IS NOT NULL OR NULLIF([Target].[CookieSlide], [Source].[CookieSlide]) IS NOT NULL OR 
	NULLIF([Source].[AccountInactivityLockoutDurationInDays], [Target].[AccountInactivityLockoutDurationInDays]) IS NOT NULL OR NULLIF([Target].[AccountInactivityLockoutDurationInDays], [Source].[AccountInactivityLockoutDurationInDays]) IS NOT NULL OR 
	NULLIF([Source].[GlobalTokenLifetime], [Target].[GlobalTokenLifetime]) IS NOT NULL OR NULLIF([Target].[GlobalTokenLifetime], [Source].[GlobalTokenLifetime]) IS NOT NULL OR 
	NULLIF([Source].[AdminNotificationEmail], [Target].[AdminNotificationEmail]) IS NOT NULL OR NULLIF([Target].[AdminNotificationEmail], [Source].[AdminNotificationEmail]) IS NOT NULL OR 
	NULLIF([Source].[AdminContactEmail], [Target].[AdminContactEmail]) IS NOT NULL OR NULLIF([Target].[AdminContactEmail], [Source].[AdminContactEmail]) IS NOT NULL OR 
	NULLIF([Source].[EnableEmailNotifications], [Target].[EnableEmailNotifications]) IS NOT NULL OR NULLIF([Target].[EnableEmailNotifications], [Source].[EnableEmailNotifications]) IS NOT NULL OR 
	NULLIF([Source].[MinimumPasswordLength], [Target].[MinimumPasswordLength]) IS NOT NULL OR NULLIF([Target].[MinimumPasswordLength], [Source].[MinimumPasswordLength]) IS NOT NULL OR 
	NULLIF([Source].[EmailAsUsername], [Target].[EmailAsUsername]) IS NOT NULL OR NULLIF([Target].[EmailAsUsername], [Source].[EmailAsUsername]) IS NOT NULL OR 
	NULLIF([Source].[ConfidentialityClickThroughText], [Target].[ConfidentialityClickThroughText]) IS NOT NULL OR NULLIF([Target].[ConfidentialityClickThroughText], [Source].[ConfidentialityClickThroughText]) IS NOT NULL OR 
	NULLIF([Source].[ConfidentialityClickThroughEnable], [Target].[ConfidentialityClickThroughEnable]) IS NOT NULL OR NULLIF([Target].[ConfidentialityClickThroughEnable], [Source].[ConfidentialityClickThroughEnable]) IS NOT NULL OR 
	NULLIF([Source].[ConfidentialityBannerText], [Target].[ConfidentialityBannerText]) IS NOT NULL OR NULLIF([Target].[ConfidentialityBannerText], [Source].[ConfidentialityBannerText]) IS NOT NULL OR 
	NULLIF([Source].[ConfidentialityBannerEnable], [Target].[ConfidentialityBannerEnable]) IS NOT NULL OR NULLIF([Target].[ConfidentialityBannerEnable], [Source].[ConfidentialityBannerEnable]) IS NOT NULL OR 
	NULLIF([Source].[EncryptionEnabled], [Target].[EncryptionEnabled]) IS NOT NULL OR NULLIF([Target].[EncryptionEnabled], [Source].[EncryptionEnabled]) IS NOT NULL OR 
	NULLIF([Source].[EnablePostSignOutAutoRedirect], [Target].[EnablePostSignOutAutoRedirect]) IS NOT NULL OR NULLIF([Target].[EnablePostSignOutAutoRedirect], [Source].[EnablePostSignOutAutoRedirect]) IS NOT NULL OR 
	NULLIF([Source].[PostSignOutAutoRedirectDelay], [Target].[PostSignOutAutoRedirectDelay]) IS NOT NULL OR NULLIF([Target].[PostSignOutAutoRedirectDelay], [Source].[PostSignOutAutoRedirectDelay]) IS NOT NULL OR 
	NULLIF([Source].[RequireSsl], [Target].[RequireSsl]) IS NOT NULL OR NULLIF([Target].[RequireSsl], [Source].[RequireSsl]) IS NOT NULL OR 
	NULLIF([Source].[PasswordReveal], [Target].[PasswordReveal]) IS NOT NULL OR NULLIF([Target].[PasswordReveal], [Source].[PasswordReveal]) IS NOT NULL OR 
	NULLIF([Source].[RequireSignOutPrompt], [Target].[RequireSignOutPrompt]) IS NOT NULL OR NULLIF([Target].[RequireSignOutPrompt], [Source].[RequireSignOutPrompt]) IS NOT NULL) THEN
 UPDATE SET
  [Target].[EnableIDSLogs] = [Source].[EnableIDSLogs], 
  [Target].[AppName] = [Source].[AppName], 
  [Target].[SigningCert] = [Source].[SigningCert], 
  [Target].[PIIEncryptionCert] = [Source].[PIIEncryptionCert], 
  [Target].[CookieCert] = [Source].[CookieCert], 
  [Target].[IssuerUri] = [Source].[IssuerUri], 
  [Target].[Realm] = [Source].[Realm], 
  [Target].[CookieExpiration] = [Source].[CookieExpiration], 
  [Target].[CookieSlide] = [Source].[CookieSlide], 
  [Target].[AccountInactivityLockoutDurationInDays] = [Source].[AccountInactivityLockoutDurationInDays], 
  [Target].[GlobalTokenLifetime] = [Source].[GlobalTokenLifetime], 
  [Target].[AdminNotificationEmail] = [Source].[AdminNotificationEmail], 
  [Target].[AdminContactEmail] = [Source].[AdminContactEmail], 
  [Target].[EnableEmailNotifications] = [Source].[EnableEmailNotifications], 
  [Target].[MinimumPasswordLength] = [Source].[MinimumPasswordLength], 
  [Target].[EmailAsUsername] = [Source].[EmailAsUsername], 
  [Target].[ConfidentialityClickThroughText] = [Source].[ConfidentialityClickThroughText], 
  [Target].[ConfidentialityClickThroughEnable] = [Source].[ConfidentialityClickThroughEnable], 
  [Target].[ConfidentialityBannerText] = [Source].[ConfidentialityBannerText], 
  [Target].[ConfidentialityBannerEnable] = [Source].[ConfidentialityBannerEnable], 
  [Target].[EncryptionEnabled] = [Source].[EncryptionEnabled], 
  [Target].[EnablePostSignOutAutoRedirect] = [Source].[EnablePostSignOutAutoRedirect], 
  [Target].[PostSignOutAutoRedirectDelay] = [Source].[PostSignOutAutoRedirectDelay], 
  [Target].[RequireSsl] = [Source].[RequireSsl], 
  [Target].[PasswordReveal] = [Source].[PasswordReveal], 
  [Target].[RequireSignOutPrompt] = [Source].[RequireSignOutPrompt]
WHEN NOT MATCHED BY TARGET THEN
 INSERT([SecurityTokenServiceConfigurationId],[EnableIDSLogs],[AppName],[SigningCert],[PIIEncryptionCert],[CookieCert],[IssuerUri],[Realm],[CookieExpiration],[CookieSlide],[AccountInactivityLockoutDurationInDays],[GlobalTokenLifetime],[AdminNotificationEmail],[AdminContactEmail],[EnableEmailNotifications],[MinimumPasswordLength],[EmailAsUsername],[ConfidentialityClickThroughText],[ConfidentialityClickThroughEnable],[ConfidentialityBannerText],[ConfidentialityBannerEnable],[EncryptionEnabled],[EnablePostSignOutAutoRedirect],[PostSignOutAutoRedirectDelay],[RequireSsl],[PasswordReveal],[RequireSignOutPrompt])
 VALUES([Source].[SecurityTokenServiceConfigurationId],[Source].[EnableIDSLogs],[Source].[AppName],[Source].[SigningCert],[Source].[PIIEncryptionCert],[Source].[CookieCert],[Source].[IssuerUri],[Source].[Realm],[Source].[CookieExpiration],[Source].[CookieSlide],[Source].[AccountInactivityLockoutDurationInDays],[Source].[GlobalTokenLifetime],[Source].[AdminNotificationEmail],[Source].[AdminContactEmail],[Source].[EnableEmailNotifications],[Source].[MinimumPasswordLength],[Source].[EmailAsUsername],[Source].[ConfidentialityClickThroughText],[Source].[ConfidentialityClickThroughEnable],[Source].[ConfidentialityBannerText],[Source].[ConfidentialityBannerEnable],[Source].[EncryptionEnabled],[Source].[EnablePostSignOutAutoRedirect],[Source].[PostSignOutAutoRedirectDelay],[Source].[RequireSsl],[Source].[PasswordReveal],[Source].[RequireSignOutPrompt])
;
--WHEN NOT MATCHED BY SOURCE THEN 
-- DELETE;

SET IDENTITY_INSERT [idm].[SecurityTokenServiceConfiguration] OFF
GO

PRINT N'Overwrite [ids].[ClientRedirectUris] for [$(EnvironmentName)]...';
GO

SET IDENTITY_INSERT [ids].[ClientRedirectUris] ON

MERGE INTO [ids].[ClientRedirectUris] AS [Target]
USING (VALUES
  (1,N'https://localhost:$(idm_admin)/login/',1)
 ,(2,N'https://localhost:$(idm_federationmanager)',4)
 ,(3,N'https://localhost:$(medview_web)/signin-oidc',5)
) AS [Source] ([Id],[Uri],[Client_Id])
ON ([Target].[Id] = [Source].[Id])
WHEN MATCHED AND (
	NULLIF([Source].[Uri], [Target].[Uri]) IS NOT NULL OR NULLIF([Target].[Uri], [Source].[Uri]) IS NOT NULL OR 
	NULLIF([Source].[Client_Id], [Target].[Client_Id]) IS NOT NULL OR NULLIF([Target].[Client_Id], [Source].[Client_Id]) IS NOT NULL) THEN
 UPDATE SET
  [Target].[Uri] = [Source].[Uri], 
  [Target].[Client_Id] = [Source].[Client_Id]
WHEN NOT MATCHED BY TARGET THEN
 INSERT([Id],[Uri],[Client_Id])
 VALUES([Source].[Id],[Source].[Uri],[Source].[Client_Id])
;
--WHEN NOT MATCHED BY SOURCE THEN 
-- DELETE;

SET IDENTITY_INSERT [ids].[ClientRedirectUris] OFF
GO

PRINT N'Overwrite [ids].[ClientPostLogoutRedirectUris] for [$(EnvironmentName)]...';
GO

SET IDENTITY_INSERT [ids].[ClientPostLogoutRedirectUris] ON

MERGE INTO [ids].[ClientPostLogoutRedirectUris] AS [Target]
USING (VALUES
  (1,N'https://localhost:$(medview_web)/',5)
) AS [Source] ([Id],[Uri],[Client_Id])
ON ([Target].[Id] = [Source].[Id])
WHEN MATCHED AND (
	NULLIF([Source].[Uri], [Target].[Uri]) IS NOT NULL OR NULLIF([Target].[Uri], [Source].[Uri]) IS NOT NULL OR 
	NULLIF([Source].[Client_Id], [Target].[Client_Id]) IS NOT NULL OR NULLIF([Target].[Client_Id], [Source].[Client_Id]) IS NOT NULL) THEN
 UPDATE SET
  [Target].[Uri] = [Source].[Uri], 
  [Target].[Client_Id] = [Source].[Client_Id]
WHEN NOT MATCHED BY TARGET THEN
 INSERT([Id],[Uri],[Client_Id])
 VALUES([Source].[Id],[Source].[Uri],[Source].[Client_Id])
;
--WHEN NOT MATCHED BY SOURCE THEN 
-- DELETE;

SET IDENTITY_INSERT [ids].[ClientPostLogoutRedirectUris] OFF
GO

PRINT N'Overwrite [ids].[ClientCorsOrigins] for [$(EnvironmentName)]...';
GO

SET IDENTITY_INSERT [ids].[ClientCorsOrigins] ON

MERGE INTO [ids].[ClientCorsOrigins] AS [Target]
USING (VALUES
  (1,N'https://localhost:$(idm_sts)',5)
 ,(2,N'https://localhost:$(idm_sts)',6)
) AS [Source] ([Id],[Origin],[Client_Id])
ON ([Target].[Id] = [Source].[Id])
WHEN MATCHED AND (
	NULLIF([Source].[Origin], [Target].[Origin]) IS NOT NULL OR NULLIF([Target].[Origin], [Source].[Origin]) IS NOT NULL OR 
	NULLIF([Source].[Client_Id], [Target].[Client_Id]) IS NOT NULL OR NULLIF([Target].[Client_Id], [Source].[Client_Id]) IS NOT NULL) THEN
 UPDATE SET
  [Target].[Origin] = [Source].[Origin], 
  [Target].[Client_Id] = [Source].[Client_Id]
WHEN NOT MATCHED BY TARGET THEN
 INSERT([Id],[Origin],[Client_Id])
 VALUES([Source].[Id],[Source].[Origin],[Source].[Client_Id])
;
--WHEN NOT MATCHED BY SOURCE THEN 
-- DELETE;

SET IDENTITY_INSERT [ids].[ClientCorsOrigins] OFF
GO

PRINT N'Overwrite Filling [mr].[UserAccounts] for [$(EnvironmentName)]...';
GO

SET IDENTITY_INSERT [mr].[UserAccounts] ON

MERGE INTO [mr].[UserAccounts] AS [Target]
USING (VALUES
  (1,NULL,N'DD458DA9-5DE6-4F79-8756-E4756FEF63A3',N'default',N'$(AdministratorName)','2019-06-26T06:50:45.120','2019-06-26T06:59:04.453',0,NULL,1,NULL,'2019-07-17T21:07:03.873',NULL,0,'2019-06-26T06:59:04.453',0,N'$(AdministratorEmail)',1,NULL,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,N'C350.AAG6sCRoyYvov7fDk6zNxMlbBNhLXC1bgJC+wdo3ku8A6tc+kjW/ZVLXMshZ2ridOQ==',0,NULL,NULL)
 --,(2,NULL,N'B99C54B7-E442-47A0-B62B-DAEE906C691A',N'default',N'su','2019-06-26T07:00:19.413','2019-07-19T19:12:27.333',0,NULL,1,NULL,'2019-07-19T19:12:27.317',NULL,0,NULL,0,N'hsvqa3advanced@gmail.com',1,NULL,0,NULL,NULL,NULL,NULL,0,0,N'34E62C5DA1A5CC1A0740E482E203DD2A90A75E2C3502EE0EFC74965DA8BBB67B',3,'2019-06-26T07:00:19.413',N'hsvqa3advanced@gmail.com',NULL,0,NULL,NULL)
 --,(3,NULL,N'DB2686DD-8693-4DB9-B912-0DA5BD5EBE3B',N'default',N'ph','2019-06-26T19:27:18.630','2019-07-18T21:02:20.283',0,NULL,1,NULL,'2019-07-18T21:02:20.237',NULL,0,NULL,0,N'hsvqa3advanced@gmail.com',1,NULL,0,NULL,NULL,NULL,NULL,0,0,N'18AD2DF47BADEE4933FC44D46E167BE304E8C2A87DEE50AEE71F72EB7900FF91',3,'2019-06-26T19:27:18.630',N'hsvqa3advanced@gmail.com',NULL,0,NULL,NULL)
 --,(4,NULL,N'C1710399-1476-457C-BEA2-33BC651E2A34',N'default',N'clnph','2019-06-26T19:33:46.183','2019-07-09T17:32:33.033',0,NULL,1,NULL,'2019-07-09T17:32:33.017',NULL,0,NULL,0,N'hsvqa3advanced@gmail.com',1,NULL,0,NULL,NULL,NULL,NULL,0,0,N'0ADA15F6D187A420F701079345E89FFD33E6789F97DB1E9F8513C256B96E3F84',3,'2019-06-26T19:33:46.183',N'hsvqa3advanced@gmail.com',NULL,0,NULL,NULL)
 --,(5,NULL,N'D5D024BC-82F0-4E39-A1DC-300C31CD409F',N'default',N'cl','2019-06-26T20:20:42.823','2019-07-09T17:33:43.630',0,NULL,1,NULL,'2019-07-09T17:33:43.613',NULL,0,NULL,0,NULL,1,NULL,0,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL)
 --,(6,NULL,N'ED20A898-9108-44E7-B416-014CC2140281',N'default',N'tsa','2019-07-05T18:44:05.353','2019-07-08T21:12:59.223',0,NULL,1,NULL,'2019-07-08T21:12:59.207',NULL,0,NULL,0,N'hsvqa3advanced@gmail.com',1,NULL,0,NULL,NULL,NULL,NULL,0,0,N'0EBB74E2A3C9C6B5DF1914C75B025085B16E1223A1C5F766496B632D7FFD5ABB',3,'2019-07-05T18:44:05.353',N'hsvqa3advanced@gmail.com',NULL,0,NULL,NULL)
 --,(7,NULL,N'1094A5E6-5AF2-40F6-954A-0904E10997DD',N'default',N'bd1.onmicrosoft.com\kavita.maurya','2019-07-12T22:02:34.113','2019-07-12T22:02:34.223',0,NULL,1,NULL,'2019-07-12T22:02:34.193',NULL,0,NULL,0,N'Kavita.Maurya@bd.com',1,NULL,0,NULL,NULL,NULL,NULL,0,0,N'9D8FAA8992A492E1A4AD989612E21BC21207C832D02ACAA54E744537637C4905',3,'2019-07-12T22:02:34.113',N'Kavita.Maurya@bd.com',NULL,0,NULL,NULL)
) AS [Source] ([Key],[BypassInactivityCutoff],[ID],[Tenant],[Username],[Created],[LastUpdated],[IsAccountClosed],[AccountClosed],[IsLoginAllowed],[IsLoginAllowedChanged],[LastLogin],[LastFailedLogin],[FailedLoginCount],[PasswordChanged],[RequiresPasswordReset],[Email],[IsAccountVerified],[LastFailedPasswordReset],[FailedPasswordResetCount],[MobileCode],[MobileCodeSent],[MobilePhoneNumber],[MobilePhoneNumberChanged],[AccountTwoFactorAuthMode],[CurrentTwoFactorAuthStatus],[VerificationKey],[VerificationPurpose],[VerificationKeySent],[VerificationStorage],[HashedPassword],[CanExpire],[AccountApproved],[AccountRejected])
ON ([Target].[Key] = [Source].[Key])
WHEN MATCHED AND (
	NULLIF([Source].[BypassInactivityCutoff], [Target].[BypassInactivityCutoff]) IS NOT NULL OR NULLIF([Target].[BypassInactivityCutoff], [Source].[BypassInactivityCutoff]) IS NOT NULL OR 
	NULLIF([Source].[ID], [Target].[ID]) IS NOT NULL OR NULLIF([Target].[ID], [Source].[ID]) IS NOT NULL OR 
	NULLIF([Source].[Tenant], [Target].[Tenant]) IS NOT NULL OR NULLIF([Target].[Tenant], [Source].[Tenant]) IS NOT NULL OR 
	NULLIF([Source].[Username], [Target].[Username]) IS NOT NULL OR NULLIF([Target].[Username], [Source].[Username]) IS NOT NULL OR 
	NULLIF([Source].[Created], [Target].[Created]) IS NOT NULL OR NULLIF([Target].[Created], [Source].[Created]) IS NOT NULL OR 
	NULLIF([Source].[LastUpdated], [Target].[LastUpdated]) IS NOT NULL OR NULLIF([Target].[LastUpdated], [Source].[LastUpdated]) IS NOT NULL OR 
	NULLIF([Source].[IsAccountClosed], [Target].[IsAccountClosed]) IS NOT NULL OR NULLIF([Target].[IsAccountClosed], [Source].[IsAccountClosed]) IS NOT NULL OR 
	NULLIF([Source].[AccountClosed], [Target].[AccountClosed]) IS NOT NULL OR NULLIF([Target].[AccountClosed], [Source].[AccountClosed]) IS NOT NULL OR 
	NULLIF([Source].[IsLoginAllowed], [Target].[IsLoginAllowed]) IS NOT NULL OR NULLIF([Target].[IsLoginAllowed], [Source].[IsLoginAllowed]) IS NOT NULL OR 
	NULLIF([Source].[IsLoginAllowedChanged], [Target].[IsLoginAllowedChanged]) IS NOT NULL OR NULLIF([Target].[IsLoginAllowedChanged], [Source].[IsLoginAllowedChanged]) IS NOT NULL OR 
	NULLIF([Source].[LastLogin], [Target].[LastLogin]) IS NOT NULL OR NULLIF([Target].[LastLogin], [Source].[LastLogin]) IS NOT NULL OR 
	NULLIF([Source].[LastFailedLogin], [Target].[LastFailedLogin]) IS NOT NULL OR NULLIF([Target].[LastFailedLogin], [Source].[LastFailedLogin]) IS NOT NULL OR 
	NULLIF([Source].[FailedLoginCount], [Target].[FailedLoginCount]) IS NOT NULL OR NULLIF([Target].[FailedLoginCount], [Source].[FailedLoginCount]) IS NOT NULL OR 
	NULLIF([Source].[PasswordChanged], [Target].[PasswordChanged]) IS NOT NULL OR NULLIF([Target].[PasswordChanged], [Source].[PasswordChanged]) IS NOT NULL OR 
	NULLIF([Source].[RequiresPasswordReset], [Target].[RequiresPasswordReset]) IS NOT NULL OR NULLIF([Target].[RequiresPasswordReset], [Source].[RequiresPasswordReset]) IS NOT NULL OR 
	NULLIF([Source].[Email], [Target].[Email]) IS NOT NULL OR NULLIF([Target].[Email], [Source].[Email]) IS NOT NULL OR 
	NULLIF([Source].[IsAccountVerified], [Target].[IsAccountVerified]) IS NOT NULL OR NULLIF([Target].[IsAccountVerified], [Source].[IsAccountVerified]) IS NOT NULL OR 
	NULLIF([Source].[LastFailedPasswordReset], [Target].[LastFailedPasswordReset]) IS NOT NULL OR NULLIF([Target].[LastFailedPasswordReset], [Source].[LastFailedPasswordReset]) IS NOT NULL OR 
	NULLIF([Source].[FailedPasswordResetCount], [Target].[FailedPasswordResetCount]) IS NOT NULL OR NULLIF([Target].[FailedPasswordResetCount], [Source].[FailedPasswordResetCount]) IS NOT NULL OR 
	NULLIF([Source].[MobileCode], [Target].[MobileCode]) IS NOT NULL OR NULLIF([Target].[MobileCode], [Source].[MobileCode]) IS NOT NULL OR 
	NULLIF([Source].[MobileCodeSent], [Target].[MobileCodeSent]) IS NOT NULL OR NULLIF([Target].[MobileCodeSent], [Source].[MobileCodeSent]) IS NOT NULL OR 
	NULLIF([Source].[MobilePhoneNumber], [Target].[MobilePhoneNumber]) IS NOT NULL OR NULLIF([Target].[MobilePhoneNumber], [Source].[MobilePhoneNumber]) IS NOT NULL OR 
	NULLIF([Source].[MobilePhoneNumberChanged], [Target].[MobilePhoneNumberChanged]) IS NOT NULL OR NULLIF([Target].[MobilePhoneNumberChanged], [Source].[MobilePhoneNumberChanged]) IS NOT NULL OR 
	NULLIF([Source].[AccountTwoFactorAuthMode], [Target].[AccountTwoFactorAuthMode]) IS NOT NULL OR NULLIF([Target].[AccountTwoFactorAuthMode], [Source].[AccountTwoFactorAuthMode]) IS NOT NULL OR 
	NULLIF([Source].[CurrentTwoFactorAuthStatus], [Target].[CurrentTwoFactorAuthStatus]) IS NOT NULL OR NULLIF([Target].[CurrentTwoFactorAuthStatus], [Source].[CurrentTwoFactorAuthStatus]) IS NOT NULL OR 
	NULLIF([Source].[VerificationKey], [Target].[VerificationKey]) IS NOT NULL OR NULLIF([Target].[VerificationKey], [Source].[VerificationKey]) IS NOT NULL OR 
	NULLIF([Source].[VerificationPurpose], [Target].[VerificationPurpose]) IS NOT NULL OR NULLIF([Target].[VerificationPurpose], [Source].[VerificationPurpose]) IS NOT NULL OR 
	NULLIF([Source].[VerificationKeySent], [Target].[VerificationKeySent]) IS NOT NULL OR NULLIF([Target].[VerificationKeySent], [Source].[VerificationKeySent]) IS NOT NULL OR 
	NULLIF([Source].[VerificationStorage], [Target].[VerificationStorage]) IS NOT NULL OR NULLIF([Target].[VerificationStorage], [Source].[VerificationStorage]) IS NOT NULL OR 
	NULLIF([Source].[HashedPassword], [Target].[HashedPassword]) IS NOT NULL OR NULLIF([Target].[HashedPassword], [Source].[HashedPassword]) IS NOT NULL OR 
	NULLIF([Source].[CanExpire], [Target].[CanExpire]) IS NOT NULL OR NULLIF([Target].[CanExpire], [Source].[CanExpire]) IS NOT NULL OR 
	NULLIF([Source].[AccountApproved], [Target].[AccountApproved]) IS NOT NULL OR NULLIF([Target].[AccountApproved], [Source].[AccountApproved]) IS NOT NULL OR 
	NULLIF([Source].[AccountRejected], [Target].[AccountRejected]) IS NOT NULL OR NULLIF([Target].[AccountRejected], [Source].[AccountRejected]) IS NOT NULL) THEN
 UPDATE SET
  [Target].[BypassInactivityCutoff] = [Source].[BypassInactivityCutoff], 
  [Target].[ID] = [Source].[ID], 
  [Target].[Tenant] = [Source].[Tenant], 
  [Target].[Username] = [Source].[Username], 
  [Target].[Created] = [Source].[Created], 
  [Target].[LastUpdated] = [Source].[LastUpdated], 
  [Target].[IsAccountClosed] = [Source].[IsAccountClosed], 
  [Target].[AccountClosed] = [Source].[AccountClosed], 
  [Target].[IsLoginAllowed] = [Source].[IsLoginAllowed], 
  [Target].[IsLoginAllowedChanged] = [Source].[IsLoginAllowedChanged], 
  [Target].[LastLogin] = [Source].[LastLogin], 
  [Target].[LastFailedLogin] = [Source].[LastFailedLogin], 
  [Target].[FailedLoginCount] = [Source].[FailedLoginCount], 
  [Target].[PasswordChanged] = [Source].[PasswordChanged], 
  [Target].[RequiresPasswordReset] = [Source].[RequiresPasswordReset], 
  [Target].[Email] = [Source].[Email], 
  [Target].[IsAccountVerified] = [Source].[IsAccountVerified], 
  [Target].[LastFailedPasswordReset] = [Source].[LastFailedPasswordReset], 
  [Target].[FailedPasswordResetCount] = [Source].[FailedPasswordResetCount], 
  [Target].[MobileCode] = [Source].[MobileCode], 
  [Target].[MobileCodeSent] = [Source].[MobileCodeSent], 
  [Target].[MobilePhoneNumber] = [Source].[MobilePhoneNumber], 
  [Target].[MobilePhoneNumberChanged] = [Source].[MobilePhoneNumberChanged], 
  [Target].[AccountTwoFactorAuthMode] = [Source].[AccountTwoFactorAuthMode], 
  [Target].[CurrentTwoFactorAuthStatus] = [Source].[CurrentTwoFactorAuthStatus], 
  [Target].[VerificationKey] = [Source].[VerificationKey], 
  [Target].[VerificationPurpose] = [Source].[VerificationPurpose], 
  [Target].[VerificationKeySent] = [Source].[VerificationKeySent], 
  [Target].[VerificationStorage] = [Source].[VerificationStorage], 
  [Target].[HashedPassword] = [Source].[HashedPassword], 
  [Target].[CanExpire] = [Source].[CanExpire], 
  [Target].[AccountApproved] = [Source].[AccountApproved], 
  [Target].[AccountRejected] = [Source].[AccountRejected]
WHEN NOT MATCHED BY TARGET THEN
 INSERT([Key],[BypassInactivityCutoff],[ID],[Tenant],[Username],[Created],[LastUpdated],[IsAccountClosed],[AccountClosed],[IsLoginAllowed],[IsLoginAllowedChanged],[LastLogin],[LastFailedLogin],[FailedLoginCount],[PasswordChanged],[RequiresPasswordReset],[Email],[IsAccountVerified],[LastFailedPasswordReset],[FailedPasswordResetCount],[MobileCode],[MobileCodeSent],[MobilePhoneNumber],[MobilePhoneNumberChanged],[AccountTwoFactorAuthMode],[CurrentTwoFactorAuthStatus],[VerificationKey],[VerificationPurpose],[VerificationKeySent],[VerificationStorage],[HashedPassword],[CanExpire],[AccountApproved],[AccountRejected])
 VALUES([Source].[Key],[Source].[BypassInactivityCutoff],[Source].[ID],[Source].[Tenant],[Source].[Username],[Source].[Created],[Source].[LastUpdated],[Source].[IsAccountClosed],[Source].[AccountClosed],[Source].[IsLoginAllowed],[Source].[IsLoginAllowedChanged],[Source].[LastLogin],[Source].[LastFailedLogin],[Source].[FailedLoginCount],[Source].[PasswordChanged],[Source].[RequiresPasswordReset],[Source].[Email],[Source].[IsAccountVerified],[Source].[LastFailedPasswordReset],[Source].[FailedPasswordResetCount],[Source].[MobileCode],[Source].[MobileCodeSent],[Source].[MobilePhoneNumber],[Source].[MobilePhoneNumberChanged],[Source].[AccountTwoFactorAuthMode],[Source].[CurrentTwoFactorAuthStatus],[Source].[VerificationKey],[Source].[VerificationPurpose],[Source].[VerificationKeySent],[Source].[VerificationStorage],[Source].[HashedPassword],[Source].[CanExpire],[Source].[AccountApproved],[Source].[AccountRejected])
;
--WHEN NOT MATCHED BY SOURCE THEN 
-- DELETE;

SET IDENTITY_INSERT [mr].[UserAccounts] OFF
GO

--EXEC dbo.sp_generate_merge @schema = 'ids', @table_name ='Clients', @cols_to_exclude = null
PRINT N'Overwrite [ids].[Clients] for [$(EnvironmentName)]...';
GO

SET IDENTITY_INSERT [ids].[Clients] ON

MERGE INTO [ids].[Clients] AS [Target]
USING (VALUES
  (1,1,N'idmadmin',N'Admin Web Portal',NULL,NULL,0,1,2,0,900,86400,300,2592000,1296000,1,0,1,0,1,0,0,1,0,0,1,N'https://$(EnvironmentName)-idm-admin.azurewebsites.net/Account/signoutcleanup',1,0)
 ,(2,1,N'IdmApiClient',N'Idm Api Client',NULL,NULL,0,1,3,0,900,86400,300,2592000,1296000,1,0,1,0,1,0,0,1,0,0,1,N'',1,0)
 ,(3,1,N'idmconfigapi',N'Idm Config Api Client',NULL,NULL,0,1,3,0,900,86400,300,2592000,1296000,1,0,1,0,1,0,0,1,0,0,1,N'',1,0)
 ,(4,1,N'idmFederationManager',N'Idm Federation Manager Client',NULL,NULL,0,1,2,0,900,86400,300,2592000,1296000,1,0,1,0,1,0,0,1,0,0,1,N'https://$(EnvironmentName)-idm-federationmanager/Account/signoutcleanup',1,0)
 ,(5,1,N'mvd_user_mode_client',N'mvd_user_mode_client',NULL,NULL,0,1,2,0,900,28800,300,2592000,1296000,1,0,1,0,1,1,0,1,0,0,1,NULL,0,0)
 ,(6,1,N'mvd_tv_mode_client',N'mvd_tv_mode_client',NULL,NULL,0,1,3,1,900,86400,300,2592000,1296000,1,0,1,0,1,1,0,1,0,0,1,NULL,0,0)
 ,(7,1,N'FHIRClientID',N'FHIRClientID',NULL,NULL,0,1,3,0,900,86400,300,2592000,1296000,1,0,1,0,0,1,0,1,0,0,1,NULL,0,0)
) AS [Source] ([Id],[Enabled],[ClientId],[ClientName],[ClientUri],[LogoUri],[RequireConsent],[AllowRememberConsent],[Flow],[AllowClientCredentialsOnly],[IdentityTokenLifetime],[AccessTokenLifetime],[AuthorizationCodeLifetime],[AbsoluteRefreshTokenLifetime],[SlidingRefreshTokenLifetime],[RefreshTokenUsage],[UpdateAccessTokenOnRefresh],[RefreshTokenExpiration],[AccessTokenType],[EnableLocalLogin],[IncludeJwtId],[AlwaysSendClientClaims],[PrefixClientClaims],[AllowAccessToAllScopes],[AllowAccessToAllGrantTypes],[AllowAccessTokensViaBrowser],[LogoutUri],[LogoutSessionRequired],[RequireSignOutPrompt])
ON ([Target].[Id] = [Source].[Id])
WHEN MATCHED AND (
	NULLIF([Source].[Enabled], [Target].[Enabled]) IS NOT NULL OR NULLIF([Target].[Enabled], [Source].[Enabled]) IS NOT NULL OR 
	NULLIF([Source].[ClientId], [Target].[ClientId]) IS NOT NULL OR NULLIF([Target].[ClientId], [Source].[ClientId]) IS NOT NULL OR 
	NULLIF([Source].[ClientName], [Target].[ClientName]) IS NOT NULL OR NULLIF([Target].[ClientName], [Source].[ClientName]) IS NOT NULL OR 
	NULLIF([Source].[ClientUri], [Target].[ClientUri]) IS NOT NULL OR NULLIF([Target].[ClientUri], [Source].[ClientUri]) IS NOT NULL OR 
	NULLIF([Source].[LogoUri], [Target].[LogoUri]) IS NOT NULL OR NULLIF([Target].[LogoUri], [Source].[LogoUri]) IS NOT NULL OR 
	NULLIF([Source].[RequireConsent], [Target].[RequireConsent]) IS NOT NULL OR NULLIF([Target].[RequireConsent], [Source].[RequireConsent]) IS NOT NULL OR 
	NULLIF([Source].[AllowRememberConsent], [Target].[AllowRememberConsent]) IS NOT NULL OR NULLIF([Target].[AllowRememberConsent], [Source].[AllowRememberConsent]) IS NOT NULL OR 
	NULLIF([Source].[Flow], [Target].[Flow]) IS NOT NULL OR NULLIF([Target].[Flow], [Source].[Flow]) IS NOT NULL OR 
	NULLIF([Source].[AllowClientCredentialsOnly], [Target].[AllowClientCredentialsOnly]) IS NOT NULL OR NULLIF([Target].[AllowClientCredentialsOnly], [Source].[AllowClientCredentialsOnly]) IS NOT NULL OR 
	NULLIF([Source].[IdentityTokenLifetime], [Target].[IdentityTokenLifetime]) IS NOT NULL OR NULLIF([Target].[IdentityTokenLifetime], [Source].[IdentityTokenLifetime]) IS NOT NULL OR 
	NULLIF([Source].[AccessTokenLifetime], [Target].[AccessTokenLifetime]) IS NOT NULL OR NULLIF([Target].[AccessTokenLifetime], [Source].[AccessTokenLifetime]) IS NOT NULL OR 
	NULLIF([Source].[AuthorizationCodeLifetime], [Target].[AuthorizationCodeLifetime]) IS NOT NULL OR NULLIF([Target].[AuthorizationCodeLifetime], [Source].[AuthorizationCodeLifetime]) IS NOT NULL OR 
	NULLIF([Source].[AbsoluteRefreshTokenLifetime], [Target].[AbsoluteRefreshTokenLifetime]) IS NOT NULL OR NULLIF([Target].[AbsoluteRefreshTokenLifetime], [Source].[AbsoluteRefreshTokenLifetime]) IS NOT NULL OR 
	NULLIF([Source].[SlidingRefreshTokenLifetime], [Target].[SlidingRefreshTokenLifetime]) IS NOT NULL OR NULLIF([Target].[SlidingRefreshTokenLifetime], [Source].[SlidingRefreshTokenLifetime]) IS NOT NULL OR 
	NULLIF([Source].[RefreshTokenUsage], [Target].[RefreshTokenUsage]) IS NOT NULL OR NULLIF([Target].[RefreshTokenUsage], [Source].[RefreshTokenUsage]) IS NOT NULL OR 
	NULLIF([Source].[UpdateAccessTokenOnRefresh], [Target].[UpdateAccessTokenOnRefresh]) IS NOT NULL OR NULLIF([Target].[UpdateAccessTokenOnRefresh], [Source].[UpdateAccessTokenOnRefresh]) IS NOT NULL OR 
	NULLIF([Source].[RefreshTokenExpiration], [Target].[RefreshTokenExpiration]) IS NOT NULL OR NULLIF([Target].[RefreshTokenExpiration], [Source].[RefreshTokenExpiration]) IS NOT NULL OR 
	NULLIF([Source].[AccessTokenType], [Target].[AccessTokenType]) IS NOT NULL OR NULLIF([Target].[AccessTokenType], [Source].[AccessTokenType]) IS NOT NULL OR 
	NULLIF([Source].[EnableLocalLogin], [Target].[EnableLocalLogin]) IS NOT NULL OR NULLIF([Target].[EnableLocalLogin], [Source].[EnableLocalLogin]) IS NOT NULL OR 
	NULLIF([Source].[IncludeJwtId], [Target].[IncludeJwtId]) IS NOT NULL OR NULLIF([Target].[IncludeJwtId], [Source].[IncludeJwtId]) IS NOT NULL OR 
	NULLIF([Source].[AlwaysSendClientClaims], [Target].[AlwaysSendClientClaims]) IS NOT NULL OR NULLIF([Target].[AlwaysSendClientClaims], [Source].[AlwaysSendClientClaims]) IS NOT NULL OR 
	NULLIF([Source].[PrefixClientClaims], [Target].[PrefixClientClaims]) IS NOT NULL OR NULLIF([Target].[PrefixClientClaims], [Source].[PrefixClientClaims]) IS NOT NULL OR 
	NULLIF([Source].[AllowAccessToAllScopes], [Target].[AllowAccessToAllScopes]) IS NOT NULL OR NULLIF([Target].[AllowAccessToAllScopes], [Source].[AllowAccessToAllScopes]) IS NOT NULL OR 
	NULLIF([Source].[AllowAccessToAllGrantTypes], [Target].[AllowAccessToAllGrantTypes]) IS NOT NULL OR NULLIF([Target].[AllowAccessToAllGrantTypes], [Source].[AllowAccessToAllGrantTypes]) IS NOT NULL OR 
	NULLIF([Source].[AllowAccessTokensViaBrowser], [Target].[AllowAccessTokensViaBrowser]) IS NOT NULL OR NULLIF([Target].[AllowAccessTokensViaBrowser], [Source].[AllowAccessTokensViaBrowser]) IS NOT NULL OR 
	NULLIF([Source].[LogoutUri], [Target].[LogoutUri]) IS NOT NULL OR NULLIF([Target].[LogoutUri], [Source].[LogoutUri]) IS NOT NULL OR 
	NULLIF([Source].[LogoutSessionRequired], [Target].[LogoutSessionRequired]) IS NOT NULL OR NULLIF([Target].[LogoutSessionRequired], [Source].[LogoutSessionRequired]) IS NOT NULL OR 
	NULLIF([Source].[RequireSignOutPrompt], [Target].[RequireSignOutPrompt]) IS NOT NULL OR NULLIF([Target].[RequireSignOutPrompt], [Source].[RequireSignOutPrompt]) IS NOT NULL) THEN
 UPDATE SET
  [Target].[Enabled] = [Source].[Enabled], 
  [Target].[ClientId] = [Source].[ClientId], 
  [Target].[ClientName] = [Source].[ClientName], 
  [Target].[ClientUri] = [Source].[ClientUri], 
  [Target].[LogoUri] = [Source].[LogoUri], 
  [Target].[RequireConsent] = [Source].[RequireConsent], 
  [Target].[AllowRememberConsent] = [Source].[AllowRememberConsent], 
  [Target].[Flow] = [Source].[Flow], 
  [Target].[AllowClientCredentialsOnly] = [Source].[AllowClientCredentialsOnly], 
  [Target].[IdentityTokenLifetime] = [Source].[IdentityTokenLifetime], 
  [Target].[AccessTokenLifetime] = [Source].[AccessTokenLifetime], 
  [Target].[AuthorizationCodeLifetime] = [Source].[AuthorizationCodeLifetime], 
  [Target].[AbsoluteRefreshTokenLifetime] = [Source].[AbsoluteRefreshTokenLifetime], 
  [Target].[SlidingRefreshTokenLifetime] = [Source].[SlidingRefreshTokenLifetime], 
  [Target].[RefreshTokenUsage] = [Source].[RefreshTokenUsage], 
  [Target].[UpdateAccessTokenOnRefresh] = [Source].[UpdateAccessTokenOnRefresh], 
  [Target].[RefreshTokenExpiration] = [Source].[RefreshTokenExpiration], 
  [Target].[AccessTokenType] = [Source].[AccessTokenType], 
  [Target].[EnableLocalLogin] = [Source].[EnableLocalLogin], 
  [Target].[IncludeJwtId] = [Source].[IncludeJwtId], 
  [Target].[AlwaysSendClientClaims] = [Source].[AlwaysSendClientClaims], 
  [Target].[PrefixClientClaims] = [Source].[PrefixClientClaims], 
  [Target].[AllowAccessToAllScopes] = [Source].[AllowAccessToAllScopes], 
  [Target].[AllowAccessToAllGrantTypes] = [Source].[AllowAccessToAllGrantTypes], 
  [Target].[AllowAccessTokensViaBrowser] = [Source].[AllowAccessTokensViaBrowser], 
  [Target].[LogoutUri] = [Source].[LogoutUri], 
  [Target].[LogoutSessionRequired] = [Source].[LogoutSessionRequired], 
  [Target].[RequireSignOutPrompt] = [Source].[RequireSignOutPrompt]
WHEN NOT MATCHED BY TARGET THEN
 INSERT([Id],[Enabled],[ClientId],[ClientName],[ClientUri],[LogoUri],[RequireConsent],[AllowRememberConsent],[Flow],[AllowClientCredentialsOnly],[IdentityTokenLifetime],[AccessTokenLifetime],[AuthorizationCodeLifetime],[AbsoluteRefreshTokenLifetime],[SlidingRefreshTokenLifetime],[RefreshTokenUsage],[UpdateAccessTokenOnRefresh],[RefreshTokenExpiration],[AccessTokenType],[EnableLocalLogin],[IncludeJwtId],[AlwaysSendClientClaims],[PrefixClientClaims],[AllowAccessToAllScopes],[AllowAccessToAllGrantTypes],[AllowAccessTokensViaBrowser],[LogoutUri],[LogoutSessionRequired],[RequireSignOutPrompt])
 VALUES([Source].[Id],[Source].[Enabled],[Source].[ClientId],[Source].[ClientName],[Source].[ClientUri],[Source].[LogoUri],[Source].[RequireConsent],[Source].[AllowRememberConsent],[Source].[Flow],[Source].[AllowClientCredentialsOnly],[Source].[IdentityTokenLifetime],[Source].[AccessTokenLifetime],[Source].[AuthorizationCodeLifetime],[Source].[AbsoluteRefreshTokenLifetime],[Source].[SlidingRefreshTokenLifetime],[Source].[RefreshTokenUsage],[Source].[UpdateAccessTokenOnRefresh],[Source].[RefreshTokenExpiration],[Source].[AccessTokenType],[Source].[EnableLocalLogin],[Source].[IncludeJwtId],[Source].[AlwaysSendClientClaims],[Source].[PrefixClientClaims],[Source].[AllowAccessToAllScopes],[Source].[AllowAccessToAllGrantTypes],[Source].[AllowAccessTokensViaBrowser],[Source].[LogoutUri],[Source].[LogoutSessionRequired],[Source].[RequireSignOutPrompt])
;
--WHEN NOT MATCHED BY SOURCE THEN 
-- DELETE;

SET IDENTITY_INSERT [ids].[Clients] OFF
GO

--EXEC dbo.sp_generate_merge @schema = 'idm', @table_name ='IdentityProviders', @cols_to_exclude = null
--TODO: KB: Check: Potential failure
PRINT N'Overwrite [idm].[IdentityProviders] for [$(EnvironmentName)]...';
GO

SET IDENTITY_INSERT [idm].[IdentityProviders] ON

MERGE INTO [idm].[IdentityProviders] AS [Target]
USING (VALUES
  (1,N'local',N'idsrv',N'idsrv',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,NULL,NULL,NULL,0,0,NULL,NULL,NULL,30)
 ,(2,N'OpenIDConnect',N'es_ids',N'es_ids',N'https://HSVAPPNEW1.carefusionservices.com:11998/.well-known/openid-configuration',N'https://HSVAPPNEW1.carefusionservices.com:11998/',NULL,N'Authenticate with ES',N'mvd_user_mode_client',N'7CFAA621-1F9C-4214-ABFB-7FA3E1DD0B89',N'openid openid_identity profile_identity email email_identity offline_access es_platform_api',N'code id_token token',0,0,NULL,NULL,NULL,0,0,NULL,NULL,NULL,30)
) AS [Source] ([IdentityProviderId],[AuthenticationMode],[Name],[AuthType],[MetaDataUrl],[Path],[Realm],[ButtonText],[ClientId],[ClientSecret],[RequestedScopes],[ResponseType],[Priority],[Enabled],[FailoverGroup],[SAMLNameIdFormat],[AdvancedConfiguration],[IsExternal],[AllowIdpInitiatedSSo],[IdpInitiatedMetadata],[CertificateInformation],[MetaData],[MetaDataTimeout])
ON ([Target].[IdentityProviderId] = [Source].[IdentityProviderId])
WHEN MATCHED AND (
	NULLIF([Source].[AuthenticationMode], [Target].[AuthenticationMode]) IS NOT NULL OR NULLIF([Target].[AuthenticationMode], [Source].[AuthenticationMode]) IS NOT NULL OR 
	NULLIF([Source].[Name], [Target].[Name]) IS NOT NULL OR NULLIF([Target].[Name], [Source].[Name]) IS NOT NULL OR 
	NULLIF([Source].[AuthType], [Target].[AuthType]) IS NOT NULL OR NULLIF([Target].[AuthType], [Source].[AuthType]) IS NOT NULL OR 
	NULLIF([Source].[MetaDataUrl], [Target].[MetaDataUrl]) IS NOT NULL OR NULLIF([Target].[MetaDataUrl], [Source].[MetaDataUrl]) IS NOT NULL OR 
	NULLIF([Source].[Path], [Target].[Path]) IS NOT NULL OR NULLIF([Target].[Path], [Source].[Path]) IS NOT NULL OR 
	NULLIF([Source].[Realm], [Target].[Realm]) IS NOT NULL OR NULLIF([Target].[Realm], [Source].[Realm]) IS NOT NULL OR 
	NULLIF([Source].[ButtonText], [Target].[ButtonText]) IS NOT NULL OR NULLIF([Target].[ButtonText], [Source].[ButtonText]) IS NOT NULL OR 
	NULLIF([Source].[ClientId], [Target].[ClientId]) IS NOT NULL OR NULLIF([Target].[ClientId], [Source].[ClientId]) IS NOT NULL OR 
	NULLIF([Source].[ClientSecret], [Target].[ClientSecret]) IS NOT NULL OR NULLIF([Target].[ClientSecret], [Source].[ClientSecret]) IS NOT NULL OR 
	NULLIF([Source].[RequestedScopes], [Target].[RequestedScopes]) IS NOT NULL OR NULLIF([Target].[RequestedScopes], [Source].[RequestedScopes]) IS NOT NULL OR 
	NULLIF([Source].[ResponseType], [Target].[ResponseType]) IS NOT NULL OR NULLIF([Target].[ResponseType], [Source].[ResponseType]) IS NOT NULL OR 
	NULLIF([Source].[Priority], [Target].[Priority]) IS NOT NULL OR NULLIF([Target].[Priority], [Source].[Priority]) IS NOT NULL OR 
	NULLIF([Source].[Enabled], [Target].[Enabled]) IS NOT NULL OR NULLIF([Target].[Enabled], [Source].[Enabled]) IS NOT NULL OR 
	NULLIF([Source].[FailoverGroup], [Target].[FailoverGroup]) IS NOT NULL OR NULLIF([Target].[FailoverGroup], [Source].[FailoverGroup]) IS NOT NULL OR 
	NULLIF([Source].[SAMLNameIdFormat], [Target].[SAMLNameIdFormat]) IS NOT NULL OR NULLIF([Target].[SAMLNameIdFormat], [Source].[SAMLNameIdFormat]) IS NOT NULL OR 
	NULLIF([Source].[AdvancedConfiguration], [Target].[AdvancedConfiguration]) IS NOT NULL OR NULLIF([Target].[AdvancedConfiguration], [Source].[AdvancedConfiguration]) IS NOT NULL OR 
	NULLIF([Source].[IsExternal], [Target].[IsExternal]) IS NOT NULL OR NULLIF([Target].[IsExternal], [Source].[IsExternal]) IS NOT NULL OR 
	NULLIF([Source].[AllowIdpInitiatedSSo], [Target].[AllowIdpInitiatedSSo]) IS NOT NULL OR NULLIF([Target].[AllowIdpInitiatedSSo], [Source].[AllowIdpInitiatedSSo]) IS NOT NULL OR 
	NULLIF([Source].[IdpInitiatedMetadata], [Target].[IdpInitiatedMetadata]) IS NOT NULL OR NULLIF([Target].[IdpInitiatedMetadata], [Source].[IdpInitiatedMetadata]) IS NOT NULL OR 
	NULLIF([Source].[CertificateInformation], [Target].[CertificateInformation]) IS NOT NULL OR NULLIF([Target].[CertificateInformation], [Source].[CertificateInformation]) IS NOT NULL OR 
	NULLIF([Source].[MetaData], [Target].[MetaData]) IS NOT NULL OR NULLIF([Target].[MetaData], [Source].[MetaData]) IS NOT NULL OR 
	NULLIF([Source].[MetaDataTimeout], [Target].[MetaDataTimeout]) IS NOT NULL OR NULLIF([Target].[MetaDataTimeout], [Source].[MetaDataTimeout]) IS NOT NULL) THEN
 UPDATE SET
  [Target].[AuthenticationMode] = [Source].[AuthenticationMode], 
  [Target].[Name] = [Source].[Name], 
  [Target].[AuthType] = [Source].[AuthType], 
  [Target].[MetaDataUrl] = [Source].[MetaDataUrl], 
  [Target].[Path] = [Source].[Path], 
  [Target].[Realm] = [Source].[Realm], 
  [Target].[ButtonText] = [Source].[ButtonText], 
  [Target].[ClientId] = [Source].[ClientId], 
  [Target].[ClientSecret] = [Source].[ClientSecret], 
  [Target].[RequestedScopes] = [Source].[RequestedScopes], 
  [Target].[ResponseType] = [Source].[ResponseType], 
  [Target].[Priority] = [Source].[Priority], 
  [Target].[Enabled] = [Source].[Enabled], 
  [Target].[FailoverGroup] = [Source].[FailoverGroup], 
  [Target].[SAMLNameIdFormat] = [Source].[SAMLNameIdFormat], 
  [Target].[AdvancedConfiguration] = [Source].[AdvancedConfiguration], 
  [Target].[IsExternal] = [Source].[IsExternal], 
  [Target].[AllowIdpInitiatedSSo] = [Source].[AllowIdpInitiatedSSo], 
  [Target].[IdpInitiatedMetadata] = [Source].[IdpInitiatedMetadata], 
  [Target].[CertificateInformation] = [Source].[CertificateInformation], 
  [Target].[MetaData] = [Source].[MetaData], 
  [Target].[MetaDataTimeout] = [Source].[MetaDataTimeout]
WHEN NOT MATCHED BY TARGET THEN
 INSERT([IdentityProviderId],[AuthenticationMode],[Name],[AuthType],[MetaDataUrl],[Path],[Realm],[ButtonText],[ClientId],[ClientSecret],[RequestedScopes],[ResponseType],[Priority],[Enabled],[FailoverGroup],[SAMLNameIdFormat],[AdvancedConfiguration],[IsExternal],[AllowIdpInitiatedSSo],[IdpInitiatedMetadata],[CertificateInformation],[MetaData],[MetaDataTimeout])
 VALUES([Source].[IdentityProviderId],[Source].[AuthenticationMode],[Source].[Name],[Source].[AuthType],[Source].[MetaDataUrl],[Source].[Path],[Source].[Realm],[Source].[ButtonText],[Source].[ClientId],[Source].[ClientSecret],[Source].[RequestedScopes],[Source].[ResponseType],[Source].[Priority],[Source].[Enabled],[Source].[FailoverGroup],[Source].[SAMLNameIdFormat],[Source].[AdvancedConfiguration],[Source].[IsExternal],[Source].[AllowIdpInitiatedSSo],[Source].[IdpInitiatedMetadata],[Source].[CertificateInformation],[Source].[MetaData],[Source].[MetaDataTimeout])
;
--WHEN NOT MATCHED BY SOURCE THEN 
-- DELETE;

SET IDENTITY_INSERT [idm].[IdentityProviders] OFF
GO

--EXEC dbo.sp_generate_merge @schema = 'ids', @table_name ='ClientIdPRestrictions', @cols_to_exclude = null
PRINT N'Overwrite [ids].[ClientIdPRestrictions] for [$(EnvironmentName)]...';
GO

SET IDENTITY_INSERT [ids].[ClientIdPRestrictions] ON

MERGE INTO [ids].[ClientIdPRestrictions] AS [Target]
USING (VALUES
  (1,N'idsrv',5)
) AS [Source] ([Id],[Provider],[Client_Id])
ON ([Target].[Id] = [Source].[Id])
WHEN MATCHED AND (
	NULLIF([Source].[Provider], [Target].[Provider]) IS NOT NULL OR NULLIF([Target].[Provider], [Source].[Provider]) IS NOT NULL OR 
	NULLIF([Source].[Client_Id], [Target].[Client_Id]) IS NOT NULL OR NULLIF([Target].[Client_Id], [Source].[Client_Id]) IS NOT NULL) THEN
 UPDATE SET
  [Target].[Provider] = [Source].[Provider], 
  [Target].[Client_Id] = [Source].[Client_Id]
WHEN NOT MATCHED BY TARGET THEN
 INSERT([Id],[Provider],[Client_Id])
 VALUES([Source].[Id],[Source].[Provider],[Source].[Client_Id])
;
--WHEN NOT MATCHED BY SOURCE THEN 
-- DELETE;

SET IDENTITY_INSERT [ids].[ClientIdPRestrictions] OFF
GO
