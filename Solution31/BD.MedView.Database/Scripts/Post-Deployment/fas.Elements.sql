--EXEC dbo.sp_generate_merge @schema = 'fas', @table_name ='Elements', @cols_to_exclude = null
PRINT N'Filling [fas].[Elements]...';
GO

SET IDENTITY_INSERT [fas].[Elements] ON

MERGE INTO [fas].[Elements] AS [Target]
USING (VALUES
  (1,N'BD.MedView.Facility',NULL)
) AS [Source] ([Id],[Name],[ParentId])
ON ([Target].[Id] = [Source].[Id])
WHEN MATCHED AND (
	NULLIF([Source].[Name], [Target].[Name]) IS NOT NULL OR NULLIF([Target].[Name], [Source].[Name]) IS NOT NULL OR 
	NULLIF([Source].[ParentId], [Target].[ParentId]) IS NOT NULL OR NULLIF([Target].[ParentId], [Source].[ParentId]) IS NOT NULL) THEN
 UPDATE SET
  [Target].[Name] = [Source].[Name], 
  [Target].[ParentId] = [Source].[ParentId]
WHEN NOT MATCHED BY TARGET THEN
 INSERT([Id],[Name],[ParentId])
 VALUES([Source].[Id],[Source].[Name],[Source].[ParentId])
WHEN NOT MATCHED BY SOURCE THEN 
 DELETE;

SET IDENTITY_INSERT [fas].[Elements] OFF
