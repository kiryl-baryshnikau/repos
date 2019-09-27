CREATE TABLE [fas].[Roots] (
    [Id] INT NOT NULL,
    CONSTRAINT [PK_fas.Roots] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_fas.Roots_fas.Elements_Id] FOREIGN KEY ([Id]) REFERENCES [fas].[Elements] ([Id]) ON DELETE CASCADE
);


GO
CREATE NONCLUSTERED INDEX [IX_Id]
    ON [fas].[Roots]([Id] ASC);

