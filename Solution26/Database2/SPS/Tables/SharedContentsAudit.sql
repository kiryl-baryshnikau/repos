CREATE TABLE [SPS].[SharedContentsAudit] (
    [SharedContentsAuditKey] INT            IDENTITY (1, 1) NOT NULL,
    [SharedContentKey]       INT            NOT NULL,
    [ApplicationKey]         INT            NOT NULL,
    [Token]                  VARCHAR (50)   NOT NULL,
    [SharedContentName]      VARCHAR (50)   NOT NULL,
    [SharedContentValue]     NVARCHAR (MAX) NOT NULL,
    [LastAccessedUTCDate]    DATETIME       NOT NULL,
    [ModifiedByUserKey]      INT            NULL,
    [TriggerUTCDateTime]     DATETIME2 (4)  CONSTRAINT [DF_SPS_SharedContentsAudit_TriggerUTCDateTime] DEFAULT (getutcdate()) NOT NULL,
    [ActionType]             VARCHAR (15)   NULL,
    PRIMARY KEY CLUSTERED ([SharedContentsAuditKey] ASC)
);

