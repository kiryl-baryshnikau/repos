CREATE TABLE [Locale].[ResourceType] (
    [ResourceTypeKey]   SMALLINT       NOT NULL,
    [ResourceTypeName]  NVARCHAR (128) NOT NULL,
    [ActiveFlag]        BIT            NOT NULL,
    [ResourceSourceKey] INT            NOT NULL,
    CONSTRAINT [PK_ResourceType_ResourceTypeKey] PRIMARY KEY CLUSTERED ([ResourceTypeKey] ASC)
);

