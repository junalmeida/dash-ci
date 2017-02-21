namespace DashCI.Resources.Gitlab {

    export interface IGitlabResource extends ng.resource.IResourceClass<IGitlabObject> {
        project_list(): IProject[];
        issue_count(param: { project: number; labels: string; state: string }): IIssueCount;
        latest_pipeline(param: { project: number; ref: string; }): IPipeline[];
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
                "Access-Control-Allow-Headers": "X-Total, X-Page, X-Total-Pages"
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

                issue_count: <ng.resource.IActionDescriptor>{
                    method: 'GET',
                    isArray: false,
                    url: globalOptions.gitlab.host + "/api/v3/projects/:project/issues?labels=:labels&state=:state&per_page=1",
                    headers: headers,
                    transformResponse: (data: any, getHeaders: Function, status: number) => {
                        if (status == 200) {
                            data = angular.fromJson(data);
                            var headers = getHeaders();
                            var ret = <IIssueCount>{
                                count: parseInt(headers["X-Total"]) || null
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