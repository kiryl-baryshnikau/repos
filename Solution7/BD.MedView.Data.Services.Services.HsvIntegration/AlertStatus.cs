using System.ComponentModel.DataAnnotations;

namespace BD.MedView.Data.Services.Services.HsvIntegration
{
	public class AlertStatus
	{
		[Required]
		[Range(1, 2147483647)]
		public int alert_id { get; set; }

		[Required]
		[RegularExpression("(^.*Read.*$)", ErrorMessage = "Parameter not valid.")]
		public string status { get; set; }
	}
}