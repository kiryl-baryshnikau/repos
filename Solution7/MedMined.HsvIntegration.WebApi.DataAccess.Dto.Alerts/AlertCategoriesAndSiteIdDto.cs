using System.Collections.Generic;

namespace MedMined.HsvIntegration.WebApi.DataAccess.Dto.Alerts
{
	public class AlertCategoriesAndSiteIdDto
	{
		public int facility_id { get; set; }
		public IEnumerable<AlertCategoryDto> alert_categories { get; set; }
	}
}