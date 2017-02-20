namespace DashCI.Widgets.Resources.Gitlab {

    export interface IGitlabResource extends ng.resource.IResourceClass<IGitlabObject> {
        project_list(): IProject[];
        issue_count(param: { project: number; labels: string; state: string }): IIssueCount;
        latest_pipeline(param: { project: number; ref: string; }): IPipeline[];
    }
    const private_token = "";
    const host = "https://gitlab.com/api/v3/";

    DashCI.app.factory('gitlabResources',
        ['$resource', ($resource: ng.resource.IResourceService): IGitlabResource => {

            var transform = (data: any, headers: any) => {
                var data = angular.fromJson(data);
                if (data && typeof(data) === "object")
                    data.headers = headers();

                return data;
            };

            // Return the resource, include your custom actions
            return <IGitlabResource>$resource(host, {}, {
                project_list: <ng.resource.IActionDescriptor>{
                    method: 'GET',
                    isArray: true,
                    url: host + "projects?order_by=name&per_page=100",
                    headers: {
                        "PRIVATE-TOKEN": private_token,
                        "Access-Control-Allow-Headers": "X-Total, X-Page, X-Total-Pages"
                    },
                    transformResponse: transform
                },

                issue_count: <ng.resource.IActionDescriptor>{
                    method: 'GET',
                    isArray: false,
                    url: host + "projects/:project/issues?labels=:labels&state=:state&per_page=1",
                    headers: {
                        "PRIVATE-TOKEN": private_token,
                        "Access-Control-Allow-Headers": "X-Total"
                    },
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
                    url: host + "projects/:project/pipelines?scope=branches&ref=:ref&per_page=100",
                    headers: {
                        "PRIVATE-TOKEN": private_token,
                        "Access-Control-Allow-Headers": "X-Total"
                    },

                    //transformResponse: (data: any, getHeaders: Function, status: number) => {
                    //    if (status == 200) {
                    //        var refList = "master".split(",");
                    //        data = angular.fromJson(data);

                    //        data = data.filter((i:any) => refList.indexOf(i.ref) == 0);
                            
                    //        if (data.length >= 1)
                    //            return data[0];
                    //        else
                    //            return null;
                    //    }
                    //    else
                    //        return data;

                    //}
                }

            });

    }])
}