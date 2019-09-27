CREATE TABLE [fas].[Synonyms] (
    [Id]         INT            IDENTITY (1, 1) NOT NULL,
    [Name]       NVARCHAR (150) NOT NULL,
    [ProviderId] INT            NOT NULL,
    [ElementId]  INT            NOT NULL,
    [Key]        NVARCHAR (150) NULL,
    CONSTRAINT [PK_fas.Synonyms] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_fas.Synonyms_fas.Elements_ElementId] FOREIGN KEY ([ElementId]) REFERENCES [fas].[Elements] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_fas.Synonyms_fas.Providers_ProviderId] FOREIGN KEY ([ProviderId]) REFERENCES [fas].[Providers] ([Id]) ON DELETE CASCADE
);


GO
CREATE UNIQUE NONCLUSTERED INDEX [IX_fas.Synonym_ElementId_ProviderId_Name]
    ON [fas].[Synonyms]([ElementId] ASC, [ProviderId] ASC, [Name] ASC);

