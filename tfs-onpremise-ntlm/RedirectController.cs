using System;
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

            using (var client = new HttpClient(new HttpClientHandler()
            {
                UseDefaultCredentials = true
            }))
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
