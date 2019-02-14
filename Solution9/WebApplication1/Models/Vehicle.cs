using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Linq;

namespace WebApplication1.Models
{
    public class Vehicle
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public virtual ICollection<PersonVehicle> PersonVehicles { get; set; }
        public ICollection<Person> People
        {
            get
            {
                var ret = new ObservableCollection<Person>(PersonVehicles.Select(item => item.Person));
                ret.CollectionChanged += OnCollectionChanged;
                return ret;
            }
        }

        void OnCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            switch (e.Action)
            {
                case NotifyCollectionChangedAction.Add:
                    e.NewItems.OfType<Person>().ToList().ForEach(person =>
                        PersonVehicles.Add(new PersonVehicle { PersonId = person.Id, Person = person, VehicleId = this.Id, Vehicle = this }));
                    break;
                case NotifyCollectionChangedAction.Remove:
                    e.OldItems.OfType<Person>().ToList().ForEach(person =>
                        PersonVehicles.Where(item => item.PersonId == person.Id).ToList().ForEach(item => PersonVehicles.Remove(item))
                    );
                    break;
                case NotifyCollectionChangedAction.Move:
                case NotifyCollectionChangedAction.Replace:
                case NotifyCollectionChangedAction.Reset:
                    throw new NotImplementedException();
            }
        }

    }
}
