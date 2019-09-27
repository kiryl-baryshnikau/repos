using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections;
using System.Collections.Generic;

namespace BD.MedView.Services.Services
{
    /// <summary>
    /// Caching of Not-Cyclomatic objects
    /// </summary>
    public static class ICacheServiceExtensions
    {
        public static T GetObject<T>(this ICacheService obj, string key, string path = default(string)) where T : class
        {
            if (key == null)
                throw new ArgumentNullException(nameof(key));

            var pattern = obj.Get(key);
            if (pattern == null)
            {
                return null;
            }
            if (path != null)
            {
                var value = JObject.Parse(pattern);
                if (typeof(IEnumerable).IsAssignableFrom(typeof(T)))
                {
                    var tokens = value.SelectTokens(path);
                    pattern = JsonConvert.SerializeObject(tokens);
                }
                else
                {
                    var token = value.SelectToken(path);
                    pattern = JsonConvert.SerializeObject(token);
                }
            }
            return JsonConvert.DeserializeObject<T>(pattern);
        }

        public static void SetObject<T>(this ICacheService obj, string key, T value, CacheServiceOptions options = default(CacheServiceOptions)) where T : class
        {
            if (key == null)
                throw new ArgumentNullException(nameof(key));
            if (value == null)
                throw new ArgumentNullException(nameof(value));
            if (options == null)
            {
                var def = new DistributedCacheEntryOptions();
                options = new CacheServiceOptions
                {
                    AbsoluteExpiration = def.AbsoluteExpiration,
                    AbsoluteExpirationRelativeToNow = def.AbsoluteExpirationRelativeToNow,
                    SlidingExpiration = def.SlidingExpiration,
                };
            }
            var pattern = JsonConvert.SerializeObject(value);
            obj.Set(key, pattern, options);
        }
    }
}