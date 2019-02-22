using System;
using Newtonsoft.Json;

namespace BD.MedView.Data.Services.Services.HsvIntegration
{
	public class Patient
	{
		public string name { get; set; }
		public string account_number { get; set; }
		public string mrn { get; set; }
		public DateTime born_on { get; set; }
		public string location { get; set; }
		public string bed { get; set; }

		[JsonIgnore]
		public int alert_id { get; set; }
	}
}