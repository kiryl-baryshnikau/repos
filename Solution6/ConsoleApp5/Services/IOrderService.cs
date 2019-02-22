using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace BD.MedView.Data.Services.Services
{
    #region Search/MedicalOrder
    public class MedicalOrderSearchQuery
    {
        public class PatientIdentifier
        {
            public string kind { get; set; }
            public string value { get; set; }
        }

        public class Name
        {
            public List<string> terms { get; set; }
        }

        public class Concentration
        {
            public double amount { get; set; }
            public string amountUnits { get; set; }
            public double volume { get; set; }
            public string volumeUnits { get; set; }
            public object criteria { get; set; }
        }

        public class DrugInfo
        {
            public Name name { get; set; }
            public Concentration concentration { get; set; }
        }

        public class Patient
        {
            [JsonProperty(PropertyName = "patient.organization.identifier")]
            public string patientOrganizationIdentifier { get; set; }
            [JsonProperty(PropertyName = "patient.identifier")]
            public PatientIdentifier patientIdentifier { get; set; }
            public List<string> route { get; set; }
            public int notOlderThanDays { get; set; }
            public List<string> timingCode { get; set; }
            public DrugInfo drugInfo { get; set; }
        }

        public List<Patient> patients { get; set; }
    }
    public class MedicalOrderSearchResult
    {
        public class Meta
        {
            public DateTime lastUpdated { get; set; }
        }

        public class Assigner
        {
            public string display { get; set; }
        }

        public class Identifier
        {
            public string system { get; set; }
            public string value { get; set; }
            public Assigner assigner { get; set; }
        }

        public class Patient
        {
            public string reference { get; set; }
        }

        public class Prescriber
        {
            public string reference { get; set; }
        }

        public class Encounter
        {
            public string reference { get; set; }
        }

        public class MedicationReference
        {
            public string reference { get; set; }
        }

        public class Name
        {
            public List<string> family { get; set; }
            public List<string> given { get; set; }
            public List<string> prefix { get; set; }
            public List<string> suffix { get; set; }
        }

        public class ManagingOrganization
        {
            public string reference { get; set; }
        }

        public class Coding
        {
            public string system { get; set; }
            public string code { get; set; }
            public string display { get; set; }
        }

        public class Code
        {
            public List<Coding> coding { get; set; }
            public string text { get; set; }
        }

        public class Item
        {
            public string reference { get; set; }
            public string display { get; set; }
        }

        public class Numerator
        {
            public int value { get; set; }
            public string unit { get; set; }
            public string system { get; set; }
            public string code { get; set; }
        }

        public class Denominator
        {
            public int value { get; set; }
            public string unit { get; set; }
            public string system { get; set; }
            public string code { get; set; }
        }

        public class Amount
        {
            public Numerator numerator { get; set; }
            public Denominator denominator { get; set; }
        }

        public class Ingredient
        {
            public Item item { get; set; }
            public Amount amount { get; set; }
        }

        public class Product
        {
            public List<Ingredient> ingredient { get; set; }
        }

        public class Resource
        {
            public string resourceType { get; set; }
            public string id { get; set; }
            public Meta meta { get; set; }
            public List<Identifier> identifier { get; set; }
            public string status { get; set; }
            public Patient patient { get; set; }
            public Prescriber prescriber { get; set; }
            public Encounter encounter { get; set; }
            public MedicationReference medicationReference { get; set; }
            public List<Name> name { get; set; }
            public string gender { get; set; }
            public DateTime? birthDate { get; set; }
            public ManagingOrganization managingOrganization { get; set; }
            public Code code { get; set; }
            public Product product { get; set; }
        }

        public class Entry
        {
            public Resource resource { get; set; }
        }
        public string resourceType { get; set; }
        public string type { get; set; }
        public List<Entry> entry { get; set; }
    }
    #endregion Search/MedicalOrder

    public interface IOrderService
    {
        // POST https://hsv-mrg.essqe.org/BD.fhir/fhir/MedicationOrder/_search/
        MedicalOrderSearchResult Search(MedicalOrderSearchQuery request);
    }
}