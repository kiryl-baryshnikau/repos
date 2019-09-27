using System;
using System.Data.SqlClient;

namespace BD.MedView.Services.Extensions
{
    public static class ExceptionExtensions
    {
        public static bool HasDuplicateKeyNumber(this Exception exception)
        {
            const int SQLEXCEPTIONDUPLICATEKEY = 2601;

            if (exception == null || exception.InnerException == null || exception.InnerException.InnerException == null)
            {
                return false;
            }

            if (!(exception is SqlException))
            {
                return false;
            }

            return ((SqlException)exception.InnerException.InnerException).Number == SQLEXCEPTIONDUPLICATEKEY;

        }
    }
}