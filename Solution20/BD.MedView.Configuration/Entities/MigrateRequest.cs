using System.Collections.Generic;

namespace BD.MedView.Configuration
{
    public class MigrateRequest
    {
        public string OldPrincipalName { get; set; }
        public string NewPrincipalName { get; set; }
        public IEnumerable<string> AppCodes { get; set; }
    }
}
