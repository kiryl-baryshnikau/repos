CREATE TABLE [SPS].[UserInfoControls] (
    [UserInfoControlKey] INT IDENTITY (1, 1) NOT NULL,
    [ApplicationKey]     INT NOT NULL,
    CONSTRAINT [PK_UserInfoControlMapper] PRIMARY KEY CLUSTERED ([UserInfoControlKey] ASC)
);

