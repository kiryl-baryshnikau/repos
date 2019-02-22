using Newtonsoft.Json;

namespace BD.MedView.Data.Services.Services.HsvIntegration
{
	public class Unit
	{
		[JsonIgnore]
		public int classification_id { get; set; }
		public string location { get; set; }
		public string bed { get; set; }
	}
}