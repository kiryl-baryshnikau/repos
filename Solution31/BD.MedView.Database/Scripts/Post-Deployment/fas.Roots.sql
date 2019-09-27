--EXEC dbo.sp_generate_merge @schema = 'fas', @table_name ='Roots', @cols_to_exclude = null
PRINT N'Filling [fas].[Roots]...';
GO

MERGE INTO [fas].[Roots] AS [Target]
USING (VALUES
  (1)
) AS [Source] ([Id])
ON ([Target].[Id] = [Source].[Id])
WHEN NOT MATCHED BY TARGET THEN
 INSERT([Id])
 VALUES([Source].[Id])
WHEN NOT MATCHED BY SOURCE THEN 
 DELETE;
