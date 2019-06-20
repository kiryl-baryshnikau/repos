using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Linq.Dynamic;

namespace ConsoleApp6
{
    public class Person
    {
        public Person()
        {
            Cars = new HashSet<Car>();
        }

        public int Id { get; set; }
        public string Name { get; set; }

        public virtual ICollection<Car> Cars { get; set; }
    }

    public class Car
    {
        public Car()
        {
            People = new HashSet<Person>();
        }

        public int Id { get; set; }
        public string Vin { get; set; }
        public string Make { get; set; }
        public string Model { get; set; }
        public virtual ICollection<Person> People { get; set; }
    }

    public class Context: DbContext 
    {
        public DbSet<Person> People { get; set; }
        public DbSet<Car> Cars { get; set; }
    }

    public interface IEntitySecurity<T> where T : class
    {
        IQueryable<T> List(IQueryable<T> query, string expand, string filter);
        void Read(T value, string expand);
        void Create(T value);
        void Update(T old, T @new);
        void Delete(T value);
    }
    public interface IEntityLinkSecurity<L,R> where L : class where R : class
    {
        void Link(L left, string collection, R right);
        void Unlink(L left, string collection, R right);
    }
    public interface IEntityEventEmitter<T>
    {
        void List(ICollection<T> values);
        void Read(T value);
        void Create(T value);
        void Update(T old, T @new);
        void Delete(T value);
    }
    public interface IEntityLinkEventEmitter<L, R> where L : class where R : class
    {
        void Link(L left, string collection, R right);
        void Unlink(L left, string collection, R right);
    }

    public interface IEntityService<T> where T : class
    {
        ICollection<T> List(string expand, string filter, string orderby, int? skip, int? take);
        T Read(object id, string expand);
        T Create(T value);
        T Update(object id, T value);
        void Delete(object id);
    }
    public class EntityService<T>: IEntityService<T> where T : class
    {
        private readonly IDbSet<T> tSet;
        private readonly IEntitySecurity<T> security;
        private readonly IEntityEventEmitter<T> emitter;
        public EntityService(IDbSet<T> tSet, IEntitySecurity<T> security, IEntityEventEmitter<T> emitter)
        {
            this.tSet = tSet;
            this.security = security;
            this.emitter = emitter;
        }

        public ICollection<T> List(string expand, string filter, string orderby, int? skip, int? take)
        {
            var query = tSet as IQueryable<T>;
            //--secure select
            if (!string.IsNullOrWhiteSpace(expand))
            {
                query = query.Include(expand);
            }
            if (!string.IsNullOrWhiteSpace(filter))
            {
                query = query.Where(filter);
            }
            if (!string.IsNullOrWhiteSpace(orderby))
            {
                query = query.OrderBy(orderby);
            }
            if (skip.HasValue)
            {
                query = query.Skip(skip.Value);
            }
            if (take.HasValue)
            {
                query = query.Take(take.Value);
            }
            var entities = query.ToList();
            var values = entities;//filter
            //--generate event
            return values;
        }
        public T Read(object id, string expand)
        {
            var query = tSet as IQueryable<T>;
            if (!string.IsNullOrWhiteSpace(expand))
            {
                query = query.Include(expand);
            }
            query = query.Where($"Id={id}");
            var entity = query.SingleOrDefault();
            //--secure read
            var value = entity;//filter
            //--generate event
            return value;
        }
        public T Create(T value)
        {
            //--secure create
            var entity = tSet.Add(value);
            value = entity;//filter
            //--generate event
            return value;
        }
        public T Update(object id, T value)
        {
            var entity = tSet.Find(id);
            //--secure update
            //Copy fields
            value = entity;//filter
            //--generate event
            return value;
        }
        public void Delete(object id)
        {
            var entity = tSet.Find(id);
            //--secure delete
            tSet.Remove(entity);
            //--generate event
        }
    }

    public interface IEntityLinkService<L, R> where L : class where R : class
    {
        void Link(object leftId, string collection, object rightId);
        void Unlink(object leftId, string collection, object rightId);
    }
    public class EntityLinkService<L, R>: IEntityLinkService<L, R> where L : class where R : class
    {
        private readonly IDbSet<L> lSet;
        private readonly IDbSet<R> rSet;
        private readonly IEntityLinkSecurity<L,R> security;
        private readonly IEntityLinkEventEmitter<L, R> emitter;
        public EntityLinkService(IDbSet<L> lSet, IDbSet<R> rSet, IEntityLinkSecurity<L, R> security, IEntityLinkEventEmitter<L, R> emitter)
        {
            this.lSet = lSet;
            this.rSet = rSet;
            this.security = security;
            this.emitter = emitter;
        }

        public void Link(object leftId, string collection, object rightId)
        {
            //--secure read
            var left = lSet.Find(leftId);
            //--secure read
            var right = rSet.Find(rightId);
            //--secure link
            //var col = collection(left);
            var col = null as ICollection<R>;//find collection
            col.Add(right);
            //--generate event

        }
        public void Unlink(object leftId, string collection, object rightId)
        {
            //--secure read
            var left = lSet.Find(leftId);
            //--secure read
            var right = rSet.Find(rightId);
            //--secure unlink
            //var col = collection(left);
            var col = null as ICollection<R>;//find collection
            col.Remove(right);
            //--generate event
        }
    }

    //for not basic services we have to do wrapper; for basic services we can just do generic

    public interface ICarsService : IEntityService<Car>, IEntityLinkService<Car, Person>
    {
    }
    public class CarsService: ICarsService
    {
        private readonly EntityService<Car> entityService;
        private readonly EntityLinkService<Car, Person> entityLinkService;
        public CarsService(EntityService<Car> entityService, EntityLinkService<Car, Person> entityLinkService)
        {
            this.entityService = entityService;
            this.entityLinkService = entityLinkService;
        }

        public ICollection<Car> List(string expand, string filter, string orderby, int? skip, int? take)
        {
            return entityService.List(expand, filter, orderby, skip, take);
        }
        public Car Read(object id, string expand)
        {
            return entityService.Read(id, expand);
        }
        public Car Create(Car value)
        {
            return entityService.Create(value);
        }
        public Car Update(object id, Car value)
        {
            return entityService.Update(id, value);
        }
        public void Delete(object id)
        {
            entityService.Delete(id);
        }

        public void Link(object leftId, string collection, object rightId)
        {
            entityLinkService.Link(leftId, collection, rightId);
        }
        public void Unlink(object leftId, string collection, object rightId)
        {
            entityLinkService.Unlink(leftId, collection, rightId);
        }
    }

    public interface IPeopleService : IEntityService<Person>, IEntityLinkService<Person, Car>
    {
    }
    public class PeopleService : EntityService<Person>, IPeopleService
    {
        private readonly EntityLinkService<Person, Car> entityLinkService;
        public PeopleService(IDbSet<Person> tSet, IEntitySecurity<Person> security, IEntityEventEmitter<Person> emitter, EntityLinkService<Person, Car> entityLinkService)
            :base(tSet, security, emitter)
        {
            this.entityLinkService = entityLinkService;
        }

        public void Link(object leftId, string collection, object rightId)
        {
            entityLinkService.Link(leftId, collection, rightId);
        }
        public void Unlink(object leftId, string collection, object rightId)
        {
            entityLinkService.Unlink(leftId, collection, rightId);
        }
    }


    class Program
    {
        static void Main(string[] args)
        {
        }
    }
}
