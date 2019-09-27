CREATE PROCEDURE [SPS].[uspRegisterSubMenuItem]
	@parentCode  NVARCHAR (128),
	@code        NVARCHAR (128),
	@displayName NVARCHAR (MAX),
    @url         NVARCHAR (MAX),
    @imageUrl    NVARCHAR (MAX),
	@order		 INT,
	@sectionHeader BIT = 0,
	@Css NVARCHAR (500),
	@privilegeId INT,
	@componentName NVARCHAR(50),
	@DefaultFlag BIT =0,
	@urlType BIT=0,
	@ModifiedByUserKey INT = NULL,
	@accessTypeKey INT = 0
AS
BEGIN
	SET NOCOUNT ON;
	SET XACT_ABORT ON;

	BEGIN TRY
		DECLARE @topParentId INT = (SELECT [TopMenuItemKey] FROM [SPS].[TopMenuItems] WHERE [Code] = @parentCode);
		IF @topParentId IS NOT NULL
			BEGIN			
				BEGIN TRANSACTION
				
				MERGE INTO
					[SPS].[SubMenuItems] AS DestinationTable
				USING (
					VALUES (@code, @displayName, @url, @imageUrl, @order, @sectionHeader, @topParentId, NULL,@Css,@privilegeId,@componentName,@DefaultFlag,@urlType,@ModifiedByUserKey,@accessTypeKey)
				)
				AS SourceTable ([Code], [ResourceName], [Url], [ImageUrl], [Order], [SectionHeader], [TopMenuItemKey], [SubMenuParentKey],[Css],[PrivilegeId],[ComponentName],[DefaultFlag],[UrlType],[ModifiedByUserKey],[AccessTypeKey])
				ON
					DestinationTable.[Code] = SourceTable.[Code]
				WHEN MATCHED THEN
					UPDATE
					SET
						DestinationTable.[ResourceName] = SourceTable.[ResourceName],
						DestinationTable.[Url] = SourceTable.[Url],
						DestinationTable.[ImageUrl] = SourceTable.[ImageUrl],
						DestinationTable.[Order] = SourceTable.[Order],
						DestinationTable.[SectionHeader] = SourceTable.[SectionHeader],
						DestinationTable.[TopMenuItemKey] = SourceTable.[TopMenuItemKey],
						DestinationTable.[SubMenuParentKey] = SourceTable.[SubMenuParentKey],
						DestinationTable.[Css] = SourceTable.[Css],
						DestinationTable.ModifiedUTCDate = GETUTCDATE(),
						DestinationTable.[PrivilegeId] = SourceTable.[PrivilegeId],
						DestinationTable.[ComponentName] = SourceTable.[ComponentName],
						DestinationTable.[DefaultFlag] = SourceTable.[DefaultFlag],
						DestinationTable.[UrlType] = SourceTable.[UrlType],
						DestinationTable.ModifiedByUserKey = SourceTable.ModifiedByUserKey,
						DestinationTable.[AccessTypeKey] = SourceTable.[AccessTypeKey] 
					
				WHEN NOT MATCHED BY TARGET THEN
					INSERT ([Code], [ResourceName], [Url], [ImageUrl], [Order], [SectionHeader], [TopMenuItemKey], [SubMenuParentKey],[Css],[PrivilegeId],[ComponentName], [DefaultFlag], [UrlType],ModifiedByUserKey,[AccessTypeKey])
					VALUES (
						SourceTable.[Code],
						SourceTable.[ResourceName], 
						SourceTable.[Url], 
						SourceTable.[ImageUrl], 
						SourceTable.[Order], 
						SourceTable.[SectionHeader], 
						SourceTable.[TopMenuItemKey], 
						SourceTable.[SubMenuParentKey],
						SourceTable.[Css],
						SourceTable.[PrivilegeId],
						SourceTable.[ComponentName],
						SourceTable.[DefaultFlag],
						SourceTable.[UrlType],
						SourceTable.ModifiedByUserKey,
						SourceTable.[AccessTypeKey]
					);
				COMMIT TRANSACTION
			END
		ELSE
			BEGIN
				PRINT N'Skipping upsert sub menu item: [' + @code + '] to [SPS].[SubMenuItems]...';
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
