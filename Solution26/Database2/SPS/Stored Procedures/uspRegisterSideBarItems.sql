CREATE  PROCEDURE [SPS].[uspRegisterSideBarItems]
	@sideBarName nvarchar(128),
	@sideBarCode nvarchar(128),
    @resourceName NVARCHAR(MAX),
    @url NVARCHAR(MAX),
    @imageUrl NVARCHAR(max), 
    @order INT, 
    @css NVARCHAR(MAX),  
    @modifiedByUserKey  INT,
    @privilegeId		INT,
	@accessTypeKey		INT,
    @componentName		NVARCHAR(50),
    @deleteFlag			BIT,
    @defaultFlag		BIT,
    @urlType			INT,
	@sideBarParentKey	INT,
	@resourceDescription nvarchar(max),
	@iconCss nvarchar(max)
AS
BEGIN
	SET NOCOUNT ON;
	SET XACT_ABORT ON;

	BEGIN TRY
	DECLARE @sideBarKey INT = (SELECT [SideBarKey] FROM [SPS].[SideBars] WHERE [Name] = @sideBarName);
	IF @sideBarKey IS NOT NULL
		BEGIN
			BEGIN TRANSACTION

			MERGE INTO 
				[SPS].[SideBarItems] AS DestinationTable
			USING (
				VALUES (@sideBarKey,@sideBarCode, @resourceName, @url, @imageUrl, @order, @css, @modifiedByUserKey,@privilegeId,@accessTypeKey,@componentName,@deleteFlag,@defaultFlag,@urlType,@sideBarParentKey, @resourceDescription, @iconCss)
			)
			AS SourceTable ([SideBarKey],[Code], [ResourceName], [Url], [ImageUrl], [Order], [Css],[ModifiedByUserKey],[PrivilegeId],[AccessTypeKey],[ComponentName],[DeleteFlag],[DefaultFlag],[UrlType],[SideBarParentKey],[ResourceDescription], [IconCss])
			ON
				DestinationTable.[Code] = SourceTable.[Code]
			WHEN MATCHED THEN
				UPDATE
				SET
					DestinationTable.[ResourceName] = SourceTable.[ResourceName],
					DestinationTable.[Url] = SourceTable.[Url],
					DestinationTable.[ImageUrl] = SourceTable.[ImageUrl],
					DestinationTable.[Order] = SourceTable.[Order],
					DestinationTable.[Css] = SourceTable.[Css],					
					DestinationTable.[ModifiedUTCDate] =	GETUTCDATE(),
					DestinationTable.[ModifiedByUserKey] =	 SourceTable.[ModifiedByUserKey],
					DestinationTable.[PrivilegeId] =		SourceTable.[PrivilegeId],
					DestinationTable.[AccessTypeKey] = SourceTable.[AccessTypeKey],
					DestinationTable.[ComponentName] =		SourceTable.[ComponentName],
					DestinationTable.[DeleteFlag] =			SourceTable.[DeleteFlag],
					DestinationTable.[DefaultFlag] =		SourceTable.[DefaultFlag],
					DestinationTable.[UrlType] =	SourceTable.[UrlType],
					DestinationTable.[SideBarParentKey] =	SourceTable.[SideBarParentKey],
				    DestinationTable.[ResourceDescription] = SourceTable.[ResourceDescription],
					DestinationTable.[IconCss] = SourceTable.[IconCss]
					
			WHEN NOT MATCHED BY TARGET THEN
				INSERT ([SideBarKey],[Code], [ResourceName], [Url], [ImageUrl], [Order], [Css],[ModifiedByUserKey],[PrivilegeId],[AccessTypeKey],[ComponentName],[DeleteFlag],[DefaultFlag], [UrlType],[SideBarParentKey], [ResourceDescription], [IconCss])
				VALUES (
				    SourceTable.[SideBarKey],
					SourceTable.[Code],
					SourceTable.[ResourceName], 
					SourceTable.[Url], 
					SourceTable.[ImageUrl], 
					SourceTable.[Order], 		
					SourceTable.[Css],										
					SourceTable.[ModifiedByUserKey],
					SourceTable.[PrivilegeId],
					SourceTable.[AccessTypeKey],
					SourceTable.[ComponentName],
					SourceTable.[DeleteFlag],
					SourceTable.[DefaultFlag],
					SourceTable.[UrlType],
					SourceTable.[SideBarParentKey],
					SourceTable.[ResourceDescription],
					SourceTable.[IconCss]
				);
			COMMIT TRANSACTION
		END
	ELSE
		BEGIN
			PRINT N'Skipping upsert top level menu item: [' + @sideBarCode + '] to [SPS].[SideBarItems]...';
		END
	END TRY
	BEGIN CATCH	
		IF @@TRANCOUNT > 0
		ROLLBACK TRANSACTION	
		DECLARE 
				@ErrorMsg nvarchar(4000),
				@ErrorSeverity int,
				@ErrorState int,
				@Error int;

		SELECT @Error = ERROR_NUMBER();
		
		SELECT 
			@ErrorMsg = CAST(@Error as nvarchar(20)) + N': ' + ERROR_MESSAGE(),
			@ErrorSeverity = ERROR_SEVERITY(),
			@ErrorState = ERROR_STATE();

		RAISERROR (@ErrorMsg, @ErrorSeverity, @ErrorState);
	END CATCH
END
