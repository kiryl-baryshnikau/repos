using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class GlobalPreferenceString : GlobalPreference
    {
        [ObjectMappedAttribute]
        public string StringProperty { get; set; }
    }
}