using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace BD.MedView.Services.Services
{
    public interface IEntityEmitter<T> where T : class
    {
        IDisposable Subscribe(IObserver<EntityEvent<T>> observer);
        void OnCreated(T value);
        void OnUpdated(T value, T oldValue);
        void OnDeleted(T value);
    }

    public class EntityEmitter<T>: IEntityEmitter<T> where T : class
    {
        private class Item : IDisposable
        {
            private readonly IObserver<EntityEvent<T>> observer;
            private readonly Dictionary<IObserver<EntityEvent<T>>, int> observers;

            public Item(Dictionary<IObserver<EntityEvent<T>>, int> observers, IObserver<EntityEvent<T>> observer)
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

        private Dictionary<IObserver<EntityEvent<T>>, int> observers = new Dictionary<IObserver<EntityEvent<T>>, int>();

        public IDisposable Subscribe(IObserver<EntityEvent<T>> observer)
        {
            return new Item(observers, observer);
        }

        public void OnCreated(T value)
        {
            Next(null, value);
        }

        public void OnUpdated(T value, T oldValue)
        {
            Next(oldValue, value);
        }

        public void OnDeleted(T value)
        {
            Next(value, null);
        }


        private void Next(T oldValue, T newValue)
        {
            Next(new EntityEvent<T>(oldValue, newValue));
        }
        private void Next(EntityEvent<T> @event)
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