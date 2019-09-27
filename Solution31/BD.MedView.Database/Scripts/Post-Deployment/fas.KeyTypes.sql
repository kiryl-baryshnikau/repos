--EXEC dbo.sp_generate_merge @schema = 'fas', @table_name ='KeyTypes', @cols_to_exclude = null
PRINT N'Filling [fas].[KeyTypes]...';
GO

SET IDENTITY_INSERT [fas].[KeyTypes] ON

MERGE INTO [fas].[KeyTypes] AS [Target]
USING (VALUES
  (1,N'Int32')
 ,(2,N'String')
) AS [Source] ([Id],[Name])
ON ([Target].[Id] = [Source].[Id])
WHEN MATCHED AND (
	NULLIF([Source].[Name], [Target].[Name]) IS NOT NULL OR NULLIF([Target].[Name], [Source].[Name]) IS NOT NULL) THEN
 UPDATE SET
  [Target].[Name] = [Source].[Name]
WHEN NOT MATCHED BY TARGET THEN
 INSERT([Id],[Name])
 VALUES([Source].[Id],[Source].[Name])
WHEN NOT MATCHED BY SOURCE THEN 
 DELETE;

SET IDENTITY_INSERT [fas].[KeyTypes] OFF
