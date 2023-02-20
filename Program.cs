using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Net.Http;
using System.Runtime.InteropServices.JavaScript;
using System.Runtime.CompilerServices;

namespace WasmRoslyn
{
    public partial class Program
    {
        static CompileService service;

	public static int Main () {
            CheckHttpClient();
            service = new CompileService(httpClient/*, app*/);
	    return 0;
	}

        //[JSExport]
        //internal static void Start (JSObject app, JSObject outputLog)
        //{

        //    CheckHttpClient();
        //    service = new CompileService(httpClient/*, app*/);

        //    return;
        //}

        [JSImport("WasmRoslyn.Program.sayHelloCallback", "script.js")]
        internal static partial void SayHelloCallback (string message);

        [JSImport("WasmRoslyn.Program.setCompileLog", "script.js")]
        internal static partial void SetCompileLog (string message);

        [JSImport("WasmRoslyn.Program.setRunLog", "script.js")]
        internal static partial void SetRunLog (string message);

        [JSExport]
        internal static void SayHello()
        {
            SayHelloCallback("Hello World");
        }

        [JSExport]
        internal static string ExecuteOnDemand()
        {
            return "On demand execution of a function";
        }

        [JSExport]
        public static void Run(string code)
        {
            Task.Run(() => CompileAndRun(code));
        }

        public static async Task CompileAndRun(string code)
        {

            try
            {
                service.CompileLog = new List<string>();
                var result = await service.CompileAndRun(code);
		SetRunLog(string.Join("\r\n", result));
                //app.Invoke("setRunLog", new object[] { string.Join("\r\n",result) });

            }
            catch (Exception e)
            {
                service.CompileLog.Add(e.Message);
                service.CompileLog.Add(e.StackTrace);
                throw;
            }
            finally
            {
		SetCompileLog(string.Join("\r\n", service.CompileLog));
                //app.Invoke("setCompileLog", new object[] { string.Join("\r\n",service.CompileLog) });
            }
        }

        [JSImport("WasmRoslyn.Program.window", "script.js")]
        internal static partial JSObject GetWindow ();

        [JSImport("WasmRoslyn.Program.location", "script.js")]
        internal static partial JSObject GetLocation ();

        static HttpClient httpClient;
        static string BaseApiUrl = string.Empty;
        static string PathName = string.Empty;
        static void CheckHttpClient()
        {
            if (httpClient == null)
            {
                Console.WriteLine("Create  HttpClient");
                //using (var window = (JSObject)WebAssembly.Runtime.GetGlobalObject("window"))
                //using (var location = (JSObject)window.GetObjectProperty("location"))
                using (var location = GetLocation())
                {
                    //BaseApiUrl = (string)location.GetObjectProperty("origin");
                    //PathName = (string)location.GetObjectProperty("pathname");
                    BaseApiUrl = location.GetPropertyAsString("origin");
                    PathName = location.GetPropertyAsString("pathname");
                    Console.WriteLine($"Base: {BaseApiUrl} ReferencePath: {PathName}");
                }
                httpClient = new HttpClient() { BaseAddress = new Uri(new Uri(BaseApiUrl), PathName) };
            }

        }

        private static async Task<String> GetSourceCode(string name)
        {
            Console.WriteLine($"Fetching: {name}");
            CheckHttpClient();

            var source = await httpClient.GetStringAsync(name).ConfigureAwait(false);
            return source;

        }


    }
}
