using System.Linq;

namespace BD.MedView.Services.Services
{
    public interface IEntityAccessSecurity<T> where T : class
    {
        IQueryable<T> ValidateSelect(IQueryable<T> values, string expand);
        void ValidateRead(T value, string expand);
    }
}