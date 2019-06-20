using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BD.MedView.Configuration
{
    public class DispensingPreference : GlobalPreferences
    {
        [Required]
        public string RequiredField2 { get; set; }
    }
}
