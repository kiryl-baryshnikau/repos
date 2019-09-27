using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace BD.MedView.Services.Services
{
    public interface IEntityLinkSecurity<T, R> where T : class where R : class
    {
        void ValidateAdd(T entity, R link, Expression<Func<T, ICollection<R>>> expression);
        void ValidateRemove(T entity, R link, Expression<Func<T, ICollection<R>>> expression);
    }
}