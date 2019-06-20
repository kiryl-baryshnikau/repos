using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace WebApplication1.Models
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
}