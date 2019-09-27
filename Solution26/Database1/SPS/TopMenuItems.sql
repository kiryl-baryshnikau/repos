CREATE TABLE [SPS].[TopMenuItems] (
    [TopMenuItemKey]    INT            IDENTITY (1, 1) NOT NULL,
    [Code]              NVARCHAR (128) NOT NULL,
    [ResourceName]      NVARCHAR (MAX) NULL,
    [Url]               NVARCHAR (MAX) NOT NULL,
    [ImageUrl]          NVARCHAR (MAX) NULL,
    [Order]             INT            NOT NULL,
    [ApplicationKey]    INT            NOT NULL,
    [Css]               NVARCHAR (MAX) NULL,
    [CreatedUTCDate]    DATETIME2 (3)  CONSTRAINT [df_SPS_TopMenuItems_CreatedUTCDate] DEFAULT (getutcdate()) NOT NULL,
    [ModifiedUTCDate]   DATETIME2 (3)  NULL,
    [ModifiedByUserKey] INT            NULL,
    [PrivilegeId]       INT            NULL,
    [AccessTypeKey]     INT            DEFAULT ((0)) NOT NULL,
    [ComponentName]     NVARCHAR (50)  NULL,
    [DeleteFlag]        BIT            DEFAULT ((0)) NOT NULL,
    [DefaultFlag]       BIT            DEFAULT ((0)) NOT NULL,
    [UrlType]           INT            DEFAULT ((0)) NULL,
    CONSTRAINT [PK_SPS.TopMenuItems] PRIMARY KEY CLUSTERED ([TopMenuItemKey] ASC),
    CONSTRAINT [FK_SPS.TopMenuItems_SPS.Applications_ParentId] FOREIGN KEY ([ApplicationKey]) REFERENCES [SPS].[Applications] ([ApplicationKey]) ON DELETE CASCADE,
    UNIQUE NONCLUSTERED ([Code] ASC),
    CONSTRAINT [UK_SPS.TopMenuItems_Code] UNIQUE NONCLUSTERED ([Code] ASC)
);


GO
CREATE NONCLUSTERED INDEX [IX_ParentId]
    ON [SPS].[TopMenuItems]([ApplicationKey] ASC);


GO
CREATE TRIGGER SPS.tr_TopMenuItems_OnUpdate
ON [SPS].[TopMenuItems]
AFTER UPDATE
AS 
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
		INSERT INTO [SPS].[TopMenuItemsAudit]
				(
				   [TopMenuItemKey]
				  ,[Code]
				  ,[ResourceName]
				  ,[Url]
				  ,[ImageUrl]
				  ,[Order]
				  ,[ApplicationKey]
				  ,[Css]
				  ,[CreatedUTCDate]
				  ,[ModifiedUTCDate]
				  ,[ModifiedByUserKey]
				  ,[PrivilegeId]
				  ,[ComponentName]
				  ,[DeleteFlag]
				  ,[DefaultFlag]
				  ,[UrlType]
				  ,[TriggerUTCDateTime]
				  ,[ActionType]
				)
		SELECT [TopMenuItemKey]
				  ,[Code]
				  ,[ResourceName]
				  ,[Url]
				  ,[ImageUrl]
				  ,[Order]
				  ,[ApplicationKey]
				  ,[Css]
				  ,[CreatedUTCDate]
				  ,[ModifiedUTCDate]
				  ,[ModifiedByUserKey]
				  ,[PrivilegeId]
				  ,[ComponentName]
				  ,[DeleteFlag]
				  ,[DefaultFlag]
				  ,[UrlType]
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
CREATE TRIGGER [SPS].[tr_TopMenuItems_OnDelete]
ON [SPS].[TopMenuItems]
AFTER DELETE
AS 
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
		INSERT INTO [SPS].[TopMenuItemsAudit]
				(
				   [TopMenuItemKey]
				  ,[Code]
				  ,[ResourceName]
				  ,[Url]
				  ,[ImageUrl]
				  ,[Order]
				  ,[ApplicationKey]
				  ,[Css]
				  ,[CreatedUTCDate]
				  ,[ModifiedUTCDate]
				  ,[ModifiedByUserKey]
				  ,[PrivilegeId]
				  ,[ComponentName]
				  ,[DeleteFlag]
				  ,[DefaultFlag]
				  ,[UrlType]
				  ,[TriggerUTCDateTime]
				  ,[ActionType]
				)
		SELECT [TopMenuItemKey]
				  ,[Code]
				  ,[ResourceName]
				  ,[Url]
				  ,[ImageUrl]
				  ,[Order]
				  ,[ApplicationKey]
				  ,[Css]
				  ,[CreatedUTCDate]
				  ,[ModifiedUTCDate]
				  ,[ModifiedByUserKey]
				  ,[PrivilegeId]
				  ,[ComponentName]
				  ,[DeleteFlag]
				  ,[DefaultFlag]
				  ,[UrlType]
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
CREATE TRIGGER [SPS].[tr_TopMenuItems_OnInsert]
ON [SPS].[TopMenuItems]
AFTER INSERT
AS 
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
		INSERT INTO [SPS].[TopMenuItemsAudit]
				(
				   [TopMenuItemKey]
				  ,[Code]
				  ,[ResourceName]
				  ,[Url]
				  ,[ImageUrl]
				  ,[Order]
				  ,[ApplicationKey]
				  ,[Css]
				  ,[CreatedUTCDate]
				  ,[ModifiedUTCDate]
				  ,[ModifiedByUserKey]
				  ,[PrivilegeId]
				  ,[ComponentName]
				  ,[DeleteFlag]
				  ,[DefaultFlag]
				  ,[UrlType]
				  ,[TriggerUTCDateTime]
				  ,[ActionType]
				)
		SELECT [TopMenuItemKey]
				  ,[Code]
				  ,[ResourceName]
				  ,[Url]
				  ,[ImageUrl]
				  ,[Order]
				  ,[ApplicationKey]
				  ,[Css]
				  ,[CreatedUTCDate]
				  ,[ModifiedUTCDate]
				  ,[ModifiedByUserKey]
				  ,[PrivilegeId]
				  ,[ComponentName]
				  ,[DeleteFlag]
				  ,[DefaultFlag]
				  ,[UrlType]
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
