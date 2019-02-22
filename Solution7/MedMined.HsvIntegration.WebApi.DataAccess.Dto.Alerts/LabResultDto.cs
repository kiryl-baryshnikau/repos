using System;

namespace MedMined.HsvIntegration.WebApi.DataAccess.Dto.Alerts
{
	public class LabResultDto
	{
		public string test_name { get; set; }
		public DateTime resulted_date { get; set; }
		public string raw_value { get; set; }
		public string interpretation { get; set; }
	}
}