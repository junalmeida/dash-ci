namespace DashCI.Resources.Tfs {

    export interface ITfsResource extends ng.resource.IResourceClass<ITfsObject> {
        project_list(): IProjectResult
        query_list(param: { project: string }): IQueryResult
        run_query(param: { project: string; queryId: string }): IRunQueryResult;
        latest_build(param: { project: string; build: number }): IBuildResult;
        recent_builds(param: { project: string; build: number, count: number }): IBuildResult;
        build_definition_list(param: { project: string; }): IBuildDefinitionResult;

        release_definition_list(param: { project: string; }): IReleaseDefinitionResult;
        recent_releases(param: { project: string; release: number }): IReleaseResult;
    }

    DashCI.app.factory('tfsResources',
        ['$resource', 'globalOptions',
            ($resource: ng.resource.IResourceService, globalOptions: Models.IOptions) => (): ITfsResource => {
                if (!globalOptions || !globalOptions.tfs || !globalOptions.tfs.host)
                    return null;

                var withCredentials = false;
                var headers = {
                    "Authorization": <string>null
                };
                if (globalOptions.tfs.privateToken) {
                    var encodedString = "Basic " + btoa(":" + globalOptions.tfs.privateToken);
                    headers["Authorization"] = encodedString;
                }
                else {
                    delete headers.Authorization;
                    withCredentials = true;
                }
                // Return the resource, include your custom actions
                return <ITfsResource>$resource(globalOptions.tfs.host, {}, {
                    project_list: <ng.resource.IActionDescriptor>{
                        method: 'GET',
                        isArray: false,
                        url: globalOptions.tfs.host + "/_apis/projects?api-version=2.2",
                        headers: headers,
                        cache: true,
                        withCredentials: withCredentials
                    },

                    query_list: <ng.resource.IActionDescriptor>{
                        method: 'GET',
                        isArray: false,
                        url: globalOptions.tfs.host + "/:project/_apis/wit/queries?$depth=2&$expand=all&api-version=2.2",
                        headers: headers,
                        cache: true,
                        withCredentials: withCredentials
                    },

                    run_query: <ng.resource.IActionDescriptor>{
                        method: 'GET',
                        isArray: false,
                        url: globalOptions.tfs.host + "/:project/_apis/wit/wiql/:queryId?api-version=2.2",
                        headers: headers,
                        cache: false,
                        withCredentials: withCredentials
                    },

                    latest_build: <ng.resource.IActionDescriptor>{
                        method: 'GET',
                        isArray: false,
                        url: globalOptions.tfs.host + "/:project/_apis/build/builds?definitions=:build&$top=1&api-version=2.2",
                        headers: headers,
                        cache: false,
                        withCredentials: withCredentials
                    },

                    recent_builds: <ng.resource.IActionDescriptor>{
                        method: 'GET',
                        isArray: false,
                        url: globalOptions.tfs.host + "/:project/_apis/build/builds?definitions=:build&$top=:count&api-version=2.2",
                        headers: headers,
                        cache: false,
                        withCredentials: withCredentials
                    },

                    build_definition_list: <ng.resource.IActionDescriptor>{
                        method: 'GET',
                        isArray: false,
                        url: globalOptions.tfs.host + "/:project/_apis/build/definitions?api-version=2.2",
                        headers: headers,
                        cache: false,
                        withCredentials: withCredentials
                    },

                    release_definition_list: <ng.resource.IActionDescriptor>{
                        method: 'GET',
                        isArray: false,
                        url: globalOptions.tfs.host.replace(".visualstudio.com", ".vsrm.visualstudio.com") + "/:project/_apis/release/definitions?api-version=3.0-preview.1",
                        headers: headers,
                        cache: false,
                        withCredentials: withCredentials
                    },

                    recent_releases: <ng.resource.IActionDescriptor>{
                        method: 'GET',
                        isArray: false,
                        url: globalOptions.tfs.host.replace(".visualstudio.com", ".vsrm.visualstudio.com") + "/:project/_apis/release/releases?api-version=3.0-preview.1&definitionId=:release&$expand=environments&$top=1&queryOrder=descending",
                        headers: headers,
                        cache: false,
                        withCredentials: withCredentials
                    },

                });
            }]);
}