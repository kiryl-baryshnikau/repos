using Hl7.Fhir.Model;
using Hl7.Fhir.Rest;
using Hl7.Fhir.Serialization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace ConsoleApp2
{
    class Program
    {
        static void Main(string[] args)
        {
            //var uri = new Uri("http://localhost");
            //var client = new FhirClient(uri);
            //client.PreferredFormat = ResourceFormat.Json;

            ////var q = new Query();
            ////var bundle = client.Search(q);

            //Bundle results = client.Search<Patient>(new string[] { "family:exact=Eve" });

            //var pattern = File.ReadAllText("value.json");
            //var parser = new FhirJsonParser();
            //var bundle = parser.Parse<Bundle>(pattern);

            var pattern = File.ReadAllText("value.improved.json");
            //var pattern = File.ReadAllText("value.json");
            var obj = JObject.Parse(pattern);
            var tokens =  obj.SelectTokens("$..denominator");

            foreach (var item in tokens)
            {
                Console.WriteLine(item);
            }

            var list = obj.SelectTokens("$..denominator")
                .ToList();
            foreach (var item in list)
            {
                var parent = item.Parent;
                parent.Remove();
            }

            pattern = obj.ToString();
            var parser = new FhirJsonParser();
            var bundle = parser.Parse<Bundle>(pattern);

            foreach (var item in bundle.Entry)
            {
                Console.WriteLine(item.Resource.GetType());
                if (item.Resource is MedicationOrder)
                {
                    var medicationOrder = item.Resource as MedicationOrder;
                    var patient = medicationOrder.Patient;

                    var reference = patient.Reference;
                    var referenceType = reference.Split('/')[0];
                    var referenceValue = reference.Split('/')[1];



                    var medication = medicationOrder.Medication;
                }
            }

            var medicationOrders = bundle
                .Entry
                .Select(item => item.Resource)
                .OfType<MedicationOrder>()
                .ToList();

            var patients = bundle
                .Entry
                .Select(item => item.Resource)
                .OfType<Patient>()
                .ToList();

            var medications = bundle
                .Entry
                .Select(item => item.Resource)
                .OfType<Medication>()
                .ToList();

            medicationOrders.ForEach(medicationOrder => {

                var placerOrderNumber = medicationOrder.Id;

                var reference = medicationOrder.Patient.Reference;
                var referenceType = reference.Split('/')[0];
                var referenceValue = reference.Split('/')[1];

                var patient = patients.SingleOrDefault(item => item.Id == referenceValue);
                var mrn = patient.Identifier
                    .Where(item => item.System == "MT")
                    .Select(item => item.Value)
                    .SingleOrDefault();
                var accountNumber = patient.Identifier
                    .Where(item => item.System == "AN")
                    .Select(item => item.Value)
                    .SingleOrDefault();

                //Find relation
                var medicationTmp = medicationOrder.Medication;
                //var codeableConcept = medicationTmp as CodeableConcept;
                //if (codeableConcept != null)
                //{
                //    codeableConcept.Coding.ToList().ForEach(coding => {
                //        var med = medications.Where(medication => medication.Code.Coding.)
                //    });
                //}




                var medication = medications.First();
                var primaryDrugName = medication.Code.Text;

                var concentration = medication.Product.Ingredient.ToList().Select(ingredientComponent => {
                    var amount = ingredientComponent.Amount.Numerator?.Value;
                    var amountUnits = ingredientComponent.Amount.Numerator?.Unit;
                    var volume = ingredientComponent.Amount.Denominator?.Value;
                    var volumeUnits = ingredientComponent.Amount.Denominator?.Unit;
                    return new { amount, amountUnits, volume, volumeUnits };
                })
                .First();

                var result = new { placerOrderNumber, mrn, accountNumber, primaryDrugName,  concentration };
                Console.WriteLine(JsonConvert.SerializeObject(result));
            });





            Console.ReadLine();
        }
    }
}
