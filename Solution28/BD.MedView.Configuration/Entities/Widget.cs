using Newtonsoft.Json;
using System.ComponentModel;

namespace BD.MedView.Configuration
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    public class Widget
    {
        public string Id { get; set; }
        public bool Enabled { get; set; }

        [DefaultValue(false)]
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
        public bool Default { get; set; }
        public dynamic Configuration { get; set; }

        [DefaultValue("")]
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
        public string @Route { get; set; }

    }
}
