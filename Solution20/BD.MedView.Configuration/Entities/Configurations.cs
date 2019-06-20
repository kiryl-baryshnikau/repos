using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace BD.MedView.Configuration
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    public class Configurations
    {
        public Configurations()
        {
            GlobalUserSettings = new UserSetting();
        }

        public UserSetting GlobalUserSettings { get; set; }
        
        [IgnoreDataMember]
        public string Serialized
        {
            get => JsonConvert.SerializeObject(GlobalUserSettings);
            set
            {
                if (string.IsNullOrEmpty(value))
                    return;

                var setting = JsonConvert.DeserializeObject<UserSetting>(value);
                GlobalUserSettings = setting ?? new UserSetting();
            }
        }
    }
}
