// Decompiled with JetBrains decompiler
// Type: FederationHelper.Exporter
// Assembly: FederationHelper, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null
// MVID: 6CA09CA1-4429-467F-88CF-2FF52FC027F3
// Assembly location: C:\Development\MyWork\HSV\Build\IDMExportImport\FederationHelper\FederationHelper.exe

using Clients.src;
using Newtonsoft.Json.Linq;
using System;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Net.Http;

namespace FederationHelper
{
  internal class Exporter : FederationLibrary
  {
    private string stsUrl = (string) null;
    private string apiUrl = (string) null;
    private string clientId = (string) null;
    private string clientSecret = (string) null;
    private string audience = (string) null;

    public Exporter(string stsUrl, string apiUrl, string clientId, string clientSecret)
    {
      this.stsUrl = stsUrl;
      this.apiUrl = apiUrl;
      this.clientId = clientId;
      this.clientSecret = clientSecret;
    }

    public void RunExport(string zipName)
    {
      BaseRequest.LogInfo("Exporting data...", ConsoleColor.Magenta);
      Exporter.MakeContentDirectory();
      try
      {
        if (this.RetrieveAndStoreMetadata() && this.RetrieveAndStoreJwks() && this.RetrieveAndStoreSamlMetadata() && this.RetreiveAndStoreIdentityProviderInformation())
        //if (this.RetrieveAndStoreMetadata() && this.RetrieveAndStoreJwks() && this.RetrieveAndStoreSamlMetadata()) && this.RetreiveAndStoreIdentityProviderInformation())
        {
          Exporter.ZipContentDirectory(zipName);
          FederationLibrary.DeleteContentDirectory();
          BaseRequest.LogInfo("Export complete.", ConsoleColor.Magenta);
          return;
        }
      }
      catch (Exception ex)
      {
        BaseRequest.LogError(ex.ToString(), ConsoleColor.Red);
      }
      FederationLibrary.DeleteContentDirectory();
      BaseRequest.LogError("Export failed.", ConsoleColor.Red);
    }

    private bool RetrieveAndStoreMetadata()
    {
      Uri endpoint = new Uri(this.stsUrl + "/.well-known/openid-configuration");
      BaseRequest.LogInfo("Attempting to retrieve openid metadata...", ConsoleColor.White);
      return this.RetrieveAndStoreDataFromEndpoint(endpoint, "openidmetadata.json");
    }

    private bool RetrieveAndStoreJwks()
    {
      Uri endpoint = new Uri(this.stsUrl + "/.well-known/jwks");
      BaseRequest.LogInfo("Attempting to retrieve jwks data...", ConsoleColor.White);
      return this.RetrieveAndStoreDataFromEndpoint(endpoint, "jwks.json");
    }

    private bool RetrieveAndStoreSamlMetadata()
    {
      Uri endpoint = new Uri(this.stsUrl + "/.well-known/saml-configuration");
      BaseRequest.LogInfo("Attempting to retrieve saml metadata...", ConsoleColor.White);
      return this.RetrieveAndStoreDataFromEndpoint(endpoint, "samlmetadata.xml");
    }

    private bool RetreiveAndStoreIdentityProviderInformation()
    {
            BaseRequest.verbose = true;

            BaseRequest baseRequest = FederationLibrary.RequestIdentityProviderClient(this.stsUrl, this.apiUrl, this.clientId, this.clientSecret, new string[2]
      {
        "idmconfigapi.access",
        "idmconfigapi.readidentityproviders"
      });


      if (baseRequest.tokenResponse == null || baseRequest.tokenResponse.IsError)
        return false;
      baseRequest.GetAll((string[]) null, (string[]) null);
      baseRequest.ExecuteRequest();
      JArray jarray = JObject.Parse(baseRequest.responsePayload)["resources"].ToObject<JArray>();
      JObject jobject = (JObject) null;
      foreach (JToken jtoken in jarray)
      {
        jobject = jtoken.ToObject<JObject>();
        if (jobject["AuthenticationMode"].ToString().Equals("local", StringComparison.InvariantCultureIgnoreCase))
          break;
      }
      Exporter.WriteToFile("identityprovider.json", new JObject()
      {
        {
          "Name",
          jobject["Name"]
        }
      }.ToString());
      return true;
    }

    private bool RetrieveAndStoreDataFromEndpoint(Uri endpoint, string fileName)
    {
      bool flag = false;
      using (HttpClient httpClient = new HttpClient())
      {
        HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, endpoint);
        try
        {
          BaseRequest.LogInfo("Requested URL: " + endpoint.AbsoluteUri, ConsoleColor.White);
          HttpResponseMessage result1 = httpClient.SendAsync(request).Result;
          string result2 = result1.Content.ReadAsStringAsync().Result;
          if (result1.StatusCode == HttpStatusCode.NotFound)
            BaseRequest.LogError("Unable to reach endpoint. Verify URL is correct.", ConsoleColor.Red);
          else if (!string.IsNullOrEmpty(result2))
          {
            BaseRequest.LogInfo("Data receieved.", ConsoleColor.Green);
            Exporter.WriteToFile(fileName, result2);
            flag = true;
          }
        }
        catch (Exception ex)
        {
          BaseRequest.LogError(ex.ToString(), ConsoleColor.Red);
        }
      }
      return flag;
    }

    private static void WriteToFile(string filename, string data)
    {
      BaseRequest.LogInfo("Saving data...", ConsoleColor.White);
      System.IO.File.WriteAllText("./Content/" + filename, data);
      BaseRequest.LogInfo("Data saved.", ConsoleColor.Green);
    }

    private static void ZipContentDirectory(string zipName)
    {
      if (System.IO.File.Exists(zipName))
      {
        BaseRequest.LogWarning(zipName + " already exists. Replacing...", ConsoleColor.Yellow);
        System.IO.File.Delete(zipName);
      }
      BaseRequest.LogInfo("Zipping contents...", ConsoleColor.White);
      ZipFile.CreateFromDirectory("./Content", zipName);
      BaseRequest.LogInfo(zipName + " has been created.", ConsoleColor.Green);
    }

    private static void MakeContentDirectory()
    {
      if (Directory.Exists("./Content"))
        return;
      Directory.CreateDirectory("./Content");
    }
  }
}
