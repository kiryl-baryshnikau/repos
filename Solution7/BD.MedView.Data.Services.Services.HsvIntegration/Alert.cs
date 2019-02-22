using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace BD.MedView.Data.Services.Services.HsvIntegration
{
	public class Alert
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
		public Patient patient { get; set; }
		public IEnumerable<LabResult> lab_results { get; set; }
		public bool ShouldSerializelab_results()
		{
			return !hide_lab_results;
		}
		public IEnumerable<Drug> drugs { get; set; }
		public IEnumerable<Organism> organisms { get; set; }
		public bool ShouldSerializeorganisms()
		{
			return !hide_organisms;
		}
	}
}