using System.Collections.Generic;

namespace BD.MedView.Data.Services.Services.HsvIntegration
{
	public class AlertHeader
	{
		public int page_number { get; set; }
		public int page_size { get; set; }
		public string category { get; set; }
        public string title { get; set; }
		public IEnumerable<Alert> alerts { get; set; }
	}
}