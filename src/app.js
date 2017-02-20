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
    DashCI.app.config(["$mdThemingProvider", function ($mdThemingProvider) {
            $mdThemingProvider.theme('default')
                .dark()
                .accentPalette('orange');
        }]);
    DashCI.app.run(["$rootScope", function ($rootScope) {
            angular.element(window).on("resize", function () {
                $rootScope.$apply();
            });
        }]);
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
            function GlobalConfigController($mdDialog, vm) {
                this.$mdDialog = $mdDialog;
                this.vm = vm;
            }
            GlobalConfigController.prototype.ok = function () {
                this.$mdDialog.hide();
            };
            return GlobalConfigController;
        }());
        GlobalConfigController.$inject = ["$mdDialog", "config"];
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
                this.updateGridSize();
            }
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
                window.localStorage['dash-ci'] = angular.toJson([this.currentPage]);
                window.localStorage['dash-ci-options'] = angular.toJson(this.options);
            };
            MainController.prototype.loadData = function () {
                var defOptions = {
                    columns: 30,
                    rows: 20,
                    tfs: null,
                    gitlab: null
                };
                var savedOpts = (angular.fromJson(window.localStorage['dash-ci-options']) || defOptions);
                angular.extend(this.options, savedOpts);
                var defPage = {
                    id: "1",
                    widgets: []
                };
                var lista = (angular.fromJson(window.localStorage['dash-ci']) || [defPage]);
                this.currentPage = lista[0]; //preparing to support multiple pages
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
                type: WidgetType.gitlabIssues,
                directive: "gitlab-issues",
                title: "GitLab - Issue Query",
                desc: "The count of an issue query against a project."
            },
            {
                type: WidgetType.tfsQueryCount,
                directive: "tfs-query-count",
                title: "TFS - Query Count",
                desc: "The count of a saved query against a project."
            },
            {
                type: WidgetType.tfsBuild,
                directive: "tfs-build",
                title: "TFS - Build",
                desc: "The (almost) real time build definition status for a project."
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
        var Gitlab;
        (function (Gitlab) {
            DashCI.app.factory('gitlabResources', ['$resource', 'globalOptions',
                function ($resource, globalOptions) { return function () {
                    var transform = function (data, headers) {
                        var data = angular.fromJson(data);
                        if (data && typeof (data) === "object")
                            data.headers = headers();
                        return data;
                    };
                    if (!globalOptions || !globalOptions.gitlab || !globalOptions.gitlab.host)
                        return null;
                    var headers = {
                        "PRIVATE-TOKEN": null,
                        "Access-Control-Allow-Headers": "X-Total, X-Page, X-Total-Pages"
                    };
                    if (globalOptions.gitlab.privateToken)
                        headers["PRIVATE-TOKEN"] = globalOptions.gitlab.privateToken;
                    // Return the resource, include your custom actions
                    return $resource(globalOptions.gitlab.host, {}, {
                        project_list: {
                            method: 'GET',
                            isArray: true,
                            url: globalOptions.gitlab.host + "/api/v3/projects?order_by=name&per_page=100",
                            headers: headers,
                            transformResponse: transform
                        },
                        issue_count: {
                            method: 'GET',
                            isArray: false,
                            url: globalOptions.gitlab.host + "/api/v3/projects/:project/issues?labels=:labels&state=:state&per_page=1",
                            headers: headers,
                            transformResponse: function (data, getHeaders, status) {
                                if (status == 200) {
                                    data = angular.fromJson(data);
                                    var headers = getHeaders();
                                    var ret = {
                                        count: parseInt(headers["X-Total"]) || null
                                    };
                                    return ret;
                                }
                                else
                                    return data;
                            }
                        },
                        latest_pipeline: {
                            method: 'GET',
                            isArray: true,
                            url: globalOptions.gitlab.host + "/api/v3/projects/:project/pipelines?scope=branches&ref=:ref&per_page=100",
                            headers: headers
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
                    var withCredentials = true;
                    var headers = {
                        "Authorization": null,
                        "Access-Control-Allow-Headers": "X-Total, X-Page, X-Total-Pages"
                    };
                    if (globalOptions.tfs.privateToken) {
                        var encodedString = "Basic " + btoa(":" + globalOptions.tfs.privateToken);
                        headers["Authorization"] = encodedString;
                    }
                    else {
                        delete headers.Authorization;
                    }
                    // Return the resource, include your custom actions
                    return $resource(globalOptions.tfs.host, {}, {
                        project_list: {
                            method: 'GET',
                            isArray: false,
                            url: globalOptions.tfs.host + "/_apis/projects?api-version=2.2",
                            headers: headers,
                            withCredentials: withCredentials
                        },
                        query_list: {
                            method: 'GET',
                            isArray: false,
                            url: globalOptions.tfs.host + "/:project/_apis/wit/queries?$depth=2&$expand=all&api-version=2.2",
                            headers: headers,
                            withCredentials: withCredentials
                        },
                        run_query: {
                            method: 'GET',
                            isArray: false,
                            url: globalOptions.tfs.host + "/:project/_apis/wit/wiql/:queryId?api-version=2.2",
                            headers: headers,
                            withCredentials: withCredentials
                        },
                        latest_build: {
                            method: 'GET',
                            isArray: false,
                            url: globalOptions.tfs.host + "/:project/_apis/build/builds?definitions=:build&$top=1&api-version=2.2",
                            headers: headers,
                            withCredentials: withCredentials
                        },
                        build_definition_list: {
                            method: 'GET',
                            isArray: false,
                            url: globalOptions.tfs.host + "/:project/_apis/build/definitions?api-version=2.2",
                            headers: headers,
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
                    this.$scope = $scope;
                    this.$interval = $interval;
                    this.$scope.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                    this.$scope.data.type = DashCI.Models.WidgetType.clock;
                    this.$scope.data.title = "Clock";
                    this.$scope.data.footer = false;
                    this.$scope.data.header = true;
                    this.$scope.data.color = "green";
                    this.init();
                }
                ClockController.prototype.init = function () {
                    var _this = this;
                    this.$interval(function () { return _this.setClock(); }, 1000);
                    this.$scope.$watch(function () { return _this.$scope.$element.height(); }, function (height) { return _this.atualizarFonte(height); });
                };
                ClockController.prototype.atualizarFonte = function (altura) {
                    var fontSizeTime = Math.round(altura / 4.5) + "px";
                    var lineTime = Math.round((altura / 2) - 20) + "px";
                    var fontSizeDate = Math.round(altura / 5.5) + "px";
                    var lineDate = Math.round((altura / 2) - 20) + "px";
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
        var GitlabIssues;
        (function (GitlabIssues) {
            var GitlabIssuesConfigController = (function () {
                function GitlabIssuesConfigController($mdDialog, gitlabResources, colors, vm) {
                    this.$mdDialog = $mdDialog;
                    this.gitlabResources = gitlabResources;
                    this.colors = colors;
                    this.vm = vm;
                    this.init();
                }
                GitlabIssuesConfigController.prototype.init = function () {
                    var _this = this;
                    this.gitlabResources().project_list().$promise
                        .then(function (result) {
                        _this.projects = result;
                    })
                        .catch(function (reason) { return console.error(reason); });
                };
                //public cancel() {
                //    this.$mdDialog.cancel();
                //}
                GitlabIssuesConfigController.prototype.ok = function () {
                    this.$mdDialog.hide(true);
                };
                return GitlabIssuesConfigController;
            }());
            GitlabIssuesConfigController.$inject = ["$mdDialog", "gitlabResources", "colors", "config"];
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
                    this.data.title = this.data.title || "Issues";
                    this.data.color = this.data.color || "red";
                    //default values
                    this.data.labels = this.data.labels || "bug";
                    this.data.status = this.data.status || "opened";
                    this.data.poolInterval = this.data.poolInterval || 10000;
                    this.init();
                }
                GitlabIssuesController.prototype.init = function () {
                    var _this = this;
                    this.$scope.$watch(function () { return _this.$scope.$element.height(); }, function (height) { return _this.sizeFont(height); });
                    this.$scope.$watch(function () { return _this.data.poolInterval; }, function (value) { return _this.updateInterval(); });
                    this.updateInterval();
                    this.update();
                };
                GitlabIssuesController.prototype.sizeFont = function (altura) {
                    var p = this.$scope.$element.find("p");
                    var fontSize = Math.round(altura / 1.3) + "px";
                    var lineSize = Math.round((altura) - 60) + "px";
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
                };
                GitlabIssuesController.prototype.update = function () {
                    var _this = this;
                    if (!this.data.project)
                        return;
                    this.gitlabResources().issue_count({
                        project: this.data.project,
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
                function GitlabPipelineConfigController($mdDialog, gitlabResources, colors, vm) {
                    this.$mdDialog = $mdDialog;
                    this.gitlabResources = gitlabResources;
                    this.colors = colors;
                    this.vm = vm;
                    this.init();
                }
                GitlabPipelineConfigController.prototype.init = function () {
                    var _this = this;
                    this.gitlabResources().project_list().$promise
                        .then(function (result) {
                        _this.projects = result;
                    })
                        .catch(function (reason) { return console.error(reason); });
                };
                //public cancel() {
                //    this.$mdDialog.cancel();
                //}
                GitlabPipelineConfigController.prototype.ok = function () {
                    this.$mdDialog.hide(true);
                };
                return GitlabPipelineConfigController;
            }());
            GitlabPipelineConfigController.$inject = ["$mdDialog", "gitlabResources", "colors", "config"];
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
                    this.$scope = $scope;
                    this.$q = $q;
                    this.$timeout = $timeout;
                    this.$interval = $interval;
                    this.$mdDialog = $mdDialog;
                    this.gitlabResources = gitlabResources;
                    this.icon = "help_outline";
                    this.data = this.$scope.data;
                    this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                    this.data.type = DashCI.Models.WidgetType.gitlabPipeline;
                    this.data.footer = false;
                    this.data.header = false;
                    this.data.title = this.data.title || "Pipeline";
                    this.data.color = this.data.color || "green";
                    //default values
                    this.data.refs = this.data.refs || "master";
                    this.data.poolInterval = this.data.poolInterval || 10000;
                    this.init();
                }
                GitlabPipelineController.prototype.init = function () {
                    var _this = this;
                    this.$scope.$watch(function () { return _this.$scope.$element.height(); }, function (height) { return _this.sizeFont(height); });
                    this.$scope.$watch(function () { return _this.data.poolInterval; }, function (value) { return _this.updateInterval(); });
                    this.updateInterval();
                    this.update();
                    this.$timeout(function () { return _this.sizeFont(_this.$scope.$element.height()); }, 500);
                };
                GitlabPipelineController.prototype.sizeFont = function (altura) {
                    var icon = this.$scope.$element.find(".play-status md-icon");
                    var fontSize = Math.round(altura / 1) + "px";
                    //var lineSize = Math.round((altura) - 60) + "px";
                    icon.css('font-size', fontSize);
                    icon.parent().width(Math.round(altura / 1));
                    //p.css('line-height', lineSize);
                    var title = this.$scope.$element.find("h2");
                    fontSize = Math.round(altura / 6) + "px";
                    title.css('font-size', fontSize);
                    var txt = this.$scope.$element.find("h4");
                    fontSize = Math.round(altura / 8) + "px";
                    txt.css('font-size', fontSize);
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
                };
                GitlabPipelineController.prototype.update = function () {
                    var _this = this;
                    if (!this.data.project)
                        return;
                    console.log("start request: " + this.data.id + "; " + this.data.title);
                    this.gitlabResources().latest_pipeline({
                        project: this.data.project,
                        ref: this.data.refs
                    }).$promise.then(function (pipelines) {
                        console.log("end request: " + _this.data.id + "; " + _this.data.title);
                        var new_pipeline = null;
                        var refList = _this.data.refs.split(",");
                        pipelines = pipelines.filter(function (i) { return refList.indexOf(i.ref) > -1; });
                        if (pipelines.length >= 1)
                            new_pipeline = pipelines[0];
                        _this.latest = new_pipeline;
                        if (_this.latest && _this.latest.status) {
                            switch (_this.latest.status) {
                                case "pending":
                                    _this.icon = "pause_circle_outline";
                                    break;
                                case "running":
                                    _this.icon = "play_circle_outline";
                                    break;
                                case "canceled":
                                    _this.icon = "remove_circle_outline";
                                    break;
                                case "success":
                                    _this.icon = "check_circle";
                                    break;
                                case "failed":
                                    _this.icon = "error_outline";
                                    break;
                                case "default":
                                    _this.icon = "help_outline";
                                    break;
                            }
                        }
                        else
                            _this.icon = "help_outline";
                        //var p = this.$scope.$element.find("p");
                        //p.addClass('changed');
                        //this.$timeout(() => p.removeClass('changed'), 1000);
                    }).catch(function (reason) {
                        _this.latest = null;
                        console.error(reason);
                    });
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
                    this.$scope = $scope;
                    this.$timeout = $timeout;
                    this.$mdDialog = $mdDialog;
                    this.$q = $q;
                    this.data = this.$scope.data;
                    this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                    this.data.type = DashCI.Models.WidgetType.labelTitle;
                    this.data.title = this.data.title || "Label";
                    this.data.footer = false;
                    this.data.header = false;
                    this.data.color = this.data.color || "green";
                    this.init();
                }
                LabelController.prototype.init = function () {
                    var _this = this;
                    this.$scope.$watch(function () { return _this.$scope.$element.height(); }, function (height) { return _this.sizeFont(height); });
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
                function TfsBuildConfigController($scope, $mdDialog, tfsResources, colors, vm) {
                    this.$scope = $scope;
                    this.$mdDialog = $mdDialog;
                    this.tfsResources = tfsResources;
                    this.colors = colors;
                    this.vm = vm;
                    this.init();
                }
                TfsBuildConfigController.prototype.init = function () {
                    var _this = this;
                    this.tfsResources().project_list().$promise
                        .then(function (result) {
                        _this.projects = result.value;
                    }).catch(function (reason) { return console.error(reason); });
                    this.$scope.$watch(function () { return _this.vm.project; }, function () { return _this.getBuilds(); });
                };
                TfsBuildConfigController.prototype.getBuilds = function () {
                    var _this = this;
                    this.tfsResources().build_definition_list({ project: this.vm.project }).$promise
                        .then(function (result) {
                        _this.builds = result.value;
                    })
                        .catch(function (reason) { return console.error(reason); });
                };
                //public cancel() {
                //    this.$mdDialog.cancel();
                //}
                TfsBuildConfigController.prototype.ok = function () {
                    this.$mdDialog.hide(true);
                };
                return TfsBuildConfigController;
            }());
            TfsBuildConfigController.$inject = ["$scope", "$mdDialog", "tfsResources", "colors", "config"];
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
                    this.$scope = $scope;
                    this.$q = $q;
                    this.$timeout = $timeout;
                    this.$interval = $interval;
                    this.$mdDialog = $mdDialog;
                    this.tfsResources = tfsResources;
                    this.icon = "help_outline";
                    this.data = this.$scope.data;
                    this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                    this.data.type = DashCI.Models.WidgetType.tfsBuild;
                    this.data.footer = false;
                    this.data.header = false;
                    this.data.title = this.data.title || "Build";
                    this.data.color = this.data.color || "green";
                    //default values
                    this.data.poolInterval = this.data.poolInterval || 10000;
                    this.init();
                }
                TfsBuildController.prototype.init = function () {
                    var _this = this;
                    this.$scope.$watch(function () { return _this.$scope.$element.height(); }, function (height) { return _this.sizeFont(height); });
                    this.$scope.$watch(function () { return _this.data.poolInterval; }, function (value) { return _this.updateInterval(); });
                    this.updateInterval();
                    this.update();
                    this.$timeout(function () { return _this.sizeFont(_this.$scope.$element.height()); }, 500);
                };
                TfsBuildController.prototype.sizeFont = function (altura) {
                    var icon = this.$scope.$element.find(".play-status md-icon");
                    var fontSize = Math.round(altura / 1) + "px";
                    //var lineSize = Math.round((altura) - 60) + "px";
                    icon.css('font-size', fontSize);
                    icon.parent().width(Math.round(altura / 1));
                    //p.css('line-height', lineSize);
                    var title = this.$scope.$element.find("h2");
                    fontSize = Math.round(altura / 6) + "px";
                    title.css('font-size', fontSize);
                    var txt = this.$scope.$element.find("h4");
                    fontSize = Math.round(altura / 8) + "px";
                    txt.css('font-size', fontSize);
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
                    console.log("start request: " + this.data.id + "; " + this.data.title);
                    this.tfsResources().latest_build({
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
                                    _this.icon = "pause_circle_outline";
                                    break;
                                case "inProgress":
                                    _this.icon = "play_circle_outline";
                                    break;
                                case "cancelling":
                                case "stopped":
                                    _this.icon = "remove_circle_outline";
                                    break;
                                case "completed":
                                    switch (_this.latest.result) {
                                        case "partiallySucceeded":
                                        case "succeeded":
                                            _this.icon = "check_circle";
                                            break;
                                        case "failed":
                                            _this.icon = "error_outline";
                                            break;
                                        case "canceled":
                                            _this.icon = "remove_circle_outline";
                                            break;
                                        case "default":
                                            _this.icon = "help_outline";
                                            break;
                                    }
                                    break;
                                case "default":
                                    _this.icon = "help_outline";
                                    break;
                            }
                        }
                        else
                            _this.icon = "help_outline";
                        //var p = this.$scope.$element.find("p");
                        //p.addClass('changed');
                        //this.$timeout(() => p.removeClass('changed'), 1000);
                    }).catch(function (reason) {
                        _this.latest = null;
                        console.error(reason);
                    });
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
        var TfsQueryCount;
        (function (TfsQueryCount) {
            var TfsQueryCountConfigController = (function () {
                function TfsQueryCountConfigController($scope, $mdDialog, tfsResources, colors, vm) {
                    this.$scope = $scope;
                    this.$mdDialog = $mdDialog;
                    this.tfsResources = tfsResources;
                    this.colors = colors;
                    this.vm = vm;
                    this.init();
                }
                TfsQueryCountConfigController.prototype.init = function () {
                    var _this = this;
                    this.tfsResources().project_list().$promise
                        .then(function (result) {
                        _this.projects = result.value;
                    }).catch(function (reason) { return console.error(reason); });
                    ;
                    this.$scope.$watch(function () { return _this.vm.project; }, function () { return _this.getQueries(); });
                };
                TfsQueryCountConfigController.prototype.getQueries = function () {
                    var _this = this;
                    this.tfsResources().query_list({ project: this.vm.project }).$promise
                        .then(function (result) {
                        _this.queries = result.value;
                    }).catch(function (reason) { return console.error(reason); });
                };
                TfsQueryCountConfigController.prototype.ok = function () {
                    this.$mdDialog.hide(true);
                };
                return TfsQueryCountConfigController;
            }());
            TfsQueryCountConfigController.$inject = ["$scope", "$mdDialog", "tfsResources", "colors", "config"];
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
                    this.data.title = this.data.title || "Query";
                    this.data.color = this.data.color || "green";
                    //default values
                    this.data.queryId = this.data.queryId || "";
                    this.data.poolInterval = this.data.poolInterval || 20000;
                    this.init();
                }
                TfsQueryCountController.prototype.init = function () {
                    var _this = this;
                    this.$scope.$watch(function () { return _this.$scope.$element.height(); }, function (height) { return _this.sizeFont(height); });
                    this.$scope.$watch(function () { return _this.data.poolInterval; }, function (value) { return _this.updateInterval(); });
                    this.updateInterval();
                    this.update();
                };
                TfsQueryCountController.prototype.sizeFont = function (altura) {
                    var p = this.$scope.$element.find("p");
                    var fontSize = Math.round(altura / 1.3) + "px";
                    var lineSize = Math.round((altura) - 60) + "px";
                    p.css('font-size', fontSize);
                    p.css('line-height', lineSize);
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
                    this.tfsResources().run_query({
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
//# sourceMappingURL=app.js.map