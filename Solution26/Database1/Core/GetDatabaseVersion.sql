CREATE PROCEDURE [Core].[GetDatabaseVersion]
AS
	SELECT [VersionText]
	FROM [Core].[DatabaseVersion]
