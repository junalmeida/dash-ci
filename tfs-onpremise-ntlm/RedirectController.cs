using System;
using System.Configuration;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Http;

namespace TfsOnPremiseNtlm
{
    public class RedirectController : ApiController
    {
        private string TfsHost => ConfigurationManager.AppSettings["tfs-host"];


        [HttpGet, HttpPost, HttpOptions]
        public async Task<HttpResponseMessage> ToTfs()
        {
            var url = Request.RequestUri.ToString();
            url = url.Replace(Program.BaseUrl + "/api/", "");
            url = url.Replace("http/", "http://");
            using (var client = new HttpClient(new HttpClientHandler()
            {
                UseDefaultCredentials = true
            }))
            {
                // Add an Accept header for JSON format.
                client.DefaultRequestHeaders.Accept.Add(
                    new MediaTypeWithQualityHeaderValue("application/json"));

                if (Request.Method == HttpMethod.Get)
                    return await ToTfsGet(client, url);
                else if (Request.Method == HttpMethod.Options)
                    return await ToTfsOptions(client, url);
                //else if (Request.Method == HttpMethod.Post)
                //    return await ToTfsPost(client, url);
                else
                    throw new NotSupportedException();
                // List data response.
            }
        }

        private async Task<HttpResponseMessage> ToTfsOptions(HttpClient client, string url)
        {
            return await client.SendAsync(new HttpRequestMessage()
            {
                Method = HttpMethod.Options,
                RequestUri = new Uri(url),
            }, HttpCompletionOption.ResponseHeadersRead);
        }

        private async Task<HttpResponseMessage> ToTfsGet(HttpClient client, string url)
        {
            return await client.GetAsync(url);
        }
        //private async Task<HttpResponseMessage> ToTfsPost(HttpClient client, string url)
        //{
        //    return await client.PostAsync(url, Request.Content);
        //}
    }
}
