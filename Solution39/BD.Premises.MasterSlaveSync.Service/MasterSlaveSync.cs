using Microsoft.Web.Administration;
using System;
using System.IO;
using System.Timers;

namespace BD.Premises.MasterSlaveSync.Service
{
    public class MasterSlaveSyncOptions {
        public string AppPoolName { get; set; }
        public string MasterPath { get; set; }
        public string SlavePath { get; set; }
        //milliseconds...
        public double TimerInterval { get; set; }

    }
    class MasterSlaveSync
    {
        private const string indexSubDirectoryPath = "App_Data/Index";
        public static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        private readonly MasterSlaveSyncOptions options;
        private readonly Timer timer;

        public MasterSlaveSync(MasterSlaveSyncOptions options)
        {
            this.options = options;
            timer = new Timer(options.TimerInterval)
            {
                AutoReset = true,
                Enabled = false
            };
            timer.Elapsed += OnTimedEvent;
        }
        public void Start()
        {
            log.Info("Starting");
            this.timer.Start();
            log.Info("Started");
        }

        public void Stop()
        {
            log.Info("Stopping");
            this.timer.Stop();
            log.Info("Stopped");
        }

        private object _lock = new object();
        private void OnTimedEvent(Object source, ElapsedEventArgs e)
        {
            try
            {
                log.Info($"Synching timer elapsed at {DateTime.Now}");
                lock (_lock)
                {
                    using (var serviceManager = new ServerManager())
                    {
                        var appPool = serviceManager.ApplicationPools[options.AppPoolName];
                        if (appPool != null && appPool.State == ObjectState.Started)
                        {
                            log.Info($"Synching service at {DateTime.Now}");
                            
                            try
                            {
                                log.Debug("Stopping app pool");
                                appPool.Stop();
                                log.Debug("Stopped app pool");
                            }
                            catch (Exception ex)
                            {
                                log.Error("Cannot stop app pool", ex);
                            }

                            try
                            {
                                log.Debug("Waiting untill app pool fully stops");
                                while (appPool.State != ObjectState.Stopped)
                                {
                                    System.Threading.Thread.Sleep(100);
                                }
                                log.Debug("Waited untill app pool fully stops");
                            }
                            catch (Exception ex)
                            {
                                log.Error("Cannot wait untill app pool stop", ex);
                            }

                            try
                            {
                                var materIndexPath = Path.Combine(options.MasterPath, indexSubDirectoryPath);
                                var slaveIndexPath = Path.Combine(options.SlavePath, indexSubDirectoryPath);
                                if (Directory.Exists(slaveIndexPath))
                                {

                                    log.Debug("Deleting slave Index directory");
                                    Directory.Delete(slaveIndexPath, true);
                                    log.Debug("Deleted Slave Index directory");
                                }
                                else
                                {
                                    log.Debug("Slave Index directory does not exists: " + slaveIndexPath);
                                }

                                if (Directory.Exists(materIndexPath))
                                {
                                    log.Debug("Copy-ing master Index directory to Slave");
                                    CopyFolder(materIndexPath, slaveIndexPath);
                                    log.Debug("Copy-ed master Index directory to Slave");
                                }
                                else
                                {
                                    log.Debug("Master Index directory does not exists: " + slaveIndexPath);
                                }
                            }
                            catch (Exception ex)
                            {
                                log.Error("Cannot copy files", ex);
                            }

                            try
                            {
                                log.Debug("Starting app pool");
                                appPool.Start();
                                log.Debug("Starting app pool");
                            }
                            catch (Exception ex)
                            {
                                log.Error("Cannot start app pool", ex);
                            }
                            log.Info($"Synched service at {DateTime.Now}");
                        }
                        else
                        {
                            log.Info($"Synch ignored: " + (appPool == null ? $"app pool {options.AppPoolName} is not found" : $"app pool {options.AppPoolName} is not started"));
                        }
                    }
                }
                log.Info($"Synching timer elapse processed at {DateTime.Now}");
            }
            catch (Exception ex)
            {
                log.Error($"Synching timer elapse faled  at {DateTime.Now}", ex);
            }
        }

        static public void CopyFolder(string sourceFolder, string destFolder)
        {
            if (!Directory.Exists(destFolder))
                Directory.CreateDirectory(destFolder);
            string[] files = Directory.GetFiles(sourceFolder);
            foreach (string file in files)
            {
                string name = Path.GetFileName(file);
                string dest = Path.Combine(destFolder, name);
                File.Copy(file, dest);
            }
            string[] folders = Directory.GetDirectories(sourceFolder);
            foreach (string folder in folders)
            {
                string name = Path.GetFileName(folder);
                string dest = Path.Combine(destFolder, name);
                CopyFolder(folder, dest);
            }
        }
    }
}
