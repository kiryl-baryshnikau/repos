CREATE TABLE [fas].[Units] (
    [Id] INT NOT NULL,
    CONSTRAINT [PK_fas.Units] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_fas.Units_fas.Elements_Id] FOREIGN KEY ([Id]) REFERENCES [fas].[Elements] ([Id]) ON DELETE CASCADE
);


GO
CREATE NONCLUSTERED INDEX [IX_Id]
    ON [fas].[Units]([Id] ASC);

