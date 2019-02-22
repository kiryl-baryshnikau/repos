using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace MedMined.HsvIntegration.WebApi.DataAccess.Dto.Alerts
{
	public class AlertSummaryDto
	{
		[JsonIgnore]
		public int classification_id { get; set; }

		public string category { get; set; }
		public string title { get; set; }
		public int facility_id { get; set; }
		public int total_alerts { get; set; }
		public IEnumerable<AlertStatusesDto> statuses { get; set; }
		public IEnumerable<AlertPrioritiesDto> priorities { get; set; }
		public string ownership { get; set; }
		public DateTime updated_on { get; set; }
		public IEnumerable<UnitDto> units { get; set; }

	}
}