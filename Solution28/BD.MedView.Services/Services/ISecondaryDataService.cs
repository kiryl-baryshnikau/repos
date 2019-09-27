using BD.MedView.Services.Models;
using System;

namespace BD.MedView.Services.Services
{
    public interface ISecondaryDataService
    {
        void Process(SecondaryData value);
    }
}