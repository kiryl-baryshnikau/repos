using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;

namespace BD.MedView.Services.Services
{
    public static class EntityExtensions
    {
        public static IQueryable<T> Expand<T>(this IQueryable<T> values, string expand = null) where T : class
        {
            var tokens = String.IsNullOrWhiteSpace(expand) ? new string[0] : expand.Split(',');
            foreach (var item in tokens)
            {
                values = values.Include(item);
            }
            return values;
        }

        //public static IEnumerable<T> Filters<T>(this IQueryable<T> values, string expand = null) where T : class
        //{
        //    return values.ToList().Select(value => Filter(value, expand)).ToList();
        //}
        public static IEnumerable<T> Filters<T>(this IEnumerable<T> values, string expand = null) where T : class
        {
            return values.ToList().Select(value => Filter(value, expand)).ToList();
        }
        public static T Filter<T>(this T value, string expand = null) where T : class
        {
            var tokens = String.IsNullOrWhiteSpace(expand) ? new string[0] : expand.Split(',');

            var type = typeof(T);
            if (value != null)
            {
                var valueType = value.GetType();
                if (valueType.Assembly == type.Assembly)
                {
                    type = valueType;
                }
            }

            var properties = type.GetProperties();
            //var instance = Activator.CreateInstance<T>();
            var instance = (T)Activator.CreateInstance(type);
            foreach (var property in properties)
            {
                if (property.GetMethod.IsVirtual)
                {
                    if (!tokens.Contains(property.Name))
                    {
                        property.SetValue(instance, null);
                        continue;
                    }

                    var insTokens = String.Join(",", tokens
                        .Where(item => item.StartsWith($"{property.Name}."))
                        .Select(item => item.Substring($"{property.Name}.".Length)));
                    if (string.IsNullOrWhiteSpace(insTokens))
                    {
                        insTokens = null;
                    }

                    //do filtering
                    if (typeof(System.Collections.IEnumerable).IsAssignableFrom(property.PropertyType))
                    {
                        var obj = property.GetValue(value);
                        var method = typeof(EntityExtensions).GetMethod(nameof(Filters));
                        var genericMethod = method.MakeGenericMethod(property.PropertyType.GenericTypeArguments[0]);
                        var ins = genericMethod.Invoke(null, new object[] { obj, insTokens });
                        property.SetValue(instance, ins);
                    }
                    else
                    {
                        var obj = property.GetValue(value);
                        var method = typeof(EntityExtensions).GetMethod(nameof(Filter));
                        var genericMethod = method.MakeGenericMethod(property.PropertyType);
                        var ins = genericMethod.Invoke(null, new object[] { obj, insTokens });
                        property.SetValue(instance, ins);
                    }
                }
                else
                {
                    var obj = property.GetValue(value);
                    property.SetValue(instance, obj);
                }
            }
            return instance;
        }

        //public static string SerializeObject(this IPreferences preference)
        //{
        //    return JsonConvert.SerializeObject(preference);
        //}
    }
}