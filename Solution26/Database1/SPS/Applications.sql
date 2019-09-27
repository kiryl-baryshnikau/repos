CREATE TABLE [SPS].[Applications] (
    [ApplicationKey]    INT            IDENTITY (1, 1) NOT NULL,
    [Code]              NVARCHAR (128) NOT NULL,
    [Description]       NVARCHAR (MAX) NULL,
    [CreatedUTCDate]    DATETIME2 (3)  CONSTRAINT [df_SPS_Applications_CreatedUtcDate] DEFAULT (getutcdate()) NOT NULL,
    [ModifiedUTCDate]   DATETIME2 (3)  NULL,
    [ModifiedByUserKey] INT            NULL,
    [APPLICATION_ID]    INT            NULL,
    [SideBarKey]        INT            NULL,
    CONSTRAINT [PK_SPS.Applications] PRIMARY KEY CLUSTERED ([ApplicationKey] ASC),
    CONSTRAINT [FK_SPS.Application_SPS.SideBar_SideBarKey] FOREIGN KEY ([SideBarKey]) REFERENCES [SPS].[SideBars] ([SideBarKey]) ON DELETE CASCADE,
    CONSTRAINT [UK_SPS.Applications_Code] UNIQUE NONCLUSTERED ([Code] ASC)
);

