using System;
using System.Data.SqlClient;

namespace BD.MedView.Services
{
    class Program
    {
        static void Main(string[] args)
        {
            //using (var connection = new SqlConnection("Context"))
            //using (var connection = new SqlConnection("Server=tcp:bd-hsv-dev-sql-server.database.windows.net,1433;Initial Catalog=4605bf6c-2fd6-431e-9251-63671b99659b-medview;Persist Security Info=False;User ID=bdadmin;Password=pass@word1;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"))
            using (var connection = new SqlConnection("Server=tcp:bd-hsv-local-kiryl-sql-server.database.windows.net,1433;Initial Catalog=bd-hsv-local-kiryl-legacy-db-medview;Persist Security Info=False;User ID=bdadmin;Password=pass@word1;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"))
            {
                var command = new SqlCommand("SELECT DatabaseVersionKey, VersionText, LocaleCode, LastModifiedUTCDateTime FROM Core.DatabaseVersion", connection);
                //command.Parameters.AddWithValue("@tPatSName", "Your-Parm-Value");
                connection.Open();
                var reader = command.ExecuteReader();
                try
                {
                    while (reader.Read())
                    {
                        Console.WriteLine(String.Format("{0}, {1}, {2}, {3}", reader["DatabaseVersionKey"], reader["VersionText"], reader["LocaleCode"], reader["LastModifiedUTCDateTime"]));
                    }
                }
                finally
                {
                    // Always call Close when done reading.
                    reader.Close();
                }
            }
        }
    }
}
