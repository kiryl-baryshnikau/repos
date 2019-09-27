CREATE TABLE [SPS].[SharedContents] (
    [SharedContentKey]    INT            IDENTITY (1, 1) NOT NULL,
    [ApplicationKey]      INT            NOT NULL,
    [Token]               VARCHAR (50)   NOT NULL,
    [SharedContentName]   VARCHAR (50)   NOT NULL,
    [SharedContentValue]  NVARCHAR (MAX) NOT NULL,
    [LastAccessedUTCDate] DATETIME       DEFAULT (getutcdate()) NOT NULL,
    [ModifiedByUserKey]   INT            NULL,
    PRIMARY KEY CLUSTERED ([SharedContentKey] ASC),
    CONSTRAINT [AK_SharedContentName_Token] UNIQUE NONCLUSTERED ([Token] ASC, [SharedContentName] ASC)
);


GO
CREATE TRIGGER [SPS].[tr_SharedContentsAudit_OnDelete]
ON [SPS].[SharedContents]
AFTER DELETE
AS 
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
		INSERT INTO [SPS].[SharedContentsAudit]
				(
				 [SharedContentKey]
				  ,[ApplicationKey]
				  ,[Token]
				  ,[SharedContentName]
				  ,[SharedContentValue]
				  ,[LastAccessedUTCDate]
				  ,[ModifiedByUserKey]
				  ,[TriggerUTCDateTime]
				  ,[ActionType]
				)
		SELECT 
				[SharedContentKey]
				,[ApplicationKey]
				,[Token]
				,[SharedContentName]
				,[SharedContentValue]
				,[LastAccessedUTCDate]
				,[ModifiedByUserKey]
				,GETUTCDATE()
				,'Delete'
		FROM deleted
	END TRY
	BEGIN CATCH		
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

GO
CREATE TRIGGER SPS.tr_SharedContentsAudit_OnUpdate
ON [SPS].[SharedContents]
AFTER UPDATE
AS 
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
		INSERT INTO [SPS].[SharedContentsAudit]
				(
				 [SharedContentKey]
				  ,[ApplicationKey]
				  ,[Token]
				  ,[SharedContentName]
				  ,[SharedContentValue]
				  ,[LastAccessedUTCDate]
				  ,[ModifiedByUserKey]
				  ,[TriggerUTCDateTime]
				  ,[ActionType]
				)
		SELECT 
				[SharedContentKey]
				,[ApplicationKey]
				,[Token]
				,[SharedContentName]
				,[SharedContentValue]
				,[LastAccessedUTCDate]
				,[ModifiedByUserKey]
				,GETUTCDATE()
				,'Update'
		FROM inserted
	END TRY
	BEGIN CATCH		
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

GO
CREATE TRIGGER [SPS].[tr_SharedContentsAudit_OnInsert]
ON [SPS].[SharedContents]
AFTER INSERT
AS 
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
		INSERT INTO [SPS].[SharedContentsAudit]
				(
				 [SharedContentKey]
				  ,[ApplicationKey]
				  ,[Token]
				  ,[SharedContentName]
				  ,[SharedContentValue]
				  ,[LastAccessedUTCDate]
				  ,[ModifiedByUserKey]
				  ,[TriggerUTCDateTime]
				  ,[ActionType]
				)
		SELECT 
				[SharedContentKey]
				,[ApplicationKey]
				,[Token]
				,[SharedContentName]
				,[SharedContentValue]
				,[LastAccessedUTCDate]
				,[ModifiedByUserKey]
				,GETUTCDATE()
				,'Insert'
		FROM inserted
	END TRY
	BEGIN CATCH		
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
