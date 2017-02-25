"use strict";
var DashCI;
(function (DashCI) {
    DashCI.app = angular.module("dashboard", [
        "widgetGrid",
        "ngMaterial",
        "ngResource",
        "angularCSS"
    ]);
    var Config = (function () {
        function Config() {
        }
        // suppress iOS' rubber band effect 
        // c.f.http://stackoverflow.com/a/26853900 
        Config.supressIosRubberEffect = function () {
            var firstMove = false;
            window.addEventListener('touchstart', function (e) {
                firstMove = true;
            });
            window.addEventListener('touchmove', function (e) {
                if (firstMove) {
                    e.preventDefault();
                    firstMove = false;
                }
            });
        };
        return Config;
    }());
    $(Config.supressIosRubberEffect);
    DashCI.app.config(["$mdThemingProvider", "$resourceProvider", function ($mdThemingProvider, $resourceProvider) {
            $mdThemingProvider.theme('default')
                .dark()
                .accentPalette('orange');
            //$resourceProvider.defaults.stripTrailingSlashes = true;
        }]);
    DashCI.app.run(["$rootScope", function ($rootScope) {
            angular.element(window).on("resize", function () {
                $rootScope.$apply();
            });
        }]);
    function wildcardMatch(pattern, source) {
        pattern = pattern.replace(/[\-\[\]\/\{\}\(\)\+\.\\\^\$\|]/g, "\\$&");
        pattern = pattern.replace(/\*/g, ".*");
        pattern = pattern.replace(/\?/g, ".");
        var regEx = new RegExp(pattern, "i");
        return regEx.test(source);
    }
    DashCI.wildcardMatch = wildcardMatch;
})(DashCI || (DashCI = {}));
/// <reference path="../app.ts" />
"use strict";
var DashCI;
(function (DashCI) {
    var Core;
    (function (Core) {
        var AddWidgetController = (function () {
            function AddWidgetController($mdDialog, widgets) {
                this.$mdDialog = $mdDialog;
                this.widgets = widgets;
            }
            AddWidgetController.prototype.cancel = function () {
                this.$mdDialog.cancel();
            };
            AddWidgetController.prototype.select = function (type) {
                this.$mdDialog.hide(type);
            };
            return AddWidgetController;
        }());
        AddWidgetController.$inject = ["$mdDialog", "widgets"];
        Core.AddWidgetController = AddWidgetController;
    })(Core = DashCI.Core || (DashCI.Core = {}));
})(DashCI || (DashCI = {}));
/// <reference path="../app.ts" />
"use strict";
var DashCI;
(function (DashCI) {
    var Core;
    (function (Core) {
        var GlobalConfigController = (function () {
            function GlobalConfigController($timeout, $mdDialog, $scope, $rootscope, vm) {
                var _this = this;
                this.$timeout = $timeout;
                this.$mdDialog = $mdDialog;
                this.$rootscope = $rootscope;
                this.vm = vm;
                this.pageCount = this.vm.pages.length;
                $scope.$watch(function () { return _this.pageCount; }, function () { return _this.updatePages(); });
            }
            GlobalConfigController.prototype.ok = function () {
                this.$mdDialog.hide();
            };
            GlobalConfigController.prototype.updatePages = function () {
                if (this.pageCount < 1)
                    this.pageCount = 1;
                if (this.pageCount > 5)
                    this.pageCount = 5;
                if (this.pageCount < this.vm.pages.length) {
                    for (var i = this.vm.pages.length; i > this.pageCount; i--) {
                        this.vm.pages.pop();
                    }
                }
                else if (this.pageCount > this.vm.pages.length) {
                    for (var i = this.vm.pages.length; i < this.pageCount; i++) {
                        var id = (this.vm.pages.length + 1).toString();
                        this.vm.pages.push({
                            id: id,
                            name: "Dash-CI " + id.toString(),
                            widgets: []
                        });
                    }
                }
            };
            GlobalConfigController.prototype.reset = function () {
            };
            GlobalConfigController.prototype.import = function () {
                var _this = this;
                var inputFile = $("#import").get(0);
                var reader = new FileReader();
                reader.onload = function (event) {
                    try {
                        var obj = angular.fromJson(event.target.result);
                        if (obj && obj.pages && obj.pages.length && obj.pages.length > 0) {
                            if (confirm("This will reset your current configuration and replace with the file imported.\n\nConfirm importing the file?")) {
                                _this.vm.pages = null;
                                angular.extend(_this.vm, obj);
                            }
                            alert("File imported successfully");
                            _this.$rootscope.$apply();
                            _this.$rootscope.$broadcast("dashci-refresh");
                        }
                        else
                            throw "File format not supported.";
                    }
                    catch (e) {
                        alert(e);
                    }
                };
                reader.readAsText(inputFile.files[0]);
                inputFile.value = null;
            };
            GlobalConfigController.prototype.export = function () {
                var data = jQuery.extend(true, {}, this.vm);
                data.gitlab.privateToken = null;
                data.tfs.privateToken = null;
                var datatxt = angular.toJson(data);
                var myBlob = new Blob([datatxt], { type: "application/json" });
                var url = window.URL.createObjectURL(myBlob);
                var a = document.createElement("a");
                a.style.display = "none";
                document.body.appendChild(a);
                a.href = url;
                a.download = "dash-ci.json";
                a.click();
                this.$timeout(function () { return window.URL.revokeObjectURL(url); }, 1000);
                alert("Your configuration was exported. Take note of your private keys, they are not saved to the exported file.");
            };
            return GlobalConfigController;
        }());
        GlobalConfigController.$inject = ["$timeout", "$mdDialog", "$scope", "$rootScope", "config"];
        Core.GlobalConfigController = GlobalConfigController;
    })(Core = DashCI.Core || (DashCI.Core = {}));
})(DashCI || (DashCI = {}));
/// <reference path="../app.ts" />
"use strict";
var DashCI;
(function (DashCI) {
    var Core;
    (function (Core) {
        var MainController = (function () {
            function MainController($scope, $timeout, $q, $mdDialog, options) {
                var _this = this;
                this.$scope = $scope;
                this.$timeout = $timeout;
                this.$q = $q;
                this.$mdDialog = $mdDialog;
                this.options = options;
                this.gridWidth = 800;
                this.gridHeight = 600;
                this.editable = false;
                this.additionPossible = true;
                this.gridOptions = {
                    showGrid: false,
                    highlightNextPosition: false
                };
                this.updateGridSize = function () {
                    _this.$timeout(function () {
                        var grid = document.getElementById('grid');
                        _this.gridWidth = grid.clientWidth;
                        _this.gridHeight = grid.clientHeight;
                    }, 500);
                };
                this.loadData();
                window.onresize = this.updateGridSize;
                this.$scope.$on('wg-grid-full', function () {
                    _this.additionPossible = false;
                });
                this.$scope.$on('wg-grid-space-available', function () {
                    _this.additionPossible = true;
                });
                this.$scope.$on('wg-update-position', function (event, widgetInfo) {
                    console.log('A widget has changed its position!', widgetInfo);
                });
                this.$scope.$on("dashci-refresh", function () {
                    _this.currentPage = null;
                    _this.selectedPageId = _this.options.pages[0].id;
                    _this.changePage();
                });
                this.$scope.$watch(function () { return _this.selectedPageId; }, function () { return _this.changePage(); });
                this.updateGridSize();
            }
            MainController.prototype.changePage = function () {
                var _this = this;
                if (!this.currentPage || this.selectedPageId != this.currentPage.id) {
                    this.currentPage = null;
                    this.$timeout(function () {
                        _this.currentPage = _this.options.pages.filter(function (item) { return item.id == _this.selectedPageId; })[0];
                    }, 500);
                }
            };
            MainController.prototype.addWidgetDialog = function (ev) {
                var _this = this;
                if (this.additionPossible) {
                    this.$mdDialog.show({
                        controller: Core.AddWidgetController,
                        controllerAs: "ctrl",
                        templateUrl: 'app/core/add-widget.html',
                        parent: angular.element(document.body),
                        //targetEvent: ev,
                        clickOutsideToClose: true,
                        fullscreen: false,
                    })
                        .then(function (type) { return _this.createWidget(type); });
                }
            };
            MainController.prototype.globalConfigDialog = function (ev) {
                var _this = this;
                this.$mdDialog.show({
                    controller: Core.GlobalConfigController,
                    controllerAs: "ctrl",
                    templateUrl: 'app/core/global-config.html',
                    parent: angular.element(document.body),
                    //targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: false,
                    resolve: {
                        config: function () {
                            var deferred = _this.$q.defer();
                            _this.$timeout(function () { return deferred.resolve(_this.options); }, 1);
                            return deferred.promise;
                        }
                    }
                })
                    .then(function () { return _this.saveData(); });
            };
            MainController.prototype.removeWidget = function (widget) {
                var idx = this.currentPage.widgets.indexOf(widget);
                if (idx > -1) {
                    this.currentPage.widgets.splice(idx, 1);
                }
            };
            MainController.prototype.toggleEditable = function () {
                this.editable = !this.editable;
                this.gridOptions.showGrid = this.editable;
                this.saveData();
            };
            MainController.prototype.createWidget = function (type) {
                this.currentPage.widgets.push({
                    type: type,
                    position: { left: -1, top: -1, width: 6, height: 4 }
                });
                this.saveData();
            };
            MainController.prototype.saveData = function () {
                window.localStorage['dash-ci-options'] = angular.toJson(this.options);
            };
            MainController.prototype.loadData = function () {
                var defOptions = {
                    columns: 30,
                    rows: 20,
                    tfs: null,
                    gitlab: null,
                    github: [],
                    circleci: [],
                    pages: [{
                            id: "1",
                            name: "Dash-CI",
                            widgets: []
                        }]
                };
                var savedOpts = (angular.fromJson(window.localStorage['dash-ci-options']) || defOptions);
                angular.extend(this.options, defOptions, savedOpts);
                angular.forEach(savedOpts.pages, function (item) {
                    item.name = item.name || "Dash-CI";
                });
                this.currentPage = this.options.pages[0]; //preparing to support multiple pages
            };
            return MainController;
        }());
        MainController.$inject = ["$scope", "$timeout", "$q", "$mdDialog", "globalOptions"];
        DashCI.app.controller("MainController", MainController);
    })(Core = DashCI.Core || (DashCI.Core = {}));
})(DashCI || (DashCI = {}));
/// <reference path="../app.ts" />
"use strict";
var DashCI;
(function (DashCI) {
    var Models;
    (function (Models) {
        DashCI.app.constant("colors", [
            {
                code: "semi-transp",
                desc: "Semi Transparent"
            },
            {
                code: "red",
                desc: "Red"
            },
            {
                code: "green",
                desc: "Green"
            },
            {
                code: "turkoise",
                desc: "Turkoise"
            },
            {
                code: "purple",
                desc: "Purple"
            },
            {
                code: "pink",
                desc: "Pink"
            },
            {
                code: "blue",
                desc: "Blue"
            },
            {
                code: "amber",
                desc: "Amber"
            },
            {
                code: "orange",
                desc: "Orange"
            },
            {
                code: "brown",
                desc: "Brown"
            },
            {
                code: "grey",
                desc: "Grey"
            },
        ]);
        DashCI.app.constant("intervals", [
            {
                value: 10000,
                desc: "10 secs"
            },
            {
                value: 20000,
                desc: "20 secs"
            },
            {
                value: 30000,
                desc: "30 secs"
            },
            {
                value: 60000,
                desc: "1 min"
            },
            {
                value: 120000,
                desc: "2 min"
            },
        ]);
    })(Models = DashCI.Models || (DashCI.Models = {}));
})(DashCI || (DashCI = {}));
"use strict";
/// <reference path="../app.ts" />
var DashCI;
(function (DashCI) {
    var Models;
    (function (Models) {
        DashCI.app.value("globalOptions", {});
    })(Models = DashCI.Models || (DashCI.Models = {}));
})(DashCI || (DashCI = {}));
/// <reference path="../app.ts" />
"use strict";
var DashCI;
(function (DashCI) {
    var Models;
    (function (Models) {
        var WidgetType;
        (function (WidgetType) {
            WidgetType[WidgetType["clock"] = 1] = "clock";
            WidgetType[WidgetType["gitlabPipeline"] = 2] = "gitlabPipeline";
            WidgetType[WidgetType["gitlabIssues"] = 3] = "gitlabIssues";
            WidgetType[WidgetType["tfsQueryCount"] = 4] = "tfsQueryCount";
            WidgetType[WidgetType["labelTitle"] = 5] = "labelTitle";
            WidgetType[WidgetType["tfsBuild"] = 6] = "tfsBuild";
            WidgetType[WidgetType["gitlabPipelineGraph"] = 7] = "gitlabPipelineGraph";
            WidgetType[WidgetType["tfsBuildGraph"] = 8] = "tfsBuildGraph";
            WidgetType[WidgetType["githubIssues"] = 9] = "githubIssues";
            WidgetType[WidgetType["tfsRelease"] = 10] = "tfsRelease";
        })(WidgetType = Models.WidgetType || (Models.WidgetType = {}));
        DashCI.app.constant("widgets", [
            {
                type: WidgetType.clock,
                title: "Clock",
                desc: "Current date and time."
            },
            {
                type: WidgetType.labelTitle,
                directive: "label-title",
                title: "Label",
                desc: "Static label to create semantic areas"
            },
            {
                type: WidgetType.gitlabPipeline,
                directive: "gitlab-pipeline",
                title: "GitLab - Pipeline",
                desc: "The (almost) real time pipeline status for a branch."
            },
            {
                type: WidgetType.gitlabPipelineGraph,
                directive: "gitlab-pipeline-graph",
                title: "GitLab - Pipeline Graph",
                desc: "The pipeline graph for last N status for a branch."
            },
            {
                type: WidgetType.gitlabIssues,
                directive: "gitlab-issues",
                title: "GitLab - Issue Query",
                desc: "The count of an issue query against a project."
            },
            {
                type: WidgetType.tfsBuild,
                directive: "tfs-build",
                title: "TFS - Build",
                desc: "The (almost) real time build definition status for a project."
            },
            {
                type: WidgetType.tfsBuildGraph,
                directive: "tfs-build-graph",
                title: "TFS - Build Graph",
                desc: "The build graph for last N builds of a branch."
            },
            {
                type: WidgetType.tfsRelease,
                directive: "tfs-release",
                title: "TFS - Release Status",
                desc: "The release status for a release definition."
            },
            {
                type: WidgetType.tfsQueryCount,
                directive: "tfs-query-count",
                title: "TFS - Query Count",
                desc: "The count of a saved query against a project."
            },
            {
                type: WidgetType.githubIssues,
                directive: "github-issues",
                title: "GitHub - Issue Query",
                desc: "The count of an issue query against a repository."
            },
        ]);
    })(Models = DashCI.Models || (DashCI.Models = {}));
})(DashCI || (DashCI = {}));
"use strict";
"use strict";
var DashCI;
(function (DashCI) {
    var Resources;
    (function (Resources) {
        var Github;
        (function (Github) {
            DashCI.app.factory('githubResources', ['$resource', 'globalOptions',
                function ($resource, globalOptions) { return function (username) {
                    if (!globalOptions || !globalOptions.github || globalOptions.github.length == 0)
                        return null;
                    var accounts = globalOptions.github.filter(function (item) { return item.username == username; });
                    if (!accounts || accounts.length != 1)
                        return null;
                    var host = "https://api.github.com";
                    var headers = {
                        "Authorization": null,
                    };
                    if (accounts[0].privateToken)
                        headers.Authorization = "Basic " + btoa(accounts[0].username + ":" + accounts[0].privateToken);
                    else
                        delete headers.Authorization;
                    var transform = function (data, headers) {
                        var data = angular.fromJson(data);
                        if (data && typeof (data) === "object")
                            data.headers = headers();
                        return data;
                    };
                    var countParser = function (data, getHeaders, status) {
                        if (status == 200) {
                            data = angular.fromJson(data);
                            var headers = getHeaders();
                            var parsedCount = parseInt(headers["X-Total"]);
                            if (isNaN(parsedCount)) {
                                parsedCount = 0;
                                //cannot access X-Total today, let's parse
                                var links = headers.link.split('>');
                                angular.forEach(links, function (item) {
                                    var matches = item.match(/&page=(\d*)/);
                                    if (matches && matches.length > 1) {
                                        var page = Number(matches[1]);
                                        if (page > parsedCount)
                                            parsedCount = page;
                                    }
                                });
                            }
                            var ret = {
                                count: parsedCount
                            };
                            return ret;
                        }
                        else
                            return data;
                    };
                    // Return the resource, include your custom actions
                    return $resource(host, {}, {
                        repository_list: {
                            method: 'GET',
                            isArray: true,
                            url: host + "/user/repos?sort=updated&direction=desc&per_page=100",
                            headers: headers,
                            transformResponse: transform,
                            cache: true
                        },
                        issue_count: {
                            method: 'GET',
                            isArray: false,
                            url: host + "/repos/:owner/:repository/issues?labels=:labels&state=:state&per_page=1",
                            headers: headers,
                            cache: false,
                            transformResponse: countParser
                        },
                    });
                }; }]);
        })(Github = Resources.Github || (Resources.Github = {}));
    })(Resources = DashCI.Resources || (DashCI.Resources = {}));
})(DashCI || (DashCI = {}));
"use strict";
"use strict";
var DashCI;
(function (DashCI) {
    var Resources;
    (function (Resources) {
        var Gitlab;
        (function (Gitlab) {
            DashCI.app.factory('gitlabResources', ['$resource', 'globalOptions',
                function ($resource, globalOptions) { return function () {
                    if (!globalOptions || !globalOptions.gitlab || !globalOptions.gitlab.host)
                        return null;
                    var headers = {
                        "PRIVATE-TOKEN": null,
                    };
                    if (globalOptions.gitlab.privateToken)
                        headers["PRIVATE-TOKEN"] = globalOptions.gitlab.privateToken;
                    else
                        delete headers["PRIVATE-TOKEN"];
                    var transform = function (data, headers) {
                        var data = angular.fromJson(data);
                        if (data && typeof (data) === "object")
                            data.headers = headers();
                        return data;
                    };
                    var countParser = function (data, getHeaders, status) {
                        if (status == 200) {
                            data = angular.fromJson(data);
                            var headers = getHeaders();
                            var parsedCount = parseInt(headers["X-Total"]);
                            if (isNaN(parsedCount)) {
                                parsedCount = 0;
                                //cannot access X-Total today, let's parse
                                var links = headers.link.split('>');
                                angular.forEach(links, function (item) {
                                    var matches = item.match(/page=(\d*)/);
                                    if (matches && matches.length > 1) {
                                        var page = Number(matches[1]);
                                        if (page > parsedCount)
                                            parsedCount = page;
                                    }
                                });
                            }
                            var ret = {
                                count: parsedCount
                            };
                            return ret;
                        }
                        else
                            return data;
                    };
                    // Return the resource, include your custom actions
                    return $resource(globalOptions.gitlab.host, {}, {
                        project_list: {
                            method: 'GET',
                            isArray: true,
                            url: globalOptions.gitlab.host + "/api/v3/projects?order_by=last_activity_at&sort=desc&per_page=100",
                            headers: headers,
                            transformResponse: transform,
                            cache: true
                        },
                        group_list: {
                            method: 'GET',
                            isArray: true,
                            url: globalOptions.gitlab.host + "/api/v3/groups?all_available=true&order_by=name&sort=asc&per_page=100",
                            headers: headers,
                            transformResponse: transform,
                            cache: true
                        },
                        issue_count: {
                            method: 'GET',
                            isArray: false,
                            url: globalOptions.gitlab.host + "/api/v3/:scope/:scopeId/issues?labels=:labels&state=:state&per_page=1",
                            headers: headers,
                            cache: false,
                            transformResponse: countParser
                        },
                        latest_pipeline: {
                            method: 'GET',
                            isArray: true,
                            url: globalOptions.gitlab.host + "/api/v3/projects/:project/pipelines?scope=branches&ref=:ref&per_page=100",
                            cache: false,
                            headers: headers
                        },
                        recent_pipelines: {
                            method: 'GET',
                            isArray: true,
                            url: globalOptions.gitlab.host + "/api/v3/projects/:project/pipelines?ref=:ref&per_page=:count",
                            cache: false,
                            headers: headers
                        },
                        commit_count: {
                            method: 'GET',
                            isArray: true,
                            url: globalOptions.gitlab.host + "/api/v3/projects/:project/repository/commits?ref_name=:ref&since=:since&per_page=1",
                            cache: false,
                            transformResponse: countParser
                        }
                    });
                }; }]);
        })(Gitlab = Resources.Gitlab || (Resources.Gitlab = {}));
    })(Resources = DashCI.Resources || (DashCI.Resources = {}));
})(DashCI || (DashCI = {}));
"use strict";
"use strict";
var DashCI;
(function (DashCI) {
    var Resources;
    (function (Resources) {
        var Tfs;
        (function (Tfs) {
            DashCI.app.factory('tfsResources', ['$resource', 'globalOptions',
                function ($resource, globalOptions) { return function () {
                    if (!globalOptions || !globalOptions.tfs || !globalOptions.tfs.host)
                        return null;
                    var withCredentials = false;
                    var headers = {
                        "Authorization": null
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
                    return $resource(globalOptions.tfs.host, {}, {
                        project_list: {
                            method: 'GET',
                            isArray: false,
                            url: globalOptions.tfs.host + "/_apis/projects?api-version=2.2",
                            headers: headers,
                            cache: true,
                            withCredentials: withCredentials
                        },
                        query_list: {
                            method: 'GET',
                            isArray: false,
                            url: globalOptions.tfs.host + "/:project/_apis/wit/queries?$depth=2&$expand=all&api-version=2.2",
                            headers: headers,
                            cache: true,
                            withCredentials: withCredentials
                        },
                        run_query: {
                            method: 'GET',
                            isArray: false,
                            url: globalOptions.tfs.host + "/:project/_apis/wit/wiql/:queryId?api-version=2.2",
                            headers: headers,
                            cache: false,
                            withCredentials: withCredentials
                        },
                        latest_build: {
                            method: 'GET',
                            isArray: false,
                            url: globalOptions.tfs.host + "/:project/_apis/build/builds?definitions=:build&$top=1&api-version=2.2",
                            headers: headers,
                            cache: false,
                            withCredentials: withCredentials
                        },
                        recent_builds: {
                            method: 'GET',
                            isArray: false,
                            url: globalOptions.tfs.host + "/:project/_apis/build/builds?definitions=:build&$top=:count&api-version=2.2",
                            headers: headers,
                            cache: false,
                            withCredentials: withCredentials
                        },
                        build_definition_list: {
                            method: 'GET',
                            isArray: false,
                            url: globalOptions.tfs.host + "/:project/_apis/build/definitions?api-version=2.2",
                            headers: headers,
                            cache: false,
                            withCredentials: withCredentials
                        },
                        release_definition_list: {
                            method: 'GET',
                            isArray: false,
                            url: tfs_release_preview + "/:project/_apis/release/definitions?api-version=3.0-preview.1",
                            headers: headers,
                            cache: false,
                            withCredentials: withCredentials
                        },
                        latest_release: {
                            method: 'GET',
                            isArray: false,
                            url: tfs_release_preview + "/:project/_apis/release/releases?api-version=3.0-preview.1&definitionId=:release&$expand=environments&$top=1&queryOrder=descending",
                            headers: headers,
                            cache: false,
                            withCredentials: withCredentials
                        },
                        recent_releases: {
                            method: 'GET',
                            isArray: false,
                            url: tfs_release_preview + "/:project/_apis/release/releases?api-version=3.0-preview.1&definitionId=:release&$expand=environments&$top=25&queryOrder=descending",
                            headers: headers,
                            cache: false,
                            withCredentials: withCredentials
                        },
                    });
                }; }]);
        })(Tfs = Resources.Tfs || (Resources.Tfs = {}));
    })(Resources = DashCI.Resources || (DashCI.Resources = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var Clock;
        (function (Clock) {
            var ClockDirective = (function () {
                function ClockDirective() {
                    this.restrict = "E";
                    this.templateUrl = "app/widgets/clock/clock.html";
                    this.replace = false;
                    this.controller = Clock.ClockController;
                    this.controllerAs = "ctrl";
                    /* Binding css to directives */
                    this.css = {
                        href: "app/widgets/clock/clock.css",
                        persist: true
                    };
                }
                ClockDirective.create = function () {
                    var directive = function () { return new ClockDirective(); };
                    directive.$inject = [];
                    return directive;
                };
                return ClockDirective;
            }());
            DashCI.app.directive("clock", ClockDirective.create());
        })(Clock = Widgets.Clock || (Widgets.Clock = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var Clock;
        (function (Clock) {
            var ClockController = (function () {
                function ClockController($scope, $interval) {
                    var _this = this;
                    this.$scope = $scope;
                    this.$interval = $interval;
                    this.data = this.$scope.data;
                    this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                    this.data.type = DashCI.Models.WidgetType.clock;
                    this.data.footer = false;
                    this.data.header = true;
                    this.$scope.$on("$destroy", function () { return _this.finalize(); });
                    this.$scope.$watch(function () { return _this.$scope.$element.height(); }, function (height) { return _this.fontSize(height); });
                    this.init();
                }
                ClockController.prototype.init = function () {
                    var _this = this;
                    this.data.title = this.$scope.data.title || "Clock";
                    this.data.color = this.$scope.data.color || "green";
                    this.handle = this.$interval(function () { return _this.setClock(); }, 1000);
                };
                ClockController.prototype.finalize = function () {
                    if (this.handle)
                        this.$interval.cancel(this.handle);
                    console.log("dispose: " + this.data.id + "-" + this.data.title);
                };
                ClockController.prototype.fontSize = function (height) {
                    var fontSizeTime = Math.round(height / 3.8) + "px";
                    var lineTime = Math.round((height / 2) - 20) + "px";
                    var fontSizeDate = Math.round(height / 5.9) + "px";
                    var lineDate = Math.round((height / 2) - 30) + "px";
                    var date = this.$scope.$element.find(".date");
                    var time = this.$scope.$element.find(".time");
                    date.css('font-size', fontSizeDate);
                    date.css('line-height', lineDate);
                    time.css('font-size', fontSizeTime);
                    time.css('line-height', lineTime);
                };
                ClockController.prototype._formatDoubleDigit = function (digit) {
                    return ('0' + digit).slice(-2);
                };
                ClockController.prototype.setClock = function () {
                    var now = new Date();
                    var locale = 'pt-br';
                    var status = {
                        year: now.getFullYear(),
                        month: (/[a-z]+/gi.exec(now.toLocaleString(locale, { month: "short" })))[0].substring(0, 3),
                        day: now.getDate(),
                        hours: this._formatDoubleDigit(now.getHours()),
                        minutes: this._formatDoubleDigit(now.getMinutes()),
                        seconds: this._formatDoubleDigit(now.getSeconds())
                    };
                    this.date = status.day + ' ' + status.month + ' ' + status.year;
                    this.time = status.hours + ':' + status.minutes + ':' + status.seconds;
                };
                return ClockController;
            }());
            ClockController.$inject = ["$scope", "$interval"];
            Clock.ClockController = ClockController;
        })(Clock = Widgets.Clock || (Widgets.Clock = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var GithubIssues;
        (function (GithubIssues) {
            var GithubIssuesConfigController = (function () {
                function GithubIssuesConfigController($mdDialog, $scope, globalOptions, githubResources, colors, intervals, vm) {
                    var _this = this;
                    this.$mdDialog = $mdDialog;
                    this.$scope = $scope;
                    this.globalOptions = globalOptions;
                    this.githubResources = githubResources;
                    this.colors = colors;
                    this.intervals = intervals;
                    this.vm = vm;
                    this.$scope.$watch(function () { return _this.vm.username; }, function () { return _this.listRepositories(); });
                    this.init();
                }
                GithubIssuesConfigController.prototype.init = function () {
                    var _this = this;
                    this.users = [];
                    angular.forEach(this.globalOptions.github, function (item) { return _this.users.push(item.username); });
                };
                GithubIssuesConfigController.prototype.listRepositories = function () {
                    var _this = this;
                    this.repositories = [];
                    var res = this.githubResources(this.vm.username);
                    if (!res)
                        return;
                    res.repository_list().$promise
                        .then(function (result) {
                        _this.repositories = result;
                    })
                        .catch(function (reason) {
                        console.error(reason);
                    });
                };
                //public cancel() {
                //    this.$mdDialog.cancel();
                //}
                GithubIssuesConfigController.prototype.ok = function () {
                    this.$mdDialog.hide(true);
                };
                return GithubIssuesConfigController;
            }());
            GithubIssuesConfigController.$inject = ["$mdDialog", "$scope", "globalOptions", "githubResources", "colors", "intervals", "config"];
            GithubIssues.GithubIssuesConfigController = GithubIssuesConfigController;
        })(GithubIssues = Widgets.GithubIssues || (Widgets.GithubIssues = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var GithubIssues;
        (function (GithubIssues) {
            var GithubIssuesController = (function () {
                function GithubIssuesController($scope, $q, $timeout, $interval, $mdDialog, githubResources) {
                    var _this = this;
                    this.$scope = $scope;
                    this.$q = $q;
                    this.$timeout = $timeout;
                    this.$interval = $interval;
                    this.$mdDialog = $mdDialog;
                    this.githubResources = githubResources;
                    this.issueCount = null;
                    this.data = this.$scope.data;
                    this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                    this.data.type = DashCI.Models.WidgetType.githubIssues;
                    this.data.footer = false;
                    this.data.header = true;
                    this.$scope.$watch(function () { return _this.$scope.$element.height(); }, function (height) { return _this.sizeFont(height); });
                    this.$scope.$watch(function () { return _this.data.poolInterval; }, function (value) { return _this.updateInterval(); });
                    this.$scope.$on("$destroy", function () { return _this.finalize(); });
                    this.init();
                }
                GithubIssuesController.prototype.finalize = function () {
                    if (this.handle)
                        this.$interval.cancel(this.handle);
                    console.log("dispose: " + this.data.id + "-" + this.data.title);
                };
                GithubIssuesController.prototype.init = function () {
                    this.data.title = this.data.title || "Issues";
                    this.data.color = this.data.color || "red";
                    //default values
                    this.data.labels = this.data.labels || "bug";
                    this.data.status = this.data.status || "open";
                    this.data.poolInterval = this.data.poolInterval || 10000;
                    this.updateInterval();
                    this.update();
                };
                GithubIssuesController.prototype.sizeFont = function (height) {
                    var p = this.$scope.$element.find("p");
                    var fontSize = Math.round(height / 1.3) + "px";
                    var lineSize = Math.round((height) - 60) + "px";
                    p.css('font-size', fontSize);
                    p.css('line-height', lineSize);
                };
                GithubIssuesController.prototype.config = function () {
                    var _this = this;
                    this.$mdDialog.show({
                        controller: GithubIssues.GithubIssuesConfigController,
                        controllerAs: "ctrl",
                        templateUrl: 'app/widgets/github-issues/config.html',
                        parent: angular.element(document.body),
                        //targetEvent: ev,
                        clickOutsideToClose: true,
                        fullscreen: false,
                        resolve: {
                            config: function () {
                                var deferred = _this.$q.defer();
                                _this.$timeout(function () { return deferred.resolve(_this.data); }, 1);
                                return deferred.promise;
                            }
                        }
                    });
                    //.then((ok) => this.createWidget(type));
                };
                GithubIssuesController.prototype.updateInterval = function () {
                    var _this = this;
                    if (this.handle)
                        this.$interval.cancel(this.handle);
                    this.handle = this.$interval(function () { return _this.update(); }, this.data.poolInterval);
                    this.update();
                };
                GithubIssuesController.prototype.update = function () {
                    var _this = this;
                    if (!this.data.repository && !this.data.username)
                        return;
                    var res = this.githubResources(this.data.username);
                    if (!res)
                        return;
                    res.issue_count({
                        owner: this.data.repository.split('/')[0],
                        repository: this.data.repository.split('/')[1],
                        labels: this.data.labels,
                        state: this.data.status
                    }).$promise.then(function (newCount) {
                        //var newCount = Math.round(Math.random() * 100);
                        if (newCount.count != _this.issueCount) {
                            _this.issueCount = newCount.count;
                            var p = _this.$scope.$element.find("p");
                            p.addClass('changed');
                            _this.$timeout(function () { return p.removeClass('changed'); }, 1000);
                        }
                    })
                        .catch(function (reason) {
                        _this.issueCount = null;
                        console.error(reason);
                    });
                    this.$timeout(function () { return _this.sizeFont(_this.$scope.$element.height()); }, 500);
                };
                return GithubIssuesController;
            }());
            GithubIssuesController.$inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "githubResources"];
            GithubIssues.GithubIssuesController = GithubIssuesController;
        })(GithubIssues = Widgets.GithubIssues || (Widgets.GithubIssues = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var GithubIssues;
        (function (GithubIssues) {
            var GithubIssuesDirective = (function () {
                function GithubIssuesDirective() {
                    this.restrict = "E";
                    this.templateUrl = "app/widgets/github-issues/issues.html";
                    this.replace = false;
                    this.controller = GithubIssues.GithubIssuesController;
                    this.controllerAs = "ctrl";
                    /* Binding css to directives */
                    this.css = {
                        href: "app/widgets/github-issues/issues.css",
                        persist: true
                    };
                }
                GithubIssuesDirective.create = function () {
                    var directive = function () { return new GithubIssuesDirective(); };
                    directive.$inject = [];
                    return directive;
                };
                return GithubIssuesDirective;
            }());
            DashCI.app.directive("githubIssues", GithubIssuesDirective.create());
        })(GithubIssues = Widgets.GithubIssues || (Widgets.GithubIssues = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var GitlabIssues;
        (function (GitlabIssues) {
            var GitlabIssuesConfigController = (function () {
                function GitlabIssuesConfigController($mdDialog, gitlabResources, colors, intervals, vm) {
                    this.$mdDialog = $mdDialog;
                    this.gitlabResources = gitlabResources;
                    this.colors = colors;
                    this.intervals = intervals;
                    this.vm = vm;
                    this.init();
                }
                GitlabIssuesConfigController.prototype.init = function () {
                    var _this = this;
                    var res = this.gitlabResources();
                    if (!res)
                        return;
                    res.project_list().$promise
                        .then(function (result) {
                        _this.projects = result;
                    })
                        .catch(function (reason) {
                        console.error(reason);
                        _this.projects = [];
                    });
                    res.group_list().$promise
                        .then(function (result) {
                        _this.groups = result;
                    })
                        .catch(function (reason) {
                        console.error(reason);
                        _this.groups = [];
                    });
                };
                //public cancel() {
                //    this.$mdDialog.cancel();
                //}
                GitlabIssuesConfigController.prototype.ok = function () {
                    this.$mdDialog.hide(true);
                };
                return GitlabIssuesConfigController;
            }());
            GitlabIssuesConfigController.$inject = ["$mdDialog", "gitlabResources", "colors", "intervals", "config"];
            GitlabIssues.GitlabIssuesConfigController = GitlabIssuesConfigController;
        })(GitlabIssues = Widgets.GitlabIssues || (Widgets.GitlabIssues = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var GitlabIssues;
        (function (GitlabIssues) {
            var GitlabIssuesController = (function () {
                function GitlabIssuesController($scope, $q, $timeout, $interval, $mdDialog, gitlabResources) {
                    var _this = this;
                    this.$scope = $scope;
                    this.$q = $q;
                    this.$timeout = $timeout;
                    this.$interval = $interval;
                    this.$mdDialog = $mdDialog;
                    this.gitlabResources = gitlabResources;
                    this.data = this.$scope.data;
                    this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                    this.data.type = DashCI.Models.WidgetType.gitlabIssues;
                    this.data.footer = false;
                    this.data.header = true;
                    this.$scope.$watch(function () { return _this.$scope.$element.height(); }, function (height) { return _this.sizeFont(height); });
                    this.$scope.$watch(function () { return _this.data.poolInterval; }, function (value) { return _this.updateInterval(); });
                    this.$scope.$on("$destroy", function () { return _this.finalize(); });
                    this.init();
                }
                GitlabIssuesController.prototype.finalize = function () {
                    if (this.handle)
                        this.$interval.cancel(this.handle);
                    console.log("dispose: " + this.data.id + "-" + this.data.title);
                };
                GitlabIssuesController.prototype.init = function () {
                    this.data.title = this.data.title || "Issues";
                    this.data.color = this.data.color || "red";
                    //default values
                    this.data.labels = this.data.labels || "bug";
                    this.data.status = this.data.status || "opened";
                    this.data.poolInterval = this.data.poolInterval || 10000;
                    this.updateInterval();
                    this.update();
                };
                GitlabIssuesController.prototype.sizeFont = function (height) {
                    var p = this.$scope.$element.find("p");
                    var fontSize = Math.round(height / 1.3) + "px";
                    var lineSize = Math.round((height) - 60) + "px";
                    p.css('font-size', fontSize);
                    p.css('line-height', lineSize);
                };
                GitlabIssuesController.prototype.config = function () {
                    var _this = this;
                    this.$mdDialog.show({
                        controller: GitlabIssues.GitlabIssuesConfigController,
                        controllerAs: "ctrl",
                        templateUrl: 'app/widgets/gitlab-issues/config.html',
                        parent: angular.element(document.body),
                        //targetEvent: ev,
                        clickOutsideToClose: true,
                        fullscreen: false,
                        resolve: {
                            config: function () {
                                var deferred = _this.$q.defer();
                                _this.$timeout(function () { return deferred.resolve(_this.data); }, 1);
                                return deferred.promise;
                            }
                        }
                    });
                    //.then((ok) => this.createWidget(type));
                };
                GitlabIssuesController.prototype.updateInterval = function () {
                    var _this = this;
                    if (this.handle)
                        this.$interval.cancel(this.handle);
                    this.handle = this.$interval(function () { return _this.update(); }, this.data.poolInterval);
                    this.update();
                };
                GitlabIssuesController.prototype.update = function () {
                    var _this = this;
                    if (!this.data.project && !this.data.group)
                        return;
                    var res = this.gitlabResources();
                    if (!res)
                        return;
                    res.issue_count({
                        scope: this.data.query_type,
                        scopeId: this.data.query_type == 'projects' ? this.data.project : this.data.group,
                        labels: this.data.labels,
                        state: this.data.status
                    }).$promise.then(function (newCount) {
                        //var newCount = Math.round(Math.random() * 100);
                        if (newCount.count != _this.issueCount) {
                            _this.issueCount = newCount.count;
                            var p = _this.$scope.$element.find("p");
                            p.addClass('changed');
                            _this.$timeout(function () { return p.removeClass('changed'); }, 1000);
                        }
                    })
                        .catch(function (reason) {
                        _this.issueCount = null;
                        console.error(reason);
                    });
                    this.$timeout(function () { return _this.sizeFont(_this.$scope.$element.height()); }, 500);
                };
                return GitlabIssuesController;
            }());
            GitlabIssuesController.$inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "gitlabResources"];
            GitlabIssues.GitlabIssuesController = GitlabIssuesController;
        })(GitlabIssues = Widgets.GitlabIssues || (Widgets.GitlabIssues = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var GitlabIssues;
        (function (GitlabIssues) {
            var GitlabIssuesDirective = (function () {
                function GitlabIssuesDirective() {
                    this.restrict = "E";
                    this.templateUrl = "app/widgets/gitlab-issues/issues.html";
                    this.replace = false;
                    this.controller = GitlabIssues.GitlabIssuesController;
                    this.controllerAs = "ctrl";
                    /* Binding css to directives */
                    this.css = {
                        href: "app/widgets/gitlab-issues/issues.css",
                        persist: true
                    };
                }
                GitlabIssuesDirective.create = function () {
                    var directive = function () { return new GitlabIssuesDirective(); };
                    directive.$inject = [];
                    return directive;
                };
                return GitlabIssuesDirective;
            }());
            DashCI.app.directive("gitlabIssues", GitlabIssuesDirective.create());
        })(GitlabIssues = Widgets.GitlabIssues || (Widgets.GitlabIssues = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var GitlabPipeline;
        (function (GitlabPipeline) {
            var GitlabPipelineConfigController = (function () {
                function GitlabPipelineConfigController($mdDialog, gitlabResources, colors, intervals, vm) {
                    this.$mdDialog = $mdDialog;
                    this.gitlabResources = gitlabResources;
                    this.colors = colors;
                    this.intervals = intervals;
                    this.vm = vm;
                    this.init();
                }
                GitlabPipelineConfigController.prototype.init = function () {
                    var _this = this;
                    var res = this.gitlabResources();
                    if (!res)
                        return;
                    res.project_list().$promise
                        .then(function (result) {
                        _this.projects = result;
                    })
                        .catch(function (reason) {
                        console.error(reason);
                        _this.projects = [];
                    });
                };
                //public cancel() {
                //    this.$mdDialog.cancel();
                //}
                GitlabPipelineConfigController.prototype.ok = function () {
                    this.$mdDialog.hide(true);
                };
                return GitlabPipelineConfigController;
            }());
            GitlabPipelineConfigController.$inject = ["$mdDialog", "gitlabResources", "colors", "intervals", "config"];
            GitlabPipeline.GitlabPipelineConfigController = GitlabPipelineConfigController;
        })(GitlabPipeline = Widgets.GitlabPipeline || (Widgets.GitlabPipeline = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var GitlabPipeline;
        (function (GitlabPipeline) {
            var GitlabPipelineController = (function () {
                function GitlabPipelineController($scope, $q, $timeout, $interval, $mdDialog, gitlabResources) {
                    var _this = this;
                    this.$scope = $scope;
                    this.$q = $q;
                    this.$timeout = $timeout;
                    this.$interval = $interval;
                    this.$mdDialog = $mdDialog;
                    this.gitlabResources = gitlabResources;
                    this.icon = "help";
                    this.data = this.$scope.data;
                    this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                    this.data.type = DashCI.Models.WidgetType.gitlabPipeline;
                    this.data.footer = false;
                    this.data.header = false;
                    this.$scope.$watch(function () { return _this.$scope.$element.height(); }, function (height) { return _this.sizeFont(height); });
                    this.$scope.$watch(function () { return _this.data.poolInterval; }, function (value) { return _this.updateInterval(); });
                    this.$scope.$on("$destroy", function () { return _this.finalize(); });
                    this.init();
                }
                GitlabPipelineController.prototype.finalize = function () {
                    if (this.handle)
                        this.$interval.cancel(this.handle);
                    console.log("dispose: " + this.data.id + "-" + this.data.title);
                };
                GitlabPipelineController.prototype.init = function () {
                    this.data.title = this.data.title || "Pipeline";
                    this.data.color = this.data.color || "green";
                    //default values
                    this.data.refs = this.data.refs || "master";
                    this.data.poolInterval = this.data.poolInterval || 10000;
                    this.updateInterval();
                    this.update();
                };
                GitlabPipelineController.prototype.sizeFont = function (altura) {
                    var icon = this.$scope.$element.find(".play-status md-icon");
                    var fontSize = Math.round(altura / 1) + "px";
                    //var lineSize = Math.round((altura) - 60) + "px";
                    icon.css('font-size', fontSize);
                    icon.parent().width(Math.round(altura / 1));
                    //p.css('line-height', lineSize);
                    var header = this.$scope.$element.find(".header");
                    fontSize = Math.round(altura / 1) + "px";
                    header.css('text-indent', fontSize);
                    //var title = this.$scope.$element.find("h2");
                    //fontSize = Math.round(altura / 6) + "px";
                    //title.css('font-size', fontSize);
                    var txt = this.$scope.$element.find("h4");
                    fontSize = Math.round(altura / 7) + "px";
                    txt.css('font-size', fontSize);
                    var img = this.$scope.$element.find(".avatar");
                    var size = Math.round(altura - 32);
                    img.width(size);
                    img.height(size);
                };
                GitlabPipelineController.prototype.config = function () {
                    var _this = this;
                    this.$mdDialog.show({
                        controller: GitlabPipeline.GitlabPipelineConfigController,
                        controllerAs: "ctrl",
                        templateUrl: 'app/widgets/gitlab-pipeline/config.html',
                        parent: angular.element(document.body),
                        //targetEvent: ev,
                        clickOutsideToClose: true,
                        fullscreen: false,
                        resolve: {
                            config: function () {
                                var deferred = _this.$q.defer();
                                _this.$timeout(function () { return deferred.resolve(_this.data); }, 1);
                                return deferred.promise;
                            }
                        }
                    });
                    //.then((ok) => this.createWidget(type));
                };
                GitlabPipelineController.prototype.updateInterval = function () {
                    var _this = this;
                    if (this.handle)
                        this.$interval.cancel(this.handle);
                    this.handle = this.$interval(function () { return _this.update(); }, this.data.poolInterval);
                    this.update();
                };
                GitlabPipelineController.prototype.update = function () {
                    var _this = this;
                    if (!this.data.project)
                        return;
                    var res = this.gitlabResources();
                    if (!res)
                        return;
                    console.log("start request: " + this.data.id + "; " + this.data.title);
                    res.latest_pipeline({
                        project: this.data.project,
                        ref: this.data.refs
                    }).$promise.then(function (pipelines) {
                        console.log("end request: " + _this.data.id + "; " + _this.data.title);
                        var new_pipeline = null;
                        var refList = _this.data.refs.split(",");
                        pipelines = pipelines.filter(function (i) { return refList.filter(function (r) { return DashCI.wildcardMatch(r, i.ref); }).length > 0; });
                        if (pipelines.length >= 1)
                            new_pipeline = pipelines[0];
                        _this.latest = new_pipeline;
                        if (_this.latest && _this.latest.status) {
                            switch (_this.latest.status) {
                                case "pending":
                                    _this.icon = "pause_circle_filled";
                                    break;
                                case "running":
                                    _this.icon = "play_circle_filled";
                                    break;
                                case "canceled":
                                    _this.icon = "remove_circle";
                                    break;
                                case "success":
                                    _this.icon = "check_circle";
                                    break;
                                case "failed":
                                    _this.icon = "error";
                                    break;
                                case "default":
                                    _this.icon = "help";
                                    break;
                            }
                        }
                        else
                            _this.icon = "help";
                        //var p = this.$scope.$element.find("p");
                        //p.addClass('changed');
                        //this.$timeout(() => p.removeClass('changed'), 1000);
                    }).catch(function (reason) {
                        _this.latest = null;
                        console.error(reason);
                    });
                    this.$timeout(function () { return _this.sizeFont(_this.$scope.$element.height()); }, 500);
                };
                return GitlabPipelineController;
            }());
            GitlabPipelineController.$inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "gitlabResources"];
            GitlabPipeline.GitlabPipelineController = GitlabPipelineController;
        })(GitlabPipeline = Widgets.GitlabPipeline || (Widgets.GitlabPipeline = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var GitlabPipeline;
        (function (GitlabPipeline) {
            var GitlabPipelineDirective = (function () {
                function GitlabPipelineDirective() {
                    this.restrict = "E";
                    this.templateUrl = "app/widgets/gitlab-pipeline/pipeline.html";
                    this.replace = false;
                    this.controller = GitlabPipeline.GitlabPipelineController;
                    this.controllerAs = "ctrl";
                    /* Binding css to directives */
                    this.css = {
                        href: "app/widgets/gitlab-pipeline/pipeline.css",
                        persist: true
                    };
                }
                GitlabPipelineDirective.create = function () {
                    var directive = function () { return new GitlabPipelineDirective(); };
                    directive.$inject = [];
                    return directive;
                };
                return GitlabPipelineDirective;
            }());
            DashCI.app.directive("gitlabPipeline", GitlabPipelineDirective.create());
        })(GitlabPipeline = Widgets.GitlabPipeline || (Widgets.GitlabPipeline = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var GitlabPipelineGraph;
        (function (GitlabPipelineGraph) {
            var GitlabPipelineGraphConfigController = (function () {
                function GitlabPipelineGraphConfigController($mdDialog, gitlabResources, colors, intervals, vm) {
                    this.$mdDialog = $mdDialog;
                    this.gitlabResources = gitlabResources;
                    this.colors = colors;
                    this.intervals = intervals;
                    this.vm = vm;
                    this.init();
                }
                GitlabPipelineGraphConfigController.prototype.init = function () {
                    var _this = this;
                    var res = this.gitlabResources();
                    if (!res)
                        return;
                    res.project_list().$promise
                        .then(function (result) {
                        _this.projects = result;
                    })
                        .catch(function (reason) {
                        console.error(reason);
                        _this.projects = [];
                    });
                };
                //public cancel() {
                //    this.$mdDialog.cancel();
                //}
                GitlabPipelineGraphConfigController.prototype.ok = function () {
                    this.$mdDialog.hide(true);
                };
                return GitlabPipelineGraphConfigController;
            }());
            GitlabPipelineGraphConfigController.$inject = ["$mdDialog", "gitlabResources", "colors", "intervals", "config"];
            GitlabPipelineGraph.GitlabPipelineGraphConfigController = GitlabPipelineGraphConfigController;
        })(GitlabPipelineGraph = Widgets.GitlabPipelineGraph || (Widgets.GitlabPipelineGraph = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var GitlabPipelineGraph;
        (function (GitlabPipelineGraph) {
            var GitlabPipelineGraphController = (function () {
                function GitlabPipelineGraphController($scope, $q, $timeout, $interval, $mdDialog, gitlabResources) {
                    var _this = this;
                    this.$scope = $scope;
                    this.$q = $q;
                    this.$timeout = $timeout;
                    this.$interval = $interval;
                    this.$mdDialog = $mdDialog;
                    this.gitlabResources = gitlabResources;
                    this.data = this.$scope.data;
                    this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                    this.data.type = DashCI.Models.WidgetType.gitlabPipelineGraph;
                    this.data.footer = false;
                    this.data.header = true;
                    this.$scope.$watch(function () { return _this.$scope.$element.height(); }, function (height) { return _this.sizeFont(height); });
                    this.$scope.$watch(function () { return _this.data.poolInterval; }, function (value) { return _this.updateInterval(); });
                    this.$scope.$on("$destroy", function () { return _this.finalize(); });
                    this.init();
                }
                GitlabPipelineGraphController.prototype.finalize = function () {
                    if (this.handle)
                        this.$interval.cancel(this.handle);
                    console.log("dispose: " + this.data.id + "-" + this.data.title);
                };
                GitlabPipelineGraphController.prototype.init = function () {
                    this.data.title = this.data.title || "Pipeline Graph";
                    this.data.color = this.data.color || "blue";
                    //default values
                    this.data.ref = this.data.ref || "master";
                    this.data.poolInterval = this.data.poolInterval || 10000;
                    this.updateInterval();
                    this.update();
                };
                GitlabPipelineGraphController.prototype.sizeFont = function (height) {
                    var histogram = this.$scope.$element.find(".histogram");
                    histogram.height(height - 60);
                };
                GitlabPipelineGraphController.prototype.config = function () {
                    var _this = this;
                    this.$mdDialog.show({
                        controller: GitlabPipelineGraph.GitlabPipelineGraphConfigController,
                        controllerAs: "ctrl",
                        templateUrl: 'app/widgets/gitlab-pipeline-graph/config.html',
                        parent: angular.element(document.body),
                        //targetEvent: ev,
                        clickOutsideToClose: true,
                        fullscreen: false,
                        resolve: {
                            config: function () {
                                var deferred = _this.$q.defer();
                                _this.$timeout(function () { return deferred.resolve(_this.data); }, 1);
                                return deferred.promise;
                            }
                        }
                    });
                    //.then((ok) => this.createWidget(type));
                };
                GitlabPipelineGraphController.prototype.updateInterval = function () {
                    var _this = this;
                    if (this.handle)
                        this.$interval.cancel(this.handle);
                    this.handle = this.$interval(function () { return _this.update(); }, this.data.poolInterval);
                    this.update();
                };
                GitlabPipelineGraphController.prototype.update = function () {
                    var _this = this;
                    if (!this.data.project)
                        return;
                    var res = this.gitlabResources();
                    if (!res)
                        return;
                    console.log("start request: " + this.data.id + "; " + this.data.title);
                    res.recent_pipelines({
                        project: this.data.project,
                        ref: this.data.ref,
                        count: 60 //since we don't have a filter by ref, lets take more and then filter crossing fingers
                    }).$promise.then(function (pipelines) {
                        console.log("end request: " + _this.data.id + "; " + _this.data.title);
                        pipelines = pipelines.filter(function (item) { return DashCI.wildcardMatch(_this.data.ref, item.ref); }).slice(0, _this.data.count).reverse();
                        var maxDuration = 1;
                        angular.forEach(pipelines, function (item) {
                            if (maxDuration < item.duration)
                                maxDuration = item.duration;
                        });
                        var width = (100 / pipelines.length);
                        angular.forEach(pipelines, function (item, i) {
                            item.css = {
                                height: Math.round((100 * item.duration) / maxDuration).toString() + "%",
                                width: width.toFixed(2) + "%",
                                left: (width * i).toFixed(2) + "%"
                            };
                        });
                        _this.pipelines = pipelines;
                    }).catch(function (reason) {
                        _this.pipelines = null;
                        console.error(reason);
                    });
                    this.$timeout(function () { return _this.sizeFont(_this.$scope.$element.height()); }, 500);
                };
                return GitlabPipelineGraphController;
            }());
            GitlabPipelineGraphController.$inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "gitlabResources"];
            GitlabPipelineGraph.GitlabPipelineGraphController = GitlabPipelineGraphController;
        })(GitlabPipelineGraph = Widgets.GitlabPipelineGraph || (Widgets.GitlabPipelineGraph = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var GitlabPipelineGraph;
        (function (GitlabPipelineGraph) {
            var GitlabPipelineGraphDirective = (function () {
                function GitlabPipelineGraphDirective() {
                    this.restrict = "E";
                    this.templateUrl = "app/widgets/gitlab-pipeline-graph/pipeline-graph.html";
                    this.replace = false;
                    this.controller = GitlabPipelineGraph.GitlabPipelineGraphController;
                    this.controllerAs = "ctrl";
                    /* Binding css to directives */
                    this.css = {
                        href: "app/widgets/gitlab-pipeline-graph/pipeline-graph.css",
                        persist: true
                    };
                }
                GitlabPipelineGraphDirective.create = function () {
                    var directive = function () { return new GitlabPipelineGraphDirective(); };
                    directive.$inject = [];
                    return directive;
                };
                return GitlabPipelineGraphDirective;
            }());
            DashCI.app.directive("gitlabPipelineGraph", GitlabPipelineGraphDirective.create());
        })(GitlabPipelineGraph = Widgets.GitlabPipelineGraph || (Widgets.GitlabPipelineGraph = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var Label;
        (function (Label) {
            var LabelConfigController = (function () {
                function LabelConfigController($mdDialog, colors, vm) {
                    this.$mdDialog = $mdDialog;
                    this.colors = colors;
                    this.vm = vm;
                    this.init();
                }
                LabelConfigController.prototype.init = function () {
                };
                LabelConfigController.prototype.ok = function () {
                    this.$mdDialog.hide(true);
                };
                return LabelConfigController;
            }());
            LabelConfigController.$inject = ["$mdDialog", "colors", "config"];
            Label.LabelConfigController = LabelConfigController;
            DashCI.app.controller("LabelConfigController", LabelConfigController);
        })(Label = Widgets.Label || (Widgets.Label = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var Label;
        (function (Label) {
            var LabelController = (function () {
                function LabelController($scope, $timeout, $mdDialog, $q) {
                    var _this = this;
                    this.$scope = $scope;
                    this.$timeout = $timeout;
                    this.$mdDialog = $mdDialog;
                    this.$q = $q;
                    this.data = this.$scope.data;
                    this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                    this.data.type = DashCI.Models.WidgetType.labelTitle;
                    this.data.footer = false;
                    this.data.header = false;
                    this.$scope.$watch(function () { return _this.$scope.$element.height(); }, function (height) { return _this.sizeFont(height); });
                    this.init();
                }
                LabelController.prototype.init = function () {
                    this.data.title = this.data.title || "Label";
                    this.data.color = this.data.color || "semi-transp";
                };
                LabelController.prototype.config = function () {
                    var _this = this;
                    this.$mdDialog.show({
                        controller: Label.LabelConfigController,
                        controllerAs: "ctrl",
                        templateUrl: 'app/widgets/label/config.html',
                        parent: angular.element(document.body),
                        //targetEvent: ev,
                        clickOutsideToClose: true,
                        fullscreen: false,
                        resolve: {
                            config: function () {
                                var deferred = _this.$q.defer();
                                _this.$timeout(function () { return deferred.resolve(_this.data); }, 1);
                                return deferred.promise;
                            }
                        }
                    });
                    //.then((ok) => this.createWidget(type));
                };
                LabelController.prototype.sizeFont = function (height) {
                    var div = this.$scope.$element.find("div");
                    var fontSize = Math.round(height / 1.6) + "px";
                    var lineSize = Math.round((height) - 8) + "px";
                    div.css('font-size', fontSize);
                    div.css('line-height', lineSize);
                };
                return LabelController;
            }());
            LabelController.$inject = ["$scope", "$timeout", "$mdDialog", "$q"];
            Label.LabelController = LabelController;
        })(Label = Widgets.Label || (Widgets.Label = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var Label;
        (function (Label) {
            var LabelDirective = (function () {
                function LabelDirective() {
                    this.restrict = "E";
                    this.templateUrl = "app/widgets/label/label.html";
                    this.replace = false;
                    this.controller = Label.LabelController;
                    this.controllerAs = "ctrl";
                    /* Binding css to directives */
                    this.css = {
                        href: "app/widgets/label/label.css",
                        persist: true
                    };
                }
                LabelDirective.create = function () {
                    var directive = function () { return new LabelDirective(); };
                    directive.$inject = [];
                    return directive;
                };
                return LabelDirective;
            }());
            DashCI.app.directive("labelTitle", LabelDirective.create());
        })(Label = Widgets.Label || (Widgets.Label = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
/// <reference path="../models/widgets.ts" />
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var LoaderDirective = (function () {
            function LoaderDirective($compile, widgets) {
                var _this = this;
                this.$compile = $compile;
                this.widgets = widgets;
                this.scope = { scope: '=', editable: '=', globalOptions: '=' };
                this.restrict = "E";
                this.replace = true;
                this.link = function ($scope, $element, attrs, ctrl) {
                    var widgetParam = $scope.scope;
                    var wscope = $scope.$new();
                    angular.extend(wscope, {
                        data: widgetParam
                    });
                    var wdesc = _this.widgets.filter(function (item) { return item.type == wscope.data.type; })[0];
                    var el = _this.$compile("<" + (wdesc.directive || DashCI.Models.WidgetType[wdesc.type]) + ' class="widget {{data.color}}" />')(wscope);
                    wscope.$element = el;
                    $element.replaceWith(el);
                    $scope.$watch(function () { return $scope.editable; }, function () { return wscope.editable = $scope.editable; });
                    $scope.$watch(function () { return $scope.globalOptions; }, function () { return wscope.globalOptions = $scope.globalOptions; });
                };
            }
            LoaderDirective.create = function () {
                var directive = function ($compile, widgets) { return new LoaderDirective($compile, widgets); };
                directive.$inject = ["$compile", "widgets"];
                return directive;
            };
            return LoaderDirective;
        }());
        Widgets.LoaderDirective = LoaderDirective;
        DashCI.app.directive("widgetLoader", LoaderDirective.create());
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsBuild;
        (function (TfsBuild) {
            var TfsBuildConfigController = (function () {
                function TfsBuildConfigController($scope, $mdDialog, tfsResources, colors, intervals, vm) {
                    this.$scope = $scope;
                    this.$mdDialog = $mdDialog;
                    this.tfsResources = tfsResources;
                    this.colors = colors;
                    this.intervals = intervals;
                    this.vm = vm;
                    this.init();
                }
                TfsBuildConfigController.prototype.init = function () {
                    var _this = this;
                    var res = this.tfsResources();
                    if (!res)
                        return;
                    res.project_list().$promise
                        .then(function (result) {
                        _this.projects = result.value;
                    })
                        .catch(function (reason) {
                        console.error(reason);
                        _this.projects = [];
                    });
                    this.$scope.$watch(function () { return _this.vm.project; }, function () { return _this.getBuilds(); });
                };
                TfsBuildConfigController.prototype.getBuilds = function () {
                    var _this = this;
                    var res = this.tfsResources();
                    if (!res || !this.vm.project)
                        return;
                    res.build_definition_list({ project: this.vm.project }).$promise
                        .then(function (result) {
                        _this.builds = result.value;
                    })
                        .catch(function (reason) {
                        console.error(reason);
                        _this.builds = [];
                    });
                };
                //public cancel() {
                //    this.$mdDialog.cancel();
                //}
                TfsBuildConfigController.prototype.ok = function () {
                    this.$mdDialog.hide(true);
                };
                return TfsBuildConfigController;
            }());
            TfsBuildConfigController.$inject = ["$scope", "$mdDialog", "tfsResources", "colors", "intervals", "config"];
            TfsBuild.TfsBuildConfigController = TfsBuildConfigController;
        })(TfsBuild = Widgets.TfsBuild || (Widgets.TfsBuild = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsBuild;
        (function (TfsBuild) {
            var TfsBuildController = (function () {
                function TfsBuildController($scope, $q, $timeout, $interval, $mdDialog, tfsResources) {
                    var _this = this;
                    this.$scope = $scope;
                    this.$q = $q;
                    this.$timeout = $timeout;
                    this.$interval = $interval;
                    this.$mdDialog = $mdDialog;
                    this.tfsResources = tfsResources;
                    this.icon = "help";
                    this.data = this.$scope.data;
                    this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                    this.data.type = DashCI.Models.WidgetType.tfsBuild;
                    this.data.footer = false;
                    this.data.header = false;
                    this.$scope.$watch(function () { return _this.$scope.$element.height(); }, function (height) { return _this.sizeFont(height); });
                    this.$scope.$watch(function () { return _this.data.poolInterval; }, function (value) { return _this.updateInterval(); });
                    this.$scope.$on("$destroy", function () { return _this.finalize(); });
                    this.init();
                }
                TfsBuildController.prototype.finalize = function () {
                    if (this.handle)
                        this.$interval.cancel(this.handle);
                    console.log("dispose: " + this.data.id + "-" + this.data.title);
                };
                TfsBuildController.prototype.init = function () {
                    this.data.title = this.data.title || "Build";
                    this.data.color = this.data.color || "green";
                    //default values
                    this.data.poolInterval = this.data.poolInterval || 10000;
                    this.updateInterval();
                    this.update();
                };
                TfsBuildController.prototype.sizeFont = function (altura) {
                    var icon = this.$scope.$element.find(".play-status md-icon");
                    var fontSize = Math.round(altura / 1) + "px";
                    //var lineSize = Math.round((altura) - 60) + "px";
                    icon.css('font-size', fontSize);
                    icon.parent().width(Math.round(altura / 1));
                    //p.css('line-height', lineSize);
                    var header = this.$scope.$element.find(".header");
                    fontSize = Math.round(altura / 1) + "px";
                    header.css('text-indent', fontSize);
                    //var title = this.$scope.$element.find("h2");
                    //fontSize = Math.round(altura / 6) + "px";
                    //title.css('font-size', fontSize);
                    var txt = this.$scope.$element.find("h4");
                    fontSize = Math.round(altura / 7) + "px";
                    txt.css('font-size', fontSize);
                    var img = this.$scope.$element.find(".avatar");
                    var size = Math.round(altura - 32);
                    img.width(size);
                    img.height(size);
                };
                TfsBuildController.prototype.config = function () {
                    var _this = this;
                    this.$mdDialog.show({
                        controller: TfsBuild.TfsBuildConfigController,
                        controllerAs: "ctrl",
                        templateUrl: 'app/widgets/tfs-build/config.html',
                        parent: angular.element(document.body),
                        //targetEvent: ev,
                        clickOutsideToClose: true,
                        fullscreen: false,
                        resolve: {
                            config: function () {
                                var deferred = _this.$q.defer();
                                _this.$timeout(function () { return deferred.resolve(_this.data); }, 1);
                                return deferred.promise;
                            }
                        }
                    });
                    //.then((ok) => this.createWidget(type));
                };
                TfsBuildController.prototype.updateInterval = function () {
                    var _this = this;
                    if (this.handle)
                        this.$interval.cancel(this.handle);
                    this.handle = this.$interval(function () { return _this.update(); }, this.data.poolInterval);
                };
                TfsBuildController.prototype.update = function () {
                    var _this = this;
                    if (!this.data.project || !this.data.build)
                        return;
                    var res = this.tfsResources();
                    if (!res)
                        return;
                    console.log("start request: " + this.data.id + "; " + this.data.title);
                    res.latest_build({
                        project: this.data.project,
                        build: this.data.build
                    }).$promise.then(function (build) {
                        console.log("end request: " + _this.data.id + "; " + _this.data.title);
                        var new_build = null;
                        if (build.value.length >= 1)
                            new_build = build.value[0];
                        _this.latest = new_build;
                        if (_this.latest && _this.latest.status) {
                            switch (_this.latest.status) {
                                case "notStarted":
                                case "postponed":
                                case "none":
                                    _this.icon = "pause_circle_filled";
                                    break;
                                case "inProgress":
                                    _this.icon = "play_circle_filled";
                                    break;
                                case "cancelling":
                                case "stopped":
                                    _this.icon = "remove_circle";
                                    break;
                                case "completed":
                                    switch (_this.latest.result) {
                                        case "partiallySucceeded":
                                        case "succeeded":
                                            _this.icon = "check";
                                            break;
                                        case "failed":
                                            _this.icon = "error";
                                            break;
                                        case "canceled":
                                            _this.icon = "remove_circle";
                                            break;
                                        case "default":
                                            _this.icon = "help";
                                            break;
                                    }
                                    break;
                                case "default":
                                    _this.icon = "help";
                                    break;
                            }
                        }
                        else
                            _this.icon = "help";
                        //var p = this.$scope.$element.find("p");
                        //p.addClass('changed');
                        //this.$timeout(() => p.removeClass('changed'), 1000);
                    }).catch(function (reason) {
                        _this.latest = null;
                        console.error(reason);
                    });
                    this.$timeout(function () { return _this.sizeFont(_this.$scope.$element.height()); }, 500);
                };
                return TfsBuildController;
            }());
            TfsBuildController.$inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "tfsResources"];
            TfsBuild.TfsBuildController = TfsBuildController;
        })(TfsBuild = Widgets.TfsBuild || (Widgets.TfsBuild = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsBuild;
        (function (TfsBuild) {
            var TfsBuildDirective = (function () {
                function TfsBuildDirective() {
                    this.restrict = "E";
                    this.templateUrl = "app/widgets/tfs-build/build.html";
                    this.replace = false;
                    this.controller = TfsBuild.TfsBuildController;
                    this.controllerAs = "ctrl";
                    /* Binding css to directives */
                    this.css = {
                        href: "app/widgets/tfs-build/build.css",
                        persist: true
                    };
                }
                TfsBuildDirective.create = function () {
                    var directive = function () { return new TfsBuildDirective(); };
                    directive.$inject = [];
                    return directive;
                };
                return TfsBuildDirective;
            }());
            DashCI.app.directive("tfsBuild", TfsBuildDirective.create());
        })(TfsBuild = Widgets.TfsBuild || (Widgets.TfsBuild = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsBuildGraph;
        (function (TfsBuildGraph) {
            var TfsBuildGraphDirective = (function () {
                function TfsBuildGraphDirective() {
                    this.restrict = "E";
                    this.templateUrl = "app/widgets/tfs-build-graph/build-graph.html";
                    this.replace = false;
                    this.controller = TfsBuildGraph.TfsBuildGraphController;
                    this.controllerAs = "ctrl";
                    /* Binding css to directives */
                    this.css = {
                        href: "app/widgets/tfs-build-graph/build-graph.css",
                        persist: true
                    };
                }
                TfsBuildGraphDirective.create = function () {
                    var directive = function () { return new TfsBuildGraphDirective(); };
                    directive.$inject = [];
                    return directive;
                };
                return TfsBuildGraphDirective;
            }());
            DashCI.app.directive("tfsBuildGraph", TfsBuildGraphDirective.create());
        })(TfsBuildGraph = Widgets.TfsBuildGraph || (Widgets.TfsBuildGraph = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsBuildGraph;
        (function (TfsBuildGraph) {
            var TfsBuildGraphConfigController = (function () {
                function TfsBuildGraphConfigController($scope, $mdDialog, tfsResources, colors, intervals, vm) {
                    this.$scope = $scope;
                    this.$mdDialog = $mdDialog;
                    this.tfsResources = tfsResources;
                    this.colors = colors;
                    this.intervals = intervals;
                    this.vm = vm;
                    this.init();
                }
                TfsBuildGraphConfigController.prototype.init = function () {
                    var _this = this;
                    var res = this.tfsResources();
                    if (!res)
                        return;
                    res.project_list().$promise
                        .then(function (result) {
                        _this.projects = result.value;
                    })
                        .catch(function (reason) {
                        console.error(reason);
                        _this.projects = [];
                    });
                    this.$scope.$watch(function () { return _this.vm.project; }, function () { return _this.getBuilds(); });
                };
                TfsBuildGraphConfigController.prototype.getBuilds = function () {
                    var _this = this;
                    var res = this.tfsResources();
                    if (!res || !this.vm.project)
                        return;
                    res.build_definition_list({ project: this.vm.project }).$promise
                        .then(function (result) {
                        _this.builds = result.value;
                    })
                        .catch(function (reason) {
                        console.error(reason);
                        _this.builds = [];
                    });
                };
                //public cancel() {
                //    this.$mdDialog.cancel();
                //}
                TfsBuildGraphConfigController.prototype.ok = function () {
                    this.$mdDialog.hide(true);
                };
                return TfsBuildGraphConfigController;
            }());
            TfsBuildGraphConfigController.$inject = ["$scope", "$mdDialog", "tfsResources", "colors", "intervals", "config"];
            TfsBuildGraph.TfsBuildGraphConfigController = TfsBuildGraphConfigController;
        })(TfsBuildGraph = Widgets.TfsBuildGraph || (Widgets.TfsBuildGraph = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsBuildGraph;
        (function (TfsBuildGraph) {
            var TfsBuildGraphController = (function () {
                function TfsBuildGraphController($scope, $q, $timeout, $interval, $mdDialog, tfsResources) {
                    var _this = this;
                    this.$scope = $scope;
                    this.$q = $q;
                    this.$timeout = $timeout;
                    this.$interval = $interval;
                    this.$mdDialog = $mdDialog;
                    this.tfsResources = tfsResources;
                    this.data = this.$scope.data;
                    this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                    this.data.type = DashCI.Models.WidgetType.tfsBuildGraph;
                    this.data.footer = false;
                    this.data.header = true;
                    this.$scope.$watch(function () { return _this.$scope.$element.height(); }, function (height) { return _this.sizeFont(height); });
                    this.$scope.$watch(function () { return _this.data.poolInterval; }, function (value) { return _this.updateInterval(); });
                    this.$scope.$on("$destroy", function () { return _this.finalize(); });
                    this.init();
                }
                TfsBuildGraphController.prototype.finalize = function () {
                    if (this.handle)
                        this.$interval.cancel(this.handle);
                    console.log("dispose: " + this.data.id + "-" + this.data.title);
                };
                TfsBuildGraphController.prototype.init = function () {
                    this.data.title = this.data.title || "Build Graph";
                    this.data.color = this.data.color || "blue";
                    //default values
                    this.data.poolInterval = this.data.poolInterval || 10000;
                    this.updateInterval();
                    this.update();
                };
                TfsBuildGraphController.prototype.sizeFont = function (height) {
                    var histogram = this.$scope.$element.find(".histogram");
                    histogram.height(height - 60);
                };
                TfsBuildGraphController.prototype.config = function () {
                    var _this = this;
                    this.$mdDialog.show({
                        controller: TfsBuildGraph.TfsBuildGraphConfigController,
                        controllerAs: "ctrl",
                        templateUrl: 'app/widgets/Tfs-Build-graph/config.html',
                        parent: angular.element(document.body),
                        //targetEvent: ev,
                        clickOutsideToClose: true,
                        fullscreen: false,
                        resolve: {
                            config: function () {
                                var deferred = _this.$q.defer();
                                _this.$timeout(function () { return deferred.resolve(_this.data); }, 1);
                                return deferred.promise;
                            }
                        }
                    });
                    //.then((ok) => this.createWidget(type));
                };
                TfsBuildGraphController.prototype.updateInterval = function () {
                    var _this = this;
                    if (this.handle)
                        this.$interval.cancel(this.handle);
                    this.handle = this.$interval(function () { return _this.update(); }, this.data.poolInterval);
                    this.update();
                };
                TfsBuildGraphController.prototype.update = function () {
                    var _this = this;
                    if (!this.data.project || !this.data.build)
                        return;
                    var res = this.tfsResources();
                    if (!res)
                        return;
                    console.log("start request: " + this.data.id + "; " + this.data.title);
                    res.recent_builds({
                        project: this.data.project,
                        build: this.data.build,
                        count: 60 //since we don't have a filter by ref, lets take more and then filter crossing fingers
                    }).$promise.then(function (result) {
                        console.log("end request: " + _this.data.id + "; " + _this.data.title);
                        var builds = result.value.reverse();
                        var maxDuration = 1;
                        angular.forEach(builds, function (item) {
                            if (item.finishTime) {
                                var duration = moment(item.finishTime).subtract(moment(item.finishTime));
                                item.duration = duration.seconds();
                                if (maxDuration < item.duration)
                                    maxDuration = item.duration;
                            }
                        });
                        var width = (100 / builds.length);
                        angular.forEach(builds, function (item, i) {
                            item.css = {
                                height: Math.round((100 * item.duration) / maxDuration).toString() + "%",
                                width: width.toFixed(2) + "%",
                                left: (width * i).toFixed(2) + "%"
                            };
                        });
                        _this.builds = builds;
                    }).catch(function (reason) {
                        _this.builds = [];
                        console.error(reason);
                    });
                    this.$timeout(function () { return _this.sizeFont(_this.$scope.$element.height()); }, 500);
                };
                return TfsBuildGraphController;
            }());
            TfsBuildGraphController.$inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "tfsResources"];
            TfsBuildGraph.TfsBuildGraphController = TfsBuildGraphController;
        })(TfsBuildGraph = Widgets.TfsBuildGraph || (Widgets.TfsBuildGraph = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsQueryCount;
        (function (TfsQueryCount) {
            var TfsQueryCountConfigController = (function () {
                function TfsQueryCountConfigController($scope, $mdDialog, tfsResources, colors, intervals, vm) {
                    this.$scope = $scope;
                    this.$mdDialog = $mdDialog;
                    this.tfsResources = tfsResources;
                    this.colors = colors;
                    this.intervals = intervals;
                    this.vm = vm;
                    this.init();
                }
                TfsQueryCountConfigController.prototype.init = function () {
                    var _this = this;
                    var res = this.tfsResources();
                    if (!res)
                        return;
                    res.project_list().$promise
                        .then(function (result) {
                        _this.projects = result.value;
                    })
                        .catch(function (reason) {
                        console.error(reason);
                        _this.projects = [];
                    });
                    this.$scope.$watch(function () { return _this.vm.project; }, function () { return _this.getQueries(); });
                };
                TfsQueryCountConfigController.prototype.getQueries = function () {
                    var _this = this;
                    var res = this.tfsResources();
                    if (!res || !this.vm.project)
                        return;
                    res.query_list({ project: this.vm.project }).$promise
                        .then(function (result) {
                        _this.queries = result.value;
                    }).catch(function (reason) {
                        console.error(reason);
                        _this.queries = [];
                    });
                };
                TfsQueryCountConfigController.prototype.ok = function () {
                    this.$mdDialog.hide(true);
                };
                return TfsQueryCountConfigController;
            }());
            TfsQueryCountConfigController.$inject = ["$scope", "$mdDialog", "tfsResources", "colors", "intervals", "config"];
            TfsQueryCount.TfsQueryCountConfigController = TfsQueryCountConfigController;
        })(TfsQueryCount = Widgets.TfsQueryCount || (Widgets.TfsQueryCount = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsQueryCount;
        (function (TfsQueryCount) {
            var TfsQueryCountController = (function () {
                function TfsQueryCountController($scope, $q, $timeout, $interval, $mdDialog, tfsResources) {
                    var _this = this;
                    this.$scope = $scope;
                    this.$q = $q;
                    this.$timeout = $timeout;
                    this.$interval = $interval;
                    this.$mdDialog = $mdDialog;
                    this.tfsResources = tfsResources;
                    this.data = this.$scope.data;
                    this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                    this.data.type = DashCI.Models.WidgetType.tfsQueryCount;
                    this.data.footer = false;
                    this.data.header = true;
                    this.$scope.$watch(function () { return _this.$scope.$element.height(); }, function (height) { return _this.sizeFont(height); });
                    this.$scope.$watch(function () { return _this.data.poolInterval; }, function (value) { return _this.updateInterval(); });
                    this.$scope.$on("$destroy", function () { return _this.finalize(); });
                    this.init();
                }
                TfsQueryCountController.prototype.finalize = function () {
                    if (this.handle)
                        this.$interval.cancel(this.handle);
                    console.log("dispose: " + this.data.id + "-" + this.data.title);
                };
                TfsQueryCountController.prototype.init = function () {
                    this.data.title = this.data.title || "Query";
                    this.data.color = this.data.color || "green";
                    //default values
                    this.data.queryId = this.data.queryId || "";
                    this.data.poolInterval = this.data.poolInterval || 20000;
                    this.updateInterval();
                    this.update();
                };
                TfsQueryCountController.prototype.sizeFont = function (altura) {
                    var p = this.$scope.$element.find("p");
                    var fontSize = Math.round(altura / 1.3) + "px";
                    var lineSize = Math.round((altura) - 60) + "px";
                    p.css('font-size', fontSize);
                    p.css('line-height', lineSize);
                    var img = this.$scope.$element.find(".avatar");
                    var size = Math.round(altura - 32);
                    img.width(size);
                    img.height(size);
                };
                TfsQueryCountController.prototype.config = function () {
                    var _this = this;
                    this.$mdDialog.show({
                        controller: TfsQueryCount.TfsQueryCountConfigController,
                        controllerAs: "ctrl",
                        templateUrl: 'app/widgets/tfs-query-count/config.html',
                        parent: angular.element(document.body),
                        //targetEvent: ev,
                        clickOutsideToClose: true,
                        fullscreen: false,
                        resolve: {
                            config: function () {
                                var deferred = _this.$q.defer();
                                _this.$timeout(function () { return deferred.resolve(_this.data); }, 1);
                                return deferred.promise;
                            }
                        }
                    });
                    //.then((ok) => this.createWidget(type));
                };
                TfsQueryCountController.prototype.updateInterval = function () {
                    var _this = this;
                    if (this.handle)
                        this.$interval.cancel(this.handle);
                    this.handle = this.$interval(function () { return _this.update(); }, this.data.poolInterval);
                };
                TfsQueryCountController.prototype.update = function () {
                    var _this = this;
                    if (!this.data.project || !this.data.queryId)
                        return;
                    var res = this.tfsResources();
                    if (!res)
                        return;
                    res.run_query({
                        project: this.data.project,
                        queryId: this.data.queryId
                    }).$promise.then(function (result) {
                        var newCount = result.workItems.length;
                        if (newCount != _this.queryCount) {
                            _this.queryCount = newCount;
                            var p = _this.$scope.$element.find("p");
                            p.addClass('changed');
                            _this.$timeout(function () { return p.removeClass('changed'); }, 1000);
                        }
                    })
                        .catch(function (reason) {
                        _this.queryCount = null;
                        console.error(reason);
                    });
                    this.$timeout(function () { return _this.sizeFont(_this.$scope.$element.height()); }, 500);
                };
                return TfsQueryCountController;
            }());
            TfsQueryCountController.$inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "tfsResources"];
            TfsQueryCount.TfsQueryCountController = TfsQueryCountController;
        })(TfsQueryCount = Widgets.TfsQueryCount || (Widgets.TfsQueryCount = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsQueryCount;
        (function (TfsQueryCount) {
            var TfsQueryCountDirective = (function () {
                function TfsQueryCountDirective() {
                    this.restrict = "E";
                    this.templateUrl = "app/widgets/tfs-query-count/tfs-query-count.html";
                    this.replace = false;
                    this.controller = TfsQueryCount.TfsQueryCountController;
                    this.controllerAs = "ctrl";
                    /* Binding css to directives */
                    this.css = {
                        href: "app/widgets/tfs-query-count/tfs-query-count.css",
                        persist: true
                    };
                }
                TfsQueryCountDirective.create = function () {
                    var directive = function () { return new TfsQueryCountDirective(); };
                    directive.$inject = [];
                    return directive;
                };
                return TfsQueryCountDirective;
            }());
            DashCI.app.directive("tfsQueryCount", TfsQueryCountDirective.create());
        })(TfsQueryCount = Widgets.TfsQueryCount || (Widgets.TfsQueryCount = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsRelease;
        (function (TfsRelease) {
            var TfsReleaseConfigController = (function () {
                function TfsReleaseConfigController($scope, $mdDialog, tfsResources, colors, intervals, vm) {
                    this.$scope = $scope;
                    this.$mdDialog = $mdDialog;
                    this.tfsResources = tfsResources;
                    this.colors = colors;
                    this.intervals = intervals;
                    this.vm = vm;
                    this.init();
                }
                TfsReleaseConfigController.prototype.init = function () {
                    var _this = this;
                    var res = this.tfsResources();
                    if (!res)
                        return;
                    res.project_list().$promise
                        .then(function (result) {
                        _this.projects = result.value;
                    })
                        .catch(function (reason) {
                        console.error(reason);
                        _this.projects = [];
                    });
                    this.$scope.$watch(function () { return _this.vm.project; }, function () { return _this.getReleaseDefs(); });
                };
                TfsReleaseConfigController.prototype.getReleaseDefs = function () {
                    var _this = this;
                    var res = this.tfsResources();
                    if (!res || !this.vm.project)
                        return;
                    res.release_definition_list({ project: this.vm.project }).$promise
                        .then(function (result) {
                        _this.releases = result.value;
                    })
                        .catch(function (reason) {
                        console.error(reason);
                        _this.releases = [];
                    });
                };
                //public cancel() {
                //    this.$mdDialog.cancel();
                //}
                TfsReleaseConfigController.prototype.ok = function () {
                    this.$mdDialog.hide(true);
                };
                return TfsReleaseConfigController;
            }());
            TfsReleaseConfigController.$inject = ["$scope", "$mdDialog", "tfsResources", "colors", "intervals", "config"];
            TfsRelease.TfsReleaseConfigController = TfsReleaseConfigController;
        })(TfsRelease = Widgets.TfsRelease || (Widgets.TfsRelease = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsRelease;
        (function (TfsRelease) {
            var TfsReleaseController = (function () {
                function TfsReleaseController($scope, $q, $timeout, $interval, $mdDialog, tfsResources) {
                    var _this = this;
                    this.$scope = $scope;
                    this.$q = $q;
                    this.$timeout = $timeout;
                    this.$interval = $interval;
                    this.$mdDialog = $mdDialog;
                    this.tfsResources = tfsResources;
                    this.data = this.$scope.data;
                    this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                    this.data.type = DashCI.Models.WidgetType.tfsRelease;
                    this.data.footer = false;
                    this.data.header = false;
                    this.$scope.$watch(function () { return _this.$scope.$element.height(); }, function (height) { return _this.sizeFont(height); });
                    this.$scope.$watch(function () { return _this.data.poolInterval; }, function (value) { return _this.updateInterval(); });
                    this.$scope.$on("$destroy", function () { return _this.finalize(); });
                    this.init();
                }
                TfsReleaseController.prototype.finalize = function () {
                    if (this.handle)
                        this.$interval.cancel(this.handle);
                    console.log("dispose: " + this.data.id + "-" + this.data.title);
                };
                TfsReleaseController.prototype.init = function () {
                    this.data.title = this.data.title || "Release";
                    this.data.color = this.data.color || "green";
                    //default values
                    this.data.poolInterval = this.data.poolInterval || 10000;
                    this.updateInterval();
                    this.update();
                };
                TfsReleaseController.prototype.sizeFont = function (height) {
                    var help_icon = this.$scope.$element.find(".unknown");
                    var size = Math.round(height / 1) - 30;
                    help_icon.css("font-size", size);
                    help_icon.height(size);
                    //var icon = this.$scope.$element.find(".play-status md-icon");
                    ////var lineSize = Math.round((altura) - 60) + "px";
                    //icon.css('font-size', fontSize);
                    //icon.parent().width(Math.round(altura / 1));
                    ////p.css('line-height', lineSize);
                    //var header = this.$scope.$element.find(".header");
                    //fontSize = Math.round(altura / 1) + "px";
                    //header.css('text-indent', fontSize);
                    ////var title = this.$scope.$element.find("h2");
                    ////fontSize = Math.round(altura / 6) + "px";
                    ////title.css('font-size', fontSize);
                    //var txt = this.$scope.$element.find("h4");
                    //fontSize = Math.round(altura / 7) + "px";
                    //txt.css('font-size', fontSize);
                    //var img = this.$scope.$element.find(".avatar");
                    //var size = Math.round(altura - 32);
                    //img.width(size);
                    //img.height(size);
                };
                TfsReleaseController.prototype.config = function () {
                    var _this = this;
                    this.$mdDialog.show({
                        controller: TfsRelease.TfsReleaseConfigController,
                        controllerAs: "ctrl",
                        templateUrl: 'app/widgets/tfs-release/config.html',
                        parent: angular.element(document.body),
                        //targetEvent: ev,
                        clickOutsideToClose: true,
                        fullscreen: false,
                        resolve: {
                            config: function () {
                                var deferred = _this.$q.defer();
                                _this.$timeout(function () { return deferred.resolve(_this.data); }, 1);
                                return deferred.promise;
                            }
                        }
                    });
                    //.then((ok) => this.createWidget(type));
                };
                TfsReleaseController.prototype.updateInterval = function () {
                    var _this = this;
                    if (this.handle)
                        this.$interval.cancel(this.handle);
                    this.handle = this.$interval(function () { return _this.update(); }, this.data.poolInterval);
                };
                TfsReleaseController.prototype.update = function () {
                    var _this = this;
                    if (!this.data.project || !this.data.release)
                        return;
                    var res = this.tfsResources();
                    if (!res)
                        return;
                    console.log("start request: " + this.data.id + "; " + this.data.title);
                    res.latest_release({ project: this.data.project, release: this.data.release })
                        .$promise.then(function (result) {
                        _this.latest = result.value.length > 0 ? result.value[0] : null;
                    })
                        .catch(function (error) {
                        _this.latest = null;
                        console.error(error);
                    });
                    this.$timeout(function () { return _this.sizeFont(_this.$scope.$element.height()); }, 500);
                };
                return TfsReleaseController;
            }());
            TfsReleaseController.$inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "tfsResources"];
            TfsRelease.TfsReleaseController = TfsReleaseController;
        })(TfsRelease = Widgets.TfsRelease || (Widgets.TfsRelease = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
"use strict";
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsRelease;
        (function (TfsRelease) {
            var TfsReleaseDirective = (function () {
                function TfsReleaseDirective() {
                    this.restrict = "E";
                    this.templateUrl = "app/widgets/tfs-release/release.html";
                    this.replace = false;
                    this.controller = TfsRelease.TfsReleaseController;
                    this.controllerAs = "ctrl";
                    /* Binding css to directives */
                    this.css = {
                        href: "app/widgets/tfs-release/release.css",
                        persist: true
                    };
                }
                TfsReleaseDirective.create = function () {
                    var directive = function () { return new TfsReleaseDirective(); };
                    directive.$inject = [];
                    return directive;
                };
                return TfsReleaseDirective;
            }());
            DashCI.app.directive("tfsRelease", TfsReleaseDirective.create());
        })(TfsRelease = Widgets.TfsRelease || (Widgets.TfsRelease = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
//# sourceMappingURL=app.js.map