﻿CREATE SCHEMA [fas]
    AUTHORIZATION [dbo];
GO
GRANT DELETE
    ON SCHEMA::[fas] TO [BDMedViewRole];
GO
GRANT EXECUTE
    ON SCHEMA::[fas] TO [BDMedViewRole];
GO
GRANT INSERT
    ON SCHEMA::[fas] TO [BDMedViewRole];
GO
GRANT REFERENCES
    ON SCHEMA::[fas] TO [BDMedViewRole];
GO
GRANT SELECT
    ON SCHEMA::[fas] TO [BDMedViewRole];
GO
GRANT UPDATE
    ON SCHEMA::[fas] TO [BDMedViewRole];
