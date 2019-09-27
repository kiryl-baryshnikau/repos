GO
:setvar AdministratorName "admin"
:setvar AdministratorEmail "kiryl.baryshnikau@bd.com"
:setvar EnvironmentName "localhost"
:setvar CertificateThumbprint "‎C076647E94B998AF15F07B4113D498C49D789366"
:setvar medview_web "17443"
:setvar medview_services "16443"
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


--EXEC dbo.sp_generate_merge @schema = 'CFW', @table_name ='DataSource', @cols_to_exclude = null
PRINT N'Overwrite [CFW].[DataSource] for [$(EnvironmentName)]...';
GO

SET IDENTITY_INSERT [CFW].[DataSource] ON

MERGE INTO [CFW].[DataSource] AS [Target]
USING (VALUES
  (1,N'AuthorizationRoot',N'http://localhost/DispensingData/',N'api',N'',N'',N'',N'dispensing',N'GET')
 ,(2,N'attentionNoticeTypes',N'http://localhost/DispensingData/',N'api/pharmacystatusboard/attentionnoticetypes',N'',N'',N'',N'dispensing',N'GET')
 ,(3,N'medminedSecondaryData',N'https://localhost:$(medview_services)/',N'api/secondarydata',N'',N'',N'',N'hsv',N'POST')
 ,(4,N'containerandguardrailwarnings',N'https://HSVCLEANINST.essqe.org/BD.MedView.Data.Services/',N'api/containerandguardrailwarnings',N'',N'',N'',N'infusion',N'POST')
 ,(5,N'AttentionNotices',N'http://localhost/DispensingData/',N'api/pharmacystatusboard/AttentionNotices',N'',N'facilityKeys',N'',N'dispensing',N'GET')
 ,(6,N'dispensingfacilities',N'http://localhost/DispensingData/',N'api/pharmacystatusboard/facilities',N'',N'',N'',N'dispensing',N'GET')
 ,(7,N'AttentionNoticesDetails',N'http://localhost/DispensingData/',N'api/pharmacystatusboard/AttentionNotices/{noticeTypeInternalCode}/',N'noticeTypeInternalCode',N'',N'',N'dispensing',N'GET')
 ,(8,N'ivacknowledgement',N'https://HSVCLEANINST.essqe.org/BD.MedView.Data.Services/',N'api/containerandguardrailwarnings/ivacknowledgement',N'',N'',N'',N'infusion',N'POST')
 ,(9,N'orderservice',N'https://HSVCLEANINST.essqe.org/BD.Fhir/',N'fhir/MedicationOrder/_search',N'',N'',N'',N'infusion',N'POST')
 ,(10,N'DoseRequest',N'http://localhost/DispensingData/',N'api/pharmacystatusboard/DoseRequests',N'',N'facilityKeys',N'',N'dispensing',N'GET')
 ,(11,N'DoseRequestDetail',N'http://localhost/DispensingData/',N'api/pharmacystatusboard/DoseRequests',N'',N'facilityKeys',N'',N'dispensing',N'GET')
 ,(12,N'deliverytracking',N'http://localhost/DispensingData/',N'api/pharmacystatusboard/deliverytrackingstatuses',N'',N'facilityKeys',N'',N'dispensing',N'GET')
 ,(13,N'principals',N'https://localhost:$(medview_services)/',N'api/Principals',N'',N'',N'',N'',N'GET')
 ,(14,N'guardrailwarningsfacilitiesinfo',N'https://HSVCLEANINST.essqe.org/BD.MedView.Data.Services/',N'api/guardrailwarningsfacilitiesinfo',N'',N'',N'',N'infusion',N'POST')
 ,(15,N'ivprepdosestates',N'https://HSVCLEANINST.essqe.org:60013/',N'catoconnect/hsv/api/v1/dosestates',N'',N'',N'',N'cato',N'GET')
 ,(16,N'infusiondrugs',N'https://HSVCLEANINST.essqe.org/BD.MedView.Data.Services/',N'api/infusiondrugs',N'',N'',N'',N'infusion',N'GET')
 ,(17,N'ivprepconfiguration',N'https://HSVCLEANINST.essqe.org:60013/',N'catoconnect/hsv/api/v1/configuration',N'',N'',N'',N'cato',N'GET')
 ,(18,N'ivprepfacilities',N'https://HSVCLEANINST.essqe.org:60013/',N'catoconnect/hsv/api/v1/facilities',N'',N'',N'',N'cato',N'GET')
 ,(19,N'ivprepunits',N'https://HSVCLEANINST.essqe.org:60013/',N'catoconnect/hsv/api/v1/units',N'',N'',N'',N'cato',N'GET')
 ,(20,N'ivprepsites',N'https://HSVCLEANINST.essqe.org:60013/',N'catoconnect/hsv/api/v1/prepsites',N'',N'',N'',N'cato',N'GET')
 ,(21,N'ivprepdoses',N'https://HSVCLEANINST.essqe.org:60013/',N'catoconnect/hsv/api/v1/doses',N'',N'',N'',N'cato',N'GET')
 ,(22,N'ivprepblockdoses',N'https://HSVCLEANINST.essqe.org:60013/',N'catoconnect/hsv/api/v1/doses/{id}/blocking',N'id',N'',N'',N'cato',N'PUT')
 ,(23,N'ivprepseturgency',N'https://HSVCLEANINST.essqe.org:60013/',N'catoconnect/hsv/api/v1/doses/{id}/urgency',N'id',N'',N'',N'cato',N'PUT')
 ,(24,N'medminedfacilities',N'https://QA3.medmined.com/',N'HSVIntegration/v1/Facilities',N'',N'',N'',N'medmined',N'GET')
 ,(25,N'medminedalertsummary',N'https://QA3.medmined.com/',N'HSVIntegration/v1/AlertSummary',N'',N'facilityKeys',N'',N'medmined',N'GET')
 ,(26,N'medminedalertsdetailsheader',N'https://QA3.medmined.com/',N'HSVIntegration/v1/AlertHeader',N'',N'FacilityKeys,Title,Cate--GOry,Ownership',N'',N'medmined',N'GET')
 ,(27,N'medminedalertsmetadata',N'https://QA3.medmined.com/',N'HSVIntegration/v1/AlertMetadata',N'',N'facilityKeys',N'',N'medmined',N'GET')
 ,(28,N'medminedalertssubscriptions',N'https://QA3.medmined.com/',N'HSVIntegration/v1/AlertSubscription',N'',N'FacilityKeys,Type',N'',N'medmined',N'GET')
 ,(29,N'medminedpostalertssubscriptions',N'https://QA3.medmined.com/',N'HSVIntegration/v1/AlertSubscription',N'',N'FacilityKeys,Type',N'',N'medmined',N'POST')
 ,(30,N'medminedalertsdetailsupdate',N'https://QA3.medmined.com/',N'HSVIntegration/v1/AcknowledgeAlert',N'',N'FacilityKey',N'',N'medmined',N'POST')
 ,(31,N'medminedalertsdetails',N'https://QA3.medmined.com/',N'HSVIntegration/v1/Alerts/{AlertID}',N'',N'FacilityKey',N'',N'medmined',N'GET')
 ,(32,N'bd.medview.services.list',N'https://localhost:$(medview_services)/',N'api/{collection}',N'collection',N'expand,filter,orderby,take,skip',N'',N'bd.medview.services',N'GET')
 ,(33,N'bd.medview.services.create',N'https://localhost:$(medview_services)/',N'api/{collection}',N'collection',N'',N'',N'bd.medview.services',N'POST')
 ,(34,N'bd.medview.services.read',N'https://localhost:$(medview_services)/',N'api/{collection}/{id}',N'collection,id',N'expand',N'',N'bd.medview.services',N'GET')
 ,(35,N'bd.medview.services.update',N'https://localhost:$(medview_services)/',N'api/{collection}/{id}',N'collection,id',N'',N'',N'bd.medview.services',N'PUT')
 ,(36,N'bd.medview.services.delete',N'https://localhost:$(medview_services)/',N'api/{collection}/{id}',N'collection,id',N'',N'',N'bd.medview.services',N'DELETE')
 ,(37,N'bd.medview.services.link',N'https://localhost:$(medview_services)/',N'api/{collection}/{id}/{property}/{link}',N'collection,id,entity,link',N'',N'',N'bd.medview.services',N'PUT')
 ,(38,N'bd.medview.services.unlink',N'https://localhost:$(medview_services)/',N'api/{collection}/{id}/{property}/{link}',N'collection,id,entity,link',N'',N'',N'bd.medview.services',N'DELETE')
 ,(39,N'bd.medview.services.count',N'https://localhost:$(medview_services)/',N'api/{collection}/count',N'collection',N'filter',N'',N'bd.medview.services',N'GET')
 ,(40,N'bd.medview.services.staticmethodcall',N'https://localhost:$(medview_services)/',N'api/{collection}/{method}',N'collection,method',N'',N'',N'bd.medview.services',N'POST')
 ,(41,N'bd.medview.services.instancmethodcall',N'https://localhost:$(medview_services)/',N'api/{collection}/{id}/{method}',N'collection,id,method',N'',N'',N'bd.medview.services',N'POST')
 ,(42,N'bd.medview.services.staticpropertyget',N'https://localhost:$(medview_services)/',N'api/{collection}/{property}',N'collection,property',N'',N'',N'bd.medview.services',N'GET')
 ,(43,N'bd.medview.services.staticpropertyset',N'https://localhost:$(medview_services)/',N'api/{collection}/{property}',N'collection,property',N'',N'',N'bd.medview.services',N'PUT')
 ,(44,N'bd.medview.services.instancepropertyget',N'https://localhost:$(medview_services)/',N'api/{collection}/{id}/{property}',N'collection,id,property',N'',N'',N'bd.medview.services',N'GET')
 ,(45,N'bd.medview.services.instancepropertyset',N'https://localhost:$(medview_services)/',N'api/{collection}/{id}/{property}',N'collection,id,property',N'',N'',N'bd.medview.services',N'PUT')
 ,(46,N'attentionNoticeTypesPublic',N'http://localhost/DispensingData/',N'api/pharmacystatusboard/public/attentionnoticetypes',N'',N'',N'',N'dispensing',N'GET')
 ,(47,N'AttentionNoticesPublic',N'http://localhost/DispensingData/',N'api/pharmacystatusboard/public/AttentionNotices',N'',N'facilityKeys',N'',N'dispensing',N'GET')
 ,(48,N'dispensingfacilitiesPublic',N'http://localhost/DispensingData/',N'api/pharmacystatusboard/public/facilities',N'',N'facilityKeys',N'',N'dispensing',N'GET')
 ,(49,N'DoseRequestPublic',N'http://localhost/DispensingData/',N'api/pharmacystatusboard/public/DoseRequests',N'',N'facilityKeys',N'',N'dispensing',N'GET')
 ,(50,N'AuthorizationFacilities',N'https://localhost:$(medview_services)/',N'api/facilities',N'',N'',N'',N'',N'GET')
 ,(51,N'StateMappingConfiguration',N'https://localhost:$(medview_services)/',N'api/StateMappingConfiguration',N'',N'',N'',N'',N'GET')
 ,(52,N'ivprepconfigurationPublic',N'http://localhost/DispensingData/',N'catoconnect/hsv/api/v1/configuration',N'',N'',N'',N'cato-public',N'GET')
 ,(53,N'ivprepfacilitiesPublic',N'http://localhost/DispensingData/',N'catoconnect/hsv/api/v1/facilities',N'',N'',N'',N'cato-public',N'GET')
 ,(54,N'ivprepunitsPublic',N'http://localhost/DispensingData/',N'catoconnect/hsv/api/v1/units',N'',N'',N'',N'cato-public',N'GET')
 ,(55,N'ivprepsitesPublic',N'http://localhost/DispensingData/',N'catoconnect/hsv/api/v1/prepsites',N'',N'',N'',N'cato-public',N'GET')
 ,(56,N'ivprepdosesPublic',N'http://localhost/DispensingData/',N'catoconnect/hsv/api/v1/doses',N'',N'',N'',N'cato-public',N'GET')
 ,(57,N'ivprepdosestatesPublic',N'http://localhost/DispensingData/',N'catoconnect/hsv/api/v1/dosestates',N'',N'',N'',N'cato-public',N'GET')
 ,(58,N'medmineduidocumentation',N'https://QA3.medmined.com/',N'HSVIntegration/v1/AlertDetails/{AlertID}',N'',N'',N'',N'medmined',N'GET')
 ,(59,N'medmineduipatientinfo',N'https://QA3.medmined.com/',N'HSVIntegration/v1/AlertDetails/{AlertID}',N'',N'',N'',N'medmined',N'GET')
) AS [Source] ([DataSourceId],[Name],[BaseUrl],[Api],[PathParams],[QueryParams],[Claims],[Provider],[Method])
ON ([Target].[DataSourceId] = [Source].[DataSourceId])
WHEN MATCHED AND (
	NULLIF([Source].[Name], [Target].[Name]) IS NOT NULL OR NULLIF([Target].[Name], [Source].[Name]) IS NOT NULL OR 
	NULLIF([Source].[BaseUrl], [Target].[BaseUrl]) IS NOT NULL OR NULLIF([Target].[BaseUrl], [Source].[BaseUrl]) IS NOT NULL OR 
	NULLIF([Source].[Api], [Target].[Api]) IS NOT NULL OR NULLIF([Target].[Api], [Source].[Api]) IS NOT NULL OR 
	NULLIF([Source].[PathParams], [Target].[PathParams]) IS NOT NULL OR NULLIF([Target].[PathParams], [Source].[PathParams]) IS NOT NULL OR 
	NULLIF([Source].[QueryParams], [Target].[QueryParams]) IS NOT NULL OR NULLIF([Target].[QueryParams], [Source].[QueryParams]) IS NOT NULL OR 
	NULLIF([Source].[Claims], [Target].[Claims]) IS NOT NULL OR NULLIF([Target].[Claims], [Source].[Claims]) IS NOT NULL OR 
	NULLIF([Source].[Provider], [Target].[Provider]) IS NOT NULL OR NULLIF([Target].[Provider], [Source].[Provider]) IS NOT NULL OR 
	NULLIF([Source].[Method], [Target].[Method]) IS NOT NULL OR NULLIF([Target].[Method], [Source].[Method]) IS NOT NULL) THEN
 UPDATE SET
  [Target].[Name] = [Source].[Name], 
  [Target].[BaseUrl] = [Source].[BaseUrl], 
  [Target].[Api] = [Source].[Api], 
  [Target].[PathParams] = [Source].[PathParams], 
  [Target].[QueryParams] = [Source].[QueryParams], 
  [Target].[Claims] = [Source].[Claims], 
  [Target].[Provider] = [Source].[Provider], 
  [Target].[Method] = [Source].[Method]
WHEN NOT MATCHED BY TARGET THEN
 INSERT([DataSourceId],[Name],[BaseUrl],[Api],[PathParams],[QueryParams],[Claims],[Provider],[Method])
 VALUES([Source].[DataSourceId],[Source].[Name],[Source].[BaseUrl],[Source].[Api],[Source].[PathParams],[Source].[QueryParams],[Source].[Claims],[Source].[Provider],[Source].[Method])
;
--WHEN NOT MATCHED BY SOURCE THEN 
-- DELETE;

SET IDENTITY_INSERT [CFW].[DataSource] OFF
