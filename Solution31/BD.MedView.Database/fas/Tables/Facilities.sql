CREATE TABLE [fas].[Facilities] (
    [Id] INT NOT NULL,
    CONSTRAINT [PK_fas.Facilities] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_fas.Facilities_fas.Elements_Id] FOREIGN KEY ([Id]) REFERENCES [fas].[Elements] ([Id]) ON DELETE CASCADE
);


GO
CREATE NONCLUSTERED INDEX [IX_Id]
    ON [fas].[Facilities]([Id] ASC);

