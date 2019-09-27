CREATE TABLE [SPS].[UserInfoControlItems] (
    [UserInfoControlItemKey]     INT            IDENTITY (1, 1) NOT NULL,
    [UserInfoControlKey]         INT            NOT NULL,
    [UserInfoControlItemCode]    NVARCHAR (MAX) NOT NULL,
    [ResourceName]               NVARCHAR (MAX) NOT NULL,
    [Action]                     NVARCHAR (MAX) NULL,
    [Url]                        NVARCHAR (MAX) NULL,
    [Css]                        NVARCHAR (MAX) NULL,
    [ComponentName]              NVARCHAR (MAX) NULL,
    [SeparatorFlag]              BIT            NULL,
    [UserLoginTypes]             VARCHAR (50)   NULL,
    [UserApplicationAccessCheck] TINYINT        DEFAULT ((0)) NOT NULL,
    [Order]                      INT            DEFAULT ((0)) NOT NULL,
    [CreatedUTCDate]             DATETIME2 (3)  CONSTRAINT [df_SPS_UserInfoControlItems_CreatedUtcDate] DEFAULT (getutcdate()) NULL,
    [ModifiedUTCDate]            DATETIME2 (3)  NULL,
    CONSTRAINT [PK_UserInfoControlItems] PRIMARY KEY CLUSTERED ([UserInfoControlItemKey] ASC)
);


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'No Check = 0; Single Application = 1; Multiple Application = 2;', @level0type = N'SCHEMA', @level0name = N'SPS', @level1type = N'TABLE', @level1name = N'UserInfoControlItems', @level2type = N'COLUMN', @level2name = N'UserApplicationAccessCheck';

