using System.ComponentModel.DataAnnotations;

namespace BD.MedView.Configuration
{
    public class FacilityPatientIdMapping
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string SynonymKey { get; set; }

        [Required]
        [MaxLength(150)]
        public string ProviderName { get; set; }

        [Required]
        [MaxLength(100)]
        public string PatientIdKind { get; set; }
    }
}
