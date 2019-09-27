using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BD.MedView.Runtime
{
    [Table("LastActiveRoutes", Schema = "rnt")]
    public class LastActiveRoute
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(128)]
        [Index("IX_rnt.LastActiveRoutes_User", 1, IsUnique = true)]
        public string User { get; set; }

        //[Required]
        public string Value { get; set; }
    }
}
