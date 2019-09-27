CREATE PROCEDURE SPS.uspSetSharedContent
@applicationKey int,
@token varchar(50),
@sharedContentName varchar(50),
@shareContentValue nvarchar(max),
@ModifiedByUserKey INT = NULL
AS
BEGIN
	SET NOCOUNT ON;
	SET XACT_ABORT ON;

	BEGIN TRY
		EXEC SPS.uspScheduler @token
		BEGIN TRANSACTION

		MERGE INTO
				[SPS].[SharedContents] AS DestinationTable
			USING (
				VALUES (@applicationKey, @token, @sharedContentName, @shareContentValue, @ModifiedByUserKey)
			)
			AS SourceTable ([ApplicationKey], [Token], [SharedContentName], [SharedContentValue], ModifiedByUserKey)
			ON
				DestinationTable.[SharedContentName] = SourceTable.[SharedContentName]
			WHEN MATCHED THEN
				UPDATE
				SET
					DestinationTable.[ApplicationKey] = SourceTable.[ApplicationKey],
					DestinationTable.[Token] = SourceTable.[Token],
					DestinationTable.[SharedContentName] = SourceTable.[SharedContentName],
					DestinationTable.[SharedContentValue] = SourceTable.[SharedContentValue],
					DestinationTable.ModifiedByUserKey = SourceTable.ModifiedByUserKey

			WHEN NOT MATCHED BY TARGET THEN
				INSERT ([ApplicationKey], [Token], [SharedContentName], [SharedContentValue], ModifiedByUserKey)
				VALUES (
					SourceTable.[ApplicationKey],
					SourceTable.[Token], 
					SourceTable.[SharedContentName], 
					SourceTable.[SharedContentValue],
					SourceTable.ModifiedByUserKey
				);
			COMMIT TRANSACTION
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
