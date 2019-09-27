CREATE TABLE [fas].[KeyTypes] (
    [Id]   INT            IDENTITY (1, 1) NOT NULL,
    [Name] NVARCHAR (150) NULL,
    CONSTRAINT [PK_fas.KeyTypes] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
CREATE UNIQUE NONCLUSTERED INDEX [IX_fas.KeyType_Name]
    ON [fas].[KeyTypes]([Name] ASC);

