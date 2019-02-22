using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace MedMined.HsvIntegration.WebApi.DataAccess.Dto.Alerts
{
	public class OrganismDto
	{
		[JsonIgnore]
		public int alert_id { get; set; }
		public DateTime resulted_date { get; set; }
		public string organism { get; set; }
		public string mapped_source_test { get; set; }
		public string site_test { get; set; }
		public IEnumerable<OrganismSusceptibilityDto> susceptibilities { get; set; }
	}
}