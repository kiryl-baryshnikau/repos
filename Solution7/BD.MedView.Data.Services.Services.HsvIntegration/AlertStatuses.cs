using Newtonsoft.Json;

namespace BD.MedView.Data.Services.Services.HsvIntegration
{
    public class AlertStatuses
    {
        [JsonIgnore]
        public int classification_id { get; set; }
        public string status { get; set; }
        public int count { get; set; }
    }
}