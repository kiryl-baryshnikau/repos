using Newtonsoft.Json;

namespace BD.MedView.Data.Services.Services.HsvIntegration
{
    public class AlertPriorities
	{
        [JsonIgnore]
        public int classification_id { get; set; }
        public string priority { get; set; }
		public int @new { get; set; }
		public int read { get; set; }
		public int pending { get; set; }
		public int documented { get; set; }
	}
}