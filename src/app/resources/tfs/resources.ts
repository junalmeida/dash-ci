namespace DashCI.Resources.Tfs {

    export interface ITfsResource extends ng.resource.IResourceClass<ITfsObject> {
        project_list(): IProjectResult
        query_list(param: { project: string, folder: string }): IQueryResult
        run_query(param: { project: string; queryId: string }): IRunQueryResult;
        latest_build(param: { project: string; build: number }): IBuildResult;
        recent_builds(param: { project: string; build: number, count: number }): IBuildResult;
        build_definition_list(param: { project: string; }): IBuildDefinitionResult;

        release_definition_list(param: { project: string; }): IReleaseDefinitionListResult;
        latest_release_environments(param: { project: string; release: number }): IReleaseEnvironmentResult;
        recent_releases(param: { project: string; release: number }): IReleaseResult;
        release_definition(param: { project: string; release: number }): IReleaseDefinition;
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

                var tfs_release_preview = globalOptions.tfs.host.replace(".visualstudio.com", ".vsrm.visualstudio.com");
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
                        url: globalOptions.tfs.host + "/:project/_apis/wit/queries/:folder?$depth=2&$expand=all&api-version=2.2",
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
                        url: tfs_release_preview + "/:project/_apis/release/definitions?api-version=2.2-preview.1",
                        headers: headers,
                        cache: false,
                        withCredentials: withCredentials
                    },

                    release_definition: <ng.resource.IActionDescriptor>{
                        method: 'GET',
                        isArray: false,
                        url: tfs_release_preview + "/:project/_apis/release/definitions/:release?api-version=2.2-preview.1",
                        headers: headers,
                        cache: false,
                        withCredentials: withCredentials
                    },

                    latest_release_environments: <ng.resource.IActionDescriptor>{
                        method: 'GET',
                        isArray: false,
                        url: tfs_release_preview + "/:project/_apis/release/releases?api-version=2.2-preview.1&definitionId=:release&releaseCount=1&includeArtifact=false",
                        headers: headers,
                        cache: false,
                        withCredentials: withCredentials
                    },

                    recent_releases: <ng.resource.IActionDescriptor>{
                        method: 'GET',
                        isArray: false,
                        url: tfs_release_preview + "/:project/_apis/release/releases?api-version=2.2-preview.1&definitionId=:release&$expand=environments&$top=25&queryOrder=descending",
                        headers: headers,
                        cache: false,
                        withCredentials: withCredentials
                    },

                });
            }]);
}