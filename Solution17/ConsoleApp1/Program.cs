using System;
using System.Text;
using System.Net.Http;
using System.Net.Http.Headers;

namespace ConsoleApplication1
{
    public class A
    {
        public string SAMLResponse { get; set; }
        public string acs { get; set; }
    }

    class Program
    {
        static void Main(string[] args)
        {
            var email = "bob@foo.com";
            //var identityServerUrl = "https://w12r2devidm.my.domain/idmsts/ids/";
            //var identityServerClientId = "idmFedDeployed";
            //var identityServerClientSecret = "secret";
            var identityServerUrl = "https://hsv-mm.essqe.org/idmsts/ids/";
            var identityServerClientId = "mvd_user_mode_client";
            var identityServerClientSecret = "7CFAA621-1F9C-4214-ABFB-7FA3E1DD0B89";

            var SAMLResponse = null as string;
            var acs = null as string;

            {
                var client = new HttpClient { BaseAddress = new Uri(identityServerUrl) };
                client.DefaultRequestHeaders.Accept.Clear();

                var byteArray = Encoding.ASCII.GetBytes(identityServerClientId + ":" + identityServerClientSecret);
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));
                var value = new
                {
                    hostedIdm = identityServerUrl,
                    email
                };
                var response = client.PostAsJsonAsync("invoke", value).Result;
                response.EnsureSuccessStatusCode();
                var obj = response.Content.ReadAsAsync<A>().Result;
                SAMLResponse = obj.SAMLResponse;
                acs = obj.acs;
            }

            Console.WriteLine(SAMLResponse);
            Console.WriteLine(acs);

        }
    }
}
