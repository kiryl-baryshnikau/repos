namespace BD.MedView.Configuration
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    public class Widget
    {
        public string Id { get; set; }
        public bool Enabled { get; set; }
        public bool Default { get; set; }
        public dynamic Configuration { get; set; }
        public string @Route { get; set; }

    }
}
