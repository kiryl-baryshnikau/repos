using System.Collections.Generic;

namespace BD.MedView.Data.Services.Services.HsvIntegration
{
	public class AlertCategoriesAndSiteId
	{
		public int facility_id { get; set; }
		public IEnumerable<AlertCategory> alert_categories { get; set; }
	}
}