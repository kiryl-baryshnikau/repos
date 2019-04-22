using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleApp2
{
    class Program
    {
        static void Main(string[] args)
        {
            var queryString = $"Select 1";
            var your_username = "cfnadmin";
            var your_password = "Cfn2009!";
            var connectionString = $"Server=tcp:internationalcandiesx4teodohkffvk.database.windows.net,1433;Initial Catalog=internationalcandies-db-aue;Persist Security Info=False;User ID={your_username};Password={your_password};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";

            using (var connection = new SqlConnection(connectionString))
            {
                connection.Open();
                //var command = new SqlCommand(queryString, connection);
                //command.Parameters.AddWithValue("@tPatSName", "Your-Parm-Value");
                //var reader = command.ExecuteReader();
                //try
                //{
                //    while (reader.Read())
                //    {
                //        Console.WriteLine(String.Format("{0}, {1}",
                //        reader["tPatCulIntPatIDPk"], reader["tPatSFirstname"]));// etc
                //    }
                //}
                //finally
                //{
                //    // Always call Close when done reading.
                //    reader.Close();
                //}
            }
        }
    }
}
