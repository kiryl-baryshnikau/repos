CREATE PROCEDURE [SPS].[uspRegisterUserInfoControlItems]
	@applicationCode				NVARCHAR (128),
	@userInfoControlItemCode		NVARCHAR (MAX),
	@resourceName					NVARCHAR (MAX),
	@action							NVARCHAR (MAX),
    @url							NVARCHAR (MAX),
    @css							NVARCHAR (500),
	@componentName					NVARCHAR(50),
	@separatorFlag					BIT = 0,
	@userLoginTypes					VARCHAR(MAX) = NULL,
	@userApplicationAccessCheck		TINYINT = 0,
	@order							INT = NULL

AS
BEGIN
	SET NOCOUNT ON;
	SET XACT_ABORT ON;

	BEGIN TRY
	DECLARE @applicationId INT = (SELECT [ApplicationKey] FROM [SPS].[Applications] WHERE [Code] = @applicationCode);
	IF @applicationId IS NOT NULL
		BEGIN
			Declare @userInfoControlKey INT = (SELECT [UserInfoControlKey] FROM [SPS].[UserInfoControls] WHERE [ApplicationKey] = @applicationId);
			IF @userInfoControlKey IS NULL
				BEGIN
					BEGIN TRANSACTION
						INSERT INTO [SPS].[UserInfoControls] VALUES (@applicationId)
						Select @userInfoControlKey = [UserInfoControlKey] FROM [SPS].[UserInfoControls] WHERE [ApplicationKey] = @applicationId
					COMMIT TRANSACTION
				END
			
				BEGIN TRANSACTION
						MERGE INTO 
							[SPS].[UserInfoControlItems] AS DestinationTable
						USING (
							VALUES (@userInfoControlKey, @userInfoControlItemCode, @resourceName, @action, @url, @css,  @componentName, @separatorFlag, @userLoginTypes, @userApplicationAccessCheck, @order)
								)
						AS SourceTable ([UserInfoControlKey], [UserInfoControlItemCode], [ResourceName], [Action], [Url], [Css],[ComponentName],[SeparatorFlag],[UserLoginTypes], [UserApplicationAccessCheck],[Order])
						ON
							DestinationTable.[UserInfoControlKey] =  SourceTable.[UserInfoControlKey] AND DestinationTable.[UserInfoControlItemCode] =  SourceTable.[UserInfoControlItemCode] 
						WHEN MATCHED THEN
							UPDATE
							SET
								DestinationTable.[UserInfoControlKey]				=	SourceTable.[UserInfoControlKey],
								DestinationTable.[UserInfoControlItemCode]			=	SourceTable.[UserInfoControlItemCode],
								DestinationTable.[ResourceName]						=	SourceTable.[ResourceName],
								DestinationTable.[Action]							=	SourceTable.[Action],
								DestinationTable.[Url]								=	SourceTable.[Url],
								DestinationTable.[Css]								=	SourceTable.[Css],						
								DestinationTable.[ComponentName]					=	SourceTable.[ComponentName],
								DestinationTable.[SeparatorFlag]					=	SourceTable.[SeparatorFlag],
								DestinationTable.[UserLoginTypes]					=	SourceTable.[UserLoginTypes],
								DestinationTable.[UserApplicationAccessCheck]		=	SourceTable.[UserApplicationAccessCheck],
								DestinationTable.[Order]							=	SourceTable.[Order]								
						WHEN NOT MATCHED BY TARGET THEN
							INSERT ([UserInfoControlKey], [UserInfoControlItemCode], [ResourceName], [Action], [Url], [Css],[ComponentName],[SeparatorFlag],[UserLoginTypes],[UserApplicationAccessCheck],[Order])
							VALUES (
								SourceTable.[UserInfoControlKey],
								SourceTable.[UserInfoControlItemCode],
								SourceTable.[ResourceName],
								SourceTable.[Action],
								SourceTable.[Url],
								SourceTable.[Css],
								SourceTable.[ComponentName],
								SourceTable.[SeparatorFlag],
								SourceTable.[UserLoginTypes],
								SourceTable.[UserApplicationAccessCheck],
								SourceTable.[Order]
							);
			    COMMIT TRANSACTION
		END
	ELSE
		BEGIN
			PRINT N'Skipping upsert top level menu item: [' + @applicationCode + '] to [SPS].[UserInfoControls]...';
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
