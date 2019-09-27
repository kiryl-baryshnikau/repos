CREATE TABLE [SPS].[SubMenuItems] (
    [SubMenuItemKey]    INT            IDENTITY (1, 1) NOT NULL,
    [TopMenuItemKey]    INT            NOT NULL,
    [SubMenuParentKey]  INT            NULL,
    [Code]              NVARCHAR (128) NOT NULL,
    [ResourceName]      NVARCHAR (MAX) NULL,
    [Url]               NVARCHAR (MAX) NOT NULL,
    [ImageUrl]          NVARCHAR (MAX) NULL,
    [Order]             INT            NOT NULL,
    [SectionHeader]     BIT            DEFAULT ((0)) NOT NULL,
    [Css]               NVARCHAR (MAX) NULL,
    [CreatedUTCDate]    DATETIME2 (3)  CONSTRAINT [df_SPS_SubMenuItems_CreatedUTCDate] DEFAULT (getutcdate()) NOT NULL,
    [ModifiedUTCDate]   DATETIME2 (3)  NULL,
    [ModifiedByUserKey] INT            NULL,
    [PrivilegeId]       INT            NULL,
    [AccessTypeKey]     INT            DEFAULT ((0)) NOT NULL,
    [ComponentName]     NVARCHAR (50)  NULL,
    [DeleteFlag]        BIT            DEFAULT ((0)) NOT NULL,
    [DefaultFlag]       BIT            DEFAULT ((0)) NOT NULL,
    [UrlType]           INT            DEFAULT ((0)) NULL,
    CONSTRAINT [PK_SPS.SubMenuItems] PRIMARY KEY CLUSTERED ([SubMenuItemKey] ASC),
    CONSTRAINT [FK_SPS.SubMenuItems_SPS.SubMenuItems_ParentId] FOREIGN KEY ([SubMenuParentKey]) REFERENCES [SPS].[SubMenuItems] ([SubMenuItemKey]),
    CONSTRAINT [FK_SPS.SubMenuItems_SPS.TopMenuItems_TopParentId] FOREIGN KEY ([TopMenuItemKey]) REFERENCES [SPS].[TopMenuItems] ([TopMenuItemKey]) ON DELETE CASCADE
);


GO
CREATE NONCLUSTERED INDEX [IX_TopParentId]
    ON [SPS].[SubMenuItems]([TopMenuItemKey] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_ParentId]
    ON [SPS].[SubMenuItems]([SubMenuParentKey] ASC);


GO

CREATE TRIGGER [SPS].[tr_SubMenuItems_OnUpdate]
ON [SPS].[SubMenuItems]
AFTER UPDATE
AS 
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
	INSERT INTO [SPS].[SubMenuItemsAudit]
				(
				[SubMenuItemKey]
				  ,[TopMenuItemKey]
				  ,[SubMenuParentKey]
				  ,[Code]
				  ,[ResourceName]
				  ,[Url]
				  ,[ImageUrl]
				  ,[Order]
				  ,[SectionHeader]
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
	SELECT [SubMenuItemKey]
			,[TopMenuItemKey]
			,[SubMenuParentKey]
			,[Code]
			,[ResourceName]
			,[Url]
			,[ImageUrl]
			,[Order]
			,[SectionHeader]
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

CREATE TRIGGER [SPS].[tr_SubMenuItems_OnInsert]
ON [SPS].[SubMenuItems]
AFTER INSERT
AS 
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
	INSERT INTO [SPS].[SubMenuItemsAudit]
				(
				[SubMenuItemKey]
				  ,[TopMenuItemKey]
				  ,[SubMenuParentKey]
				  ,[Code]
				  ,[ResourceName]
				  ,[Url]
				  ,[ImageUrl]
				  ,[Order]
				  ,[SectionHeader]
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
	SELECT [SubMenuItemKey]
			,[TopMenuItemKey]
			,[SubMenuParentKey]
			,[Code]
			,[ResourceName]
			,[Url]
			,[ImageUrl]
			,[Order]
			,[SectionHeader]
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

GO
CREATE TRIGGER SPS.tr_SubMenuItems_OnDelete
ON [SPS].[SubMenuItems]
AFTER DELETE
AS 
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
	INSERT INTO [SPS].[SubMenuItemsAudit]
				(
				[SubMenuItemKey]
				  ,[TopMenuItemKey]
				  ,[SubMenuParentKey]
				  ,[Code]
				  ,[ResourceName]
				  ,[Url]
				  ,[ImageUrl]
				  ,[Order]
				  ,[SectionHeader]
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
	SELECT [SubMenuItemKey]
			,[TopMenuItemKey]
			,[SubMenuParentKey]
			,[Code]
			,[ResourceName]
			,[Url]
			,[ImageUrl]
			,[Order]
			,[SectionHeader]
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
