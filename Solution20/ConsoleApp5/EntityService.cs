using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;

namespace ConsoleApp5
{
    public class EntityService<T>  where T : class
    {
        private readonly DbContext context;
        private readonly Func<T, int> id;
        private readonly Func<T, string> key;

        public EntityService(
            DbContext context,
            Func<T, int> idSelector,
            Func<T, string> keySelector
            )
        {
            this.id = idSelector;
            this.key = keySelector;
        }

        public IQueryable<T> Select(string expand = null)
        {
            var entities = context.Set<T>()
                .AsNoTracking()
                //.Expand(expand)
                ;
            return entities;
        }

        public void Create(T value)
        {
            var entity = context.Set<T>()
                .Add(value);
            context.SaveChanges();
        }

        public T Read(int id, string expand = null)
        {
            Expression<Func<T, bool>> predicate = (T v) => { return this.id(v) == id; };
            var entity = context.Set<T>()
                .AsNoTracking()
                //.Expand(expand)
                .SingleOrDefault(predicate);
            return entity;
        }

        public void Update(int id, T value)
        {
            Expression<Func<T, bool>> predicate = (T) => true;
            var entity = context.Set<T>()
                .SingleOrDefault(this.id);
            context.SaveChanges();
        }

        public void Delete(int id)
        {
            Expression<Func<T, bool>> predicate = (T) => true;
            var entity = context.Set<T>()
                .SingleOrDefault(this.id);
            context.Set<T>().Remove(entity);
            context.SaveChanges();
        }
    }

}
