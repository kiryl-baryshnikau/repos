namespace ConsoleApp2
{
    public struct Number
    {

        int value;

        public Number(int value)
        {
            this.value = value;
        }

        public static implicit operator Number(int value)
        {
            return new Number(value);
        }

        public static implicit operator int(Number value)
        {
            return value.value;
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            var intValue = 1;
            Number numberValue = intValue;
            int intValue2 = numberValue;
        }
    }
}
