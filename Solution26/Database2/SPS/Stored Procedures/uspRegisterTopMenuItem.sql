CREATE PROCEDURE [SPS].[uspRegisterTopMenuItem]
	@applicationCode NVARCHAR (128),
	@code        NVARCHAR (128),
	@displayName NVARCHAR (MAX),
    @url         NVARCHAR (MAX),
    @imageUrl    NVARCHAR (MAX),
	@order		 INT,
	@Css NVARCHAR (500),
	@privilegeId INT,
	@componentName NVARCHAR(50),
	@DefaultFlag BIT =0,
	@urlType INT=NULL,
	@ModifiedByUserKey INT = NULL,
	@accessTypeKey INT = 0
AS
BEGIN
	SET NOCOUNT ON;
	SET XACT_ABORT ON;

	BEGIN TRY
	DECLARE @applicationId INT = (SELECT [ApplicationKey] FROM [SPS].[Applications] WHERE [Code] = @applicationCode);
	IF @applicationId IS NOT NULL
		BEGIN
			BEGIN TRANSACTION

			MERGE INTO 
				[SPS].[TopMenuItems] AS DestinationTable
			USING (
				VALUES (@code, @displayName, @url, @imageUrl, @order, @applicationId, @Css,@privilegeId,@componentName, @DefaultFlag,@urlType,@ModifiedByUserKey,@accessTypeKey)
			)
			AS SourceTable ([Code], [ResourceName], [Url], [ImageUrl], [Order], [ApplicationKey],[Css],[PrivilegeId],[ComponentName],[DefaultFlag],[UrlType],[ModifiedByUserKey],[AccessTypeKey])
			ON
				DestinationTable.[Code] = SourceTable.[Code]
			WHEN MATCHED THEN
				UPDATE
				SET
					DestinationTable.[ResourceName] = SourceTable.[ResourceName],
					DestinationTable.[Url] = SourceTable.[Url],
					DestinationTable.[ImageUrl] = SourceTable.[ImageUrl],
					DestinationTable.[Order] = SourceTable.[Order],
					DestinationTable.[ApplicationKey] = SourceTable.[ApplicationKey],
					DestinationTable.[Css] = SourceTable.[Css],
					DestinationTable.ModifiedUTCDate = GETUTCDATE(),
					DestinationTable.[PrivilegeId] = SourceTable.[PrivilegeId],					
					DestinationTable.[ComponentName] = SourceTable.[ComponentName],
					DestinationTable.[DefaultFlag] = SourceTable.[DefaultFlag],
					DestinationTable.[UrlType] = SourceTable.[UrlType],
					DestinationTable.[ModifiedByUserKey] = SourceTable.[ModifiedByUserKey],
					DestinationTable.[AccessTypeKey] =SourceTable.[AccessTypeKey]
					
			WHEN NOT MATCHED BY TARGET THEN
				INSERT ([Code], [ResourceName], [Url], [ImageUrl], [Order], [ApplicationKey],[Css],[PrivilegeId],[ComponentName],[DefaultFlag], [UrlType],[ModifiedByUserKey],[AccessTypeKey])
				VALUES (
					SourceTable.[Code],
					SourceTable.[ResourceName], 
					SourceTable.[Url], 
					SourceTable.[ImageUrl], 
					SourceTable.[Order], 
					SourceTable.[ApplicationKey], 
					SourceTable.[Css],
					SourceTable.[PrivilegeId],
					SourceTable.[ComponentName],
					SourceTable.[DefaultFlag],
					SourceTable.[UrlType],
					SourceTable.[ModifiedByUserKey],
					SourceTable.[AccessTypeKey]
				);
			COMMIT TRANSACTION
		END
	ELSE
		BEGIN
			PRINT N'Skipping upsert top level menu item: [' + @code + '] to [SPS].[TopMenuItems]...';
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
