using System.Linq;

namespace BD.MedView.Services.Services
{
    public interface IEntitySecurity<T> where T : class
    {
        IQueryable<T> ValidateSelect(IQueryable<T> values, string expand);
        void ValidateRead(T value, string expand);
        void ValidateUpdate(T entity, T value);
        void ValidateDelete(T value);
        void ValidateCreate(T value);
    }
}