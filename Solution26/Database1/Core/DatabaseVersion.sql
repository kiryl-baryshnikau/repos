CREATE TABLE [Core].[DatabaseVersion] (
    [DatabaseVersionKey]      INT           NOT NULL,
    [VersionText]             VARCHAR (20)  NOT NULL,
    [LocaleCode]              VARCHAR (5)   NOT NULL,
    [LastModifiedUTCDateTime] DATETIME2 (7) NOT NULL,
    CONSTRAINT [pk_DatabaseVersion] PRIMARY KEY CLUSTERED ([DatabaseVersionKey] ASC)
);

