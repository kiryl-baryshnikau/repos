namespace ConsoleApp1
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("mr.UserClaims")]
    public partial class UserClaim
    {
        [Key]
        public int Key { get; set; }

        public int ParentKey { get; set; }

        [Required]
        [StringLength(150)]
        public string Type { get; set; }

        [Required]
        public string Value { get; set; }

        public virtual UserAccount UserAccount { get; set; }
    }
}
