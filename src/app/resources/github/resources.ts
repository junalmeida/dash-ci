namespace DashCI.Resources.Github {

    export interface IGithubResource extends ng.resource.IResourceClass<any> {
        repository_list(): IRepository[];
        issue_count(param: { owner: string, repository: string; labels: string; state: string }): ICount;
    }

    DashCI.app.factory('githubResources',
        ['$resource', 'globalOptions',
            ($resource: ng.resource.IResourceService, globalOptions: Models.IOptions) => (username: string): IGithubResource => {

            if (!globalOptions || !globalOptions.github || globalOptions.github.length == 0)
                return null;

            var accounts = globalOptions.github.filter((item) => item.username == username);
            if (!accounts || accounts.length != 1)
                return null;
            var host = "https://api.github.com";

            var headers = {
                "Authorization": <string>null,
                //"Access-Control-Request-Headers": "X-Total, X-Page, X-Total-Pages"
            };
            if (accounts[0].privateToken)
                headers.Authorization = "Basic " + btoa(accounts[0].username + ":" + accounts[0].privateToken);
            else
                delete headers.Authorization;


            var transform = (data: any, headers: any) => {
                var data = angular.fromJson(data);
                if (data && typeof(data) === "object")
                    data.headers = headers();

                return data;
                };
            var countParser = (data: any, getHeaders: Function, status: number) => {
                if (status == 200) {
                    data = angular.fromJson(data);
                    var headers = getHeaders();

                    var parsedCount = parseInt(headers["X-Total"]);
                    if (isNaN(parsedCount)) {
                        parsedCount = 0;
                        //cannot access X-Total today, let's parse
                        var links = (<string>headers.link).split('>');
                        angular.forEach(links, (item) => {
                            var matches = item.match(/&page=(\d*)/);
                            if (matches && matches.length > 1) {
                                var page = Number(matches[1]);
                                if (page > parsedCount)
                                    parsedCount = page;
                            }
                        });
                    }
                    var ret = <ICount>{
                        count: parsedCount
                    };
                    return ret;
                }
                else
                    return data;

            };

            // Return the resource, include your custom actions
            return <IGithubResource>$resource(host, {}, {
                repository_list: <ng.resource.IActionDescriptor>{
                    method: 'GET',
                    isArray: true,
                    url: host + "/user/repos?sort=updated&direction=desc&per_page=100",
                    headers: headers,
                    transformResponse: transform,
                    cache: true
                },

                issue_count: <ng.resource.IActionDescriptor>{
                    method: 'GET',
                    isArray: false,
                    url: host + "/repos/:owner/:repository/issues?labels=:labels&state=:state&per_page=1",
                    headers: headers,
                    cache: false,
                    transformResponse: countParser
                },
            });
    }])
}