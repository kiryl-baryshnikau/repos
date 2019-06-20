using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleApp4
{
    public class ObjectMappedAttribute : NotMappedAttribute
    {
    }

    public abstract class GlobalPreference
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Index("IX_conf.GlobalPreferences_Name", 1, IsUnique = true)]
        [MaxLength(128)]
        [Required]
        public string Name { get; set; }

        [IgnoreDataMember]
        [Required]
        public string Configurations
        {
            get
            {
                var obj = new Dictionary<string, object>();
                GetType()
                    .GetProperties()
                    .Where(item => Attribute.IsDefined(item, typeof(ObjectMappedAttribute)))
                    .ToList()
                    .ForEach(item => obj.Add(item.Name, item.GetValue(this)));
                return JsonConvert.SerializeObject(obj);
            }
            set
            {
                var obj = JsonConvert.DeserializeObject<Dictionary<string, object>>(value);
                GetType()
                    .GetProperties()
                    .Where(item => Attribute.IsDefined(item, typeof(ObjectMappedAttribute)))
                    .ToList()
                    .ForEach(item => {
                        var v = JsonConvert.DeserializeObject(JsonConvert.SerializeObject(obj[item.Name]), item.PropertyType);
                        item.SetValue(this, v);
                    });
            }
        }

        [Required]
        public string Type { get; set; }

        [MaxLength(128)]
        [Required]
        public string Version { get; set; }
    }

    public class GlobalPreferenceInt : GlobalPreference
    {
        [ObjectMappedAttribute]
        public int IntProperty { get; set; }
    }

    public class GlobalPreferenceString : GlobalPreference
    {
        [ObjectMappedAttribute]
        public string StringProperty { get; set; }
    }

    public enum En1
    {
        Val1, Val2, Val3
    }

    public class GlobalPreferenceEn1 : GlobalPreference
    {
        [ObjectMappedAttribute]
        public En1 En1Property { get; set; }
    }


    public class Context : DbContext
    {
        public IDbSet<GlobalPreference> GlobalPreferences { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            var db = new Context();
            var entities = db.GlobalPreferences.ToList();

            //{
            //    var value = new GlobalPreferenceInt { Name = "A", IntProperty = 1, Type = "Type", Version = "1.0" };
            //    db.GlobalPreferences.Add(value);
            //    db.SaveChanges();
            //}

            //{
            //    var value = new GlobalPreferenceString { Name = "B", StringProperty = "A", Type = "Type", Version = "1.0" };
            //    db.GlobalPreferences.Add(value);
            //    db.SaveChanges();
            //}

            //{
            //    var value = new GlobalPreferenceEn1 { Name = "C", En1Property = En1.Val3, Type = "Type", Version = "1.0" };
            //    db.GlobalPreferences.Add(value);
            //    db.SaveChanges();
            //}

            entities.ForEach(item =>
            {
                Console.WriteLine(item);
                Console.WriteLine(JsonConvert.SerializeObject(item));
            });
        }
    }
}
