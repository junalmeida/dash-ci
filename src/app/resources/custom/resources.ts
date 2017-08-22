namespace DashCI.Resources.Custom {

    export interface ICustomResource extends ng.resource.IResourceClass<any> {
        execute_count(param: { route: string, params?: string }): ICount;
        execute_list(param: { route: string, params?: string }): IList;
    }

    DashCI.app.factory('customResources',
        ['$resource', 'globalOptions',
            ($resource: ng.resource.IResourceService, globalOptions: Models.IOptions) => (label: string): ICustomResource => {

            if (!globalOptions || !globalOptions.custom || globalOptions.custom.length == 0)
            return null;

            var accounts = globalOptions.custom.filter((item) => item.label == label);
            if (!accounts || accounts.length != 1)
                return null;

            var headers = {
                "Authorization": <string>null,
                //"Access-Control-Request-Headers": "X-Total, X-Page, X-Total-Pages"
            };
            if (accounts[0].basicAuth)
                headers.Authorization = "Basic " + accounts[0].basicAuth;// btoa(accounts[0].username + ":" + accounts[0].privateToken);
            else
                delete headers.Authorization;



            var countParser = (data: any, getHeaders: Function, status: number) => {
                if (status == 200) {
                    data = angular.fromJson(data);
                    var headers = getHeaders();
                    var parameter = accounts[0].jsonCountToken;

                    var parsedCount = parseInt(headers[parameter]);
                    if (isNaN(parsedCount))
                        parsedCount = parseInt(data[parameter]);
                    if (isNaN(parsedCount)) {
                        for (var node in data) {
                            parsedCount = parseInt(data[node][parameter]);
                            if (!isNaN(parsedCount))
                                break;
                        }
                    }

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


            var listParser = (data: any, getHeaders: Function, status: number) => {
                if (status == 200) {
                    var count = <ICount>countParser(data, getHeaders, status);
                   

                    data = angular.fromJson(data);
                    var parameter = accounts[0].jsonListToken;

                    var parsedList = <any[]>(parameter ? data[parameter] : data);


                    var ret = <IList>{
                        count: count.count,
                        list: parsedList
                    };
                    return ret;
                }
                else
                    return data;

            };


            var host = accounts[0].baseUrl;
            // Return the resource, include your custom actions
            return <ICustomResource>$resource(host, {}, {
                execute_count: <ng.resource.IActionDescriptor>{
                    method: 'GET',
                    isArray: false,
                    url: host + ":route?:params",
                    headers: headers,
                    cache: false,
                    transformResponse: countParser
                },
                execute_list: <ng.resource.IActionDescriptor>{
                    method: 'GET',
                    isArray: false,
                    url: host + ":route?:params",
                    headers: headers,
                    cache: false,
                    transformResponse: listParser
                },
            });
    }])
}