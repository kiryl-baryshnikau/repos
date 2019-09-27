CREATE TABLE [SPS].[ConfigurationTypes] (
    [ConfigurationTypeKey] INT            NOT NULL,
    [ConfigurationName]    VARCHAR (50)   NOT NULL,
    [DefaultValue]         NVARCHAR (500) NULL,
    [ActiveFlag]           BIT            NULL,
    [UsageFlag]            TINYINT        DEFAULT ((1)) NOT NULL,
    PRIMARY KEY CLUSTERED ([ConfigurationTypeKey] ASC),
    UNIQUE NONCLUSTERED ([ConfigurationTypeKey] ASC)
);

