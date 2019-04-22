using Microsoft.IdentityModel.Clients.ActiveDirectory;
using System;
using System.Globalization;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace AzureADConsole
{
    class Program
    {
        public static async Task Main(string[] args)
        {
            try
            {
                var clientId = "1cae8d10-3301-4ba3-a6e0-6fde4aa0afe0";
                var aadInstance = "https://login.microsoftonline.com/{0}";
                var tenant = "12ec3669-e1bb-4e5b-9ee7-10765db988b7";
                //var tenant = "internationalcandies.onmicrosoft.com";
                var resource = "https://graph.windows.net";
                var appKey = "Rcw.JcSP]byUzgjRd)5U[_ce.m+3{|U2.LPJ_Iz5;!ZK";
                var authoity = String.Format(CultureInfo.InvariantCulture, aadInstance, tenant);
                var context = new AuthenticationContext(authoity);
                var credential = new ClientCredential(clientId, appKey);
                var token = await context.AcquireTokenAsync(resource, credential);
                var accessToken = token.AccessToken;
                Console.WriteLine(accessToken);
                var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                var uri = resource + "/" + tenant + "/" + "users" + "/?api-version=1.6";
                var result = await httpClient.GetAsync(uri);
                Console.WriteLine(result.StatusCode);
                var content = await result.Content.ReadAsStringAsync();
                Console.WriteLine(content);
            }
            catch(Exception e)
            {
                Console.WriteLine(e);
            }
            Console.ReadLine();

        }

        public static async Task Main1(string[] args)
        {
            try
            {
                var clientId = "5bf8094e-6337-4d9f-a0b6-73c87cdad0f0";
                var aadInstance = "https://login.microsoftonline.com/{0}";
                var tenant = "49d2f1c9-9567-444b-9e0b-504d88acfddd";
                //var tenant = "internationalcandies.onmicrosoft.com";
                var resource = "https://graph.windows.net";
                var appKey = "E5y95I(&O*(h1:=:gVRTo?su8O=_Q#Zv$17*Yc9]L]DAUP{iIYiBq}q";
                var authoity = String.Format(CultureInfo.InvariantCulture, aadInstance, tenant);
                var context = new AuthenticationContext(authoity);
                var credential = new ClientCredential(clientId, appKey);
                var token = await context.AcquireTokenAsync(resource, credential);
                var accessToken = token.AccessToken;
                Console.WriteLine(accessToken);
                var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                var uri = resource + "/" + tenant + "/" + "users" + "/?api-version=1.6";
                var result = await httpClient.GetAsync(uri);
                Console.WriteLine(result.StatusCode);
                var content = await result.Content.ReadAsStringAsync();
                Console.WriteLine(content);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            Console.ReadLine();

        }
    }
}
