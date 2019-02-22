using Newtonsoft.Json;

namespace BD.MedView.Data.Services.Services.HsvIntegration
{
	public class OrganismSusceptibility
	{
		[JsonIgnore]
		public int alert_id { get; set; }
		public string interpretation { get; set; }
		public string drug { get; set; }
	}
}