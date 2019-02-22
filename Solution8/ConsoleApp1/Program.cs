using IdentityModel.Client;
using Newtonsoft.Json;
using System;
using System.IdentityModel.Tokens;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Linq;
using System.Xml.XPath;

namespace ConsoleApp1
{
    public class LogDelegatingHandler : DelegatingHandler
    {
        public LogDelegatingHandler(HttpClientHandler httpClientHandler): base(httpClientHandler)
        {
        }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            if (request.Content != null)
            {
                var requestBody = await request.Content.ReadAsStringAsync();
            }

            var response = await base.SendAsync(request, cancellationToken);

            if (response.Content != null)
            {
                var responseBody = await response.Content.ReadAsStringAsync();
            }

            return response;
        }
    }

    class Program
    {
        public class Response
        {
            public string SAMLResponse { get; set; }
        }
        static void Main2(string[] args)
        {
            System.Net.ServicePointManager.ServerCertificateValidationCallback += (sender, cert, chain, sslPolicyErrors) => true;

            var client = new HttpClient(new LogDelegatingHandler(new HttpClientHandler())) { BaseAddress = new Uri("https://hsv-aio.essqe.org/idmsts/ids/") };
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            string authInfo = "mvd_user_mode_client" + ":" + "7CFAA621-1F9C-4214-ABFB-7FA3E1DD0B89";
            authInfo = Convert.ToBase64String(Encoding.Default.GetBytes(authInfo));
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authInfo);
            var value = new
            {
                acs = @"https://sd-test-2012core.kp.cfnp.local/idmsts/ids/idm-HSV-AIO.essqe.org-91b8a61b-cf71-462a-b456-4a2121b0734d/Acs",
                audience = "https://hsv-aio.essqe.org/idmsts/ids/.well-known/saml-configuration",
                metadataurl = "https://hsv-aio.essqe.org/idmsts/ids/.well-known/saml-configuration",
                email = "devendra.singh@carefusion.com",
                username = "cp1",
                relaystate = ""
            };
            //var response = client.PostAsJsonAsync("invoke", value).Result;
            var request = new HttpRequestMessage(HttpMethod.Post, "invoke");
            request.Content = new StringContent(JsonConvert.SerializeObject(value),
                                                Encoding.UTF8,
                                                "application/json");
            request.Content = new StringContent(JsonConvert.SerializeObject(value),
                                                Encoding.UTF8,
                                                "application/x-www-form-urlencoded");
            var response = client.SendAsync(request).Result;
            response.EnsureSuccessStatusCode();
            var result = response.Content.ReadAsAsync<Response>().Result;
            Console.WriteLine(result.SAMLResponse);
        }

        static void Main3(string[] args)
        {
            System.Net.ServicePointManager.ServerCertificateValidationCallback += (sender, cert, chain, sslPolicyErrors) => true;

            //var hostDomain = new Uri("https://hsv-aio.essqe.org/idmsts/ids/");
            var hostDomain = new Uri("https://appdemo.abidm.local/idmsts/ids/");
            var localIdm = "idm-HSV-AIO.essqe.org-91b8a61b-cf71-462a-b456-4a2121b0734d";

            var client = new HttpClient(new LogDelegatingHandler(new HttpClientHandler())) { BaseAddress = hostDomain };
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            string authInfo = "mvd_user_mode_client" + ":" + "7CFAA621-1F9C-4214-ABFB-7FA3E1DD0B89";
            authInfo = Convert.ToBase64String(Encoding.Default.GetBytes(authInfo));
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authInfo);
            var value = new
            {
                acs = new Uri(hostDomain, $"{localIdm}/Acs").ToString(),
                audience = new Uri(hostDomain, ".well-known/saml-configuration").ToString(),
                metadataurl = new Uri(hostDomain, ".well-known/saml-configuration").ToString(),
                email = "devendra.singh@carefusion.com",
                username = "cp1",
                relaystate = ""
            };
            //var response = client.PostAsJsonAsync("invoke", value).Result;
            var request = new HttpRequestMessage(HttpMethod.Post, "invoke");
            request.Content = new StringContent(JsonConvert.SerializeObject(value),
                                                Encoding.UTF8,
                                                "application/x-www-form-urlencoded");
            var response = client.SendAsync(request).Result;
            response.EnsureSuccessStatusCode();
            var result = response.Content.ReadAsAsync<Response>().Result;
            Console.WriteLine(result.SAMLResponse);
        }

        static void Main4(string[] args)
        {
            var address = "https://appdemo.abidm.local/idmsts/ids/invoke";
            var baseAddress = new Uri(address);
            var aaa = baseAddress.GetLeftPart(UriPartial.Path);
            //baseAddress = new Uri(baseAddress, "..");
        }

        static void Main5(string[] args)
        {
            var access = null as string;
            {
                var client = new TokenClient("https://hsv-aio.essqe.org/idmsts/ids/connect/token", "idmconfigapi", "test");
                var scopes = new[] { "idmconfigapi.access", "idmconfigapi.readidentityproviders" };
                var scope = string.Join(" ", scopes);
                var token = client.RequestClientCredentialsAsync(scope).Result;
                access = token.AccessToken;
            }
            {
                var client = new HttpClient { BaseAddress = new Uri("https://hsv-aio.essqe.org/idmconfigapi/api/") };
                client.DefaultRequestHeaders.Clear();
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", access);
                var response = client.GetAsync("identityproviders").Result;
                var content = response.Content.ReadAsStringAsync().Result;
                var parsed = JsonConvert.DeserializeAnonymousType(content, new { count = 0, resources = new[] { new { AuthenticationMode = "", Name = "" } } });
                var name = parsed.resources.Where(item => item.AuthenticationMode == "local").Select(item => item.Name).Single();
            }
        }

        static void Main6(string[] args)
        {
            string stsUrl = "https://hsv-aio.essqe.org/idmsts/ids/";
            string apiUrl = "https://hsv-aio.essqe.org/idmconfigapi/api/";
            var clientId = "idmconfigapi";
            var clientSecret = "test";
            var scopes = new[] { "idmconfigapi.access", "idmconfigapi.readidentityproviders" };


            var access = null as string;
            {
                var client = new TokenClient(stsUrl + "connect/token", clientId, clientSecret);
                var scope = string.Join(" ", scopes);
                var token = client.RequestClientCredentialsAsync(scope).Result;
                access = token.AccessToken;
            }
            var name = null as string;
            {
                var client = new HttpClient { BaseAddress = new Uri(apiUrl) };
                client.DefaultRequestHeaders.Clear();
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", access);
                var response = client.GetAsync("identityproviders").Result;
                var content = response.Content.ReadAsStringAsync().Result;
                var parsed = JsonConvert.DeserializeAnonymousType(content, new { count = 0, resources = new[] { new { AuthenticationMode = "", Name = "" } } });
                name = parsed.resources.Where(item => item.AuthenticationMode == "local").Select(item => item.Name).Single();
            }

            Console.WriteLine(name);
        }

        static void Main(string[] args)
        {
            string stsUrl = "https://hsv-aio.essqe.org/idmsts/ids/";
            string apiUrl = "https://hsv-aio.essqe.org/idmconfigapi/api/";
            var clientId = "idmconfigapi";
            var clientSecret = "test";
            var scopes = new[] { "idmconfigapi.access", "idmconfigapi.readidentityproviders" };
            var email = "devendra.singh@carefusion.com";
            var username = "cp1";
            var relaystate = "";

            var access = null as string;
            {
                var client = new TokenClient($"{stsUrl}connect/token", clientId, clientSecret);
                var scope = string.Join(" ", scopes);
                var token = client.RequestClientCredentialsAsync(scope).Result;
                access = token.AccessToken;
            }
            Console.WriteLine(access);
            var name = null as string;
            {
                var client = new HttpClient { BaseAddress = new Uri(apiUrl) };
                client.DefaultRequestHeaders.Clear();
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", access);
                var response = client.GetAsync("identityproviders").Result;
                var content = response.Content.ReadAsStringAsync().Result;
                var parsed = JsonConvert.DeserializeAnonymousType(content, new { count = 0, resources = new[] { new { AuthenticationMode = "", Name = "" } } });
                name = parsed.resources.Where(item => item.AuthenticationMode == "local").Select(item => item.Name).Single();
            }
            Console.WriteLine(name);
            var saml = null as string;
            {
                var client = new HttpClient { BaseAddress = new Uri(stsUrl) };
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                client.DefaultRequestHeaders.Authorization = new BasicAuthenticationHeaderValue(clientId, clientSecret);
                var value = new
                {
                    acs = $"{stsUrl}{name}/Acs",
                    audience = $"{stsUrl}.well-known/saml-configuration",
                    metadataurl = $"{stsUrl}.well-known/saml-configuration",
                    email,
                    username,
                    relaystate
                };
                var request = new HttpRequestMessage(HttpMethod.Post, "invoke");
                request.Content = new StringContent(JsonConvert.SerializeObject(value), Encoding.UTF8, "application/x-www-form-urlencoded");
                var response = client.SendAsync(request).Result;
                response.EnsureSuccessStatusCode();
                var content = response.Content.ReadAsStringAsync().Result;
                var parsed = JsonConvert.DeserializeAnonymousType(content, new { SAMLResponse = "" });
                saml = parsed.SAMLResponse;
            }
            var expiration = null as DateTime?;
            {
                var data = Convert.FromBase64String(saml);
                var tokenString = Encoding.UTF8.GetString(data);
                //var handler = SecurityTokenHandlerCollection.CreateDefaultSecurityTokenHandlerCollection();
                //var token = handler.ReadToken(new XmlTextReader(new StringReader(tokenString)));

                //var h1 = new Saml2SecurityTokenHandler(new SamlSecurityTokenRequirement { });
                //var h2 = h1.CanReadToken(tokenString);
                //var h3 = h1.ReadToken(new XmlTextReader(new StringReader(tokenString)));

                var doc = new XmlDocument();
                doc.LoadXml(tokenString);
                var pattern = doc.SelectSingleNode(@"/*[local-name()='Response']/*[local-name()='Assertion']/*[local-name()='Conditions']/@NotOnOrAfter")?.Value;
                var dateTime = DateTime.Parse(pattern);
                //var dateNow = DateTime.UtcNow;
                var dateNow = DateTime.Now;

                var patternTime = dateTime.ToString();
                var patternNow = dateNow.ToString();

                var diference = dateTime - dateNow;
                var patternDiference = diference.ToString();

                var expired = dateNow > dateTime;

            }


            Console.WriteLine(saml);
        }
    }

    public class Saml2Serializer : Saml2SecurityTokenHandler
    {
        public Saml2Serializer()
        {
            Configuration = new SecurityTokenHandlerConfiguration()
            {

            };
        }

        public void WriteSaml2Assertion(XmlWriter writer, Saml2Assertion data)
        {
            base.WriteAssertion(writer, data);
        }
    }
}
