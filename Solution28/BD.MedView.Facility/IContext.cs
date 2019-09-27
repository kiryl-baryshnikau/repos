using System.Data.Entity;
using BD.MedView.Facility;
using System;

namespace BD.MedView.Facility
{
    public interface IContext: IDisposable
    {
        IDbSet<Facility> Facilities { get; set; }
        IDbSet<Unit> Units { get; set; }
        IDbSet<Idn> Idns { get; set; }
        IDbSet<Provider> Providers { get; set; }
        IDbSet<Synonym> Synonyms { get; set; }
        IDbSet<Root> Roots { get; set; }
        IDbSet<KeyType> KeyTypes { get; set; }
        IDbSet<Element> Elements { get; set; }

        int SaveChanges();
    }
}
