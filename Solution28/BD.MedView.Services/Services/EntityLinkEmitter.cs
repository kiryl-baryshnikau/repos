using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace BD.MedView.Services.Services
{
    public interface IEntityLinkEmitter<T, R> where T : class where R : class
    {
        IDisposable Subscribe(IObserver<EntityLinkEvent<T, R>> observer);
        void OnAdded(T value, R link, Expression<Func<T, ICollection<R>>> expression);
        void OnRemoved(T value, R link, Expression<Func<T, ICollection<R>>> expression);
    }

    public class EntityLinkEmitter<T,R>: IEntityLinkEmitter<T,R> where T : class where R : class
    {
        private class Item : IDisposable
        {
            private readonly IObserver<EntityLinkEvent<T, R>> observer;
            private readonly Dictionary<IObserver<EntityLinkEvent<T,R>>, int> observers;

            public Item(Dictionary<IObserver<EntityLinkEvent<T,R>>, int> observers, IObserver<EntityLinkEvent<T,R>> observer)
            {
                this.observers = observers;
                this.observer = observer;
                if (!observers.ContainsKey(observer))
                {
                    observers.Add(observer, 1);
                }
                else
                {
                    observers[observer] = observers[observer] + 1;
                }
            }

            public void Dispose()
            {
                if (observer != null && observers.ContainsKey(observer))
                {
                    if (observers[observer] == 1)
                    {
                        observers.Remove(observer);
                    }
                    else
                    {
                        observers[observer] = observers[observer] - 1;
                    }
                }
            }
        }

        private Dictionary<IObserver<EntityLinkEvent<T,R>>, int> observers = new Dictionary<IObserver<EntityLinkEvent<T,R>>, int>();

        public IDisposable Subscribe(IObserver<EntityLinkEvent<T,R>> observer)
        {
            return new Item(observers, observer);
        }

        public void OnAdded(T left, R right, Expression<Func<T, ICollection<R>>> expression)
        {
            Next(left, right, true, expression);
        }

        public void OnRemoved(T left, R right, Expression<Func<T, ICollection<R>>> expression)
        {
            Next(left, right, true, expression);
        }


        private void Next(T left, R right, bool link, Expression<Func<T, ICollection<R>>> expression)
        {
            Next(new EntityLinkEvent<T,R>(left, right, link, expression));
        }
        private void Next(EntityLinkEvent<T,R> @event)
        {
            foreach (var observer in observers)
            {
                observer.Key.OnNext(@event);
            }
            //Parallel.ForEach(observers, observer => observer.Key.OnNext(@event));
        }
        public void Error(Exception e)
        {
            foreach (var observer in observers)
            {
                observer.Key.OnError(e);
            }
            //Parallel.ForEach(observers, observer => observer.Key.OnError(e));
        }
        public void Completed()
        {
            foreach (var observer in observers)
            {
                observer.Key.OnCompleted();
            }
            //Parallel.ForEach(observers, observer => observer.Key.OnCompleted());
        }
    }
}