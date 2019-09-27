CREATE TABLE [fas].[Idns] (
    [Id] INT NOT NULL,
    CONSTRAINT [PK_fas.Idns] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_fas.Idns_fas.Elements_Id] FOREIGN KEY ([Id]) REFERENCES [fas].[Elements] ([Id]) ON DELETE CASCADE
);


GO
CREATE NONCLUSTERED INDEX [IX_Id]
    ON [fas].[Idns]([Id] ASC);

