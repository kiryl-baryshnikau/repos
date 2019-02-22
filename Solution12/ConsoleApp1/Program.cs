namespace ConsoleApp1
{
    public struct Number {

        int value;

        public Number(int value)
        {
            this.value = value;
        }

        public static explicit operator Number(int value)
        {
            return new Number(value);
        }

        public static explicit operator int(Number value)
        {
            return value.value;
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            var intValue = 1;
            var numberValue = (Number)intValue;
            var intValue2 = (int)numberValue;
        }
    }
}
