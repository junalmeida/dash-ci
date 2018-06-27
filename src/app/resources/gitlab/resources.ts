namespace DashCI.Resources.Gitlab {

    export interface IGitlabResource extends ng.resource.IResourceClass<IGitlabObject> {
        project_list(): IProject[];
        issue_count(param: { scope: string; scopeId: number; labels: string; milestone: string; state: string }): ICount;
        latest_pipeline(param: { project: number; ref: string; }): IPipeline[];
        recent_pipelines(param: { project: number; ref: string; count: number }): IPipeline[];
        commit_count(param: { project: number; ref: string; since: string }): ICount;
        group_list(): IGroup[];
    }

    DashCI.app.factory('gitlabResources',
        ['$resource', 'globalOptions',
            ($resource: ng.resource.IResourceService, globalOptions: Models.IOptions) => (): IGitlabResource => {

            if (!globalOptions || !globalOptions.gitlab || !globalOptions.gitlab.host || !globalOptions.gitlab.privateToken)
                return null;

            var headers = {
                "PRIVATE-TOKEN": <string>null,
                //"Access-Control-Request-Headers": "X-Total, X-Page, X-Total-Pages"
            };
            if (globalOptions.gitlab.privateToken)
                headers["PRIVATE-TOKEN"] = globalOptions.gitlab.privateToken;
            else
                delete headers["PRIVATE-TOKEN"];


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

                    var parsedCount = parseInt(headers["x-total"]);
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
                    var ret = <ICount>{
                        count: parsedCount
                    };
                    return ret;
                }
                else
                    return data;

            };

            // Return the resource, include your custom actions
            return <IGitlabResource>$resource(globalOptions.gitlab.host, {}, {
                project_list: <ng.resource.IActionDescriptor>{
                    method: 'GET',
                    isArray: true,
                    url: globalOptions.gitlab.host + "/api/v4/projects?order_by=last_activity_at&sort=desc&per_page=100",
                    headers: headers,
                    transformResponse: transform,
                    cache: true
                },

                group_list: <ng.resource.IActionDescriptor>{
                    method: 'GET',
                    isArray: true,
                    url: globalOptions.gitlab.host + "/api/v4/groups?all_available=true&order_by=name&sort=asc&per_page=100",
                    headers: headers,
                    transformResponse: transform,
                    cache: true
                },

                issue_count: <ng.resource.IActionDescriptor>{
                    method: 'GET',
                    isArray: false,
                    url: globalOptions.gitlab.host + "/api/v4/:scope/:scopeId/issues?labels=:labels&state=:state&per_page=1",
                    headers: headers,
                    cache: false,
                    transformResponse: countParser
                },

                latest_pipeline: <ng.resource.IActionDescriptor>{
                    method: 'GET',
                    isArray: true,
                    url: globalOptions.gitlab.host + "/api/v4/projects/:project/pipelines?scope=branches&ref=:ref&per_page=100",
                    cache: false,
                    headers: headers
                },

                recent_pipelines: <ng.resource.IActionDescriptor>{
                    method: 'GET',
                    isArray: true,
                    url: globalOptions.gitlab.host + "/api/v4/projects/:project/pipelines?ref=:ref&per_page=:count",
                    cache: false,
                    headers: headers
                },

                commit_count: <ng.resource.IActionDescriptor>{
                    method: 'GET',
                    isArray: true,
                    url: globalOptions.gitlab.host + "/api/v4/projects/:project/repository/commits?ref_name=:ref&since=:since&per_page=1",
                    cache: false,
                    transformResponse: countParser
                }

            });

    }])
}
