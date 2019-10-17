﻿CREATE TABLE [SPS].[SideBarItems] (
    [SideBarItemKey]      INT            IDENTITY (1, 1) NOT NULL,
    [SideBarKey]          INT            NOT NULL,
    [Code]                NVARCHAR (128) NULL,
    [ResourceName]        NVARCHAR (MAX) NULL,
    [Url]                 NVARCHAR (MAX) NOT NULL,
    [ImageUrl]            NVARCHAR (MAX) NULL,
    [Order]               INT            NOT NULL,
    [Css]                 NVARCHAR (MAX) NULL,
    [CreatedUTCDate]      DATETIME2 (3)  DEFAULT (getutcdate()) NULL,
    [ModifiedUTCDate]     DATETIME2 (3)  NULL,
    [ModifiedByUserKey]   INT            NULL,
    [PrivilegeId]         INT            NULL,
    [AccessTypeKey]       INT            DEFAULT ((0)) NOT NULL,
    [ComponentName]       NVARCHAR (50)  NULL,
    [DeleteFlag]          BIT            DEFAULT ((0)) NOT NULL,
    [DefaultFlag]         BIT            DEFAULT ((0)) NOT NULL,
    [UrlType]             INT            DEFAULT ((0)) NULL,
    [SideBarParentKey]    INT            NULL,
    [ResourceDescription] NVARCHAR (MAX) NULL,
    [IconCss]             NVARCHAR (MAX) NULL,
    PRIMARY KEY CLUSTERED ([SideBarItemKey] ASC),
    CONSTRAINT [FK_SPS.SideBarItems_SPS.SideBar_SideBarKey] FOREIGN KEY ([SideBarKey]) REFERENCES [SPS].[SideBars] ([SideBarKey]) ON DELETE CASCADE,
    CONSTRAINT [FK_SPS.SideBarItems_SPS.SideBarItems_ParentId] FOREIGN KEY ([SideBarParentKey]) REFERENCES [SPS].[SideBarItems] ([SideBarItemKey]),
    UNIQUE NONCLUSTERED ([Code] ASC)
);
