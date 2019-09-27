CREATE TABLE [Common].[DeployHistory] (
    [DeployHistoryKey]         INT            IDENTITY (1, 1) NOT NULL,
    [VersionNumber]            VARCHAR (50)   NOT NULL,
    [Changeset]                INT            NULL,
    [DeployDateTime]           DATETIME       NOT NULL,
    [DeployByUserName]         NVARCHAR (128) NULL,
    [RestoreDateTime]          DATETIME       NULL,
    [RestoreByUserName]        NVARCHAR (128) NULL,
    [BackupFinishDateTime]     DATETIME       NULL,
    [SourceDatabaseName]       NVARCHAR (128) NULL,
    [SourceServerName]         NVARCHAR (128) NULL,
    [BackupFileUsedForRestore] NVARCHAR (260) NULL,
    CONSTRAINT [pk_DeployHistory] PRIMARY KEY CLUSTERED ([DeployHistoryKey] ASC)
);

