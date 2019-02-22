// Decompiled with JetBrains decompiler
// Type: FederationHelper.Program
// Assembly: FederationHelper, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null
// MVID: 6CA09CA1-4429-467F-88CF-2FF52FC027F3
// Assembly location: C:\Development\MyWork\HSV\Build\IDMExportImport\FederationHelper\FederationHelper.exe

using Clients.src;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;

namespace FederationHelper
{
  internal class Program : FederationLibrary
  {
    protected static readonly string stsUrl = ConfigurationManager.AppSettings["StsUrl"];
    protected static readonly string apiUrl = ConfigurationManager.AppSettings["ApiUrl"];
    protected static readonly string clientId = ConfigurationManager.AppSettings["ClientName"];
    protected static readonly string clientSecret = ConfigurationManager.AppSettings["ClientSecret"];

    private static void Main(string[] args)
    {
      BaseRequest.verbose = true;
      if (args.Length == 0 || args[0].ToLower().Equals("-help"))
      {
        Program.PrintHelp();
      }
      else
      {
        if (!Program.ValidateAppConfigValues())
          return;
        List<string> args1 = new List<string>((IEnumerable<string>) args);
        if (((IEnumerable<string>) args).Count<string>() < 2)
        {
          BaseRequest.LogError("Missing arguments. See -help for more information", ConsoleColor.Red);
        }
        else
        {
          if (((IEnumerable<string>) args).Contains<string>("-import"))
          {
            string zipName = Program.RetrieveZipname(args1, "-import");
            if (zipName == null)
              return;
            string flagValue = Program.GetFlagValue(args1, "-idpclientsecret");
            new Importer(Program.stsUrl, Program.apiUrl, Program.clientId, Program.clientSecret).RunImport(zipName, flagValue);
          }
          else if (((IEnumerable<string>) args).Contains<string>("-export"))
          {
            string zipName = Program.RetrieveZipname(args1, "-export");
            if (zipName == null)
              return;
            new Exporter(Program.stsUrl, Program.apiUrl, Program.clientId, Program.clientSecret).RunExport(zipName);
          }
          else
            BaseRequest.LogError("Application requires either -import or -export flags to be set", ConsoleColor.Red);
          Console.ForegroundColor = ConsoleColor.Gray;
        }
      }
    }

    private static string GetFlagValue(List<string> args, string flag)
    {
      int index1 = args.FindIndex((Predicate<string>) (x => x == flag));
      int index2 = index1 + 1;
      if (index1 != -1 && args.Count<string>() > index2)
        return args[index2];
      return (string) null;
    }

    private static string RetrieveZipname(List<string> args, string flag)
    {
      string flagValue = Program.GetFlagValue(args, flag);
      if (flagValue == null)
        BaseRequest.LogError("Missing .zip filename", ConsoleColor.Red);
      else if (flagValue != null && !flagValue.EndsWith(".zip"))
        flagValue += ".zip";
      return flagValue;
    }

    private static bool ValidateAppConfigValues()
    {
      if (!string.IsNullOrWhiteSpace(Program.apiUrl) && !string.IsNullOrWhiteSpace(Program.stsUrl) && !string.IsNullOrWhiteSpace(Program.clientId) && !string.IsNullOrWhiteSpace(Program.clientSecret))
        return true;
      BaseRequest.LogError("Not all app.config settings are set.", ConsoleColor.Red);
      return false;
    }

    private static void PrintHelp()
    {
      Console.WriteLine("IDM Federation Helper");
      Console.WriteLine("---------------------");
      Console.WriteLine("The IDM Federation Helper allows a user to easily export and import IDM configuration data.");
      Console.WriteLine("");
      Console.WriteLine("Exporting: Exporting will retrieve all of the needed information from the IDM instance, and create a zip.");
      Console.WriteLine("Importing: Importing will take all of the information in the specified zip and import it into the IDM instance.");
      Console.WriteLine();
      Console.WriteLine("Flags");
      Console.WriteLine("-------");
      Console.WriteLine("-import");
      Console.WriteLine("-idpclientsecret <secret>: (OPTIONAL) Specifiy a client secret for this identity provider. If none is passed in, one will be generated");
      Console.WriteLine("-export");
      Console.WriteLine("<fileName>: The name of the output/input .zip file (extension is not required)");
      Console.WriteLine("");
      Console.WriteLine("Example Commands");
      Console.WriteLine("----------------");
      Console.WriteLine("FederationHelper.exe -export <fileName>");
      Console.WriteLine("FederationHelper.exe -import <fileName>");
      Console.WriteLine("");
    }
  }
}
