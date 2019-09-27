using BD.MedView.Services.Extensions;
using Common.Logging;
using Microsoft.Extensions.Caching.Distributed;
using System;
using System.Threading;

namespace BD.MedView.Services.Services
{
    public class CacheServiceOptions
    {
        public DateTimeOffset? AbsoluteExpiration { get; set; }
        public TimeSpan? AbsoluteExpirationRelativeToNow { get; set; }
        public TimeSpan? SlidingExpiration { get; set; }
    }

    public interface ICacheService
    {
        string Get(string key);
        void Refresh(string key);
        void Remove(string key);
        void Set(string key, string value, CacheServiceOptions options);
    }

    public interface ICacheSecurity
    {
        void ValidateGet(string key);
        void ValidateRefresh(string key);
        void ValidateRemove(string key);
        void ValidateSet(string key, string value, CacheServiceOptions options);
    }

    public class CacheService : ICacheService
    {
        private readonly ILog log;
        private readonly IDistributedCache context;
        private readonly ICacheSecurity security;

        public CacheService(
            ILog log,
            IDistributedCache context,
            ICacheSecurity security
            )
        {
            this.log = log;
            this.context = context;
            this.security = security;
        }

        public string Get(string key)
        {
            if (key == null)
                throw new ArgumentNullException(nameof(key));

            using (log.Activity(m => m($"Reading Cache[{key}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                using (log.Activity(m => m("Authorization")))
                {
                    try
                    {
                        security.ValidateGet(key);
                    }
                    catch (UnauthorizedAccessException)
                    {
                        log.Warn($"Authorization Denied");
                        throw;
                    }
                    catch (Exception e)
                    {
                        log.Error($"Authorization Error", e);
                        throw;
                    }
                }

                var value = context.GetString(key);

                //TODO: KB: Should we throw key not found or null? We cannot put null back - so it should be key-not-found. Problem in IDistributed Cache: must have TryGet

                log.Info(m => m($"Read Cache[{key}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
                return value;
            }
        }

        public void Refresh(string key)
        {
            if (key == null)
                throw new ArgumentNullException(nameof(key));

            using (log.Activity(m => m($"Refreshing Cache[{key}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                context.Refresh(key);
                log.Info(m => m($"Refreshed Cache[{key}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public void Remove(string key)
        {
            if (key == null)
                throw new ArgumentNullException(nameof(key));

            using (log.Activity(m => m($"Removing Cache[{key}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                using (log.Activity(m => m("Authorization")))
                {
                    try
                    {
                        security.ValidateRemove(key);
                    }
                    catch (UnauthorizedAccessException)
                    {
                        log.Warn($"Authorization Denied");
                        throw;
                    }
                    catch (Exception e)
                    {
                        log.Error($"Authorization Error", e);
                        throw;
                    }
                }

                context.Remove(key);
                log.Info(m => m($"Removed Cache[{key}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public void Set(string key, string value, CacheServiceOptions options)
        {
            if (key == null)
                throw new ArgumentNullException(nameof(key));
            if (value == null)
                throw new ArgumentNullException(nameof(value));
            if (options == null)
                throw new ArgumentNullException(nameof(options));

            using (log.Activity(m => m($"Setting Cache[{key}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                using (log.Activity(m => m("Authorization")))
                {
                    try
                    {
                        security.ValidateSet(key, value, options);
                    }
                    catch (UnauthorizedAccessException)
                    {
                        log.Warn($"Authorization Denied");
                        throw;
                    }
                    catch (Exception e)
                    {
                        log.Error($"Authorization Error", e);
                        throw;
                    }
                }

                context.SetString(key, value, new DistributedCacheEntryOptions
                {
                    AbsoluteExpiration = options?.AbsoluteExpiration,
                    AbsoluteExpirationRelativeToNow = options?.AbsoluteExpirationRelativeToNow,
                    SlidingExpiration = options?.SlidingExpiration,
                });

                log.Info(m => m($"Setted Cache[{key}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }
    }
}