using System;
using System.Collections.Generic;

namespace BD.MedView.Services.Services
{
    public interface IEntityAccessEmitter<T> where T : class
    {
        IDisposable Subscribe(IObserver<EntityAccessEvent<T>> observer);
        void OnReaded(T value);
        void OnSelected(List<T> values);
    }

    public class EntityAccessEmitter<T> : IEntityAccessEmitter<T> where T : class
    {
        private class Item : IDisposable
        {
            private readonly IObserver<EntityAccessEvent<T>> observer;
            private readonly Dictionary<IObserver<EntityAccessEvent<T>>, int> observers;

            public Item(Dictionary<IObserver<EntityAccessEvent<T>>, int> observers, IObserver<EntityAccessEvent<T>> observer)
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

        private Dictionary<IObserver<EntityAccessEvent<T>>, int> observers = new Dictionary<IObserver<EntityAccessEvent<T>>, int>();

        public IDisposable Subscribe(IObserver<EntityAccessEvent<T>> observer)
        {
            return new Item(observers, observer);
        }

        public void OnReaded(T value)
        {
            Next(value);
        }
        public void OnSelected(List<T> values)
        {
            Next(values);
        }

        private void Next(T value)
        {
            Next(new EntityAccessEvent<T>(value));
        }
        private void Next(List<T> values)
        {
            Next(new EntityAccessEvent<T>(values));
        }
        private void Next(EntityAccessEvent<T> @event)
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