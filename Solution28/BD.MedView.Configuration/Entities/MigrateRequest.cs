using System.Collections.Generic;

namespace BD.MedView.Configuration
{
    public class MigrateRequest
    {
        public string OldPrincipalName { get; set; }
        public string NewPrincipalName { get; set; }
        public List<string> AppCodes { get; set; }
    }
}
