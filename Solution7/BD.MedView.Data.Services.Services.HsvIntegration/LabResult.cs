using System;

namespace BD.MedView.Data.Services.Services.HsvIntegration
{
	public class LabResult
	{
		public string test_name { get; set; }
		public DateTime resulted_date { get; set; }
		public string raw_value { get; set; }
		public string interpretation { get; set; }
	}
}