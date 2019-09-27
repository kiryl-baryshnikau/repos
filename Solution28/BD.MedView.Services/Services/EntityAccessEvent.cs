using System.Collections.Generic;

namespace BD.MedView.Services.Services
{
    public class EntityAccessEvent<T> where T : class
    {
        public T Value { get; private set; }
        public List<T> Values { get; private set; }

        public EntityAccessEvent(T value)
        {
            Value = value;
        }
        public EntityAccessEvent(List<T> values)
        {
            Values = values;
        }
    }
}