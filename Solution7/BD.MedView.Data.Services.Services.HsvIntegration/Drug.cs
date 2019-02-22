using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace BD.MedView.Data.Services.Services.HsvIntegration
{
	public class Drug
	{
		[JsonIgnore]
		public bool hide_components { get; set; }
		[JsonIgnore]
		public bool hide_med_id { get; set; }
		public string prescription_number { get; set; }
		[JsonIgnore]
		public string drug_code { get; set; }
		public string placer_order_number { get; set; }
		public string drug { get; set; }
		public DateTime started_on { get; set; }
		public DateTime stopped_on { get; set; }
		public int days { get; set; }
		public string route { get; set; }
		public string mapped_route { get; set; }
		public decimal give_per { get; set; }
		public decimal give_rate_amount { get; set; }
		public string give_rate_units { get; set; }
		public decimal give_strength { get; set; }
		public string give_strength_units { get; set; }
		public string give_strength_volume_units { get; set; }
		public string ordering_physician { get; set; }
		public IEnumerable<DrugComponentDto> components { get; set; }
		public bool ShouldSerializecomponents()
		{
			return !hide_components;
		}

		public string med_id { get; set; }
		public bool ShouldSerializemed_id()
		{
			return !hide_med_id;
		}
		[JsonIgnore]
		public int alert_id { get; set; }
	}
}