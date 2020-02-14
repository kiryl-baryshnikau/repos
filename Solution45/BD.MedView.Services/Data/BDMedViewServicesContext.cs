using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BD.MedView.Services.Models;

namespace BD.MedView.Services.Data
{
    public class BDMedViewServicesContext : DbContext
    {
        public BDMedViewServicesContext (DbContextOptions<BDMedViewServicesContext> options)
            : base(options)
        {
        }

        public DbSet<BD.MedView.Services.Models.Role> Role { get; set; }
    }
}
