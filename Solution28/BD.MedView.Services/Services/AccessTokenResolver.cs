using Common.Logging;
using System;
using System.Web;

namespace BD.MedView.Services.Services
{
    public interface IAccessTokenResolver
    {
        string Resolve();
    }

    public class AccessTokenResolver : IAccessTokenResolver
    {
        private readonly ILog log;
        private readonly string token;
        public AccessTokenResolver(ILog log)
        {
            this.log = log ?? throw new ArgumentNullException(nameof(log));

            #region Initialize
            //Important: only dyring construction we have accesss to HttpContext.Current because it available in calling Thread. 
            //Important: if you move this code to GetAccessToken you loos ability to use service in async calls
            var authorization = HttpContext.Current.Request.Headers["Authorization"];
            if ((!string.IsNullOrWhiteSpace(authorization)) && authorization.StartsWith("Bearer "))
            {
                token = authorization.Substring("Bearer ".Length);
            }
            #endregion Initialize
        }

        public string Resolve()
        {
            return token;
        }
    }
}