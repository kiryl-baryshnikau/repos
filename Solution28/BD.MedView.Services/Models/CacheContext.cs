using Microsoft.Extensions.Caching.SqlServer;
using Microsoft.Extensions.Options;

namespace BD.MedView.Services.Models
{
    public class CacheContext : Sql​Server​Cache
    {
        public CacheContext(IOptions<SqlServerCacheOptions> options) : base(options.Value)
        {
        }
    }
}