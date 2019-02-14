namespace WebApplication1.Models
{
    public class PersonVehicle
    {
        public int PersonId { get; set; }
        public virtual Person Person { get; set; }

        public int VehicleId { get; set; }
        public virtual Vehicle Vehicle { get; set; }
    }
}
