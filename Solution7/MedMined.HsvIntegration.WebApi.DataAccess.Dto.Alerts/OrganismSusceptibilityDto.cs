using Newtonsoft.Json;

namespace MedMined.HsvIntegration.WebApi.DataAccess.Dto.Alerts
{
	public class OrganismSusceptibilityDto
	{
		[JsonIgnore]
		public int alert_id { get; set; }
		public string interpretation { get; set; }
		public string drug { get; set; }
	}
}