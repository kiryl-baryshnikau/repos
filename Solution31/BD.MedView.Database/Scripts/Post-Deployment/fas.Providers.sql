--EXEC dbo.sp_generate_merge @schema = 'fas', @table_name ='Providers', @cols_to_exclude = null
PRINT N'Filling [fas].[Providers]...';
GO

SET IDENTITY_INSERT [fas].[Providers] ON

MERGE INTO [fas].[Providers] AS [Target]
USING (VALUES
  (1,N'BD.MedView.Facility',1)
) AS [Source] ([Id],[Name],[KeyTypeId])
ON ([Target].[Id] = [Source].[Id])
WHEN MATCHED AND (
	NULLIF([Source].[Name], [Target].[Name]) IS NOT NULL OR NULLIF([Target].[Name], [Source].[Name]) IS NOT NULL OR 
	NULLIF([Source].[KeyTypeId], [Target].[KeyTypeId]) IS NOT NULL OR NULLIF([Target].[KeyTypeId], [Source].[KeyTypeId]) IS NOT NULL) THEN
 UPDATE SET
  [Target].[Name] = [Source].[Name], 
  [Target].[KeyTypeId] = [Source].[KeyTypeId]
WHEN NOT MATCHED BY TARGET THEN
 INSERT([Id],[Name],[KeyTypeId])
 VALUES([Source].[Id],[Source].[Name],[Source].[KeyTypeId])
WHEN NOT MATCHED BY SOURCE THEN 
 DELETE;

SET IDENTITY_INSERT [fas].[Providers] OFF
