using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration;
using System.Linq;

namespace ConsoleApp1
{

    public class GlobalPreference
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Index("IX_conf.GlobalPreferences_Name", 1, IsUnique = true)]
        [MaxLength(128)]
        [Required]
        public string Name { get; set; }

        [Required]
        /*protected*/ string Configurations { get; set; }

        [Required]
        public string Type { get; set; }

        [MaxLength(128)]
        [Required]
        public string Version { get; set; }

        [NotMapped]
        public dynamic Value
        {
            get { return Configurations; }
            set { Configurations = value; }
        }

        public class EntityTypeConfiguration : EntityTypeConfiguration<GlobalPreference>
        {
            public EntityTypeConfiguration()
            {
                Map(e => e.Property(p => p.Configurations).HasColumnName(nameof(GlobalPreference.Configurations)));
            }
        }
    }

    public class Context : DbContext
    {
        public IDbSet<GlobalPreference> GlobalPreferences { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Configurations.Add(new GlobalPreference.EntityTypeConfiguration());
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            var db = new Context();
            var entities = db.GlobalPreferences.ToList();
            entities.ForEach(item =>
            {
                Console.WriteLine(item);
            });
        }
    }
}
