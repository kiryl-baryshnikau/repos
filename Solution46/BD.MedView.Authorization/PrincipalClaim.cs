using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BD.MedView.Authorization
{
    [Table("PrincipalClaims", Schema = "auth")]
    public class PrincipalClaim
    {
        [Key]
        public int Id { get; set; }
        [ForeignKey(nameof(Principal))]
        public int PrincipalId { get; set; }
        public virtual Principal Principal { get; set; }

        [Required]
        public string Issuer { get; set; }
        [Required]
        public string OriginalIssuer { get; set; }
        [Required]
        public string Subject { get; set; }
        [Required]
        public string Type { get; set; }
        [Required]
        public string Value { get; set; }
        [Required]
        public string ValueType { get; set; }
    }
}