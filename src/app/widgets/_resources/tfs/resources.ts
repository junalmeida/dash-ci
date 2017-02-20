namespace DashCI.Widgets.Resources.Tfs {

    export interface ITfsResource extends ng.resource.IResourceClass<ITfsObject> {
        project_list(): IProjectResult
        query_list(param: { project: string }): IQueryResult
        run_query(param: { project: string; queryId: string }): IRunQueryResult;
        latest_build(param: { project: string; build: string }): IBuildResult;
        build_definition_list(param: { project: string; }): IBuildDefinitionResult;
    }
    const private_token = "xcxwole6pqc3r2h7d53pj3723hp5ecpbnqa5mhr7s5stxkzpin7q";
    const host = "https://junalmeida.visualstudio.com/DefaultCollection";

    DashCI.app.factory('tfsResources',
        ['$resource', ($resource: ng.resource.IResourceService): ITfsResource => {

            var string = ":" + private_token;
            var encodedString = "Basic " + btoa(string);

            // Return the resource, include your custom actions
            return <ITfsResource>$resource(host, {}, {
                project_list: <ng.resource.IActionDescriptor>{
                    method: 'GET',
                    isArray: false,
                    url: host + "/_apis/projects?api-version=2.2",
                    headers: {
                        "Authorization": encodedString,
                    },
                },

                query_list: <ng.resource.IActionDescriptor>{
                    method: 'GET',
                    isArray: false,
                    url: host + "/:project/_apis/wit/queries?$depth=2&$expand=all&api-version=2.2",
                    headers: {
                        "Authorization": encodedString,
                    },
                },

                run_query: <ng.resource.IActionDescriptor>{
                    method: 'GET',
                    isArray: false,
                    url: host + "/:project/_apis/wit/wiql/:queryId?api-version=2.2",
                    headers: {
                        "Authorization": encodedString,
                    },
                },

                latest_build: <ng.resource.IActionDescriptor>{
                    method: 'GET',
                    isArray: false,
                    url: host + "/:project/_apis/build/builds?definitions=:build&$top=1&api-version=2.2",
                    headers: {
                        "Authorization": encodedString,
                    },
                },

                build_definition_list: <ng.resource.IActionDescriptor>{
                    method: 'GET',
                    isArray: false,
                    url: host + "/:project/_apis/build/definitions?api-version=2.2",
                    headers: {
                        "Authorization": encodedString,
                    },
                },

            });

    }])
}