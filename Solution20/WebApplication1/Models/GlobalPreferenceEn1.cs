using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public enum En1
    {
        Val1, Val2, Val3
    }

    public class GlobalPreferenceEn1 : GlobalPreference
    {
        [ObjectMappedAttribute]
        public En1 En1Property { get; set; }
    }
}