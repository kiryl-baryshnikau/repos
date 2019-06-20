using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleApp3
{
    public abstract class GlobalPreference
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Index("IX_conf.GlobalPreferences_Name", 1, IsUnique = true)]
        [MaxLength(128)]
        [Required]
        public string Name { get; set; }

        [Required]
        public string Configurations { get; set; }

        [Required]
        public string Type { get; set; }

        [MaxLength(128)]
        [Required]
        public string Version { get; set; }
    }

    public class GlobalPreferenceInt: GlobalPreference
    {
        public new dynamic Configurations
        {
            get { return JsonConvert.DeserializeObject<dynamic>(base.Configurations); }
            set { base.Configurations = JsonConvert.SerializeObject(value); }
        }
    }

    public class GlobalPreferenceString : GlobalPreference
    {
        public new string Configurations
        {
            get { return base.Configurations; }
            set { base.Configurations = value; }
        }
    }

    public enum En1 {
        Val1, Val2, Val3
    }

    public class GlobalPreferenceEn1 : GlobalPreference
    {
        public new En1 Configurations
        {
            get { return (En1)Enum.Parse(typeof(En1), base.Configurations); }
            set { base.Configurations = value.ToString(); }
        }
    }


    public class Context : DbContext
    {
        public IDbSet<GlobalPreference> GlobalPreferences { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<GlobalPreference>()
                .HasDiscriminator<int>("Type");
                
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            var db = new Context();
            var entities = db.GlobalPreferences.ToList();

            //{
            //    var value = new GlobalPreferenceInt { Name = "A", Configurations = 1, Type = "Type", Version = "1.0" };
            //    db.GlobalPreferences.Add(value);
            //    db.SaveChanges();
            //}

            //{
            //    var value = new GlobalPreferenceString { Name = "B", Configurations = "A", Type = "Type", Version = "1.0" };
            //    db.GlobalPreferences.Add(value);
            //    db.SaveChanges();
            //}

            //{
            //    var value = new GlobalPreferenceEn1 { Name = "C", Configurations = En1.Val3, Type = "Type", Version = "1.0" };
            //    db.GlobalPreferences.Add(value);
            //    db.SaveChanges();
            //}

            entities.ForEach(item =>
            {
                Console.WriteLine(item);
            });
        }
    }

}
