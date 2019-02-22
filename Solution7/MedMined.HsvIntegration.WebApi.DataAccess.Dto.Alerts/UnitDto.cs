using Newtonsoft.Json;

namespace MedMined.HsvIntegration.WebApi.DataAccess.Dto.Alerts
{
	public class UnitDto
	{
		[JsonIgnore]
		public int classification_id { get; set; }
		public string location { get; set; }
		public string bed { get; set; }
	}
}