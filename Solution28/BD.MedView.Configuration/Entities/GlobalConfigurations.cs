using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

using Newtonsoft.Json;

namespace BD.MedView.Configuration
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    public class GlobalConfigurations
    {
        public GlobalSetting GlobalSettings { get; set; }

        [IgnoreDataMember]
        public string Serialized
        {
            get => JsonConvert.SerializeObject(GlobalSettings);
            set
            {
                if (string.IsNullOrEmpty(value))
                    return;

                var setting = JsonConvert.DeserializeObject<GlobalSetting>(value);
                GlobalSettings = setting ?? new GlobalSetting();
            }
        }
    }
}
