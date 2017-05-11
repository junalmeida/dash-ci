using System;
using System.Configuration;
using System.Net;
using System.Web.Http;
using System.Windows.Forms;
using Microsoft.Owin.FileSystems;
using Microsoft.Owin.Hosting;
using Microsoft.Owin.StaticFiles;
using Owin;

namespace TfsOnPremiseNtlm
{
    static class Program
    {
        public const string Title = "Dash-CI";
        public static IDisposable server;

        //static int Port => Convert.ToInt32(ConfigurationManager.AppSettings["port"]);

        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            StartSelfHost();
            if (server != null)
            {
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(true);
                Application.Run(new MyApplicationContext());
            }
        }


        public const string BaseUrl = "http://localhost/Temporary_Listen_Addresses/dash-ci";

        private static void StartSelfHost()
        {
            var baseUrl = BaseUrl.Replace("//localhost", "//+:80");
            try
            {
                server = WebApp.Start(baseUrl, (app) =>
                {
                    var listener = (HttpListener)app.Properties["System.Net.HttpListener"];
                    listener.AuthenticationSchemes = AuthenticationSchemes.Anonymous;

                    var config = new HttpConfiguration();
                    new HttpServer(config);

                    Configure(app, config);

                });
            }
            catch (Exception ex)
            {
                var msg = ex.Message;
                var innerMsg = ex.InnerException != null ? ex.InnerException.Message : null;

                msg = $@"Cannot start the web server. Check static-files config parameter.

{msg}
{innerMsg}";

                if (IsRunningOnMono())
                {
                    Console.Error.WriteLine(ex.ToString());
                }
                MessageBox.Show(msg, Title, MessageBoxButtons.OK, MessageBoxIcon.Error, MessageBoxDefaultButton.Button1, MessageBoxOptions.ServiceNotification);
                server = null;
            }
        }

        private static void Configure(IAppBuilder app, HttpConfiguration config)
        {
            config.Routes.MapHttpRoute(
               name: "CatchAllRoute",
                routeTemplate: "api/{*pathValue}",
                defaults: new { controller = nameof(RedirectController).Replace("Controller", ""), action = nameof(RedirectController.ToAnyHost) }
            );

            app.UseFileServer(staticFiles);
            //app.UseStaticFiles(staticFiles);
            app.UseWebApi(config);
        }


        private static FileServerOptions staticFiles => new FileServerOptions()
        {

            //EnableDefaultFiles = true,
            DefaultFilesOptions = { DefaultFileNames = { "index.html" } },
            EnableDefaultFiles = true,
            EnableDirectoryBrowsing = false,
            FileSystem = new PhysicalFileSystem(ConfigurationManager.AppSettings["static-files"])
        };


        public static bool IsRunningOnMono()
        {
            return Type.GetType("Mono.Runtime", false) != null;
        }
    }
}
