using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleApp2
{
    public class GlobalPreference
    {
        public string Value { get; set; }
    }

    public class GlobalPreferenceInt: GlobalPreference
    {
        public new int Value
        {
            get
            {
                return int.Parse(base.Value);
            }
            set
            {
                base.Value = value.ToString();
            }
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            var a___ = new GlobalPreferenceInt { Value = 1 };
            var b___ = a___ as GlobalPreference;
            var c___ = JsonConvert.SerializeObject(a___);
            var d___ = JsonConvert.SerializeObject(b___);
            var e___ = new GlobalPreference { Value = "a" };
            var f___ = JsonConvert.SerializeObject(e___);
        }
    }
}
