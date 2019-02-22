using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace BD.MedView.Data.Services.Services.HsvIntegration
{
	public class AlertSummary
	{
		[JsonIgnore]
		public int classification_id { get; set; }

		public string category { get; set; }
		public string title { get; set; }
		public int facility_id { get; set; }
		public int total_alerts { get; set; }
		public IEnumerable<AlertStatuses> statuses { get; set; }
		public IEnumerable<AlertPriorities> priorities { get; set; }
		public string ownership { get; set; }
		public DateTime updated_on { get; set; }
		public IEnumerable<Unit> units { get; set; }

	}
}