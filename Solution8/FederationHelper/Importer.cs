// Decompiled with JetBrains decompiler
// Type: FederationHelper.Importer
// Assembly: FederationHelper, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null
// MVID: 6CA09CA1-4429-467F-88CF-2FF52FC027F3
// Assembly location: C:\Development\MyWork\HSV\Build\IDMExportImport\FederationHelper\FederationHelper.exe

using Clients.src;
using Newtonsoft.Json.Linq;
using System;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Web.Security;

namespace FederationHelper
{
  internal class Importer : FederationLibrary
  {
    private string stsUrl = (string) null;
    private string apiUrl = (string) null;
    private string clientId = (string) null;
    private string clientSecret = (string) null;

    public Importer(string stsUrl, string apiUrl, string clientId, string clientSecret)
    {
      this.stsUrl = stsUrl;
      this.apiUrl = apiUrl;
      this.clientId = clientId;
      this.clientSecret = clientSecret;
    }

    public void RunImport(string zipName, string idpClientSecret)
    {
      BaseRequest.LogInfo("Importing data...", ConsoleColor.Magenta);
      bool flag = false;
      try
      {
        this.UnzipFiles(zipName);
        flag = this.SendIdentityProviderToApi(this.CreateIdentityProviderJson(this.ValidateOrCreateClientSecret(idpClientSecret)));
      }
      catch (DirectoryNotFoundException ex)
      {
        BaseRequest.LogError(ex.Message, ConsoleColor.Red);
      }
      catch (Exception ex)
      {
        BaseRequest.LogError(ex.ToString(), ConsoleColor.Red);
      }
      FederationLibrary.DeleteContentDirectory();
      if (flag)
        BaseRequest.LogInfo("Import complete.", ConsoleColor.Magenta);
      else
        BaseRequest.LogError("Import failed.", ConsoleColor.Red);
    }

    private string ValidateOrCreateClientSecret(string idpClientSecret)
    {
      if (idpClientSecret != null)
        return idpClientSecret;
      BaseRequest.LogInfo("IdentityProvider ClientSecret not passed in. Generating client secret instead.", ConsoleColor.White);
      return Membership.GeneratePassword(15, 3);
    }

    private JObject CreateIdentityProviderJson(string idpClientSecret)
    {
      JObject jobject = new JObject();
      string str1 = JObject.Parse(this.ReadFile("./Content/identityprovider.json"))["Name"].ToString();
      string str2 = JObject.Parse(this.ReadFile("./Content/openidmetadata.json"))["issuer"].ToString().ToLower() + "/resources";
      jobject.Add("Metadata", (JToken) this.ReadFile("./Content/openidmetadata.json"));
      jobject.Add("CertificateInformation", (JToken) this.ReadFile("./Content/jwks.json"));
      jobject.Add("IdpInitiatedMetadata", (JToken) this.ReadFile("./Content/samlmetadata.xml"));
      jobject.Add("Name", (JToken) str1);
      jobject.Add("AuthType", (JToken) str1);
      jobject.Add("AuthenticationMode", (JToken) "openidconnect");
      jobject.Add("ClientId", (JToken) "HostedIdm");
      jobject.Add("Enabled", (JToken) true);
      jobject.Add("AllowIdpInitiatedSSO", (JToken) true);
      jobject.Add("ButtonText", (JToken) str1);
      jobject.Add("ClientSecret", (JToken) idpClientSecret);
      jobject.Add("IDPType", (JToken) "generic");
      jobject.Add("Priority", (JToken) 1);
      jobject.Add("IsExternal", (JToken) true);
      jobject.Add("Audiences", JToken.FromObject((object) new string[1]
      {
        str2
      }));
      jobject.Add("RequestedScopes", (JToken) "openid profile email offline_access");
      jobject.Add("ResponseType", (JToken) "code id_token token");
      return jobject;
    }

    private bool SendIdentityProviderToApi(JObject identityProvider)
    {
      BaseRequest baseRequest = FederationLibrary.RequestIdentityProviderClient(this.stsUrl, this.apiUrl, this.clientId, this.clientSecret, new string[2]
      {
        "idmconfigapi.access",
        "idmconfigapi.writeidentityproviders"
      });
      if (baseRequest.tokenResponse == null || baseRequest.tokenResponse.IsError)
        return false;
      baseRequest.Create(identityProvider);
      baseRequest.ExecuteRequest();
      if (baseRequest.HttpStatusCode == HttpStatusCode.Created)
      {
        BaseRequest.LogInfo("Identity provider created.", ConsoleColor.Green);
        return true;
      }
      if (baseRequest.HttpStatusCode == HttpStatusCode.NotFound)
        BaseRequest.LogError("Failed to create identity provider. Verify API URL is correct.", ConsoleColor.Red);
      else
        BaseRequest.LogError(string.Format("Failed to create identity provider - {0}: {1}", (object) baseRequest.HttpStatusCode, (object) baseRequest.responsePayload), ConsoleColor.Red);
      return false;
    }

    private string ReadFile(string fileName)
    {
      return System.IO.File.ReadAllText(fileName);
    }

    private void UnzipFiles(string zipName)
    {
      ZipFile.ExtractToDirectory(zipName, "./Content");
    }
  }
}
