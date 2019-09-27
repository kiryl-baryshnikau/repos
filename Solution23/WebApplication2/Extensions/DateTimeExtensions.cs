using System;

namespace WebApplication2.Extensions
{
    public static class DateTimeExtensions
    {
        public static double GetEpochTime(this DateTime dateTime)
        {
            return dateTime.Subtract(DateTime.MinValue.AddYears(1969)).TotalMilliseconds;
        }
    }
}
