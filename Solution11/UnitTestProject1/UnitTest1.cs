using Common.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NMock;
using System;
using System.Diagnostics;

namespace UnitTestProject1
{
    [TestClass]
    public class UnitTest1
    {
        private MockFactory _mocksFactory;
        private ILog log;


        [TestInitialize]
        public void BeforeEach()
        {
            _mocksFactory = new MockFactory();
            log = _mocksFactory.CreateMock<ILog>().MockObject;
        }


        [TestCleanup]
        public void Cleanup()
        {
            _mocksFactory.VerifyAllExpectationsHaveBeenMet();
            _mocksFactory.ClearExpectations();
        }

        [TestMethod]
        public void TestMethod1()
        {
            Expect.On(log)
                .Any
                .GetProperty(x => x.IsTraceEnabled)
                .WillReturn(true);
            Expect.On(log)
                .Any
                .Method(x => x.Trace(null as object))
                .WithAnyArguments()
                .Will(Collect.MethodArgument(0, delegate (object arg) {
                    if (arg is string)
                    {
                        Trace.WriteLine(arg);
                    }
                    if (arg is Action<FormatMessageHandler>)
                    {
                        //(arg as Action<FormatMessageHandler>).Invoke();
                    }
                }));



            //Expect.On(log)
            //    .Any
            //    .Method(x => x.Trace(null as Action<FormatMessageHandler>))
            //    .WithAnyArguments();


            //Expect.On(log)
            //    .Any
            //    .Method(x => x.Info(null as Action<FormatMessageHandler>))
            //    .WithAnyArguments();
            //Expect.On(log)
            //    .Any
            //    .Method(x => x.Error(null as Action<FormatMessageHandler>))
            //    .WithAnyArguments();

            log.Trace("hello");
            log.Trace(m => m("hello 2"));
        }
    }
}
