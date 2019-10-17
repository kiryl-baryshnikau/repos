using System;
using System.Configuration;
using System.Threading;
using Topshelf;

namespace BD.Premises.MasterSlaveSync.Service
{
    static class Program
    {
        public static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        static void Main(string[] args)
        {
            var options = new MasterSlaveSyncOptions
            {
                AppPoolName = ConfigurationManager.AppSettings["AppplicatonPool.Name"],
                MasterPath = ConfigurationManager.AppSettings["Master.Path"],
                SlavePath = ConfigurationManager.AppSettings["Slave.Path"],
                TimerInterval = Convert.ToDouble(ConfigurationManager.AppSettings["Timer.Interval"])
            };

            var rc = HostFactory.Run(x =>
            {
                x.Service<MasterSlaveSync>(s =>
                {
                    s.ConstructUsing(name => new MasterSlaveSync(options));
                    s.WhenStarted(mss => mss.Start());
                    s.WhenStopped(mss => mss.Stop());
                });
                x.RunAsLocalSystem();

                x.SetDescription("HSV Master Slave Sync synchronizes original data providers (masters) with cloned data providers (slaves).");
                x.SetDisplayName("HSV Master Slave Sync");
                x.SetServiceName("HSVMasterSlaveSync");
            });

            var exitCode = (int)Convert.ChangeType(rc, rc.GetTypeCode());
            Environment.ExitCode = exitCode;
        }
    }
}
