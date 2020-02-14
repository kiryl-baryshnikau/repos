namespace WebApplication4.SpaExtensions
{
    public class LocalizedSpaStaticFilePathProvider
    {
        private readonly IUserLanguageService _userLanguageService;

        public LocalizedSpaStaticFilePathProvider(IUserLanguageService userLanguageService)
        {
            _userLanguageService = userLanguageService;
        }

        public string GetRequestPath(string subpath, string defaultFile)
        {
            var userLocale = _userLanguageService.GetUserLocale();
            if (subpath == "/") {
                var spaFilePath = "/" + userLocale + "/" + defaultFile;
                return spaFilePath;
            }
            return subpath;
        }
    }
}
