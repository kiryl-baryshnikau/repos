using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using BD.MedView.Configuration;

namespace BD.MedView.Services.Services
{
    public interface IGlobalPreferencesService
    {
        List<GlobalPreferences> Select();
        void Create(GlobalPreferences value);
        object Read(int id);
        void Update(int id, GlobalPreferences value);
        void Delete(int id);
    }
    public class GlobalPreferencesService : IGlobalPreferencesService
    {
        public void Create(GlobalPreferences value)
        {
            throw new NotImplementedException();
        }

        public void Delete(int id)
        {
            throw new NotImplementedException();
        }

        public object Read(int id)
        {
            throw new NotImplementedException();
        }

        public List<GlobalPreferences> Select()
        {
            throw new NotImplementedException();
        }

        public void Update(int id, GlobalPreferences value)
        {
            throw new NotImplementedException();
        }
    }
}