using Newtonsoft.Json;

namespace MedMined.HsvIntegration.WebApi.DataAccess.Dto.Alerts
{
    public class AlertStatusesDto
    {
        [JsonIgnore]
        public int classification_id { get; set; }
        public string status { get; set; }
        public int count { get; set; }
    }
}