namespace BD.MedView.Services.Services
{
    public class EntityEvent<T> where T: class
    {
        public T OldValue { get; private set; }
        public T NewValue { get; private set; }

        public EntityEvent(T oldValue, T newValue)
        {
            OldValue = oldValue;
            NewValue = newValue;
        }
    }
}