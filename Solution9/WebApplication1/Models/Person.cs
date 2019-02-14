using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Linq;

namespace WebApplication1.Models
{
    public class Person
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public virtual ICollection<PersonVehicle> PersonVehicles { get; set; }
        public ICollection<Vehicle> Vehicles
        {
            get
            {
                var ret = new ObservableCollection<Vehicle>(PersonVehicles.Select(item => item.Vehicle));
                ret.CollectionChanged += OnCollectionChanged;
                return ret;
            }
        }

        void OnCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            switch (e.Action)
            {
                case NotifyCollectionChangedAction.Add:
                    e.NewItems.OfType<Vehicle>().ToList().ForEach(vehicle =>
                        PersonVehicles.Add(new PersonVehicle { PersonId = this.Id, Person = this, VehicleId = vehicle.Id, Vehicle = vehicle }));
                    break;
                case NotifyCollectionChangedAction.Remove:
                    e.OldItems.OfType<Vehicle>().ToList().ForEach(vehicle =>
                        PersonVehicles.Where(item => item.VehicleId == vehicle.Id).ToList().ForEach(item => PersonVehicles.Remove(item))
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
