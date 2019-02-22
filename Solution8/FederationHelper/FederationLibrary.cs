// Decompiled with JetBrains decompiler
// Type: FederationHelper.FederationLibrary
// Assembly: FederationHelper, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null
// MVID: 6CA09CA1-4429-467F-88CF-2FF52FC027F3
// Assembly location: C:\Development\MyWork\HSV\Build\IDMExportImport\FederationHelper\FederationHelper.exe

using Clients.src;
using System.Collections.Generic;
using System.IO;

namespace FederationHelper
{
  internal abstract class FederationLibrary
  {
    internal static BaseRequest RequestIdentityProviderClient(string stsUrl, string apiUrl, string clientId, string clientSecret, string[] scopes)
    {
      BaseRequest baseRequest = (BaseRequest) new IdentityProviderClient(apiUrl);
      baseRequest.tokenResponse = BaseRequest.RequestToken(stsUrl, clientId, clientSecret, (IEnumerable<string>) scopes);
      return baseRequest;
    }

    internal static void DeleteContentDirectory()
    {
      if (!Directory.Exists("./Content"))
        return;
      string[] files = Directory.GetFiles("./Content");
      Directory.GetDirectories("./Content");
      foreach (string path in files)
      {
        File.SetAttributes(path, FileAttributes.Normal);
        File.Delete(path);
      }
      Directory.Delete("./Content", false);
    }

    internal class Constants
    {
      public const string OpenIdMetadata = "openidmetadata.json";
      public const string Jwks = "jwks.json";
      public const string SamlMetadata = "samlmetadata.xml";
      public const string IdentityProvider = "identityprovider.json";
      public const string ContentDirectory = "./Content";
    }
  }
}
