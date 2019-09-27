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


--EXEC dbo.sp_generate_merge @schema = 'auth', @table_name ='Principals', @cols_to_exclude = null
PRINT N'Overwrite [auth].[Principals] for [$(EnvironmentName)]...';
GO

SET IDENTITY_INSERT [auth].[Principals] ON

MERGE INTO [auth].[Principals] AS [Target]
USING (VALUES
  (1,N'BD.MedView.Authorization.System')
 ,(2,N'$(AdministratorName)')
) AS [Source] ([Id],[Name])
ON ([Target].[Id] = [Source].[Id])
WHEN MATCHED AND (
	NULLIF([Source].[Name], [Target].[Name]) IS NOT NULL OR NULLIF([Target].[Name], [Source].[Name]) IS NOT NULL) THEN
 UPDATE SET
  [Target].[Name] = [Source].[Name]
WHEN NOT MATCHED BY TARGET THEN
 INSERT([Id],[Name])
 VALUES([Source].[Id],[Source].[Name])
;
--WHEN NOT MATCHED BY SOURCE THEN 
-- DELETE;

SET IDENTITY_INSERT [auth].[Principals] OFF
