CREATE TABLE [fas].[Providers] (
    [Id]        INT            IDENTITY (1, 1) NOT NULL,
    [Name]      NVARCHAR (150) NULL,
    [KeyTypeId] INT            NOT NULL,
    CONSTRAINT [PK_fas.Providers] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_fas.Providers_fas.KeyTypes_KeyTypeId] FOREIGN KEY ([KeyTypeId]) REFERENCES [fas].[KeyTypes] ([Id]) ON DELETE CASCADE
);


GO
CREATE UNIQUE NONCLUSTERED INDEX [IX_fas.Provider_Name]
    ON [fas].[Providers]([Name] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_KeyTypeId]
    ON [fas].[Providers]([KeyTypeId] ASC);

