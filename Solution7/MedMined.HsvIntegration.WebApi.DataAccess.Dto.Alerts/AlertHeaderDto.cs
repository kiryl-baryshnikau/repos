using System.Collections.Generic;

namespace MedMined.HsvIntegration.WebApi.DataAccess.Dto.Alerts
{
	public class AlertHeaderDto
	{
		public int page_number { get; set; }
		public int page_size { get; set; }
		public string category { get; set; }
        public string title { get; set; }
		public IEnumerable<AlertDto> alerts { get; set; }
	}
}