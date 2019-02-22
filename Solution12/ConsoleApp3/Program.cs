using System;

namespace ConsoleApp3
{
    namespace ConsoleApp2
    {
        public struct EventId
        {
            int id;
            string name;
            public EventId(int id, string name)
            {
                this.id = id;
                this.name = name;
            }
        }

        public enum EventEnum
        {
            A, B, C, D
        }

        //public static class Ext
        //{
        //    public static implicit operator EventId(Enum value)
        //    {
        //    }
        //}

        class Program
        {
            static void Main(string[] args)
            {
            }
        }
    }

}
