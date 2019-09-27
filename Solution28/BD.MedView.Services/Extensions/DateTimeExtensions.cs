using System;

namespace BD.MedView.Services.Extensions
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    public static class DateTimeExtensions
    {
        public static double GetEpochTime(this DateTime dateTime)
        {
            return dateTime.Subtract(DateTime.MinValue.AddYears(1969)).TotalMilliseconds;
        }
    }
}