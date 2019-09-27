using BD.MedView.Runtime;
using System;
using BD.MedView.Services.Extensions;
using Common.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Configuration;
using Microsoft.Extensions.Options;

namespace BD.MedView.Services.Services
{
    #region Interface
    public interface IAttentionNoticeStatusesTracker : IObserver<EntityEvent<AttentionNoticeStatus>>, IObserver<EntityAccessEvent<AttentionNoticeStatus>>
    {
    }
    #endregion Interface

    #region Options
    public class AttentionNoticeStatusesTrackerOptions
    {
        public TimeSpan Life { get; set; } = new TimeSpan(6, 0, 0, 0);
    }
    #endregion Options

    #region Implementation
    public class AttentionNoticeStatusesTracker : IAttentionNoticeStatusesTracker
    {
        private readonly IOptions<AttentionNoticeStatusesTrackerOptions> options;
        private readonly ILog log;
        private readonly IContext context;

        public AttentionNoticeStatusesTracker(
            IOptions<AttentionNoticeStatusesTrackerOptions> options,
            ILog log,
            IContext context
            )
        {
            this.log = log;
            this.options = options;
            this.context = context;
        }

        #region IObserver<EntityEvent<AttentionNoticeStatus>>
        void IObserver<EntityEvent<AttentionNoticeStatus>>.OnCompleted()
        {
        }

        void IObserver<EntityEvent<AttentionNoticeStatus>>.OnError(Exception error)
        {
        }

        void IObserver<EntityEvent<AttentionNoticeStatus>>.OnNext(EntityEvent<AttentionNoticeStatus> value)
        {
            using (log.Activity(m => m($"Processing {nameof(EntityEvent<AttentionNoticeStatus>)} event")))
            {
                if (value.OldValue == null && value.NewValue != null)
                {
                    OnCreated(value.NewValue);
                }
                else if (value.OldValue != null && value.NewValue != null)
                {
                    OnUpdated(value.NewValue, value.OldValue);
                }
                else if (value.OldValue != null && value.NewValue == null)
                {
                    OnDeleted(value.OldValue);
                }
                else
                {
                    log.Trace(m => m($"{nameof(EntityEvent<Facility.Facility>)} event is ignored"));
                }
            }
        }
        #endregion

        #region IObserver<EntityAccessEvent<AttentionNoticeStatus>>
        void IObserver<EntityAccessEvent<AttentionNoticeStatus>>.OnError(Exception error)
        {
        }
        void IObserver<EntityAccessEvent<AttentionNoticeStatus>>.OnCompleted()
        {
        }
        void IObserver<EntityAccessEvent<AttentionNoticeStatus>>.OnNext(EntityAccessEvent<AttentionNoticeStatus> value)
        {
            using (log.Activity(m => m($"Processing {nameof(EntityAccessEvent<AttentionNoticeStatus>)} event")))
            {
                if (value.Values != null)
                {
                    OnSelected(value.Values);
                }
                else if (value != null)
                {
                    OnReaded(value.Value);
                }
                else
                {
                    throw new Exception("Impossible case");
                }
            }
        }
        #endregion

        private void OnCreated(AttentionNoticeStatus value)
        {
            using (log.Activity(m => m($"Execute {nameof(OnCreated)} for {nameof(AttentionNoticeStatus)}[{value.Id}]")))
            {
                Ensure(value);
            }
        }
        private void OnUpdated(AttentionNoticeStatus value, AttentionNoticeStatus original)
        {
            using (log.Activity(m => m($"Execute {nameof(OnUpdated)} for {nameof(AttentionNoticeStatus)}[{value.Id}]")))
            {
                Ensure(value);
            }
        }
        private void OnDeleted(AttentionNoticeStatus value)
        {
            using (log.Activity(m => m($"Execute {nameof(OnDeleted)} for {nameof(AttentionNoticeStatus)}[{value.Id}]")))
            {
                log.Info($"Delete {nameof(AttentionNoticeStatusTracker)} for {nameof(AttentionNoticeStatus)}[{value.Id}] ignored. Expected Cascade Delete");
            }
        }

        private void OnSelected(List<AttentionNoticeStatus> values)
        {
            using (log.Activity(m => m($"Execute {nameof(OnSelected)} for {nameof(AttentionNoticeStatus)}[{string.Join(",", values.Select(item => item.Id))}]")))
            {
                var ids = values.Select(item => item.Id).ToList();

                var entities = null as List<AttentionNoticeStatusTracker>;
                using (log.Activity(m => m($"Load {nameof(AttentionNoticeStatusTracker)} for {nameof(AttentionNoticeStatus)}[{string.Join(",", ids)}]")))
                {
                    entities = context.AttentionNoticeStatusTrackers.Where(item => ids.Contains(item.Id)).ToList();
                    log.Trace($"Loaded {nameof(AttentionNoticeStatusTracker)}[{string.Join(",", entities.Select(item => item.Id))}] for {nameof(AttentionNoticeStatus)}[{string.Join(",", ids)}]");
                }

                try
                {
                    foreach (var entity in entities)
                    {
                        using (log.Activity(m => m($"Update {nameof(AttentionNoticeStatusTracker)}[{entity.Id}] for {nameof(AttentionNoticeStatus)}[{entity.Id}]")))
                        {
                            entity.ValidThrough = DateTime.Now + options.Value.Life;
                        }
                    }

                    foreach (var id in ids.Except(entities.Select(item => item.Id)))
                    {
                        context.AttentionNoticeStatusTrackers.Add(new AttentionNoticeStatusTracker
                        {
                            Id = id,
                            ValidThrough = DateTime.Now + options.Value.Life
                        });
                    }

                    context.SaveChanges();
                }
                catch (Exception e)
                {
                    log.Error($"Execute {nameof(OnSelected)} for {nameof(AttentionNoticeStatus)}[{string.Join(",", values.Select(item => item.Id))}] Error", e);
                    throw;
                }

                log.Info($"Executed {nameof(OnSelected)} for {nameof(AttentionNoticeStatus)}[{string.Join(",", values.Select(item => item.Id))}]");
            }
        }
        private void OnReaded(AttentionNoticeStatus value)
        {
            using (log.Activity(m => m($"Execute {nameof(OnReaded)} for {nameof(AttentionNoticeStatus)}[{value.Id}]")))
            {
                Ensure(value);
            }
        }

        private void Ensure(AttentionNoticeStatus value)
        {
            using (log.Activity(m => m($"Execute {nameof(Ensure)} for {nameof(AttentionNoticeStatus)}[{value.Id}]")))
            {
                var entity = null as AttentionNoticeStatusTracker;
                using (log.Activity(m => m($"Read {nameof(AttentionNoticeStatusTracker)} for {nameof(AttentionNoticeStatus)}[{value.Id}]")))
                {
                    entity = context.AttentionNoticeStatusTrackers.SingleOrDefault(item => item.Id == value.Id);
                }

                if (entity == null)
                {
                    using (log.Activity(m => m($"Create {nameof(AttentionNoticeStatusTracker)} for {nameof(AttentionNoticeStatus)}[{value.Id}]")))
                    {
                        try
                        {
                            entity = context.AttentionNoticeStatusTrackers.Add(new AttentionNoticeStatusTracker
                            {
                                Id = value.Id,
                                ValidThrough = DateTime.Now + options.Value.Life
                            });
                            context.SaveChanges();
                        }
                        catch (Exception e)
                        {
                            log.Error($"Create {nameof(AttentionNoticeStatusTracker)} for {nameof(AttentionNoticeStatus)}[{value.Id}] Error", e);
                            throw;
                        }
                    }
                }
                else
                {
                    using (log.Activity(m => m($"Update {nameof(AttentionNoticeStatusTracker)}[{value.Id}] for {nameof(AttentionNoticeStatus)}[{value.Id}]")))
                    {
                        try
                        {
                            entity.ValidThrough = DateTime.Now + options.Value.Life;
                            context.SaveChanges();
                        }
                        catch (Exception e)
                        {
                            log.Error($"Update {nameof(AttentionNoticeStatusTracker)}[{entity.Id}] for {nameof(AttentionNoticeStatus)}[{value.Id}] Error", e);
                            throw;
                        }
                    }
                }

                log.Info($"Ensured {nameof(AttentionNoticeStatusTracker)}[{entity.Id}] for {nameof(AttentionNoticeStatus)}[{value.Id}]");
            }
        }
    }
    #endregion Implementation
}