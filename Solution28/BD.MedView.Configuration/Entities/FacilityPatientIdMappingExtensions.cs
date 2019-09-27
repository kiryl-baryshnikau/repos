using System;

namespace BD.MedView.Configuration.Entities
{
    public static class FacilityPatientIdMappingExtensions
    {
        public static PatientIdKind GetPatientIdKind(this FacilityPatientIdMapping obj)
        {
            return (PatientIdKind)Enum.Parse(typeof(PatientIdKind), obj.PatientIdKind);
        }
        public static void SetPatientIdKind(this FacilityPatientIdMapping obj, PatientIdKind value)
        {
            obj.PatientIdKind = value.ToString();
        }
    }
}
