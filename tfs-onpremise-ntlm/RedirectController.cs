using System;
using System.Configuration;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Http;

namespace TfsOnPremiseNtlm
{
    public class RedirectController : ApiController
    {

        [HttpGet, HttpPost, HttpOptions]
        public async Task<HttpResponseMessage> ToAnyHost()
        {
            var url = Request.RequestUri.ToString();
            url = url.Replace(Program.BaseUrl + "/api/", "");
            url = url.Replace("http/", "http://");
            url = url.Replace("https/", "https://");

            var handler = new HttpClientHandler();

            var username = ConfigurationManager.AppSettings["username"];
            var password = ConfigurationManager.AppSettings["password"];
            var domain = ConfigurationManager.AppSettings["domain"];
            handler.UseDefaultCredentials = string.IsNullOrWhiteSpace(username);
            if (!handler.UseDefaultCredentials)
            {

                var credential = new NetworkCredential(username, password, domain);
                var myCache = new CredentialCache();
                myCache.Add(new Uri(url), "NTLM", credential);

                // Create an HttpClientHandler to add some settings
                handler.AllowAutoRedirect = true;
                handler.Credentials = myCache;
            }


            using (var client = new HttpClient(handler))
            {
                
                // Add an Accept header for JSON format.
                client.DefaultRequestHeaders.Accept.Add(
                    new MediaTypeWithQualityHeaderValue("application/json"));

                if (Request.Method == HttpMethod.Get)
                    return await ToAnyHostGet(client, url);
                else if (Request.Method == HttpMethod.Options)
                    return await ToAnyHostOptions(client, url);
                //else if (Request.Method == HttpMethod.Post)
                //    return await ToTfsPost(client, url);
                else
                    throw new NotSupportedException();
                // List data response.
            }
        }

        private async Task<HttpResponseMessage> ToAnyHostOptions(HttpClient client, string url)
        {
            return await client.SendAsync(new HttpRequestMessage()
            {
                Method = HttpMethod.Options,
                RequestUri = new Uri(url),
            }, HttpCompletionOption.ResponseHeadersRead);
        }

        private async Task<HttpResponseMessage> ToAnyHostGet(HttpClient client, string url)
        {
            return await client.GetAsync(url);
        }
        //private async Task<HttpResponseMessage> ToTfsPost(HttpClient client, string url)
        //{
        //    return await client.PostAsync(url, Request.Content);
        //}
    }
}
