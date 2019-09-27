using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Runtime.Serialization;

namespace BD.MedView.Configuration
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    [Table("UserPreferences", Schema = "conf")]
    public class UserPreference
    {
        public UserPreference()
        { 
            Facilities = new List<Facility>();
            GeneralSettings = new List<GeneralSetting>();
            ColumnOptions = new List<ColumnOption>();
        }

        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(128)]
        [Index("IX_conf.UserPreferences_User", 1, IsUnique = true)]
        public string User { get; set; }

        [Required]
        public int SessionTimeout { get; set; }

        [Required]
        public bool MaskData { get; set; }

        [ObjectMapped]
        public List<Facility> Facilities { get; set; }

        [ObjectMapped]
        public List<GeneralSetting> GeneralSettings { get; set; }

        [ObjectMapped]
        public Filters Filters { get; set; }

        [ObjectMapped]
        public List<ColumnOption> ColumnOptions { get; set; }

        [IgnoreDataMember]
        [Required]
        [Column(nameof(Configurations))]
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
                        if (obj.ContainsKey(item.Name))
                        {
                            var v = JsonConvert.DeserializeObject(JsonConvert.SerializeObject(obj[item.Name]), item.PropertyType);
                            item.SetValue(this, v);
                        }
                    });
            }
        }

    }
}
