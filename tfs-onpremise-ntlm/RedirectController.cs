using System;
using System.Configuration;
using System.Linq;
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

            var ixApi = url.IndexOf("/api/", StringComparison.InvariantCultureIgnoreCase);
            url = url.Substring(ixApi + 5);
            url = url.Replace("http/", "http://");
            url = url.Replace("https/", "https://");

            var origin = (string)null;
            if (Request.Headers.Contains("Origin"))
            {
                origin = Request.Headers.GetValues("Origin").FirstOrDefault();
            }

            var handler = new HttpClientHandler();

            var username = ConfigurationManager.AppSettings["username"];
            handler.UseDefaultCredentials = string.IsNullOrWhiteSpace(username);
            if (!handler.UseDefaultCredentials)
            {
                var password = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(ConfigurationManager.AppSettings["password"]));
                var domain = ConfigurationManager.AppSettings["domain"];

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

                HttpResponseMessage result;

                if (Request.Method == HttpMethod.Get)
                    result = await ToAnyHostGet(client, url);
                else if (Request.Method == HttpMethod.Options)
                    result = await ToAnyHostOptions(client, url);
                //else if (Request.Method == HttpMethod.Post)
                //    return await ToTfsPost(client, url);
                else
                    throw new NotSupportedException();
                // List data response.
                if (!string.IsNullOrWhiteSpace(origin))
                {
                    if (result.Headers.Contains("Access-Control-Allow-Origin"))
                        result.Headers.Remove("Access-Control-Allow-Origin");
                    result.Headers.Add("Access-Control-Allow-Origin", origin);
                }

                result.Headers.Add("Access-Control-Allow-Credentials", "true");
                return result;
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
