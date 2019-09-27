CREATE TABLE [SPS].[ApplicationConfigurations] (
    [ApplicationConfigurationKey] INT            IDENTITY (1, 1) NOT NULL,
    [ApplicationKey]              INT            NOT NULL,
    [ConfigurationTypeKey]        INT            NOT NULL,
    [ConfigurationValue]          NVARCHAR (500) NULL,
    PRIMARY KEY CLUSTERED ([ApplicationConfigurationKey] ASC)
);

