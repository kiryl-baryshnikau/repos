CREATE TABLE [Locale].[ResourceItem] (
    [ResourceItemKey]     INT             IDENTITY (1, 1) NOT NULL,
    [LocaleIdentifierKey] INT             NOT NULL,
    [ResourceTypeKey]     SMALLINT        NOT NULL,
    [ResourceName]        NVARCHAR (128)  NOT NULL,
    [ResourceValue]       NVARCHAR (4000) NOT NULL,
    [TranslateFlag]       BIT             NOT NULL,
    [ActiveFlag]          BIT             NOT NULL,
    CONSTRAINT [PK_ResourceItem_ResourceItemKey] PRIMARY KEY CLUSTERED ([ResourceItemKey] ASC),
    CONSTRAINT [FK_ResourceItem_LocaleIdentifier_LocaleIdentifierKey] FOREIGN KEY ([LocaleIdentifierKey]) REFERENCES [Locale].[LocaleIdentifier] ([LocaleIdentifierKey]),
    CONSTRAINT [FK_ResourceItem_ResourceType_ResourceTypeKey] FOREIGN KEY ([ResourceTypeKey]) REFERENCES [Locale].[ResourceType] ([ResourceTypeKey]),
    UNIQUE NONCLUSTERED ([LocaleIdentifierKey] ASC, [ResourceTypeKey] ASC, [ResourceName] ASC)
);

