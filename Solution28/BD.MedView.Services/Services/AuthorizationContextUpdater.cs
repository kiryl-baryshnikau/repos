using BD.MedView.Services.Extensions;
using Common.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace BD.MedView.Services.Services
{
    public interface IAuthorizationContextUpdater : IObserver<EntityEvent<Facility.Facility>>
    {
    }

    public class AuthorizationContextUpdater : IAuthorizationContextUpdater
    {
        private readonly ILog log;
        private readonly Authorization.IContext context;

        public AuthorizationContextUpdater(
            ILog log,
            Authorization.IContext authorizationContext
            )
        {
            this.log = log;
            this.context = authorizationContext;
        }

        #region IObserver<EntityEvent<Facility.Facility>>
        void IObserver<EntityEvent<Facility.Facility>>.OnCompleted()
        {
        }

        void IObserver<EntityEvent<Facility.Facility>>.OnError(Exception error)
        {
        }

        void IObserver<EntityEvent<Facility.Facility>>.OnNext(EntityEvent<Facility.Facility> value)
        {
            using (log.Activity(m => m($"Processing {nameof(EntityEvent<Facility.Facility>)} event")))
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

        private void OnCreated(Facility.Facility value)
        {
            using (log.Activity(m => m($"Execute {nameof(OnCreated)} for {nameof(Facility.Facility)}[{value.Id}]")))
            {
                var realm = null as Authorization.Realm;
                using (log.Activity(m => m($"Define {nameof(Authorization.Realm)} for {nameof(Facility.Facility)}[{value.Id}]")))
                {
                    realm = new Authorization.Realm
                    {
                        Name = value.Name,
                        ParentId = 1,
                        Claims = new List<Authorization.RealmClaim>
                        {
                            new Authorization.RealmClaim
                            {
                                Issuer = "BD.MedView.Facility",
                                OriginalIssuer = "BD.MedView.Facility",
                                Subject = "Harness",
                                Type = "Provider.Id",
                                Value = value.Id.ToString(),
                                ValueType = "Int32"
                            }
                        },
                        Roles = new List<Authorization.Role>
                        {
                            new Authorization.Role {
                                Name = "BD.MedView.Web.Admin",
                                Permissions = context.Roles.Where( item => item.RealmId == 1 && item.Name == "BD.MedView.Web.Admin").SelectMany(item => item.Permissions).ToList()
                            },
                            new Authorization.Role {
                                Name = "BD.MedView.Web.Clinician",
                                Permissions = context.Roles.Where( item => item.RealmId == 1 && item.Name == "BD.MedView.Web.Clinician").SelectMany(item => item.Permissions).ToList()
                            },
                            new Authorization.Role {
                                Name = "BD.MedView.Web.Pharmacist",
                                Permissions = context.Roles.Where( item => item.RealmId == 1 && item.Name == "BD.MedView.Web.Pharmacist").SelectMany(item => item.Permissions).ToList()
                            },
                            new Authorization.Role {
                                Name = "BD.MedView.Web.ClinicalPharmacist",
                                Permissions = context.Roles.Where( item => item.RealmId == 1 && item.Name == "BD.MedView.Web.ClinicalPharmacist").SelectMany(item => item.Permissions).ToList()
                            },
                            new Authorization.Role {
                                Name = "BD.MedView.Web.Technician",
                                Permissions = context.Roles.Where( item => item.RealmId == 1 && item.Name == "BD.MedView.Web.Technician").SelectMany(item => item.Permissions).ToList()
                            }

                        }
                    };
                }

                var entity = null as Authorization.Realm;
                using (log.Activity(m => m($"Create {nameof(Authorization.Realm)} for {nameof(Facility.Facility)}[{value.Id}]")))
                {
                    try
                    {
                        entity = context.Realms.Add(realm);
                        context.SaveChanges();
                    }
                    catch (Exception e)
                    {
                        log.Error($"Create {nameof(Authorization.Realm)} for {nameof(Facility.Facility)}[{value.Id}] Error", e);
                        throw;
                    }
                }

                log.Info($"Created {nameof(Authorization.Realm)}[{entity.Id}] for {nameof(Facility.Facility)}[{value.Id}]");
            }
        }
        private void OnUpdated(Facility.Facility value, Facility.Facility original)
        {
            using (log.Activity(m => m($"Execute {nameof(OnUpdated)} for {nameof(Facility.Facility)}[{value.Id}]")))
            {
                var realm = null as Authorization.Realm;
                using (log.Activity(m => m($"Read {nameof(Authorization.Realm)} for {nameof(Facility.Facility)}[{value.Id}]")))
                {
                    var idPattern = value.Id.ToString();
                    realm = context.Realms
                        .FirstOrDefault(item => item.Claims.Any(claim =>
                        claim.Issuer == "BD.MedView.Facility"
                        && claim.OriginalIssuer == "BD.MedView.Facility"
                        && claim.Subject == "Harness"
                        && claim.Type == "Provider.Id"
                        && claim.Value == idPattern
                        && claim.ValueType == "Int32"));
                }

                if (realm == null)
                {
                    log.Warn($"Update {nameof(Authorization.Realm)} for {nameof(Facility.Facility)}[{value.Id}] Ignore: {nameof(Authorization.Realm)} is not found");
                    return;
                }

                using (log.Activity(m => m($"Update {nameof(Authorization.Realm)}[{realm.Id}] for {nameof(Facility.Facility)}[{value.Id}]")))
                {
                    try
                    {
                        realm.Name = value.Name;
                        context.SaveChanges();
                    }
                    //TODO: KB: Do this on index validation
                    //throw new DuplicateKeyException(value.Name)
                    catch (Exception e)
                    {
                        log.Error($"Update {nameof(Authorization.Realm)}[{realm.Id}] for {nameof(Facility.Facility)}[{value.Id}] Error", e);
                        throw;
                    }
                }

                log.Info($"Updated {nameof(Authorization.Realm)}[{realm.Id}] for {nameof(Facility.Facility)}[{value.Id}]");
            }
        }

        private void OnDeleted(Facility.Facility value)
        {
            using (log.Activity(m => m($"Execute {nameof(OnDeleted)} for {nameof(Facility.Facility)}[{value.Id}]")))
            {
                var realm = null as Authorization.Realm;
                using (log.Activity(m => m($"Read {nameof(Authorization.Realm)} for {nameof(Facility.Facility)}[{value.Id}]")))
                {
                    var idPattern = value.Id.ToString();
                    realm = context.Realms
                        .FirstOrDefault(item => item.Claims.Any(claim =>
                        claim.Issuer == "BD.MedView.Facility"
                        && claim.OriginalIssuer == "BD.MedView.Facility"
                        && claim.Subject == "Harness"
                        && claim.Type == "Provider.Id"
                        && claim.Value == idPattern
                        && claim.ValueType == "Int32"));
                }

                if (realm == null)
                {
                    log.Warn($"Delete {nameof(Authorization.Realm)} for {nameof(Facility.Facility)}[{value.Id}] Ignore: {nameof(Authorization.Realm)} is not found");
                    return;
                }

                using (log.Activity(m => m($"Delete {nameof(Authorization.Realm)}[{realm.Id}] for {nameof(Facility.Facility)}[{value.Id}]")))
                {
                    try
                    {
                        context.Realms.Remove(realm);
                        context.SaveChanges();
                    }
                    catch (Exception e)
                    {
                        log.Error($"Delete {nameof(Authorization.Realm)}[{realm.Id}] for {nameof(Facility.Facility)}[{value.Id}] Error", e);
                        throw;
                    }
                }

                log.Info($"Delete {nameof(Authorization.Realm)}[{realm.Id}] for {nameof(Facility.Facility)}[{value.Id}]");
            }
        }
    }
}