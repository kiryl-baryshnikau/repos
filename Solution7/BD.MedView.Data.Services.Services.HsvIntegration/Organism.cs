using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace BD.MedView.Data.Services.Services.HsvIntegration
{
	public class Organism
	{
		[JsonIgnore]
		public int alert_id { get; set; }
		public DateTime resulted_date { get; set; }
		public string organism { get; set; }
		public string mapped_source_test { get; set; }
		public string site_test { get; set; }
		public IEnumerable<OrganismSusceptibility> susceptibilities { get; set; }
	}
}