using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace MedMined.HsvIntegration.WebApi.DataAccess.Dto.Alerts
{
	public class AlertDto
	{
		[JsonIgnore]
		public bool hide_lab_results { get; set; }
		[JsonIgnore]
		public bool hide_organisms { get; set; }
		public int alert_id { get; set; }
		public int facility_id { get; set; }
		public string priority { get; set; }
		public string status { get; set; }
		public string ownership { get; set; }
		public DateTime created_on { get; set; }
		public DateTime updated_on { get; set; }
		public PatientDto patient { get; set; }
		public IEnumerable<LabResultDto> lab_results { get; set; }
		public bool ShouldSerializelab_results()
		{
			return !hide_lab_results;
		}
		public IEnumerable<DrugDto> drugs { get; set; }
		public IEnumerable<OrganismDto> organisms { get; set; }
		public bool ShouldSerializeorganisms()
		{
			return !hide_organisms;
		}
	}
}