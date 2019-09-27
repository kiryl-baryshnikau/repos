GO
:setvar AdministratorName "admin"
:setvar AdministratorEmail "kiryl.baryshnikau@bd.com"
:setvar EnvironmentName "localhost"
:setvar CertificateThumbprint "‎C076647E94B998AF15F07B4113D498C49D789366"
:setvar medview_web "17443"
:setvar idm_sts "15443"
:setvar idm_admin "13443"
:setvar bdportal_configuration "11443"
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


--EXEC dbo.sp_generate_merge @schema = 'SPS', @table_name ='ConfigurationTypes', @cols_to_exclude = null
PRINT N'Overwrite [SPS].[ConfigurationTypes] for [$(EnvironmentName)]...';
GO

MERGE INTO [SPS].[ConfigurationTypes] AS [Target]
USING (VALUES
  (1,N'PrivilegeServiceUrl',NULL,1,1)
 ,(2,N'ApplicationAccessServiceUrl',NULL,1,1)
 ,(3,N'ApplicationPrivilegeServiceUrl',NULL,1,1)
 ,(4,N'UserInfoServiceUrl',NULL,1,1)
 ,(5,N'PresetCulture',NULL,1,1)
 ,(6,N'AutoLogoutTime',N'300',1,2)
 ,(7,N'AutoLogoutWarningTime',N'900',1,2)
 ,(8,N'BrandName',NULL,1,2)
 ,(9,N'ProductName',NULL,1,2)
 ,(10,N'ApplicationLocale',NULL,1,2)
 ,(11,N'HelpLinkUrl',NULL,1,2)
 ,(12,N'LogOutUrl',N'https://HSVCLEANINST.essqe.org/ISupplySecurity/AppLogin.aspx?Logout=True',1,2)
 ,(13,N'ModuleName',NULL,1,2)
 ,(14,N'ApplicationLoadTime',N'20',1,1)
 ,(15,N'ApplicationSessionResetUrl',N'https://localhost:$(bdportal_configuration)/api/refresh',1,2)
) AS [Source] ([ConfigurationTypeKey],[ConfigurationName],[DefaultValue],[ActiveFlag],[UsageFlag])
ON ([Target].[ConfigurationTypeKey] = [Source].[ConfigurationTypeKey])
WHEN MATCHED AND (
	NULLIF([Source].[ConfigurationName], [Target].[ConfigurationName]) IS NOT NULL OR NULLIF([Target].[ConfigurationName], [Source].[ConfigurationName]) IS NOT NULL OR 
	NULLIF([Source].[DefaultValue], [Target].[DefaultValue]) IS NOT NULL OR NULLIF([Target].[DefaultValue], [Source].[DefaultValue]) IS NOT NULL OR 
	NULLIF([Source].[ActiveFlag], [Target].[ActiveFlag]) IS NOT NULL OR NULLIF([Target].[ActiveFlag], [Source].[ActiveFlag]) IS NOT NULL OR 
	NULLIF([Source].[UsageFlag], [Target].[UsageFlag]) IS NOT NULL OR NULLIF([Target].[UsageFlag], [Source].[UsageFlag]) IS NOT NULL) THEN
 UPDATE SET
  [Target].[ConfigurationName] = [Source].[ConfigurationName], 
  [Target].[DefaultValue] = [Source].[DefaultValue], 
  [Target].[ActiveFlag] = [Source].[ActiveFlag], 
  [Target].[UsageFlag] = [Source].[UsageFlag]
WHEN NOT MATCHED BY TARGET THEN
 INSERT([ConfigurationTypeKey],[ConfigurationName],[DefaultValue],[ActiveFlag],[UsageFlag])
 VALUES([Source].[ConfigurationTypeKey],[Source].[ConfigurationName],[Source].[DefaultValue],[Source].[ActiveFlag],[Source].[UsageFlag])
;
--WHEN NOT MATCHED BY SOURCE THEN 
-- DELETE;
