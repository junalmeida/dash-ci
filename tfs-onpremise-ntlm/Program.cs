using Microsoft.Owin.FileSystems;
using Microsoft.Owin.Hosting;
using Microsoft.Owin.StaticFiles;
using Owin;
using System;
using System.Configuration;
using System.Net;
using System.Web.Http;
using System.Windows.Forms;

namespace TfsOnPremiseNtlm
{
    static class Program
    {
        public static IDisposable server;

        //static int Port => Convert.ToInt32(ConfigurationManager.AppSettings["port"]);

        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            StartSelfHost();
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(true);
            Application.Run(new MyApplicationContext());
        }


        public const string BaseUrl = "http://localhost/Temporary_Listen_Addresses/dash-ci";

        private static void StartSelfHost()
        {
            var baseUrl = BaseUrl.Replace("//localhost", "//+:80");

            server = WebApp.Start(baseUrl, (app) =>
            {
                var listener = (HttpListener)app.Properties["System.Net.HttpListener"];
                listener.AuthenticationSchemes = AuthenticationSchemes.Anonymous;

                var config = new HttpConfiguration();
                new HttpServer(config);

                Configure(app, config);
            });
        }

        private static void Configure(IAppBuilder app, HttpConfiguration config)
        {
            config.Routes.MapHttpRoute(
               name: "CatchAllRoute",
                routeTemplate: "api/{*pathValue}",
                defaults: new { controller = "Redirect", action = "ToTfs" }
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
    }
}
