using System.ComponentModel.DataAnnotations;

namespace MedMined.HsvIntegration.WebApi.DataAccess.Dto.Alerts
{
	public class AlertStatusDto
	{
		[Required]
		[Range(1, 2147483647)]
		public int alert_id { get; set; }

		[Required]
		[RegularExpression("(^.*Read.*$)", ErrorMessage = "Parameter not valid.")]
		public string status { get; set; }
	}
}