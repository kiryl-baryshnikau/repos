CREATE TABLE [Locale].[LocaleIdentifier] (
    [LocaleIdentifierKey] INT           NOT NULL,
    [CultureName]         NVARCHAR (5)  NOT NULL,
    [CultureDisplayName]  NVARCHAR (64) NOT NULL,
    [ActiveFlag]          BIT           NOT NULL,
    [DefaultFlag]         BIT           NOT NULL,
    [Created]             DATETIME      CONSTRAINT [DF_LocaleIdentifier_Created] DEFAULT (getdate()) NOT NULL,
    [CreatedUserName]     NVARCHAR (32) CONSTRAINT [DF_LocaleIdentifier_CreatedUserName] DEFAULT (suser_sname()) NOT NULL,
    [LastUpdated]         DATETIME      CONSTRAINT [DF_LocaleIdentifier_LastUpdated] DEFAULT (getdate()) NOT NULL,
    [LastUpdatedUserName] NVARCHAR (32) CONSTRAINT [DF_LocaleIdentifier_LastUpdatedUserName] DEFAULT (suser_sname()) NOT NULL,
    CONSTRAINT [PK_LocaleIdentifier] PRIMARY KEY CLUSTERED ([LocaleIdentifierKey] ASC) ON [DATA],
    CONSTRAINT [CK_LocaleIdentifier_CultureName] CHECK (len([CultureName])=(2) OR len([CultureName])=(5) AND substring([CultureName],(3),(1))=N'-')
) ON [DATA];

