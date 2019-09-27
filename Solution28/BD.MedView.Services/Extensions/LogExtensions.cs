using Common.Logging;
using System;
using System.Runtime.InteropServices;

namespace BD.MedView.Services.Extensions
{
    public static class LogExtensions
    {
        public class LogActivity : IDisposable
        {
            private readonly ILog log;

            private readonly LogLevel level;
            private readonly Action<FormatMessageHandler> formatMessageCallback;
            private readonly IFormatProvider formatProvider;
            private Exception exception;

            private string cachedFormat;
            private object[] cachedArguments;
            private string cachedMessage;

            private Action<string> messageWriter;
            private Action<string, Exception> exceptionWriter;

            public LogActivity(ILog log, LogLevel level, IFormatProvider formatProvider, Action<FormatMessageHandler> formatMessageCallback)
            {
                this.log = log;
                this.level = level;
                this.formatProvider = formatProvider;
                this.formatMessageCallback = formatMessageCallback;

                if (level == LogLevel.Trace && log.IsTraceEnabled)
                {
                    messageWriter = log.Trace;
                    exceptionWriter = log.Trace;
                }
                else if (level == LogLevel.Debug && log.IsDebugEnabled)
                {
                    messageWriter = log.Debug;
                    exceptionWriter = log.Debug;
                }
                else if (level == LogLevel.Info && log.IsInfoEnabled)
                {
                    messageWriter = log.Info;
                    exceptionWriter = log.Info;
                }
                else if (level == LogLevel.Warn && log.IsWarnEnabled)
                {
                    messageWriter = log.Warn;
                    exceptionWriter = log.Warn;
                }
                else if (level == LogLevel.Error && log.IsErrorEnabled)
                {
                    messageWriter = log.Error;
                    exceptionWriter = log.Error;
                }
                else if (level == LogLevel.Fatal && log.IsFatalEnabled)
                {
                    messageWriter = log.Fatal;
                    exceptionWriter = log.Fatal;
                }

                if (messageWriter != null)
                {
                    formatMessageCallback(FormatMessage);
                    messageWriter($"Attempt: {cachedMessage}");
                }
            }

            protected string FormatMessage(string format, params object[] args)
            {
                this.cachedMessage = args.Length == 0 || this.formatProvider == null ? (args.Length == 0 ? (this.formatProvider == null ? format : string.Format(this.formatProvider, format, new object[0])) : string.Format(format, args)) : string.Format(this.formatProvider, format, args);
                this.cachedFormat = format;
                this.cachedArguments = args;
                return this.cachedMessage;
            }

            public void Dispose()
            {
                if (messageWriter == null)
                {
                    return;
                }

                if (Marshal.GetExceptionCode() == 0)
                {
                    messageWriter($"Success: {cachedMessage}");
                }
                else
                {
                    if (exception != null)
                    {
                        exceptionWriter($"Failure: {cachedMessage}", exception);
                    }
                    else
                    {
                        messageWriter($"Failure: {cachedMessage}");
                    }
                }
            }
            public void Throw(Exception exception)
            {
                this.exception = exception;
                throw exception;
            }
        }


        public static LogActivity Activity(this ILog log, Action<FormatMessageHandler> formatMessageCallback, LogLevel level = LogLevel.Trace)
        {
            return new LogActivity(log, level, null, formatMessageCallback);
        }
    }
}