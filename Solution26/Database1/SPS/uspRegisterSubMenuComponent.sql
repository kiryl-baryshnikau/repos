CREATE PROCEDURE [SPS].[uspRegisterSubMenuComponent]
	@topParentCode  NVARCHAR (128),
	@parentCode  NVARCHAR (128),
	@code        NVARCHAR (128),
	@displayName NVARCHAR (MAX),
    @url         NVARCHAR (MAX),
    @imageUrl    NVARCHAR (MAX),
	@order		 INT,	
	@privilegeId INT,
	@DefaultFlag BIT =0,
	@urlType	 INT=NULL,
	@ModifiedByUserKey INT = NULL,
	@accessTypeKey INT = 0
AS
BEGIN
	SET NOCOUNT ON;
	SET XACT_ABORT ON;

	BEGIN TRY
		DECLARE @topParentId INT = (SELECT [TopMenuItemKey] FROM [SPS].[TopMenuItems] WHERE [Code] = @topParentCode);
		DECLARE @parentId INT = (SELECT [SubMenuItemKey] FROM [SPS].[SubMenuItems] WHERE [Code] = @parentCode);

		IF (@topParentId IS NOT NULL AND @parentId IS NOT NULL)
			BEGIN
				BEGIN TRANSACTION

				MERGE INTO
					[SPS].[SubMenuItems] AS DestinationTable
				USING (
					VALUES (@code, @displayName, @url, @imageUrl, @order, @topParentId, @parentId,@privilegeId,@DefaultFlag,@urlType,@ModifiedByUserKey,@accessTypeKey)
				)
				AS SourceTable ([Code], [ResourceName], [Url], [ImageUrl], [Order], [TopMenuItemKey], [SubMenuParentKey],[PrivilegeId],[DefaultFlag],[UrlType], ModifiedByUserKey,[AccessTypeKey])
				ON
					DestinationTable.[Code] = SourceTable.[Code]
				WHEN MATCHED THEN
					UPDATE
					SET
						DestinationTable.[ResourceName] = SourceTable.[ResourceName],
						DestinationTable.[Url] = SourceTable.[Url],
						DestinationTable.[ImageUrl] = SourceTable.[ImageUrl],
						DestinationTable.[Order] = SourceTable.[Order],
						DestinationTable.[TopMenuItemKey] = SourceTable.[TopMenuItemKey],
						DestinationTable.[SubMenuParentKey] = SourceTable.[SubMenuParentKey],
						DestinationTable.ModifiedUTCDate = GETUTCDATE(),
						DestinationTable.[PrivilegeId] = SourceTable.[PrivilegeId],
						DestinationTable.[DefaultFlag] = SourceTable.[DefaultFlag],
						DestinationTable.[UrlType] = SourceTable.[UrlType],
						DestinationTable.ModifiedByUserKey = SourceTable.ModifiedByUserKey,
						DestinationTable.[AccessTypeKey] = SourceTable.[AccessTypeKey]

				WHEN NOT MATCHED BY TARGET THEN
					INSERT ([Code], [ResourceName], [Url], [ImageUrl], [Order], [TopMenuItemKey], [SubMenuParentKey],[PrivilegeId],[DefaultFlag], [UrlType], ModifiedByUserKey,[AccessTypeKey])
					VALUES (
						SourceTable.[Code],
						SourceTable.[ResourceName], 
						SourceTable.[Url], 
						SourceTable.[ImageUrl], 
						SourceTable.[Order], 
						SourceTable.[TopMenuItemKey], 
						SourceTable.[SubMenuParentKey],
						SourceTable.[PrivilegeId],
						SourceTable.[DefaultFlag],
						SourceTable.[UrlType],
						SourceTable.ModifiedByUserKey,
						SourceTable.[AccessTypeKey]
					);	
				COMMIT TRANSACTION	
			END
		ELSE
			BEGIN
				PRINT N'Skipping upsert submenu component: [' + @code + '] to [SPS].[SubMenuItems]...';
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
