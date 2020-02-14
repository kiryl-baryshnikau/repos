using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Http;

namespace WebApplication4.SpaExtensions
{
    public interface IUserLanguageService
    {
        string GetUserLocale();
    }

    public class UserLanguageService : IUserLanguageService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly List<string> _availableLanguages;

        public UserLanguageService(IHttpContextAccessor httpContextAccessor,
            IEnumerable<string> availableLanguages)
        {
            _httpContextAccessor = httpContextAccessor;
            _availableLanguages = availableLanguages
                .Select(l => l.ToLowerInvariant())
                .ToList();
        }

        public string GetUserLocale()
        {
            var request = _httpContextAccessor.HttpContext?.Request;
            if (request == null)
            {
                return _availableLanguages[0];
            }

            var cookieLocale = request.Cookies[".User.Locale"];
            if (!string.IsNullOrWhiteSpace(cookieLocale))
            {
                return cookieLocale;
            }

            var userLocales = request.Headers["Accept-Language"].ToString();
            var userAcceptLanguage = GetAcceptLanguageFromHeaderOrNull(userLocales);

            if (!string.IsNullOrWhiteSpace(userAcceptLanguage))
            {
                return userAcceptLanguage;
            }

            return _availableLanguages[0];
        }

        public string GetAcceptLanguageFromHeaderOrNull(string headerValue)
        {
            if (headerValue == null)
            {
                return null;
            }
            try
            {
                var clientLanguages = (headerValue)
                    .Split(',')
                    .Select(StringWithQualityHeaderValue.Parse)
                    .OrderByDescending(language => language.Quality.GetValueOrDefault(1))
                    .Select(language => language.Value)
                    .Select(languageCode =>
                    {
                        if (languageCode.Contains("-"))
                        {
                            return languageCode.Split('-').First();
                        }

                        return languageCode;
                    })
                    .Select(languageCode => languageCode.ToLowerInvariant())
                    .Distinct()
                    .Where(languageCode => !string.IsNullOrWhiteSpace(languageCode) && languageCode.Trim() != "*");
                return clientLanguages
                    .FirstOrDefault(clientLanguage => _availableLanguages.Contains(clientLanguage));
            }
            catch
            {
                return null;
            }
        }
    }
}