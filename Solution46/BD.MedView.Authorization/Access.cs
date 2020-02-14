using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BD.MedView.Authorization
{
    [Table("Accesses", Schema = "auth")]
    public class Access
    {
        [Key]
        [Column("PrincipalId", Order = 1)]
        public int PrincipalId { get; set; }
        [Key]
        [Column("PermissionId", Order = 2)]
        public int PermissionId { get; set; }
        [Key]
        [Column("RealmId", Order = 3)]
        public int RealmId { get; set; }

        [ForeignKey("PrincipalId")]
        public virtual Principal Principal { get; set; }

        [ForeignKey("PermissionId")]
        public virtual Permission Permission { get; set; }

        [ForeignKey("RealmId")]
        public virtual Realm Realm { get; set; }
    }
}
