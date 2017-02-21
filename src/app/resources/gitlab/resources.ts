namespace DashCI.Resources.Gitlab {

    export interface IGitlabResource extends ng.resource.IResourceClass<IGitlabObject> {
        project_list(): IProject[];
        issue_count(param: { scope: string; scopeId: number; labels: string; state: string }): IIssueCount;
        latest_pipeline(param: { project: number; ref: string; }): IPipeline[];
        group_list(): IGroup[];
    }

    DashCI.app.factory('gitlabResources',
        ['$resource', 'globalOptions',
            ($resource: ng.resource.IResourceService, globalOptions: Models.IOptions) => (): IGitlabResource => {

            var transform = (data: any, headers: any) => {
                var data = angular.fromJson(data);
                if (data && typeof(data) === "object")
                    data.headers = headers();

                return data;
                };
            if (!globalOptions || !globalOptions.gitlab || !globalOptions.gitlab.host)
                return null;

            var headers = {
                "PRIVATE-TOKEN": <string>null,
                //"Access-Control-Request-Headers": "X-Total, X-Page, X-Total-Pages"
            };
            if (globalOptions.gitlab.privateToken)
                headers["PRIVATE-TOKEN"] = globalOptions.gitlab.privateToken;
            else
                delete headers["PRIVATE-TOKEN"];

            // Return the resource, include your custom actions
            return <IGitlabResource>$resource(globalOptions.gitlab.host, {}, {
                project_list: <ng.resource.IActionDescriptor>{
                    method: 'GET',
                    isArray: true,
                    url: globalOptions.gitlab.host + "/api/v3/projects?order_by=name&per_page=100",
                    headers: headers,
                    transformResponse: transform
                },

                group_list: <ng.resource.IActionDescriptor>{
                    method: 'GET',
                    isArray: true,
                    url: globalOptions.gitlab.host + "/api/v3/groups?all_available=true&order_by=name&per_page=100",
                    headers: headers,
                    transformResponse: transform
                },

                issue_count: <ng.resource.IActionDescriptor>{
                    method: 'GET',
                    isArray: false,
                    url: globalOptions.gitlab.host + "/api/v3/:scope/:scopeId/issues?labels=:labels&state=:state&per_page=1",
                    headers: headers,
                    transformResponse: (data: any, getHeaders: Function, status: number) => {
                        if (status == 200) {
                            data = angular.fromJson(data);
                            var headers = getHeaders();

                            var parsedCount = parseInt(headers["X-Total"]);
                            if (isNaN(parsedCount)) {
                                parsedCount = 0;
                                //cannot access X-Total today, let's parse
                                var links = (<string>headers.link).split('>');
                                angular.forEach(links, (item) => {
                                    var matches = item.match(/page=(\d*)/);
                                    if (matches && matches.length > 1) {
                                        var page = Number(matches[1]);
                                        if (page > parsedCount)
                                            parsedCount = page;
                                    }
                                });
                            }
                            var ret = <IIssueCount>{
                                count: parsedCount
                            };
                            return ret;
                        }
                        else
                            return data;

                    }
                },

                latest_pipeline: <ng.resource.IActionDescriptor>{
                    method: 'GET',
                    isArray: true,
                    url: globalOptions.gitlab.host + "/api/v3/projects/:project/pipelines?scope=branches&ref=:ref&per_page=100",
                    headers: headers
                }

            });

    }])
}