CREATE TABLE [SPS].[TopMenuItemsAudit] (
    [TopMenuItemsAuditKey] INT            IDENTITY (1, 1) NOT NULL,
    [TopMenuItemKey]       INT            NOT NULL,
    [Code]                 NVARCHAR (128) NOT NULL,
    [ResourceName]         NVARCHAR (MAX) NULL,
    [Url]                  NVARCHAR (MAX) NOT NULL,
    [ImageUrl]             NVARCHAR (MAX) NULL,
    [Order]                INT            NOT NULL,
    [ApplicationKey]       INT            NOT NULL,
    [Css]                  NVARCHAR (MAX) NULL,
    [CreatedUTCDate]       DATETIME2 (3)  NOT NULL,
    [ModifiedUTCDate]      DATETIME2 (3)  NULL,
    [ModifiedByUserKey]    INT            NULL,
    [PrivilegeId]          INT            NULL,
    [ComponentName]        NVARCHAR (50)  NULL,
    [DeleteFlag]           BIT            NOT NULL,
    [DefaultFlag]          BIT            NOT NULL,
    [UrlType]              INT            DEFAULT ((0)) NULL,
    [TriggerUTCDateTime]   DATETIME2 (4)  CONSTRAINT [DF_SPS_TopMenuItemsAudit_TriggerUTCDateTime] DEFAULT (getutcdate()) NOT NULL,
    [ActionType]           VARCHAR (15)   NULL,
    CONSTRAINT [PK_SPS.TopMenuItemsAudit] PRIMARY KEY CLUSTERED ([TopMenuItemsAuditKey] ASC)
);

