using System;
using System.Data.Entity;

namespace BD.MedView.Runtime
{
    public interface IContext : IDisposable
    {
        IDbSet<AttentionNoticeStatus> AttentionNoticeStatuses { get; set; }
        IDbSet<LastActiveRoute> LastActiveRoutes { get; set; }
        IDbSet<AttentionNoticeStatusTracker> AttentionNoticeStatusTrackers { get; set; }

        int SaveChanges();
    }
}
