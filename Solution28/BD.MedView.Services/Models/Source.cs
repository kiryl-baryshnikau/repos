using System.ComponentModel.DataAnnotations;

namespace BD.MedView.Services.Models
{
    public class Source
    {
        [Key]
        public int Id { get; set; }
        [MaxLength(150)]
        public string Name { get; set; }
    }
}