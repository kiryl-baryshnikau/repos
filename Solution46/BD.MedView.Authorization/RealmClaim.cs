using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BD.MedView.Authorization
{
    [Table("RealmClaims", Schema = "auth")]
    public class RealmClaim
    {
        [Key]
        public int Id { get; set; }
        [ForeignKey(nameof(Realm))]
        public int RealmId { get; set; }
        public virtual Realm Realm { get; set; }

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