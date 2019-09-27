using Auth0;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Net;

namespace BD.IdentityManagement.Common.Security.MVC.Tokens
{
    /// <summary>
    /// Provides access to Auth0 services. This class cannot be inherited.
    /// NOTE: this is an override of the Auth0 class because their implementation requires the client secret
    /// to request a delegated token, but the API doesn't require it nor should we have it.
    /// If Auth0 fixes their library we can remove this and use their again.
    /// </summary>
    internal sealed class Auth0Client : Client
    {
        private readonly string _clientId;
        private readonly string _clientSecret;
        private readonly string _domain;
        private readonly IWebProxy _webProxy;
        private readonly DiagnosticsHeader _diagnostics;

        /// <summary>
        /// Creates an instance of the client.
        /// </summary>
        /// <param name="clientID">The client id of the application, as shown in the dashboard settings.</param>
        /// <param name="clientSecret">The client secret of the application, as shown in the dashboard settings.</param>
        /// <param name="domain">The domain for the Auth0 server.</param>
        /// <param name="webProxy">Proxy to use for requests made by this client instance. Passed on to underying WebRequest if set.</param>
        /// <param name="diagnostics">A <see cref="DiagnosticsHeader"/> instance that contains diagnostic information sent to Auth0.  Default = <see cref="DiagnosticsHeader.Default"/> </param>
        public Auth0Client(string clientID, string clientSecret, string domain, IWebProxy webProxy = null, DiagnosticsHeader diagnostics = null)
            : base(clientID, domain, webProxy, diagnostics)
        {
            this._clientId = clientID;
            this._clientSecret = clientSecret;
            this._domain = domain;
            this._webProxy = webProxy;
            this._diagnostics = diagnostics == null ? DiagnosticsHeader.Default : diagnostics;
        }

        /// <summary>
        /// Creates an instance of the client for unauthenticated requests.
        /// </summary>
        /// <remarks>This constructor does not take a clientSecret, and thus only provides
        /// access to operations that don't require a clientSecret or access token.</remarks>
        /// <param name="clientID">The client id of the application, as shown in the dashboard settings.</param>
        /// <param name="domain">The domain for the Auth0 server.</param>
        /// <param name="webProxy">Proxy to use for requests made by this client instance. Passed on to underying WebRequest if set.</param>
        /// <param name="diagnostics">A <see cref="DiagnosticsHeader"/> instance that contains diagnostic information sent to Auth0.  Default = <see cref="DiagnosticsHeader.Default"/> </param>
        public Auth0Client(string clientID, string domain, IWebProxy webProxy = null, DiagnosticsHeader diagnostics = null)
            : base(clientID, domain, webProxy, diagnostics)
        {
            this._clientId = clientID;
            this._domain = domain;
            this._webProxy = webProxy;
            this._diagnostics = diagnostics == null ? DiagnosticsHeader.Default : diagnostics;
        }

        /// <summary>
        /// Generates a REST client.
        /// </summary>
        /// <returns>
        /// A REST client.
        /// </returns>
        /// <exception cref="System.InvalidOperationException">Rest client could not be generated.</exception>
        private RestClient GenerateRestClient()
        {
            Uri parsedDomain;
            RestClient client;
            if (Uri.TryCreate(this._domain, UriKind.Absolute, out parsedDomain) ||
                Uri.TryCreate("https://" + this._domain, UriKind.Absolute, out parsedDomain))
            {
                client = new RestClient(parsedDomain);
            }
            else
            {
                throw new InvalidOperationException("Rest client could not be generated.");
            }

            if (this._webProxy != null)
            {
                client.Proxy = this._webProxy;
            }

            if (!Object.ReferenceEquals(this._diagnostics, DiagnosticsHeader.Suppress))
            {
                client.AddDefaultHeader("Auth0-Client", this._diagnostics.ToString());
            }

            return client;
        }

        /// <summary>
        /// Gets a delegation token.
        /// </summary>
        /// <param name="token">The current access token.</param>
        /// <param name="targetClientId">The client id of the target application.</param>
        /// <param name="scope">The openid scope.</param>
        /// <returns>
        /// An instance of DelegationTokenResult containing the delegation token id.
        /// </returns>
        /// <exception cref="Auth0.OAuthException"></exception>
        public new DelegationTokenResult GetDelegationToken(string token, string targetClientId, string scope = "passthrough")
        {
            RestClient restClient;
            try
            {
                restClient = this.GenerateRestClient();
            }
            catch (InvalidOperationException)
            {
                throw;
            }

            var request = new RestRequest("/delegation", Method.POST);

            request.AddHeader("accept", "application/json");

            request.AddParameter("client_id", this._clientId, ParameterType.GetOrPost);
            request.AddParameter("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer", ParameterType.GetOrPost);
            request.AddParameter("id_token", token, ParameterType.GetOrPost);
            request.AddParameter("target", targetClientId, ParameterType.GetOrPost);
            request.AddParameter("scope", scope, ParameterType.GetOrPost);

            var response = restClient.Execute<Dictionary<string, string>>(request).Data;

            if (response.ContainsKey("error") || response.ContainsKey("error_description"))
            {
                throw new OAuthException(response["error_description"], response["error"]);
            }

            return new DelegationTokenResult
            {
                IdToken = response.ContainsKey("id_token") ? response["id_token"] : string.Empty,
                TokenType = response.ContainsKey("token_type") ? response["token_type"] : null,
                ValidFrom = DateTime.UtcNow,
                ValidTo = response.ContainsKey("expires_in") ? DateTime.UtcNow.AddSeconds(int.Parse(response["expires_in"])) : DateTime.MaxValue
            };
        }


        /// <summary>
        /// Contains the result from the Delegation endpoint. This class cannot be inherited.
        /// </summary>
        public sealed class DelegationTokenResult
        {
            /// <summary>
            /// Creates a new instance of <see cref="DelegationTokenResult" /> the class.
            /// </summary>
            internal DelegationTokenResult()
            { }

            /// <summary>
            /// Gets the delegation id token.
            /// </summary>
            public string IdToken { get; internal set; }

            /// <summary>
            /// Gets the last instant in time at which this security token is valid.
            /// </summary>
            public DateTime ValidTo { get; internal set; }

            /// <summary>
            /// Gets the first instant in time at which this security token is valid.
            /// </summary>
            public DateTime ValidFrom { get; internal set; }

            /// <summary>
            /// Gets the type of the returned token.
            /// </summary>
            public string TokenType { get; internal set; }
        }
    }
}
