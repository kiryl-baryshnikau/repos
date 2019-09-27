using BD.MedView.Services.Models;
using System.Collections.Generic;
using System.Linq;

namespace BD.MedView.Services.Services
{
    public interface ISourcesService
    {
        IQueryable<Source> Select(string expand = null);
        Source Read(int id, string expand = null);
    }

    public class SourcesService: ISourcesService
    {
        private readonly IQueryable<Source> Sources = new[] {
                new Source { Id = (int)SourceTypes.Dispensing, Name = SourceTypes.Dispensing.ToString()},
                new Source { Id = (int)SourceTypes.Infusion, Name = SourceTypes.Infusion.ToString()},
                new Source { Id = (int)SourceTypes.Cato, Name = SourceTypes.Cato.ToString()},
                new Source { Id = (int)SourceTypes.MedMined, Name = SourceTypes.MedMined.ToString()},
            }.AsQueryable();

        private readonly IEntitySecurity<Source> security;

        public SourcesService(IEntitySecurity<Source> security)
        {
            this.security = security;
        }

        public IQueryable<Source> Select(string expand = null)
        {
            var entities = Sources
                .AsQueryable()
                .Expand(expand);
            entities = this.security.ValidateSelect(entities, expand);
            var values = entities.Filters(expand).AsQueryable();
            return values;
        }

        public Source Read(int id, string expand = null)
        {
            var entity = Sources
                .AsQueryable()
                .Expand(expand)
                .SingleOrDefault(item => item.Id == id);
            if (entity == null)
            {
                throw new KeyNotFoundException();
            }
            this.security.ValidateRead(entity, expand);
            var value = entity.Filter();
            return value;
        }
    }
}