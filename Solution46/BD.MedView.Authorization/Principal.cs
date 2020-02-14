using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BD.MedView.Authorization
{
    [Table("Principals", Schema = "auth")]
    public class Principal
    {
        public Principal()
        {
            Roles = new HashSet<Role>();
            Claims = new HashSet<PrincipalClaim>();
        }

        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        [Index("IX_auth.Principals_Name", 1, IsUnique = true)]
        public string Name { get; set; }

        public virtual ICollection<Role> Roles { get; set; }
        public virtual ICollection<PrincipalClaim> Claims { get; set; }
    }
}