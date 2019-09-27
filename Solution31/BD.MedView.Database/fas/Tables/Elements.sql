CREATE TABLE [fas].[Elements] (
    [Id]       INT            IDENTITY (1, 1) NOT NULL,
    [Name]     NVARCHAR (150) NULL,
    [ParentId] INT            NULL,
    CONSTRAINT [PK_fas.Elements] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_fas.Elements_fas.Elements_ParentId] FOREIGN KEY ([ParentId]) REFERENCES [fas].[Elements] ([Id])
);


GO
CREATE UNIQUE NONCLUSTERED INDEX [IX_fas.Element_Name_ParentId]
    ON [fas].[Elements]([Name] ASC, [ParentId] ASC);

