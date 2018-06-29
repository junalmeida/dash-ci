"use strict";
var DashCI;
(function (DashCI) {
    DashCI.app = angular.module("dashboard", [
        "widgetGrid",
        "ngMaterial",
        "ngResource",
        "angularCSS"
    ]);
    var Config = /** @class */ (function () {
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
            $resourceProvider.defaults.stripTrailingSlashes = false;
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
    function randomNess() {
        return (Math.floor(Math.random() * 10) + 1) * 1000;
    }
    DashCI.randomNess = randomNess;
    DashCI.DEBUG = false;
    var EnumEx = /** @class */ (function () {
        function EnumEx() {
        }
        EnumEx.getNamesAndValues = function (e) {
            return EnumEx.getNames(e).map(function (n) { return ({ name: n, value: e[n] }); });
        };
        EnumEx.getNames = function (e) {
            return EnumEx.getObjValues(e).filter(function (v) { return typeof v === "string"; });
        };
        EnumEx.getValues = function (e) {
            return EnumEx.getObjValues(e).filter(function (v) { return typeof v === "number"; });
        };
        EnumEx.getObjValues = function (e) {
            return Object.keys(e).map(function (k) { return e[k]; });
        };
        return EnumEx;
    }());
    DashCI.EnumEx = EnumEx;
})(DashCI || (DashCI = {}));
/// <reference path="../app.ts" />
var DashCI;
(function (DashCI) {
    var Core;
    (function (Core) {
        var AddWidgetController = /** @class */ (function () {
            function AddWidgetController($mdDialog, widgets, categories) {
                this.$mdDialog = $mdDialog;
                this.widgets = widgets;
                this.categories = categories;
            }
            AddWidgetController.prototype.$onInit = function () { };
            AddWidgetController.prototype.cancel = function () {
                this.$mdDialog.cancel();
            };
            AddWidgetController.prototype.select = function (type) {
                this.$mdDialog.hide(type);
            };
            AddWidgetController.$inject = ["$mdDialog", "widgets", "widgetcategories"];
            return AddWidgetController;
        }());
        Core.AddWidgetController = AddWidgetController;
    })(Core = DashCI.Core || (DashCI.Core = {}));
})(DashCI || (DashCI = {}));
/// <reference path="../app.ts" />
var DashCI;
(function (DashCI) {
    var Core;
    (function (Core) {
        var GlobalConfigController = /** @class */ (function () {
            function GlobalConfigController($timeout, $mdDialog, $scope, $rootscope, vm, intervals) {
                var _this = this;
                this.$timeout = $timeout;
                this.$mdDialog = $mdDialog;
                this.$rootscope = $rootscope;
                this.vm = vm;
                this.intervals = intervals;
                this.pageCount = this.vm.pages.length;
                $scope.$watch(function () { return _this.pageCount; }, function () { return _this.updatePages(); });
            }
            GlobalConfigController.prototype.$onInit = function () { };
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
                if (data.gitlab)
                    data.gitlab.privateToken = null;
                if (data.tfs)
                    data.tfs.privateToken = null;
                if (data.github && data.github.length)
                    angular.forEach(data.github, function (item) { return item.privateToken = null; });
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
            GlobalConfigController.$inject = ["$timeout", "$mdDialog", "$scope", "$rootScope", "config", "longIntervals"];
            return GlobalConfigController;
        }());
        Core.GlobalConfigController = GlobalConfigController;
    })(Core = DashCI.Core || (DashCI.Core = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var GoogleCastReceiver = /** @class */ (function () {
        function GoogleCastReceiver() {
            var _this = this;
            this.namespace = 'urn:x-cast:almasistemas.dashci';
            this.script = '//www.gstatic.com/cast/sdk/libs/receiver/2.0.0/cast_receiver.js';
            var el = document.createElement('script');
            el.onload = function () {
                setTimeout(function () { return _this.initializeCastApi(); }, 100);
            };
            el.type = "text/javascript";
            el.src = this.script;
            document.body.appendChild(el);
        }
        GoogleCastReceiver.prototype.initializeCastApi = function () {
            var _this = this;
            GoogleCastReceiver.Cast = window.cast;
            GoogleCastReceiver.Cast.receiver.logger.setLevelValue(0);
            this.manager = GoogleCastReceiver.Cast.receiver.CastReceiverManager.getInstance();
            this.log('Starting Receiver Manager');
            this.manager.onReady = function (event) {
                _this.log('Received Ready event: ' + JSON.stringify(event.data));
                _this.manager.setApplicationState('chromecast-dashboard is ready...');
            };
            this.manager.onSenderConnected = function (event) {
                _this.log('Received Sender Connected event: ' + event.senderId);
            };
            this.manager.onSenderDisconnected = function (event) {
                _this.log('Received Sender Disconnected event: ' + event.senderId);
                if (_this.manager.getSenders().length == 0 &&
                    event.reason == GoogleCastReceiver.Cast.receiver.system.DisconnectReason.REQUESTED_BY_SENDER) {
                    window.close();
                }
            };
            this.messageBus =
                this.manager.getCastMessageBus(this.namespace, GoogleCastReceiver.Cast.receiver.CastMessageBus.MessageType.JSON);
            this.messageBus.onMessage = function (event) { return _this.receiveMessage(event); };
            // Initialize the CastReceiverManager with an application status message.
            this.manager.start({ statusText: 'Application is starting' });
            this.log('Receiver Manager started');
        };
        GoogleCastReceiver.prototype.receiveMessage = function (event) {
            this.log('Message [' + event.senderId + ']: ' + event.data);
            if (typeof (event.data) == "object")
                this.log(JSON.stringify(event.data));
            try {
                if (event.data && this.receiveOptions) {
                    var opt = event.data;
                    this.receiveOptions(opt);
                }
                else
                    $("#debug").show().append("<p>Error receiving cast</p>");
            }
            catch (err) {
                var ex = err;
                this.log(ex.message);
            }
        };
        GoogleCastReceiver.prototype.log = function (txt) {
            DashCI.DEBUG && console.log(txt);
            DashCI.DEBUG && $("#debug").append("<p>" + txt + "</p>");
            DashCI.DEBUG && $("#debug").show();
        };
        GoogleCastReceiver.Cast = null;
        return GoogleCastReceiver;
    }());
    DashCI.GoogleCastReceiver = GoogleCastReceiver;
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var GoogleCastSender = /** @class */ (function () {
        function GoogleCastSender() {
            /**
            * Call initialization for Cast
            */
            var _this = this;
            this.script = '//www.gstatic.com/cv/js/sender/v1/cast_sender.js';
            this.applicationID = 'E57E663D';
            this.namespace = 'urn:x-cast:almasistemas.dashci';
            this.session = null;
            this.invalidOs = true;
            var el = document.createElement('script');
            el.onload = function () {
                setTimeout(function () { return _this.initializeCastApi(); }, 1000);
            };
            el.type = "text/javascript";
            el.src = this.script;
            document.body.appendChild(el);
        }
        /**
         * initialization
         */
        GoogleCastSender.prototype.initializeCastApi = function () {
            var _this = this;
            GoogleCastSender.Cast = window.chrome.cast;
            var sessionRequest = new GoogleCastSender.Cast.SessionRequest(this.applicationID);
            var apiConfig = new GoogleCastSender.Cast.ApiConfig(sessionRequest, function (e) { return _this.sessionListener(e); }, function (e) { return _this.receiverListener(e); });
            GoogleCastSender.Cast.initialize(apiConfig, function () { return _this.onInitSuccess(); }, function (m) { return _this.onError(m); });
        };
        /**
         * initialization success callback
         */
        GoogleCastSender.prototype.onInitSuccess = function () {
            console.info('Cast onInitSuccess');
            this.invalidOs = false;
        };
        /**
         * initialization error callback
         */
        GoogleCastSender.prototype.onError = function (message) {
            console.error('Cast onError: ' + JSON.stringify(message));
            this.connected = false;
        };
        /**
         * generic success callback
         */
        GoogleCastSender.prototype.onSuccess = function (message) {
            console.info('Cast onSuccess: ' + message);
            this.connected = true;
        };
        /**
         * callback on success for stopping app
         */
        GoogleCastSender.prototype.onStopAppSuccess = function () {
            console.info('Cast onStopAppSuccess');
            this.connected = false;
        };
        /**
         * session listener during initialization
         */
        GoogleCastSender.prototype.sessionListener = function (e) {
            var _this = this;
            console.info('Cast New session ID:' + e.sessionId);
            this.session = e;
            this.session.addUpdateListener(function (isAlive) { return _this.sessionUpdateListener(isAlive); });
            this.session.addMessageListener(this.namespace, function (namespace, message) { return _this.receiverMessage(namespace, message); });
        };
        /**
         * listener for session updates
         */
        GoogleCastSender.prototype.sessionUpdateListener = function (isAlive) {
            var message = isAlive ? 'Session Updated' : 'Session Removed';
            message += ': ' + this.session.sessionId;
            console.debug(message);
            if (!isAlive) {
                this.session = null;
                this.connected = false;
            }
        };
        /**
         * utility private to log messages from the receiver
         * @param {string} namespace The namespace of the message
         * @param {string} message A message string
         */
        GoogleCastSender.prototype.receiverMessage = function (namespace, message) {
            console.debug('receiverMessage: ' + namespace + ', ' + message);
        };
        /**
         * receiver listener during initialization
         */
        GoogleCastSender.prototype.receiverListener = function (e) {
            if (e === 'available') {
                console.info('receiver found');
            }
            else {
                console.info('receiver list empty');
            }
        };
        /**
         * stop app/session
         */
        GoogleCastSender.prototype.stopApp = function () {
            var _this = this;
            if (this.session)
                this.session.stop(function () { return _this.onStopAppSuccess(); }, function (message) { return _this.onError(message); });
        };
        /**
         * send a message to the receiver using the custom namespace
         * receiver CastMessageBus message handler will be invoked
         * @param {string} message A message string
         */
        GoogleCastSender.prototype.sendMessage = function (message) {
            var _this = this;
            if (this.session != null) {
                this.session.sendMessage(this.namespace, message, function () { return _this.onSuccess(message); }, function (m) { return _this.onError(m); });
            }
            else {
                GoogleCastSender.Cast.requestSession(function (e) {
                    _this.session = e;
                    _this.sessionListener(e);
                    _this.session.sendMessage(_this.namespace, message, function () { return _this.onSuccess(message); }, function (m) { return _this.onError(m); });
                }, function (m) { return _this.onError(m); });
            }
        };
        GoogleCastSender.Cast = null;
        return GoogleCastSender;
    }());
    DashCI.GoogleCastSender = GoogleCastSender;
})(DashCI || (DashCI = {}));
/// <reference path="../app.ts" />
var DashCI;
(function (DashCI) {
    var Core;
    (function (Core) {
        var MainController = /** @class */ (function () {
            function MainController($scope, $timeout, $q, $mdDialog, options, $rootscope) {
                var _this = this;
                this.$scope = $scope;
                this.$timeout = $timeout;
                this.$q = $q;
                this.$mdDialog = $mdDialog;
                this.options = options;
                this.$rootscope = $rootscope;
                this.cycleInterval = null;
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
                        if (_this.isGoogleCast) {
                            if (window.outerHeight) {
                                _this.gridWidth = window.outerWidth;
                                _this.gridHeight = window.outerHeight;
                            }
                            else {
                                _this.gridWidth = document.body.clientWidth;
                                _this.gridHeight = document.body.clientHeight;
                            }
                        }
                        else {
                            var grid = document.getElementById('grid');
                            _this.gridWidth = grid.clientWidth;
                            _this.gridHeight = grid.clientHeight;
                        }
                    }, 500);
                };
                this.defOptions = {
                    columns: 30,
                    cycle: undefined,
                    rows: 20,
                    tfs: null,
                    gitlab: null,
                    github: [],
                    circleci: [],
                    custom: [],
                    pages: [{
                            id: "1",
                            name: "Dash-CI",
                            widgets: []
                        }]
                };
                this.isGoogleCast = false;
                this.castStatus = 'cast';
                this.canCast = false;
                this.castSender = null;
                this.castReceiver = null;
                this.userAgent = null;
                this.loadData();
                window.onresize = this.updateGridSize;
                this.$scope.$on('wg-grid-full', function () {
                    _this.additionPossible = false;
                });
                this.$scope.$on('wg-grid-space-available', function () {
                    _this.additionPossible = true;
                });
                this.$scope.$on('wg-update-position', function (event, widgetInfo) {
                    DashCI.DEBUG && console.log('A widget has changed its position!', widgetInfo);
                });
                this.$scope.$on("dashci-refresh", function () {
                    _this.currentPage = null;
                    _this.selectedPageId = _this.options.pages[0].id;
                    _this.changePage();
                    _this.updateGridSize();
                });
                this.$scope.$watch(function () { return _this.selectedPageId; }, function () { return _this.changePage(); });
                this.$scope.$watch(function () { return _this.options.cycle; }, function () { return _this.updateCycle(); });
                this.$scope.$watch(function () { return _this.editable; }, function () { return _this.updateCycle(); });
                this.updateGridSize();
                this.initCastApi();
            }
            MainController.prototype.$onInit = function () { };
            MainController.prototype.changePage = function () {
                var _this = this;
                if (!this.currentPage || this.selectedPageId != this.currentPage.id) {
                    this.currentPage = null;
                    this.$timeout(function () {
                        _this.currentPage = _this.options.pages.filter(function (item) { return item.id == _this.selectedPageId; })[0];
                    }, 500);
                }
            };
            MainController.prototype.updateCycle = function () {
                var _this = this;
                if (this.cycleInterval)
                    clearInterval(this.cycleInterval);
                if (this.options.cycle && !this.editable) {
                    this.cycleInterval = setInterval(function () { return _this.cyclePage(); }, this.options.cycle);
                }
            };
            MainController.prototype.cyclePage = function () {
                var index = this.options.pages.indexOf(this.currentPage);
                index += 1;
                if (index >= this.options.pages.length)
                    index = 0;
                this.selectedPageId = this.options.pages[index].id;
                this.changePage();
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
            MainController.prototype.duplicateWidget = function (widget) {
                var idx = this.currentPage.widgets.indexOf(widget);
                if (idx > -1) {
                    var newWidget = angular.copy(widget);
                    newWidget.position = { left: -1, top: -1, width: 6, height: 4 };
                    this.currentPage.widgets.push(newWidget);
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
                var defOptions = { "columns": 30, "rows": 25, "tfs": null, "gitlab": { "host": "https://gitlab.com", "privateToken": "xcijrZB97fv9xQnCNsJc" }, "github": [], "circleci": [], "custom": [], "pages": [{ "id": "1", "name": "GitLab", "widgets": [{ "type": 5, "position": { "left": 1, "top": 1, "width": 30, "height": 2 }, "id": "3a49", "footer": false, "header": false, "title": "Dashboard Example", "color": "transparent", "align": "center" }, { "type": 7, "position": { "left": 12, "top": 15, "width": 12, "height": 6 }, "id": "da4f", "footer": false, "header": true, "title": "All History", "color": "transparent", "ref": "*", "poolInterval": 30000, "count": 20, "project": 13083 }, { "type": 2, "position": { "left": 1, "top": 3, "width": 11, "height": 6 }, "id": "daa2", "footer": false, "header": false, "title": "Master", "color": "deep-green", "refs": "master", "poolInterval": 10000, "project": 13083 }, { "type": 2, "position": { "left": 1, "top": 9, "width": 11, "height": 6 }, "id": "97d0", "footer": false, "header": false, "title": "Docs", "color": "deep-green", "refs": "docs/*", "poolInterval": 10000, "project": 13083 }, { "type": 3, "position": { "left": 24, "top": 3, "width": 7, "height": 6 }, "id": "a7af", "footer": false, "header": true, "title": "Front End Bugs", "color": "grey", "labels": "frontend,bug", "status": "opened", "poolInterval": 10000, "query_type": "projects", "project": 13083, "greaterThan": { "value": 0, "color": "red" }, "lowerThan": { "value": 1, "color": "green" } }, { "type": 3, "position": { "left": 24, "top": 9, "width": 7, "height": 6 }, "id": "0bda", "footer": false, "header": true, "title": "Back End Bugs", "color": "grey", "labels": "bug,backend", "status": "opened", "poolInterval": 30000, "query_type": "projects", "project": 13083, "greaterThan": { "value": 0, "color": "turkoise" }, "lowerThan": { "value": 1, "color": "green" } }, { "type": 1, "position": { "left": 24, "top": 15, "width": 7, "height": 11 }, "id": "f815", "footer": false, "header": true, "title": "Clock", "color": "green" }, { "type": 5, "position": { "left": 1, "top": 22, "width": 22, "height": 2 }, "id": "353c", "footer": false, "header": false, "title": "This is an example of board using GitLab data", "color": "transparent", "align": "left" }, { "type": 5, "position": { "left": 1, "top": 24, "width": 23, "height": 2 }, "id": "d87e", "footer": false, "header": false, "title": "Use the top toolbar to configure service tokens", "color": "transparent", "align": "left" }, { "type": 7, "position": { "left": 12, "top": 9, "width": 12, "height": 6 }, "id": "4e5e", "footer": false, "header": true, "title": "Docs History", "color": "transparent", "ref": "docs/*", "poolInterval": 30000, "count": 20, "project": 13083 }, { "type": 7, "position": { "left": 12, "top": 3, "width": 12, "height": 6 }, "id": "b713", "footer": false, "header": true, "title": "Master History", "color": "transparent", "ref": "master", "poolInterval": 30000, "count": 20, "project": 13083 }, { "type": 2, "position": { "left": 1, "top": 15, "width": 11, "height": 6 }, "id": "5786", "footer": false, "header": false, "title": "All", "color": "purple", "refs": "*", "poolInterval": 10000, "project": 13083 }] }] };
                var savedOpts = (angular.fromJson(window.localStorage['dash-ci-options']) || defOptions);
                angular.extend(this.options, defOptions, savedOpts);
                angular.forEach(savedOpts.pages, function (item) {
                    item.name = item.name || "Dash-CI";
                });
                this.currentPage = this.options.pages[0]; //preparing to support multiple pages
            };
            MainController.prototype.initCastApi = function () {
                var _this = this;
                if (!this.CheckGoogleCast()) {
                    this.castSender = new DashCI.GoogleCastSender();
                    this.$scope.$watch(function () { return _this.castSender.connected; }, function (connected) {
                        _this.castStatus = connected ? 'cast_connected' : 'cast';
                    });
                    this.$scope.$watch(function () { return _this.castSender.invalidOs; }, function (invalidOs) {
                        _this.canCast = !invalidOs;
                    });
                }
                else {
                    this.castReceiver = new DashCI.GoogleCastReceiver();
                    this.castReceiver.receiveOptions = function (options) {
                        var defOptions = angular.copy(_this.defOptions);
                        angular.extend(_this.options, defOptions, options);
                        _this.$rootscope.$apply();
                        _this.$rootscope.$broadcast("dashci-refresh");
                    };
                }
            };
            MainController.prototype.toggleCast = function () {
                if (this.castStatus == 'cast') {
                    //connect
                    this.castSender.sendMessage(this.options);
                }
                else {
                    //disconnect
                    this.castSender.stopApp();
                }
            };
            MainController.prototype.CheckGoogleCast = function () {
                this.userAgent = navigator.userAgent;
                var crKey = this.userAgent.match(/CrKey/i);
                var tv = this.userAgent.match(/TV/i);
                this.isGoogleCast =
                    (crKey && crKey.length > 0) || (tv && tv.length > 0);
                return this.isGoogleCast;
            };
            MainController.prototype.goFullScreen = function () {
                var el = document.documentElement;
                var rfs = (el.webkitRequestFullScreen || el.requestFullScreen || el.mozRequestFullScreen);
                rfs.call(el);
            };
            MainController.prototype.isFullScreen = function () {
                return window.fullScreen ||
                    (window.innerWidth == screen.width && window.innerHeight == screen.height);
            };
            MainController.$inject = ["$scope", "$timeout", "$q", "$mdDialog", "globalOptions", "$rootScope"];
            return MainController;
        }());
        DashCI.app.controller("MainController", MainController);
    })(Core = DashCI.Core || (DashCI.Core = {}));
})(DashCI || (DashCI = {}));
/// <reference path="../app.ts" />
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
                code: "transparent",
                desc: "Transparent"
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
                code: "deep-green",
                desc: "Deep Green"
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
                value: 15000,
                desc: "15 secs"
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
        DashCI.app.constant("longIntervals", [
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
            {
                value: 300000,
                desc: "5 min"
            },
            {
                value: 3600000,
                desc: "1 hr"
            },
        ]);
        DashCI.app.constant("buildCounts", [
            {
                value: 20,
                desc: "20 builds"
            },
            {
                value: 30,
                desc: "30 builds"
            },
            {
                value: 40,
                desc: "40 builds"
            }
        ]);
        DashCI.app.constant("aligns", [
            {
                code: "center",
                desc: "Center"
            },
            {
                code: "left",
                desc: "Left"
            },
            {
                code: "right",
                desc: "Right"
            },
        ]);
    })(Models = DashCI.Models || (DashCI.Models = {}));
})(DashCI || (DashCI = {}));
/// <reference path="../app.ts" />
var DashCI;
(function (DashCI) {
    var Models;
    (function (Models) {
        DashCI.app.value("globalOptions", {});
    })(Models = DashCI.Models || (DashCI.Models = {}));
})(DashCI || (DashCI = {}));
/// <reference path="../app.ts" />
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
            WidgetType[WidgetType["tfsQueryChart"] = 11] = "tfsQueryChart";
            WidgetType[WidgetType["customCount"] = 12] = "customCount";
            WidgetType[WidgetType["customPostIt"] = 13] = "customPostIt";
            WidgetType[WidgetType["tfsPostIt"] = 14] = "tfsPostIt";
        })(WidgetType = Models.WidgetType || (Models.WidgetType = {}));
        var WidgetCategory;
        (function (WidgetCategory) {
            WidgetCategory[WidgetCategory["generic"] = 1] = "generic";
            WidgetCategory[WidgetCategory["gitlab"] = 2] = "gitlab";
            WidgetCategory[WidgetCategory["tfs"] = 3] = "tfs";
            WidgetCategory[WidgetCategory["github"] = 4] = "github";
            WidgetCategory[WidgetCategory["circleci"] = 5] = "circleci";
            WidgetCategory[WidgetCategory["custom"] = 6] = "custom";
        })(WidgetCategory = Models.WidgetCategory || (Models.WidgetCategory = {}));
        DashCI.app.constant("widgetcategories", [
            {
                value: WidgetCategory.generic,
                desc: "Generic Widgets"
            },
            {
                value: WidgetCategory.gitlab,
                desc: "Gitlab Widgets"
            },
            {
                value: WidgetCategory.tfs,
                desc: "TFS/VSTS Widgets"
            },
            {
                value: WidgetCategory.github,
                desc: "Github Widgets"
            },
            {
                value: WidgetCategory.custom,
                desc: "Custom APIs"
            },
        ]);
        DashCI.app.constant("widgets", [
            {
                type: WidgetType.clock,
                title: "Clock",
                desc: "Current date and time.",
                category: WidgetCategory.generic
            },
            {
                type: WidgetType.labelTitle,
                directive: "label-title",
                title: "Label",
                desc: "Static label to create semantic areas",
                category: WidgetCategory.generic
            },
            {
                type: WidgetType.githubIssues,
                directive: "github-issues",
                title: "GitHub - Issue Query",
                desc: "The count of an issue query against a repository.",
                category: WidgetCategory.github
            },
            {
                type: WidgetType.gitlabPipeline,
                directive: "gitlab-pipeline",
                title: "GitLab - Pipeline",
                desc: "The (almost) real time pipeline status for a branch.",
                category: WidgetCategory.gitlab
            },
            {
                type: WidgetType.gitlabPipelineGraph,
                directive: "gitlab-pipeline-graph",
                title: "GitLab - Pipeline Graph",
                desc: "The pipeline graph for last N status for a branch.",
                category: WidgetCategory.gitlab
            },
            {
                type: WidgetType.gitlabIssues,
                directive: "gitlab-issues",
                title: "GitLab - Issue Query",
                desc: "The count of an issue query against a project.",
                category: WidgetCategory.gitlab
            },
            {
                type: WidgetType.tfsBuild,
                directive: "tfs-build",
                title: "TFS - Build",
                desc: "The (almost) real time build definition status for a project.",
                category: WidgetCategory.tfs
            },
            {
                type: WidgetType.tfsBuildGraph,
                directive: "tfs-build-graph",
                title: "TFS - Build Graph",
                desc: "The build graph for last N builds of a branch.",
                category: WidgetCategory.tfs
            },
            {
                type: WidgetType.tfsRelease,
                directive: "tfs-release",
                title: "TFS - Release Status",
                desc: "The release status for a release definition.",
                category: WidgetCategory.tfs
            },
            {
                type: WidgetType.tfsQueryCount,
                directive: "tfs-query-count",
                title: "TFS - Query Count",
                desc: "The count of a saved query against a project.",
                category: WidgetCategory.tfs
            },
            {
                type: WidgetType.tfsQueryChart,
                directive: "tfs-query-chart",
                title: "TFS - Query Chart",
                desc: "Shows the count of saved querys count at a chart.",
                category: WidgetCategory.tfs
            },
            {
                type: WidgetType.tfsPostIt,
                directive: "tfs-post-it",
                title: "TFS - Post It View",
                desc: "Shows 'PostIt' of the result of a query.",
                category: WidgetCategory.tfs
            },
            {
                type: WidgetType.customCount,
                directive: "custom-count",
                title: "Custom API Count",
                desc: "Shows the count of the result of a custom REST API.",
                category: WidgetCategory.custom
            },
            {
                type: WidgetType.customPostIt,
                directive: "custom-post-it",
                title: "Custom API Post It View",
                desc: "Shows 'PostIt' of the result of a custom REST API.",
                category: WidgetCategory.custom
            },
        ]);
    })(Models = DashCI.Models || (DashCI.Models = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Resources;
    (function (Resources) {
        var Custom;
        (function (Custom) {
            DashCI.app.factory('customResources', ['$resource', 'globalOptions',
                function ($resource, globalOptions) { return function (label) {
                    if (!globalOptions || !globalOptions.custom || globalOptions.custom.length == 0)
                        return null;
                    var accounts = globalOptions.custom.filter(function (item) { return item.label == label; });
                    if (!accounts || accounts.length != 1)
                        return null;
                    var headers = {
                        "Authorization": null,
                    };
                    if (accounts[0].basicAuth)
                        headers.Authorization = "Basic " + accounts[0].basicAuth; // btoa(accounts[0].username + ":" + accounts[0].privateToken);
                    else
                        delete headers.Authorization;
                    var countParser = function (data, getHeaders, status) {
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
                    var listParser = function (data, getHeaders, status) {
                        if (status == 200) {
                            var count = countParser(data, getHeaders, status);
                            data = angular.fromJson(data);
                            var parameter = accounts[0].jsonListToken;
                            var parsedList = (parameter ? data[parameter] : data);
                            var ret = {
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
                    return $resource(host, {}, {
                        execute_count: {
                            method: 'GET',
                            isArray: false,
                            url: host + ":route?:params",
                            headers: headers,
                            cache: false,
                            transformResponse: countParser
                        },
                        execute_list: {
                            method: 'GET',
                            isArray: false,
                            url: host + ":route?:params",
                            headers: headers,
                            cache: false,
                            transformResponse: listParser
                        },
                    });
                }; }]);
        })(Custom = Resources.Custom || (Resources.Custom = {}));
    })(Resources = DashCI.Resources || (DashCI.Resources = {}));
})(DashCI || (DashCI = {}));
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
var DashCI;
(function (DashCI) {
    var Resources;
    (function (Resources) {
        var Gitlab;
        (function (Gitlab) {
            DashCI.app.factory('gitlabResources', ['$resource', 'globalOptions',
                function ($resource, globalOptions) { return function () {
                    if (!globalOptions || !globalOptions.gitlab || !globalOptions.gitlab.host || !globalOptions.gitlab.privateToken)
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
                            var parsedCount = parseInt(headers["x-total"]);
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
                            url: globalOptions.gitlab.host + "/api/v4/projects?order_by=last_activity_at&sort=desc&per_page=100",
                            headers: headers,
                            transformResponse: transform,
                            cache: true
                        },
                        group_list: {
                            method: 'GET',
                            isArray: true,
                            url: globalOptions.gitlab.host + "/api/v4/groups?all_available=true&order_by=name&sort=asc&per_page=100",
                            headers: headers,
                            transformResponse: transform,
                            cache: true
                        },
                        issue_count: {
                            method: 'GET',
                            isArray: false,
                            url: globalOptions.gitlab.host + "/api/v4/:scope/:scopeId/issues?labels=:labels&state=:state&per_page=1",
                            headers: headers,
                            cache: false,
                            transformResponse: countParser
                        },
                        pipelines: {
                            method: 'GET',
                            isArray: true,
                            url: globalOptions.gitlab.host + "/api/v4/projects/:project/pipelines?ref=:ref&per_page=:count",
                            cache: false,
                            headers: headers
                        },
                        branch_pipelines: {
                            method: 'GET',
                            isArray: true,
                            url: globalOptions.gitlab.host + "/api/v4/projects/:project/pipelines?ref=:ref&per_page=:count&scope=branches",
                            cache: false,
                            headers: headers
                        },
                        pipeline: {
                            method: 'GET',
                            isArray: false,
                            url: globalOptions.gitlab.host + "/api/v4/projects/:project/pipelines/:pipeline_id",
                            cache: false,
                            headers: headers
                        },
                        commit_count: {
                            method: 'GET',
                            isArray: true,
                            url: globalOptions.gitlab.host + "/api/v4/projects/:project/repository/commits?ref_name=:ref&since=:since&per_page=1",
                            cache: false,
                            transformResponse: countParser
                        }
                    });
                }; }]);
        })(Gitlab = Resources.Gitlab || (Resources.Gitlab = {}));
    })(Resources = DashCI.Resources || (DashCI.Resources = {}));
})(DashCI || (DashCI = {}));
/// <reference path="../../models/models.ts" />
var DashCI;
(function (DashCI) {
    var Resources;
    (function (Resources) {
        var Tfs;
        (function (Tfs) {
            var TfsColorBy;
            (function (TfsColorBy) {
                TfsColorBy[TfsColorBy["randomColorByPath"] = 1] = "randomColorByPath";
                TfsColorBy[TfsColorBy["colorByWorkItemType"] = 2] = "colorByWorkItemType";
            })(TfsColorBy = Tfs.TfsColorBy || (Tfs.TfsColorBy = {}));
            DashCI.app.constant("tfsColorBy", [
                {
                    value: TfsColorBy.colorByWorkItemType,
                    desc: "WorkItem Type"
                },
                {
                    value: TfsColorBy.randomColorByPath,
                    desc: "Random Color By Path"
                },
            ]);
        })(Tfs = Resources.Tfs || (Resources.Tfs = {}));
    })(Resources = DashCI.Resources || (DashCI.Resources = {}));
})(DashCI || (DashCI = {}));
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
                        team_list: {
                            method: 'GET',
                            isArray: false,
                            url: globalOptions.tfs.host + "/_apis/projects/:project/teams?api-version=2.2",
                            headers: headers,
                            cache: true,
                            withCredentials: withCredentials
                        },
                        query_list: {
                            method: 'GET',
                            isArray: false,
                            url: globalOptions.tfs.host + "/:project/_apis/wit/queries/:folder?$depth=2&$expand=all&api-version=2.2",
                            headers: headers,
                            cache: true,
                            withCredentials: withCredentials
                        },
                        run_query: {
                            method: 'GET',
                            isArray: false,
                            url: globalOptions.tfs.host + "/:project/:team/_apis/wit/wiql/:queryId?api-version=2.2",
                            headers: headers,
                            cache: false,
                            withCredentials: withCredentials
                        },
                        get_workitems: {
                            method: 'GET',
                            isArray: false,
                            url: globalOptions.tfs.host + "/_apis/wit/WorkItems?ids=:ids&fields=System.Id,System.Links.LinkType,System.WorkItemType,System.Title,System.AssignedTo,System.State,System.IterationPath&api-version=1.0",
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
                            url: globalOptions.tfs.host + "/:project/_apis/build/definitions?api-version=2.2&name=:name",
                            headers: headers,
                            cache: false,
                            withCredentials: withCredentials
                        },
                        release_definition_list: {
                            method: 'GET',
                            isArray: false,
                            url: tfs_release_preview + "/:project/_apis/release/definitions?api-version=2.2-preview.1",
                            headers: headers,
                            cache: false,
                            withCredentials: withCredentials
                        },
                        release_definition: {
                            method: 'GET',
                            isArray: false,
                            url: tfs_release_preview + "/:project/_apis/release/definitions/:release?api-version=2.2-preview.1",
                            headers: headers,
                            cache: false,
                            withCredentials: withCredentials
                        },
                        latest_release_environments: {
                            method: 'GET',
                            isArray: false,
                            url: tfs_release_preview + "/:project/_apis/release/releases?api-version=2.2-preview.1&definitionId=:release&releaseCount=1&includeArtifact=false",
                            headers: headers,
                            cache: false,
                            withCredentials: withCredentials
                        },
                        recent_releases: {
                            method: 'GET',
                            isArray: false,
                            url: tfs_release_preview + "/:project/_apis/release/releases?api-version=2.2-preview.1&definitionId=:release&$expand=environments&$top=25&queryOrder=descending",
                            headers: headers,
                            cache: false,
                            withCredentials: withCredentials
                        },
                    });
                }; }]);
        })(Tfs = Resources.Tfs || (Resources.Tfs = {}));
    })(Resources = DashCI.Resources || (DashCI.Resources = {}));
})(DashCI || (DashCI = {}));
/// <reference path="../models/widgets.ts" />
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var LoaderDirective = /** @class */ (function () {
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
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var Clock;
        (function (Clock) {
            var ClockDirective = /** @class */ (function () {
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
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var Clock;
        (function (Clock) {
            var ClockController = /** @class */ (function () {
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
                ClockController.prototype.$onInit = function () { };
                ClockController.prototype.init = function () {
                    var _this = this;
                    this.data.title = this.$scope.data.title || "Clock";
                    this.data.color = this.$scope.data.color || "green";
                    this.handle = this.$interval(function () { return _this.setClock(); }, 1000);
                };
                ClockController.prototype.finalize = function () {
                    if (this.handle)
                        this.$interval.cancel(this.handle);
                    DashCI.DEBUG && console.log("dispose: " + this.data.id + "-" + this.data.title);
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
                ClockController.$inject = ["$scope", "$interval"];
                return ClockController;
            }());
            Clock.ClockController = ClockController;
        })(Clock = Widgets.Clock || (Widgets.Clock = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var CustomCount;
        (function (CustomCount) {
            var CustomCountConfigController = /** @class */ (function () {
                function CustomCountConfigController($mdDialog, globalOptions, customResources, colors, intervals, vm) {
                    this.$mdDialog = $mdDialog;
                    this.globalOptions = globalOptions;
                    this.customResources = customResources;
                    this.colors = colors;
                    this.intervals = intervals;
                    this.vm = vm;
                    this.init();
                }
                CustomCountConfigController.prototype.$onInit = function () { };
                CustomCountConfigController.prototype.init = function () {
                    var _this = this;
                    this.labels = [];
                    angular.forEach(this.globalOptions.custom, function (item) { return _this.labels.push(item.label); });
                };
                CustomCountConfigController.prototype.getAccountBaseUrl = function (label) {
                    if (!this.globalOptions.custom)
                        return null;
                    var accounts = this.globalOptions.custom.filter(function (item) { return item.label == label; });
                    if (!accounts || accounts.length == 0)
                        return null;
                    return accounts[0].baseUrl;
                };
                //public cancel() {
                //    this.$mdDialog.cancel();
                //}
                CustomCountConfigController.prototype.ok = function () {
                    this.$mdDialog.hide(true);
                };
                CustomCountConfigController.$inject = ["$mdDialog", "globalOptions", "customResources", "colors", "intervals", "config"];
                return CustomCountConfigController;
            }());
            CustomCount.CustomCountConfigController = CustomCountConfigController;
        })(CustomCount = Widgets.CustomCount || (Widgets.CustomCount = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var CustomCount;
        (function (CustomCount) {
            var CustomCountController = /** @class */ (function () {
                function CustomCountController($scope, $q, $timeout, $interval, $mdDialog, customResources) {
                    var _this = this;
                    this.$scope = $scope;
                    this.$q = $q;
                    this.$timeout = $timeout;
                    this.$interval = $interval;
                    this.$mdDialog = $mdDialog;
                    this.customResources = customResources;
                    this.count = null;
                    this.data = this.$scope.data;
                    this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                    this.data.type = DashCI.Models.WidgetType.customCount;
                    this.data.footer = false;
                    this.data.header = true;
                    this.$scope.$watch(function () { return _this.$scope.$element.height(); }, function (height) { return _this.sizeFont(height); });
                    this.$scope.$watch(function () { return _this.data.poolInterval; }, function (value) { return _this.updateInterval(); });
                    this.$scope.$on("$destroy", function () { return _this.finalize(); });
                    this.init();
                }
                CustomCountController.prototype.$onInit = function () { };
                CustomCountController.prototype.finalize = function () {
                    if (this.handle) {
                        this.$timeout.cancel(this.handle);
                        this.$interval.cancel(this.handle);
                    }
                    DashCI.DEBUG && console.log("dispose: " + this.data.id + "-" + this.data.title);
                };
                CustomCountController.prototype.init = function () {
                    if (typeof (this.data.title) == "undefined")
                        this.data.title = this.data.title || "Count";
                    this.data.color = this.data.color || "grey";
                    //default values
                    this.data.poolInterval = this.data.poolInterval || 10000;
                    this.updateInterval();
                };
                CustomCountController.prototype.sizeFont = function (height) {
                    var p = this.$scope.$element.find("p");
                    var fontSize = Math.round(height / 1.3) + "px";
                    var lineSize = Math.round((height) - 60) + "px";
                    p.css('font-size', fontSize);
                    p.css('line-height', lineSize);
                };
                CustomCountController.prototype.config = function () {
                    var _this = this;
                    this.$mdDialog.show({
                        controller: CustomCount.CustomCountConfigController,
                        controllerAs: "ctrl",
                        templateUrl: 'app/widgets/custom-count/config.html',
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
                CustomCountController.prototype.updateInterval = function () {
                    var _this = this;
                    if (this.handle) {
                        this.$timeout.cancel(this.handle);
                        this.$interval.cancel(this.handle);
                    }
                    this.handle = this.$timeout(function () {
                        _this.handle = _this.$interval(function () { return _this.update(); }, _this.data.poolInterval);
                    }, DashCI.randomNess()); //this should create some randomness to avoid a lot of calls at the same moment.
                    this.update();
                };
                CustomCountController.prototype.update = function () {
                    var _this = this;
                    if (!this.data.label && !this.data.route)
                        return;
                    var res = this.customResources(this.data.label);
                    if (!res)
                        return;
                    DashCI.DEBUG && console.log("start custom request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us") + "; " + this.data.label);
                    res.execute_count({
                        route: this.data.route,
                        params: this.data.params
                    }).$promise.then(function (newCount) {
                        //var newCount = Math.round(Math.random() * 100);
                        if (newCount.count != _this.count) {
                            _this.count = newCount.count;
                            var p = _this.$scope.$element.find("p");
                            p.addClass('changed');
                            _this.$timeout(function () { return p.removeClass('changed'); }, 1000);
                        }
                        if (_this.data.lowerThan && !isNaN(_this.data.lowerThan.value) && _this.data.lowerThan.color) {
                            if (_this.count < _this.data.lowerThan.value)
                                _this.colorClass = _this.data.lowerThan.color;
                        }
                        if (_this.data.greaterThan && !isNaN(_this.data.greaterThan.value) && _this.data.greaterThan.color) {
                            if (_this.count > _this.data.greaterThan.value)
                                _this.colorClass = _this.data.greaterThan.color;
                        }
                        DashCI.DEBUG && console.log("end custom request: " + _this.data.id + "; " + _this.data.title + "; " + new Date().toLocaleTimeString("en-us") + "; " + _this.data.label);
                    })
                        .catch(function (reason) {
                        _this.count = null;
                        console.error(reason);
                    });
                    this.$timeout(function () { return _this.sizeFont(_this.$scope.$element.height()); }, 500);
                };
                CustomCountController.$inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "customResources"];
                return CustomCountController;
            }());
            CustomCount.CustomCountController = CustomCountController;
        })(CustomCount = Widgets.CustomCount || (Widgets.CustomCount = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var CustomCount;
        (function (CustomCount) {
            var CustomCountDirective = /** @class */ (function () {
                function CustomCountDirective() {
                    this.restrict = "E";
                    this.templateUrl = "app/widgets/custom-count/custom-count.html";
                    this.replace = false;
                    this.controller = CustomCount.CustomCountController;
                    this.controllerAs = "ctrl";
                    /* Binding css to directives */
                    this.css = {
                        href: "app/widgets/custom-count/custom-count.css",
                        persist: true
                    };
                }
                CustomCountDirective.create = function () {
                    var directive = function () { return new CustomCountDirective(); };
                    directive.$inject = [];
                    return directive;
                };
                return CustomCountDirective;
            }());
            DashCI.app.directive("customCount", CustomCountDirective.create());
        })(CustomCount = Widgets.CustomCount || (Widgets.CustomCount = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var CustomPostIt;
        (function (CustomPostIt) {
            var CustomPostItConfigController = /** @class */ (function () {
                function CustomPostItConfigController($mdDialog, globalOptions, customResources, colors, intervals, vm) {
                    this.$mdDialog = $mdDialog;
                    this.globalOptions = globalOptions;
                    this.customResources = customResources;
                    this.colors = colors;
                    this.intervals = intervals;
                    this.vm = vm;
                    this.init();
                }
                CustomPostItConfigController.prototype.$onInit = function () { };
                CustomPostItConfigController.prototype.init = function () {
                    var _this = this;
                    this.labels = [];
                    angular.forEach(this.globalOptions.custom, function (item) { return _this.labels.push(item.label); });
                };
                CustomPostItConfigController.prototype.getAccountBaseUrl = function (label) {
                    if (!this.globalOptions.custom)
                        return null;
                    var accounts = this.globalOptions.custom.filter(function (item) { return item.label == label; });
                    if (!accounts || accounts.length == 0)
                        return null;
                    return accounts[0].baseUrl;
                };
                //public cancel() {
                //    this.$mdDialog.cancel();
                //}
                CustomPostItConfigController.prototype.ok = function () {
                    this.$mdDialog.hide(true);
                };
                CustomPostItConfigController.$inject = ["$mdDialog", "globalOptions", "customResources", "colors", "intervals", "config"];
                return CustomPostItConfigController;
            }());
            CustomPostIt.CustomPostItConfigController = CustomPostItConfigController;
        })(CustomPostIt = Widgets.CustomPostIt || (Widgets.CustomPostIt = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var CustomPostIt;
        (function (CustomPostIt) {
            var CustomPostItController = /** @class */ (function () {
                function CustomPostItController($scope, $q, $timeout, $interval, $mdDialog, customResources) {
                    var _this = this;
                    this.$scope = $scope;
                    this.$q = $q;
                    this.$timeout = $timeout;
                    this.$interval = $interval;
                    this.$mdDialog = $mdDialog;
                    this.customResources = customResources;
                    this.count = null;
                    this.list = null;
                    this.data = this.$scope.data;
                    this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                    this.data.type = DashCI.Models.WidgetType.customPostIt;
                    this.data.footer = false;
                    this.data.header = true;
                    this.$scope.$watch(function () { return _this.$scope.$element.height(); }, function (height) { return _this.sizeFont(height); });
                    this.$scope.$watch(function () { return _this.data.poolInterval; }, function (value) { return _this.updateInterval(); });
                    this.$scope.$on("$destroy", function () { return _this.finalize(); });
                    this.init();
                }
                CustomPostItController.prototype.$onInit = function () { };
                CustomPostItController.prototype.finalize = function () {
                    if (this.handle) {
                        this.$timeout.cancel(this.handle);
                        this.$interval.cancel(this.handle);
                    }
                    DashCI.DEBUG && console.log("dispose: " + this.data.id + "-" + this.data.title);
                };
                CustomPostItController.prototype.init = function () {
                    this.data.title = this.data.title || "PostIt";
                    this.data.color = "transparent";
                    this.data.postItColor = this.data.postItColor || "amber";
                    this.data.columns = this.data.columns || 1;
                    //default values
                    this.data.poolInterval = this.data.poolInterval || 10000;
                    this.updateInterval();
                };
                CustomPostItController.prototype.sizeFont = function (height) {
                    //var p = this.$scope.$element.find("p");
                    //var fontSize = Math.round(height / 1.3) + "px";
                    //var lineSize = Math.round((height) - 60) + "px";
                    //p.css('font-size', fontSize);
                    //p.css('line-height', lineSize);
                };
                CustomPostItController.prototype.config = function () {
                    var _this = this;
                    this.$mdDialog.show({
                        controller: CustomPostIt.CustomPostItConfigController,
                        controllerAs: "ctrl",
                        templateUrl: 'app/widgets/custom-postit/config.html',
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
                CustomPostItController.prototype.updateInterval = function () {
                    var _this = this;
                    if (this.handle) {
                        this.$timeout.cancel(this.handle);
                        this.$interval.cancel(this.handle);
                    }
                    this.handle = this.$timeout(function () {
                        _this.handle = _this.$interval(function () { return _this.update(); }, _this.data.poolInterval);
                    }, DashCI.randomNess()); //this should create some randomness to avoid a lot of calls at the same moment.
                    this.update();
                };
                CustomPostItController.prototype.update = function () {
                    var _this = this;
                    if (!this.data.label && !this.data.route)
                        return;
                    var res = this.customResources(this.data.label);
                    if (!res)
                        return;
                    DashCI.DEBUG && console.log("start custom request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us") + "; " + this.data.label);
                    res.execute_list({
                        route: this.data.route,
                        params: this.data.params
                    }).$promise.then(function (newPostIt) {
                        //var newPostIt = Math.round(Math.random() * 100);
                        if (newPostIt.count != _this.count) {
                            _this.count = newPostIt.count;
                            var p = _this.$scope.$element.find("p");
                            p.addClass('changed');
                            _this.$timeout(function () { return p.removeClass('changed'); }, 1000);
                        }
                        _this.list = mx(newPostIt.list)
                            .select(function (item) {
                            var title = "";
                            var resume = "";
                            var desc = "";
                            var tokens = (_this.data.headerTokens || "").split(",");
                            angular.forEach(tokens, function (token) {
                                var value = item[token];
                                if (title && value)
                                    title += " - ";
                                if (value)
                                    title += value;
                            });
                            tokens = (_this.data.line1Tokens || "").split(",");
                            angular.forEach(tokens, function (token) {
                                var value = item[token];
                                if (resume && value)
                                    resume += " - ";
                                if (value)
                                    resume += value;
                            });
                            tokens = (_this.data.line2Tokens || "").split(",");
                            angular.forEach(tokens, function (token) {
                                var value = item[token];
                                if (desc && value)
                                    desc += " - ";
                                if (value)
                                    desc += value;
                            });
                            var ret = {
                                avatarUrl: item[_this.data.avatarToken],
                                resume: resume,
                                description: desc,
                                title: title,
                                colorClass: _this.data.postItColor
                            };
                            return ret;
                        }).toArray();
                        DashCI.DEBUG && console.log("end custom request: " + _this.data.id + "; " + _this.data.title + "; " + new Date().toLocaleTimeString("en-us") + "; " + _this.data.label);
                    })
                        .catch(function (reason) {
                        _this.count = null;
                        console.error(reason);
                    });
                    this.$timeout(function () { return _this.sizeFont(_this.$scope.$element.height()); }, 500);
                };
                CustomPostItController.$inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "customResources"];
                return CustomPostItController;
            }());
            CustomPostIt.CustomPostItController = CustomPostItController;
            var PostItListItem = /** @class */ (function () {
                function PostItListItem() {
                }
                return PostItListItem;
            }());
            CustomPostIt.PostItListItem = PostItListItem;
        })(CustomPostIt = Widgets.CustomPostIt || (Widgets.CustomPostIt = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var CustomPostIt;
        (function (CustomPostIt) {
            var CustomPostItDirective = /** @class */ (function () {
                function CustomPostItDirective() {
                    this.restrict = "E";
                    this.templateUrl = "app/widgets/custom-postit/custom-postit.html";
                    this.replace = false;
                    this.controller = CustomPostIt.CustomPostItController;
                    this.controllerAs = "ctrl";
                    /* Binding css to directives */
                    this.css = {
                        href: "app/widgets/custom-postit/custom-postit.css",
                        persist: true
                    };
                }
                CustomPostItDirective.create = function () {
                    var directive = function () { return new CustomPostItDirective(); };
                    directive.$inject = [];
                    return directive;
                };
                return CustomPostItDirective;
            }());
            DashCI.app.directive("customPostIt", CustomPostItDirective.create());
        })(CustomPostIt = Widgets.CustomPostIt || (Widgets.CustomPostIt = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var GithubIssues;
        (function (GithubIssues) {
            var GithubIssuesConfigController = /** @class */ (function () {
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
                GithubIssuesConfigController.prototype.$onInit = function () { };
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
                        _this.repositories = mx(result).orderBy(function (x) { return x.full_name; }).toArray();
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
                GithubIssuesConfigController.$inject = ["$mdDialog", "$scope", "globalOptions", "githubResources", "colors", "intervals", "config"];
                return GithubIssuesConfigController;
            }());
            GithubIssues.GithubIssuesConfigController = GithubIssuesConfigController;
        })(GithubIssues = Widgets.GithubIssues || (Widgets.GithubIssues = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var GithubIssues;
        (function (GithubIssues) {
            var GithubIssuesController = /** @class */ (function () {
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
                GithubIssuesController.prototype.$onInit = function () { };
                GithubIssuesController.prototype.finalize = function () {
                    if (this.handle) {
                        this.$timeout.cancel(this.handle);
                        this.$interval.cancel(this.handle);
                    }
                    DashCI.DEBUG && console.log("dispose: " + this.data.id + "-" + this.data.title);
                };
                GithubIssuesController.prototype.init = function () {
                    this.data.title = this.data.title || "Issues";
                    this.data.color = this.data.color || "grey";
                    //default values
                    this.data.labels = this.data.labels || "bug";
                    this.data.status = this.data.status || "open";
                    this.data.poolInterval = this.data.poolInterval || 10000;
                    this.updateInterval();
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
                    if (this.handle) {
                        this.$timeout.cancel(this.handle);
                        this.$interval.cancel(this.handle);
                    }
                    this.handle = this.$timeout(function () {
                        _this.handle = _this.$interval(function () { return _this.update(); }, _this.data.poolInterval);
                    }, DashCI.randomNess()); //this should create some randomness to avoid a lot of calls at the same moment.
                    this.update();
                };
                GithubIssuesController.prototype.update = function () {
                    var _this = this;
                    if (!this.data.repository && !this.data.username)
                        return;
                    var res = this.githubResources(this.data.username);
                    if (!res)
                        return;
                    DashCI.DEBUG && console.log("start github request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
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
                        if (_this.data.lowerThan && !isNaN(_this.data.lowerThan.value) && _this.data.lowerThan.color) {
                            if (_this.issueCount < _this.data.lowerThan.value)
                                _this.colorClass = _this.data.lowerThan.color;
                        }
                        if (_this.data.greaterThan && !isNaN(_this.data.greaterThan.value) && _this.data.greaterThan.color) {
                            if (_this.issueCount > _this.data.greaterThan.value)
                                _this.colorClass = _this.data.greaterThan.color;
                        }
                        DashCI.DEBUG && console.log("end github request: " + _this.data.id + "; " + _this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
                    })
                        .catch(function (reason) {
                        _this.issueCount = null;
                        console.error(reason);
                    });
                    this.$timeout(function () { return _this.sizeFont(_this.$scope.$element.height()); }, 500);
                };
                GithubIssuesController.$inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "githubResources"];
                return GithubIssuesController;
            }());
            GithubIssues.GithubIssuesController = GithubIssuesController;
        })(GithubIssues = Widgets.GithubIssues || (Widgets.GithubIssues = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var GithubIssues;
        (function (GithubIssues) {
            var GithubIssuesDirective = /** @class */ (function () {
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
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var GitlabIssues;
        (function (GitlabIssues) {
            var GitlabIssuesConfigController = /** @class */ (function () {
                function GitlabIssuesConfigController($mdDialog, gitlabResources, colors, intervals, vm) {
                    this.$mdDialog = $mdDialog;
                    this.gitlabResources = gitlabResources;
                    this.colors = colors;
                    this.intervals = intervals;
                    this.vm = vm;
                    this.initialized = false;
                    this.init();
                }
                GitlabIssuesConfigController.prototype.$onInit = function () { };
                GitlabIssuesConfigController.prototype.init = function () {
                    var _this = this;
                    var res = this.gitlabResources();
                    if (!res) {
                        this.projects = null;
                        this.initialized = true;
                        return;
                    }
                    res.project_list().$promise
                        .then(function (result) {
                        _this.projects = mx(result).orderBy(function (x) { return x.name_with_namespace; }).toArray();
                        _this.initialized = true;
                    })
                        .catch(function (reason) {
                        console.error(reason);
                        _this.projects = [];
                        _this.initialized = true;
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
                GitlabIssuesConfigController.$inject = ["$mdDialog", "gitlabResources", "colors", "intervals", "config"];
                return GitlabIssuesConfigController;
            }());
            GitlabIssues.GitlabIssuesConfigController = GitlabIssuesConfigController;
        })(GitlabIssues = Widgets.GitlabIssues || (Widgets.GitlabIssues = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var GitlabIssues;
        (function (GitlabIssues) {
            var GitlabIssuesController = /** @class */ (function () {
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
                GitlabIssuesController.prototype.$onInit = function () { };
                GitlabIssuesController.prototype.finalize = function () {
                    if (this.handle) {
                        this.$timeout.cancel(this.handle);
                        this.$interval.cancel(this.handle);
                    }
                    DashCI.DEBUG && console.log("dispose: " + this.data.id + "-" + this.data.title);
                };
                GitlabIssuesController.prototype.init = function () {
                    this.data.title = this.data.title || "Issues";
                    this.data.color = this.data.color || "grey";
                    //default values
                    this.data.status = this.data.status || "opened";
                    this.data.poolInterval = this.data.poolInterval || 10000;
                    this.updateInterval();
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
                    if (this.handle) {
                        this.$timeout.cancel(this.handle);
                        this.$interval.cancel(this.handle);
                    }
                    this.handle = this.$timeout(function () {
                        _this.handle = _this.$interval(function () { return _this.update(); }, _this.data.poolInterval);
                    }, DashCI.randomNess()); //this should create some randomness to avoid a lot of calls at the same moment.
                    this.update();
                };
                GitlabIssuesController.prototype.update = function () {
                    var _this = this;
                    if (!this.data.project && !this.data.group)
                        return;
                    var res = this.gitlabResources();
                    if (!res)
                        return;
                    DashCI.DEBUG && console.log("start gitlab request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
                    res.issue_count({
                        scope: this.data.query_type,
                        scopeId: this.data.query_type == 'projects' ? this.data.project : this.data.group,
                        labels: this.data.labels,
                        milestone: this.data.milestone,
                        state: this.data.status
                    }).$promise.then(function (newCount) {
                        //var newCount = Math.round(Math.random() * 100);
                        if (newCount.count != _this.issueCount) {
                            _this.issueCount = newCount.count;
                            var p = _this.$scope.$element.find("p");
                            p.addClass('changed');
                            _this.$timeout(function () { return p.removeClass('changed'); }, 1000);
                        }
                        if (_this.data.lowerThan && !isNaN(_this.data.lowerThan.value) && _this.data.lowerThan.color) {
                            if (_this.issueCount < _this.data.lowerThan.value)
                                _this.colorClass = _this.data.lowerThan.color;
                        }
                        if (_this.data.greaterThan && !isNaN(_this.data.greaterThan.value) && _this.data.greaterThan.color) {
                            if (_this.issueCount > _this.data.greaterThan.value)
                                _this.colorClass = _this.data.greaterThan.color;
                        }
                        DashCI.DEBUG && console.log("end gitlab request: " + _this.data.id + "; " + _this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
                    })
                        .catch(function (reason) {
                        _this.issueCount = null;
                        console.error(reason);
                    });
                    this.$timeout(function () { return _this.sizeFont(_this.$scope.$element.height()); }, 500);
                };
                GitlabIssuesController.$inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "gitlabResources"];
                return GitlabIssuesController;
            }());
            GitlabIssues.GitlabIssuesController = GitlabIssuesController;
        })(GitlabIssues = Widgets.GitlabIssues || (Widgets.GitlabIssues = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var GitlabIssues;
        (function (GitlabIssues) {
            var GitlabIssuesDirective = /** @class */ (function () {
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
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var GitlabPipeline;
        (function (GitlabPipeline) {
            var GitlabPipelineConfigController = /** @class */ (function () {
                function GitlabPipelineConfigController($mdDialog, gitlabResources, colors, intervals, vm) {
                    this.$mdDialog = $mdDialog;
                    this.gitlabResources = gitlabResources;
                    this.colors = colors;
                    this.intervals = intervals;
                    this.vm = vm;
                    this.initialized = false;
                    this.init();
                }
                GitlabPipelineConfigController.prototype.$onInit = function () { };
                GitlabPipelineConfigController.prototype.init = function () {
                    var _this = this;
                    var res = this.gitlabResources();
                    if (!res) {
                        this.projects = null;
                        this.initialized = true;
                        return;
                    }
                    res.project_list().$promise
                        .then(function (result) {
                        _this.projects = mx(result).orderBy(function (x) { return x.name_with_namespace; }).toArray();
                        _this.initialized = true;
                    })
                        .catch(function (reason) {
                        console.error(reason);
                        _this.projects = [];
                        _this.initialized = true;
                    });
                };
                //public cancel() {
                //    this.$mdDialog.cancel();
                //}
                GitlabPipelineConfigController.prototype.ok = function () {
                    this.$mdDialog.hide(true);
                };
                GitlabPipelineConfigController.$inject = ["$mdDialog", "gitlabResources", "colors", "intervals", "config"];
                return GitlabPipelineConfigController;
            }());
            GitlabPipeline.GitlabPipelineConfigController = GitlabPipelineConfigController;
        })(GitlabPipeline = Widgets.GitlabPipeline || (Widgets.GitlabPipeline = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var GitlabPipeline;
        (function (GitlabPipeline) {
            var GitlabPipelineController = /** @class */ (function () {
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
                    this.$scope.$watch(function () { return _this.$scope.$element.height(); }, function (height) { return _this.sizeBy(_this.$scope.$element.width(), height); });
                    this.$scope.$watch(function () { return _this.$scope.$element.width(); }, function (width) { return _this.sizeBy(width, _this.$scope.$element.height()); });
                    this.$scope.$watch(function () { return _this.data.poolInterval; }, function (value) { return _this.updateInterval(); });
                    this.$scope.$on("$destroy", function () { return _this.finalize(); });
                    this.init();
                }
                GitlabPipelineController.prototype.$onInit = function () { };
                GitlabPipelineController.prototype.finalize = function () {
                    if (this.handle) {
                        this.$timeout.cancel(this.handle);
                        this.$interval.cancel(this.handle);
                    }
                    DashCI.DEBUG && console.log("dispose: " + this.data.id + "-" + this.data.title);
                };
                GitlabPipelineController.prototype.init = function () {
                    this.data.title = this.data.title || "Pipeline";
                    this.data.color = this.data.color || "green";
                    //default values
                    this.data.refs = this.data.refs || "master";
                    this.data.poolInterval = this.data.poolInterval || 10000;
                    this.updateInterval();
                };
                GitlabPipelineController.prototype.sizeBy = function (width, height) {
                    this.hideDetails = (width < height * 1.7);
                    var icon = this.$scope.$element.find(".play-status md-icon");
                    var fontSize = (Math.round(height / 1) - (this.hideDetails ? 30 : 0)) + "px";
                    //var lineSize = Math.round((altura) - 60) + "px";
                    icon.css('font-size', fontSize);
                    icon.parent().width(Math.round(height / 1));
                    //p.css('line-height', lineSize);
                    var header = this.$scope.$element.find(".header");
                    fontSize = Math.round(height / 1) + "px";
                    header.css('text-indent', fontSize);
                    //var title = this.$scope.$element.find("h2");
                    //fontSize = Math.round(altura / 6) + "px";
                    //title.css('font-size', fontSize);
                    var txt = this.$scope.$element.find("h4");
                    fontSize = Math.round(height / 7) + "px";
                    txt.css('font-size', fontSize);
                    var img = this.$scope.$element.find(".avatar");
                    var size = Math.round(height - 32);
                    img.width(size);
                    img.height(size);
                    this.hideAvatar = width < 390;
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
                    if (this.handle) {
                        this.$timeout.cancel(this.handle);
                        this.$interval.cancel(this.handle);
                    }
                    this.handle = this.$timeout(function () {
                        _this.handle = _this.$interval(function () { return _this.update(); }, _this.data.poolInterval);
                    }, DashCI.randomNess()); //this should create some randomness to avoid a lot of calls at the same moment.
                    this.update();
                };
                GitlabPipelineController.prototype.update = function () {
                    var _this = this;
                    if (!this.data.project)
                        return;
                    var res = this.gitlabResources();
                    if (!res)
                        return;
                    DashCI.DEBUG && console.log("start gitlab request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
                    res.branch_pipelines({
                        project: this.data.project,
                        ref: this.data.refs,
                        count: 100
                    }).$promise.then(function (pipelines) {
                        var new_pipeline = null;
                        var refList = _this.data.refs.split(",");
                        pipelines = pipelines.filter(function (i) { return refList.filter(function (r) { return DashCI.wildcardMatch(r, i.ref); }).length > 0; });
                        if (pipelines.length >= 1)
                            new_pipeline = pipelines[0];
                        res.pipeline({
                            project: _this.data.project,
                            pipeline_id: new_pipeline.id
                        }).$promise.then(function (pipeline) {
                            _this.latest = pipeline;
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
                                        _this.icon = "check";
                                        break;
                                    case "failed":
                                        _this.icon = "cancel";
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
                            _this.resizeWidget();
                            DashCI.DEBUG && console.log("end gitlab request: " + _this.data.id + "; " + _this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
                        }).catch(function (reason) {
                            _this.latest = null;
                            console.error(reason);
                            _this.resizeWidget();
                        });
                    }).catch(function (reason) {
                        _this.latest = null;
                        console.error(reason);
                        _this.resizeWidget();
                    });
                };
                GitlabPipelineController.prototype.resizeWidget = function () {
                    var _this = this;
                    this.$timeout(function () { return _this.sizeBy(_this.$scope.$element.width(), _this.$scope.$element.height()); }, 500);
                };
                GitlabPipelineController.$inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "gitlabResources"];
                return GitlabPipelineController;
            }());
            GitlabPipeline.GitlabPipelineController = GitlabPipelineController;
        })(GitlabPipeline = Widgets.GitlabPipeline || (Widgets.GitlabPipeline = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var GitlabPipeline;
        (function (GitlabPipeline) {
            var GitlabPipelineDirective = /** @class */ (function () {
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
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var GitlabPipelineGraph;
        (function (GitlabPipelineGraph) {
            var GitlabPipelineGraphConfigController = /** @class */ (function () {
                function GitlabPipelineGraphConfigController($mdDialog, gitlabResources, colors, intervals, vm) {
                    this.$mdDialog = $mdDialog;
                    this.gitlabResources = gitlabResources;
                    this.colors = colors;
                    this.intervals = intervals;
                    this.vm = vm;
                    this.initialized = false;
                    this.init();
                }
                GitlabPipelineGraphConfigController.prototype.$onInit = function () { };
                GitlabPipelineGraphConfigController.prototype.init = function () {
                    var _this = this;
                    var res = this.gitlabResources();
                    if (!res) {
                        this.projects = null;
                        this.initialized = true;
                        return;
                    }
                    res.project_list().$promise
                        .then(function (result) {
                        _this.projects = mx(result).orderBy(function (x) { return x.name_with_namespace; }).toArray();
                        _this.initialized = true;
                    })
                        .catch(function (reason) {
                        console.error(reason);
                        _this.projects = [];
                        _this.initialized = true;
                    });
                };
                //public cancel() {
                //    this.$mdDialog.cancel();
                //}
                GitlabPipelineGraphConfigController.prototype.ok = function () {
                    this.$mdDialog.hide(true);
                };
                GitlabPipelineGraphConfigController.$inject = ["$mdDialog", "gitlabResources", "colors", "intervals", "config"];
                return GitlabPipelineGraphConfigController;
            }());
            GitlabPipelineGraph.GitlabPipelineGraphConfigController = GitlabPipelineGraphConfigController;
        })(GitlabPipelineGraph = Widgets.GitlabPipelineGraph || (Widgets.GitlabPipelineGraph = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var GitlabPipelineGraph;
        (function (GitlabPipelineGraph) {
            var GitlabPipelineGraphController = /** @class */ (function () {
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
                    this.$timeout(function () { return _this.sizeFont(_this.$scope.$element.height()); }, 500);
                }
                GitlabPipelineGraphController.prototype.$onInit = function () { };
                GitlabPipelineGraphController.prototype.finalize = function () {
                    if (this.handle) {
                        this.$timeout.cancel(this.handle);
                        this.$interval.cancel(this.handle);
                    }
                    DashCI.DEBUG && console.log("dispose: " + this.data.id + "-" + this.data.title);
                };
                GitlabPipelineGraphController.prototype.init = function () {
                    this.data.title = this.data.title || "Pipeline Graph";
                    this.data.color = this.data.color || "blue";
                    //default values
                    this.data.ref = this.data.ref || "master";
                    this.data.poolInterval = this.data.poolInterval || 10000;
                    this.updateInterval();
                };
                GitlabPipelineGraphController.prototype.sizeFont = function (height) {
                    var header_size = this.$scope.$element.find(".header").height();
                    var histogram = this.$scope.$element.find(".histogram");
                    histogram.height(height - 50);
                    var help_icon = this.$scope.$element.find(".unknown");
                    var size = Math.round(height / 1) - header_size - 5;
                    help_icon.css("font-size", size);
                    help_icon.height(size);
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
                    if (this.handle) {
                        this.$timeout.cancel(this.handle);
                        this.$interval.cancel(this.handle);
                    }
                    this.handle = this.$timeout(function () {
                        _this.handle = _this.$interval(function () { return _this.update(); }, _this.data.poolInterval);
                    }, DashCI.randomNess()); //this should create some randomness to avoid a lot of calls at the same moment.
                    this.update();
                };
                GitlabPipelineGraphController.prototype.update = function () {
                    var _this = this;
                    if (!this.data.project)
                        return;
                    var res = this.gitlabResources();
                    if (!res)
                        return;
                    DashCI.DEBUG && console.log("start gitlab request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
                    res.pipelines({
                        project: this.data.project,
                        ref: this.data.ref,
                        count: 60 //since we don't have a filter by ref, lets take more and then filter crossing fingers
                    }).$promise.then(function (pipelines) {
                        pipelines = pipelines.filter(function (item) { return DashCI.wildcardMatch(_this.data.ref, item.ref); }).slice(0, _this.data.count).reverse();
                        var promises = [];
                        pipelines.forEach(function (pipeline) {
                            promises.push(res.pipeline({
                                project: _this.data.project,
                                pipeline_id: pipeline.id,
                            }).$promise);
                        });
                        _this.$q.all(promises).then(function (pipelines) {
                            var maxDuration = 1;
                            angular.forEach(pipelines, function (item) {
                                if (maxDuration < item.duration)
                                    maxDuration = item.duration;
                            });
                            var width = (100 / pipelines.length);
                            angular.forEach(pipelines, function (item, i) {
                                var height = Math.round((100 * item.duration) / maxDuration);
                                if (height < 1)
                                    height = 1;
                                item.css = {
                                    height: height.toString() + "%",
                                    width: width.toFixed(2) + "%",
                                    left: (width * i).toFixed(2) + "%"
                                };
                            });
                            _this.pipelines = pipelines;
                            _this.$timeout(function () { return _this.sizeFont(_this.$scope.$element.height()); }, 500);
                            DashCI.DEBUG && console.log("end gitlab request: " + _this.data.id + "; " + _this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
                        }).catch(function (reason) {
                            _this.pipelines = null;
                            console.error(reason);
                        });
                    }).catch(function (reason) {
                        _this.pipelines = null;
                        console.error(reason);
                    });
                };
                GitlabPipelineGraphController.$inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "gitlabResources"];
                return GitlabPipelineGraphController;
            }());
            GitlabPipelineGraph.GitlabPipelineGraphController = GitlabPipelineGraphController;
        })(GitlabPipelineGraph = Widgets.GitlabPipelineGraph || (Widgets.GitlabPipelineGraph = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var GitlabPipelineGraph;
        (function (GitlabPipelineGraph) {
            var GitlabPipelineGraphDirective = /** @class */ (function () {
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
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var Label;
        (function (Label) {
            var LabelConfigController = /** @class */ (function () {
                function LabelConfigController($mdDialog, colors, aligns, vm) {
                    this.$mdDialog = $mdDialog;
                    this.colors = colors;
                    this.aligns = aligns;
                    this.vm = vm;
                    this.init();
                }
                LabelConfigController.prototype.init = function () {
                };
                LabelConfigController.prototype.$onInit = function () { };
                LabelConfigController.prototype.ok = function () {
                    this.$mdDialog.hide(true);
                };
                LabelConfigController.$inject = ["$mdDialog", "colors", "aligns", "config"];
                return LabelConfigController;
            }());
            Label.LabelConfigController = LabelConfigController;
        })(Label = Widgets.Label || (Widgets.Label = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var Label;
        (function (Label) {
            var LabelController = /** @class */ (function () {
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
                LabelController.prototype.$onInit = function () { };
                LabelController.prototype.init = function () {
                    this.data.title = this.data.title || "Label";
                    this.data.color = this.data.color || "transparent";
                    this.data.align = this.data.align || "left";
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
                LabelController.$inject = ["$scope", "$timeout", "$mdDialog", "$q"];
                return LabelController;
            }());
            Label.LabelController = LabelController;
        })(Label = Widgets.Label || (Widgets.Label = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var Label;
        (function (Label) {
            var LabelDirective = /** @class */ (function () {
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
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsBuild;
        (function (TfsBuild) {
            var TfsBuildConfigController = /** @class */ (function () {
                function TfsBuildConfigController($scope, $mdDialog, tfsResources, colors, intervals, vm) {
                    this.$scope = $scope;
                    this.$mdDialog = $mdDialog;
                    this.tfsResources = tfsResources;
                    this.colors = colors;
                    this.intervals = intervals;
                    this.vm = vm;
                    this.init();
                }
                TfsBuildConfigController.prototype.$onInit = function () { };
                TfsBuildConfigController.prototype.init = function () {
                    var _this = this;
                    var res = this.tfsResources();
                    if (!res)
                        return;
                    res.project_list().$promise
                        .then(function (result) {
                        _this.projects = mx(result.value).orderBy(function (x) { return x.name; }).toArray();
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
                    res.build_definition_list({ project: this.vm.project, name: "*" }).$promise
                        .then(function (result) {
                        _this.builds = mx(result.value).orderBy(function (x) { return x.name; }).toArray();
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
                TfsBuildConfigController.$inject = ["$scope", "$mdDialog", "tfsResources", "colors", "intervals", "config"];
                return TfsBuildConfigController;
            }());
            TfsBuild.TfsBuildConfigController = TfsBuildConfigController;
        })(TfsBuild = Widgets.TfsBuild || (Widgets.TfsBuild = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsBuild;
        (function (TfsBuild) {
            var TfsBuildController = /** @class */ (function () {
                function TfsBuildController($scope, $q, $timeout, $interval, $mdDialog, tfsResources) {
                    var _this = this;
                    this.$scope = $scope;
                    this.$q = $q;
                    this.$timeout = $timeout;
                    this.$interval = $interval;
                    this.$mdDialog = $mdDialog;
                    this.tfsResources = tfsResources;
                    this.icon = "help";
                    this.warn = false;
                    this.data = this.$scope.data;
                    this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                    this.data.type = DashCI.Models.WidgetType.tfsBuild;
                    this.data.footer = false;
                    this.data.header = false;
                    this.$scope.$watch(function () { return _this.$scope.$element.height(); }, function (height) { return _this.sizeBy(_this.$scope.$element.width(), height); });
                    this.$scope.$watch(function () { return _this.$scope.$element.width(); }, function (width) { return _this.sizeBy(width, _this.$scope.$element.height()); });
                    this.$scope.$watch(function () { return _this.data.poolInterval; }, function (value) { return _this.updateInterval(); });
                    this.$scope.$on("$destroy", function () { return _this.finalize(); });
                    this.init();
                    this.$timeout(function () { return _this.sizeBy(_this.$scope.$element.width(), _this.$scope.$element.height()); }, 500);
                }
                TfsBuildController.prototype.$onInit = function () { };
                TfsBuildController.prototype.finalize = function () {
                    if (this.handle) {
                        this.$timeout.cancel(this.handle);
                        this.$interval.cancel(this.handle);
                    }
                    DashCI.DEBUG && console.log("dispose: " + this.data.id + "-" + this.data.title);
                };
                TfsBuildController.prototype.init = function () {
                    this.data.title = this.data.title || "Build";
                    this.data.color = this.data.color || "green";
                    //default values
                    this.data.poolInterval = this.data.poolInterval || 10000;
                    this.updateInterval();
                };
                TfsBuildController.prototype.sizeBy = function (width, height) {
                    this.hideDetails = (width < height * 1.7);
                    var icon = this.$scope.$element.find(".play-status md-icon");
                    var fontSize = (Math.round(height / 1) - (this.hideDetails ? 50 : 0)) + "px";
                    //var lineSize = Math.round((altura) - 60) + "px";
                    icon.css('font-size', fontSize);
                    icon.parent().width(Math.round(height / 1));
                    //p.css('line-height', lineSize);
                    var header = this.$scope.$element.find(".header");
                    fontSize = Math.round(height / 1) + "px";
                    header.css('text-indent', fontSize);
                    //var title = this.$scope.$element.find("h2");
                    //fontSize = Math.round(height / 6) + "px";
                    //title.css('font-size', fontSize);
                    var txt = this.$scope.$element.find("h4");
                    fontSize = Math.round(height / 7) + "px";
                    txt.css('font-size', fontSize);
                    var img = this.$scope.$element.find(".avatar");
                    var size = Math.round(height - 32);
                    img.width(size);
                    img.height(size);
                    this.hideAvatar = width < 390;
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
                    if (this.handle) {
                        this.$timeout.cancel(this.handle);
                        this.$interval.cancel(this.handle);
                    }
                    this.handle = this.$timeout(function () {
                        _this.handle = _this.$interval(function () { return _this.update(); }, _this.data.poolInterval);
                    }, DashCI.randomNess()); //this should create some randomness to avoid a lot of calls at the same moment.
                    this.update();
                };
                TfsBuildController.prototype.update = function () {
                    var _this = this;
                    if (!this.data.project || (!this.data.wildcardBuild && !this.data.build) || (this.data.wildcardBuild && !this.data.buildName))
                        return;
                    var res = this.tfsResources();
                    if (!res)
                        return;
                    DashCI.DEBUG && console.log("start tfs request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
                    var doQueryBuild = function (builds) {
                        res.latest_build({
                            project: _this.data.project,
                            build: builds
                        }).$promise.then(function (build) {
                            var new_build = null;
                            if (build.value.length >= 1)
                                new_build = build.value[0];
                            _this.latest = new_build;
                            if (_this.latest) {
                                var branchName = _this.latest.sourceBranch.split("/"); //is it right?
                                _this.latest.sourceBranch = mx(branchName).last();
                            }
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
                                                _this.icon = "cancel";
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
                                _this.warn = _this.latest.result == "partiallySucceeded";
                            }
                            else
                                _this.icon = "help";
                            //var p = this.$scope.$element.find("p");
                            //p.addClass('changed');
                            //this.$timeout(() => p.removeClass('changed'), 1000);
                            _this.resizeWidget();
                            DashCI.DEBUG && console.log("end tfs request: " + _this.data.id + "; " + _this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
                        }).catch(function (reason) {
                            _this.latest = null;
                            console.error(reason);
                            _this.resizeWidget();
                        });
                    };
                    if (this.data.wildcardBuild) {
                        res.build_definition_list({
                            project: this.data.project,
                            name: this.data.buildName
                        }).$promise.then(function (build) {
                            var buildIds = mx(build.value).select(function (x) { return x.id; }).toArray().join(",");
                            doQueryBuild(buildIds);
                        }).catch(function (reason) {
                            _this.latest = null;
                            console.error(reason);
                            _this.resizeWidget();
                        });
                    }
                    else
                        doQueryBuild(this.data.build);
                };
                TfsBuildController.prototype.resizeWidget = function () {
                    var _this = this;
                    this.$timeout(function () { return _this.sizeBy(_this.$scope.$element.width(), _this.$scope.$element.height()); }, 500);
                };
                TfsBuildController.$inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "tfsResources"];
                return TfsBuildController;
            }());
            TfsBuild.TfsBuildController = TfsBuildController;
        })(TfsBuild = Widgets.TfsBuild || (Widgets.TfsBuild = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsBuild;
        (function (TfsBuild) {
            var TfsBuildDirective = /** @class */ (function () {
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
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsBuildGraph;
        (function (TfsBuildGraph) {
            var TfsBuildGraphDirective = /** @class */ (function () {
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
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsBuildGraph;
        (function (TfsBuildGraph) {
            var TfsBuildGraphConfigController = /** @class */ (function () {
                function TfsBuildGraphConfigController($scope, $mdDialog, tfsResources, colors, intervals, buildCounts, vm) {
                    this.$scope = $scope;
                    this.$mdDialog = $mdDialog;
                    this.tfsResources = tfsResources;
                    this.colors = colors;
                    this.intervals = intervals;
                    this.buildCounts = buildCounts;
                    this.vm = vm;
                    this.init();
                }
                TfsBuildGraphConfigController.prototype.$onInit = function () { };
                TfsBuildGraphConfigController.prototype.init = function () {
                    var _this = this;
                    var res = this.tfsResources();
                    if (!res)
                        return;
                    res.project_list().$promise
                        .then(function (result) {
                        _this.projects = mx(result.value).orderBy(function (x) { return x.name; }).toArray();
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
                    res.build_definition_list({ project: this.vm.project, name: "*" }).$promise
                        .then(function (result) {
                        _this.builds = mx(result.value).orderBy(function (x) { return x.name; }).toArray();
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
                TfsBuildGraphConfigController.$inject = ["$scope", "$mdDialog", "tfsResources", "colors", "intervals", "buildCounts", "config"];
                return TfsBuildGraphConfigController;
            }());
            TfsBuildGraph.TfsBuildGraphConfigController = TfsBuildGraphConfigController;
        })(TfsBuildGraph = Widgets.TfsBuildGraph || (Widgets.TfsBuildGraph = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsBuildGraph;
        (function (TfsBuildGraph) {
            var TfsBuildGraphController = /** @class */ (function () {
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
                    this.$timeout(function () { return _this.sizeFont(_this.$scope.$element.height()); }, 500);
                }
                TfsBuildGraphController.prototype.$onInit = function () { };
                TfsBuildGraphController.prototype.finalize = function () {
                    if (this.handle) {
                        this.$timeout.cancel(this.handle);
                        this.$interval.cancel(this.handle);
                    }
                    DashCI.DEBUG && console.log("dispose: " + this.data.id + "-" + this.data.title);
                };
                TfsBuildGraphController.prototype.init = function () {
                    this.data.title = this.data.title || "Build Graph";
                    this.data.color = this.data.color || "blue";
                    this.data.count = this.data.count || 20;
                    //default values
                    this.data.poolInterval = this.data.poolInterval || 10000;
                    this.updateInterval();
                };
                TfsBuildGraphController.prototype.sizeFont = function (height) {
                    var header_size = this.$scope.$element.find(".header").height();
                    var histogram = this.$scope.$element.find(".histogram");
                    histogram.height(height - 50);
                    var help_icon = this.$scope.$element.find(".unknown");
                    var size = Math.round(height / 1) - header_size - 5;
                    help_icon.css("font-size", size);
                    help_icon.height(size);
                };
                TfsBuildGraphController.prototype.config = function () {
                    var _this = this;
                    this.$mdDialog.show({
                        controller: TfsBuildGraph.TfsBuildGraphConfigController,
                        controllerAs: "ctrl",
                        templateUrl: 'app/widgets/tfs-build-graph/config.html',
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
                    if (this.handle) {
                        this.$timeout.cancel(this.handle);
                        this.$interval.cancel(this.handle);
                    }
                    this.handle = this.$timeout(function () {
                        _this.handle = _this.$interval(function () { return _this.update(); }, _this.data.poolInterval);
                    }, DashCI.randomNess()); //this should create some randomness to avoid a lot of calls at the same moment.
                    this.update();
                };
                TfsBuildGraphController.prototype.update = function () {
                    var _this = this;
                    if (!this.data.project || (!this.data.wildcardBuild && !this.data.build) || (this.data.wildcardBuild && !this.data.buildName))
                        return;
                    var res = this.tfsResources();
                    if (!res)
                        return;
                    DashCI.DEBUG && console.log("start tfs request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
                    var doQueryBuild = function (builds) {
                        res.recent_builds({
                            project: _this.data.project,
                            build: builds,
                            count: _this.data.count
                        }).$promise.then(function (result) {
                            var builds = result.value.reverse();
                            var maxDuration = 1;
                            angular.forEach(builds, function (item) {
                                if (item.finishTime) {
                                    var finishTime = moment(item.finishTime);
                                    var startTime = moment(item.startTime);
                                    item.duration = finishTime.diff(startTime, 'seconds');
                                    if (maxDuration < item.duration)
                                        maxDuration = item.duration;
                                }
                            });
                            var width = (100 / builds.length);
                            angular.forEach(builds, function (item, i) {
                                var height = Math.round((100 * item.duration) / maxDuration);
                                if (height < 3)
                                    height = 3;
                                item.css = {
                                    height: height.toString() + "%",
                                    width: width.toFixed(2) + "%",
                                    left: (width * i).toFixed(2) + "%"
                                };
                            });
                            _this.builds = builds;
                            _this.$timeout(function () { return _this.sizeFont(_this.$scope.$element.height()); }, 500);
                            DashCI.DEBUG && console.log("end tfs request: " + _this.data.id + "; " + _this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
                        }).catch(function (reason) {
                            _this.builds = [];
                            console.error(reason);
                        });
                    };
                    if (this.data.wildcardBuild) {
                        res.build_definition_list({
                            project: this.data.project,
                            name: this.data.buildName
                        }).$promise.then(function (build) {
                            var buildIds = mx(build.value).select(function (x) { return x.id; }).toArray().join(",");
                            doQueryBuild(buildIds);
                        }).catch(function (reason) {
                            _this.builds = [];
                            console.error(reason);
                        });
                    }
                    else
                        doQueryBuild(this.data.build);
                };
                TfsBuildGraphController.$inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "tfsResources"];
                return TfsBuildGraphController;
            }());
            TfsBuildGraph.TfsBuildGraphController = TfsBuildGraphController;
        })(TfsBuildGraph = Widgets.TfsBuildGraph || (Widgets.TfsBuildGraph = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsPostIt;
        (function (TfsPostIt) {
            var TfsPostItConfigController = /** @class */ (function () {
                function TfsPostItConfigController($scope, $mdDialog, $q, tfsResources, colors, intervals, vm, tfsColorBy) {
                    this.$scope = $scope;
                    this.$mdDialog = $mdDialog;
                    this.$q = $q;
                    this.tfsResources = tfsResources;
                    this.colors = colors;
                    this.intervals = intervals;
                    this.vm = vm;
                    this.tfsColorBy = tfsColorBy;
                    this.init();
                }
                TfsPostItConfigController.prototype.$onInit = function () { };
                TfsPostItConfigController.prototype.init = function () {
                    var _this = this;
                    var res = this.tfsResources();
                    if (!res)
                        return;
                    res.project_list().$promise
                        .then(function (result) {
                        _this.projects = mx(result.value).orderBy(function (x) { return x.name; }).toArray();
                    })
                        .catch(function (reason) {
                        console.error(reason);
                        _this.projects = [];
                    });
                    this.$scope.$watch(function () { return _this.vm.project; }, function () {
                        _this.getTeams();
                        _this.getQueries();
                    });
                };
                TfsPostItConfigController.prototype.getQueries = function () {
                    var _this = this;
                    var res = this.tfsResources();
                    if (!res || !this.vm.project)
                        return;
                    var q1 = res.query_list({ project: this.vm.project, folder: "Shared Queries" }).$promise;
                    var q2 = res.query_list({ project: this.vm.project, folder: "My Queries" }).$promise;
                    this.$q.all([q1, q2])
                        .then(function (result) {
                        var q = [];
                        angular.forEach(result[0].children || result[0].value, function (item) { return q.push(item); });
                        angular.forEach(result[1].children || result[1].value, function (item) { return q.push(item); });
                        mx(q).forEach(function (x) {
                            if (x.children)
                                x.children = mx(x.children).orderBy(function (y) { return y.name; }).toArray();
                        });
                        _this.queries = mx(q).orderBy(function (x) { return x.name; }).toArray();
                    }).catch(function (reason) {
                        console.error(reason);
                        _this.queries = [];
                    });
                };
                TfsPostItConfigController.prototype.getTeams = function () {
                    var _this = this;
                    var res = this.tfsResources();
                    if (!res || !this.vm.project)
                        return;
                    res.team_list({ project: this.vm.project })
                        .$promise
                        .then(function (result) {
                        _this.teams = mx(result.value).orderBy(function (x) { return x.name; }).toArray();
                    })
                        .catch(function (reason) {
                        console.error(reason);
                        _this.teams = [];
                    });
                    ;
                };
                TfsPostItConfigController.prototype.ok = function () {
                    this.$mdDialog.hide(true);
                };
                TfsPostItConfigController.$inject = ["$scope", "$mdDialog", "$q", "tfsResources", "colors", "intervals", "config", "tfsColorBy"];
                return TfsPostItConfigController;
            }());
            TfsPostIt.TfsPostItConfigController = TfsPostItConfigController;
        })(TfsPostIt = Widgets.TfsPostIt || (Widgets.TfsPostIt = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsPostIt;
        (function (TfsPostIt) {
            var TfsPostItController = /** @class */ (function () {
                function TfsPostItController($scope, $q, $timeout, $interval, $mdDialog, tfsResources, colors) {
                    var _this = this;
                    this.$scope = $scope;
                    this.$q = $q;
                    this.$timeout = $timeout;
                    this.$interval = $interval;
                    this.$mdDialog = $mdDialog;
                    this.tfsResources = tfsResources;
                    this.colors = colors;
                    this.count = null;
                    this.list = null;
                    this.areaColors = {};
                    this.workItemColors = {
                        "Requirement": "blue",
                        "User Story": "blue",
                        "Release Item": "orange",
                        "Release": "deep-green",
                        "Feature": "purple",
                        "Epic": "purple",
                        "Bug": "red",
                        "Issue": "amber"
                    };
                    this.data = this.$scope.data;
                    this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                    this.data.type = DashCI.Models.WidgetType.tfsPostIt;
                    this.data.footer = false;
                    this.data.header = true;
                    this.$scope.$watch(function () { return _this.$scope.$element.height(); }, function (height) { return _this.sizeFont(height); });
                    this.$scope.$watch(function () { return _this.data.poolInterval; }, function (value) { return _this.updateInterval(); });
                    this.$scope.$on("$destroy", function () { return _this.finalize(); });
                    this.init();
                    this.colors = mx(this.colors).where(function (x) { return x.code != "transparent" && x.code != "semi-transp"; }).toArray();
                }
                TfsPostItController.prototype.$onInit = function () { };
                TfsPostItController.prototype.finalize = function () {
                    if (this.handle) {
                        this.$timeout.cancel(this.handle);
                        this.$interval.cancel(this.handle);
                    }
                    DashCI.DEBUG && console.log("dispose: " + this.data.id + "-" + this.data.title);
                };
                TfsPostItController.prototype.init = function () {
                    this.data.title = this.data.title || "PostIt";
                    this.data.color = "transparent";
                    this.data.postItColor = this.data.postItColor || "amber";
                    this.data.columns = this.data.columns || 1;
                    //default values
                    this.data.poolInterval = this.data.poolInterval || 10000;
                    this.updateInterval();
                };
                TfsPostItController.prototype.sizeFont = function (height) {
                    //var p = this.$scope.$element.find("p");
                    //var fontSize = Math.round(height / 1.3) + "px";
                    //var lineSize = Math.round((height) - 60) + "px";
                    //p.css('font-size', fontSize);
                    //p.css('line-height', lineSize);
                };
                TfsPostItController.prototype.config = function () {
                    var _this = this;
                    this.$mdDialog.show({
                        controller: TfsPostIt.TfsPostItConfigController,
                        controllerAs: "ctrl",
                        templateUrl: 'app/widgets/tfs-postit/config.html',
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
                TfsPostItController.prototype.updateInterval = function () {
                    var _this = this;
                    if (this.handle) {
                        this.$timeout.cancel(this.handle);
                        this.$interval.cancel(this.handle);
                    }
                    this.handle = this.$timeout(function () {
                        _this.handle = _this.$interval(function () { return _this.update(); }, _this.data.poolInterval);
                    }, DashCI.randomNess()); //this should create some randomness to avoid a lot of calls at the same moment.
                    this.update();
                };
                TfsPostItController.prototype.update = function () {
                    var _this = this;
                    var res = this.tfsResources();
                    if (!res)
                        return;
                    DashCI.DEBUG && console.log("start Tfs request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us") + "; ");
                    res.run_query({
                        project: this.data.project,
                        team: this.data.team,
                        queryId: this.data.queryId
                    }).$promise.then(function (newPostIt) {
                        //var newPostIt = Math.round(Math.random() * 100);
                        var order = mx(newPostIt.workItems).select(function (x) { return x.id; }).toArray();
                        var ids = order.join(",");
                        res.get_workitems({
                            ids: ids
                        }).$promise.then(function (data) {
                            if (data.count != _this.count) {
                                _this.count = data.count;
                                var p = _this.$scope.$element.find("p");
                                p.addClass('changed');
                                _this.$timeout(function () { return p.removeClass('changed'); }, 1000);
                            }
                            _this.list = mx(data.value)
                                .orderBy(function (x) { return order.indexOf(x.id); })
                                .select(function (item) {
                                var title = item.fields["System.Title"];
                                var resume = item.fields["System.IterationPath"];
                                var desc = item.fields["System.AssignedTo"];
                                if (desc && desc.indexOf("<") > -1)
                                    desc = desc.substr(0, desc.indexOf("<")).trim();
                                if (resume && resume.indexOf("\\") > -1)
                                    resume = resume.substr(resume.indexOf("\\") + 1);
                                var color = _this.data.postItColor;
                                if (_this.data.colorBy && _this.data.colorBy == DashCI.Resources.Tfs.TfsColorBy.randomColorByPath) {
                                    if (!_this.areaColors[resume] && _this.colors.length > 0) {
                                        var ix = TfsPostItController.getRandomInt(0, _this.colors.length - 1);
                                        _this.areaColors[resume] = _this.colors[ix].code;
                                        _this.colors.splice(ix, 1);
                                    }
                                    else if (!_this.areaColors[resume] && _this.colors.length == 0) {
                                        _this.areaColors[resume] = _this.data.postItColor;
                                    }
                                    color = _this.areaColors[resume];
                                }
                                else if (_this.data.colorBy && _this.data.colorBy == DashCI.Resources.Tfs.TfsColorBy.colorByWorkItemType) {
                                    var type = item.fields["System.WorkItemType"];
                                    if (!_this.workItemColors[type]) {
                                        _this.workItemColors[type] = _this.data.postItColor;
                                    }
                                    color = _this.workItemColors[type];
                                }
                                var ret = {
                                    avatarUrl: null,
                                    resume: resume,
                                    description: desc,
                                    title: title,
                                    colorClass: color
                                };
                                return ret;
                            }).toArray();
                            DashCI.DEBUG && console.log("end Tfs request: " + _this.data.id + "; " + _this.data.title + "; " + new Date().toLocaleTimeString("en-us") + "; ");
                        });
                    })
                        .catch(function (reason) {
                        _this.count = null;
                        console.error(reason);
                    });
                    this.$timeout(function () { return _this.sizeFont(_this.$scope.$element.height()); }, 500);
                };
                // Returns a random integer between min (included) and max (included)
                TfsPostItController.getRandomInt = function (min, max) {
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                };
                TfsPostItController.$inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "tfsResources", "colors"];
                return TfsPostItController;
            }());
            TfsPostIt.TfsPostItController = TfsPostItController;
            var PostItListItem = /** @class */ (function () {
                function PostItListItem() {
                }
                return PostItListItem;
            }());
            TfsPostIt.PostItListItem = PostItListItem;
        })(TfsPostIt = Widgets.TfsPostIt || (Widgets.TfsPostIt = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsPostIt;
        (function (TfsPostIt) {
            var TfsPostItDirective = /** @class */ (function () {
                function TfsPostItDirective() {
                    this.restrict = "E";
                    this.templateUrl = "app/widgets/tfs-postit/tfs-postit.html";
                    this.replace = false;
                    this.controller = TfsPostIt.TfsPostItController;
                    this.controllerAs = "ctrl";
                    /* Binding css to directives */
                    this.css = {
                        href: "app/widgets/tfs-postit/tfs-postit.css",
                        persist: true
                    };
                }
                TfsPostItDirective.create = function () {
                    var directive = function () { return new TfsPostItDirective(); };
                    directive.$inject = [];
                    return directive;
                };
                return TfsPostItDirective;
            }());
            DashCI.app.directive("tfsPostIt", TfsPostItDirective.create());
        })(TfsPostIt = Widgets.TfsPostIt || (Widgets.TfsPostIt = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsQueryChart;
        (function (TfsQueryChart) {
            var TfsQueryChartConfigController = /** @class */ (function () {
                function TfsQueryChartConfigController($scope, $mdDialog, $q, tfsResources, colors, intervals, vm) {
                    this.$scope = $scope;
                    this.$mdDialog = $mdDialog;
                    this.$q = $q;
                    this.tfsResources = tfsResources;
                    this.colors = colors;
                    this.intervals = intervals;
                    this.vm = vm;
                    this.init();
                }
                TfsQueryChartConfigController.prototype.init = function () {
                    var _this = this;
                    var res = this.tfsResources();
                    if (!res)
                        return;
                    res.project_list().$promise
                        .then(function (result) {
                        _this.projects = mx(result.value).orderBy(function (x) { return x.name; }).toArray();
                    })
                        .catch(function (reason) {
                        console.error(reason);
                        _this.projects = [];
                    });
                    this.$scope.$watch(function () { return _this.vm.project; }, function () {
                        _this.getTeams();
                        _this.getQueries();
                    });
                    this.$scope.$watch(function () { return _this.vm.queryCount; }, function () { return _this.setQueryList(); });
                };
                TfsQueryChartConfigController.prototype.$onInit = function () { };
                TfsQueryChartConfigController.prototype.getQueries = function () {
                    var _this = this;
                    var res = this.tfsResources();
                    if (!res || !this.vm.project)
                        return;
                    var q1 = res.query_list({ project: this.vm.project, folder: "Shared Queries" }).$promise;
                    var q2 = res.query_list({ project: this.vm.project, folder: "My Queries" }).$promise;
                    this.$q.all([q1, q2])
                        .then(function (result) {
                        var q = [];
                        angular.forEach(result[0].children || result[0].value, function (item) { return q.push(item); });
                        angular.forEach(result[1].children || result[1].value, function (item) { return q.push(item); });
                        mx(q).forEach(function (x) {
                            if (x.children)
                                x.children = mx(x.children).orderBy(function (y) { return y.name; }).toArray();
                        });
                        _this.queries = mx(q).orderBy(function (x) { return x.name; }).toArray();
                    }).catch(function (reason) {
                        console.error(reason);
                        _this.queries = [];
                    });
                };
                TfsQueryChartConfigController.prototype.getTeams = function () {
                    var _this = this;
                    var res = this.tfsResources();
                    if (!res || !this.vm.project)
                        return;
                    res.team_list({ project: this.vm.project })
                        .$promise
                        .then(function (result) {
                        _this.teams = mx(result.value).orderBy(function (x) { return x.name; }).toArray();
                    })
                        .catch(function (reason) {
                        console.error(reason);
                        _this.teams = [];
                    });
                    ;
                };
                TfsQueryChartConfigController.prototype.setQueryList = function () {
                    if (this.vm.queryIds.length < this.vm.queryCount) {
                        for (var i = 0; i < this.vm.queryCount; i++) {
                            this.vm.queryIds.push("");
                            this.vm.queryColors.push("");
                        }
                    }
                    else if (this.vm.queryIds.length > this.vm.queryCount) {
                        while (this.vm.queryIds.length > this.vm.queryCount) {
                            this.vm.queryIds.pop();
                            this.vm.queryColors.pop();
                        }
                    }
                };
                TfsQueryChartConfigController.prototype.ok = function () {
                    this.$mdDialog.hide(true);
                };
                TfsQueryChartConfigController.$inject = ["$scope", "$mdDialog", "$q", "tfsResources", "colors", "intervals", "config"];
                return TfsQueryChartConfigController;
            }());
            TfsQueryChart.TfsQueryChartConfigController = TfsQueryChartConfigController;
        })(TfsQueryChart = Widgets.TfsQueryChart || (Widgets.TfsQueryChart = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsQueryChart;
        (function (TfsQueryChart) {
            var TfsQueryChartController = /** @class */ (function () {
                function TfsQueryChartController($scope, $q, $timeout, $interval, $mdDialog, tfsResources) {
                    var _this = this;
                    this.$scope = $scope;
                    this.$q = $q;
                    this.$timeout = $timeout;
                    this.$interval = $interval;
                    this.$mdDialog = $mdDialog;
                    this.tfsResources = tfsResources;
                    this.total = null;
                    this.width = 50;
                    this.height = 50;
                    this.fontSize = 12;
                    this.lineSize = 12;
                    this.doughnutHoleSize = 0.5;
                    this.data = this.$scope.data;
                    this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                    this.data.type = DashCI.Models.WidgetType.tfsQueryChart;
                    this.data.footer = false;
                    this.data.header = true;
                    this.$scope.$watch(function () { return _this.$scope.$element.height(); }, function (height) { return _this.resizeBy(_this.$scope.$element.width(), height); });
                    this.$scope.$watch(function () { return _this.$scope.$element.width(); }, function (width) { return _this.resizeBy(width, _this.$scope.$element.height()); });
                    this.$scope.$watch(function () { return _this.data.poolInterval; }, function (value) { return _this.updateInterval(); });
                    this.$scope.$on("$destroy", function () { return _this.finalize(); });
                    this.init();
                }
                TfsQueryChartController.prototype.$onInit = function () { };
                TfsQueryChartController.prototype.finalize = function () {
                    if (this.handle) {
                        this.$timeout.cancel(this.handle);
                        this.$interval.cancel(this.handle);
                    }
                    DashCI.DEBUG && console.log("dispose: " + this.data.id + "-" + this.data.title);
                };
                TfsQueryChartController.prototype.init = function () {
                    this.data.title = this.data.title || "Chart";
                    this.data.color = this.data.color || "grey";
                    //default values
                    this.data.queryCount = this.data.queryCount || 2;
                    this.data.queryIds = this.data.queryIds || ["", ""];
                    this.data.queryColors = this.data.queryColors || ["", ""];
                    this.data.poolInterval = this.data.poolInterval || 20000;
                    this.updateInterval();
                };
                TfsQueryChartController.prototype.resizeBy = function (width, height) {
                    var _this = this;
                    this.width = width;
                    this.height = height - 40;
                    this.fontSize = Math.round(height / 1.3);
                    this.lineSize = Math.round((height) - 60);
                    var canvas = this.$scope.$element.find("canvas").get(0);
                    if (canvas) {
                        canvas.width = this.width;
                        canvas.height = this.height;
                    }
                    this.$timeout(function () { return _this.drawGraph(); }, 50);
                };
                TfsQueryChartController.prototype.config = function () {
                    var _this = this;
                    this.$mdDialog.show({
                        controller: TfsQueryChart.TfsQueryChartConfigController,
                        controllerAs: "ctrl",
                        templateUrl: 'app/widgets/tfs-query-chart/config.html',
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
                TfsQueryChartController.prototype.updateInterval = function () {
                    var _this = this;
                    if (this.handle) {
                        this.$timeout.cancel(this.handle);
                        this.$interval.cancel(this.handle);
                    }
                    this.handle = this.$timeout(function () {
                        _this.handle = _this.$interval(function () { return _this.update(); }, _this.data.poolInterval);
                    }, DashCI.randomNess()); //this should create some randomness to avoid a lot of calls at the same moment.
                    this.update();
                };
                TfsQueryChartController.prototype.update = function () {
                    var _this = this;
                    if (!this.data.project || !this.data.queryIds || this.data.queryIds.length == 0)
                        return;
                    var res = this.tfsResources();
                    if (!res)
                        return;
                    var queries = [];
                    for (var q in this.data.queryIds) {
                        var query = this.data.queryIds[q];
                        if (query)
                            queries.push(res.run_query({
                                project: this.data.project,
                                team: this.data.team,
                                queryId: query
                            }).$promise);
                    }
                    if (queries.length == 0)
                        return;
                    DashCI.DEBUG && console.log("start tfs request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
                    this.$q.all(queries)
                        .then(function (res) {
                        var resValues = [];
                        _this.total = 0;
                        for (var i in res) {
                            resValues.push(res[i].workItems.length);
                            _this.total += res[i].workItems.length;
                        }
                        _this.queryValues = resValues;
                        _this.drawGraph();
                        DashCI.DEBUG && console.log("end tfs request: " + _this.data.id + "; " + _this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
                    })
                        .catch(function (reason) {
                        _this.queryValues = null;
                        console.error(reason);
                    });
                    this.$timeout(function () { return _this.resizeBy(_this.$scope.$element.width(), _this.$scope.$element.height()); }, 500);
                };
                TfsQueryChartController.prototype.drawGraph = function () {
                    var data = [];
                    var labels = [];
                    var colors = [];
                    DashCI.DEBUG && console.log("chart draw start: " + this.data.title);
                    var bgColor = this.data.color == 'transparent' || this.data.color == 'semi-transparent' ? "black" :
                        this.getStyleRuleValue("background-color", "." + this.data.color);
                    for (var i in this.queryValues) {
                        data.push(this.queryValues[i]);
                        labels.push(this.queryValues[i].toString());
                        var color = this.getStyleRuleValue("background-color", "." + this.data.queryColors[i]);
                        colors.push(color);
                    }
                    //todo: draw segments at canvas.
                    var canvas = this.$scope.$element.find("canvas").get(0);
                    if (!canvas)
                        return;
                    var ctx = canvas.getContext("2d");
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    var total_value = this.total;
                    //var color_index = 0;
                    var start_angle = 0;
                    for (var i in data) {
                        var val = data[i];
                        var slice_angle = 2 * Math.PI * val / total_value;
                        this.drawPieSlice(ctx, canvas.width / 2, canvas.height / 2, Math.min(canvas.width / 2, canvas.height / 2), start_angle, start_angle + slice_angle, colors[i]);
                        start_angle += slice_angle;
                        //color_index++;
                    }
                    //drawing a white circle over the chart
                    //to create the doughnut chart
                    if (this.doughnutHoleSize) {
                        this.drawPieSlice(ctx, canvas.width / 2, canvas.height / 2, this.doughnutHoleSize * Math.min(canvas.width / 2, canvas.height / 2), 0, 2 * Math.PI, bgColor);
                    }
                    start_angle = 0;
                    for (i in data) {
                        var val = data[i];
                        slice_angle = 2 * Math.PI * val / total_value;
                        var pieRadius = Math.min(canvas.width / 2, canvas.height / 2);
                        var labelX = canvas.width / 2 + (pieRadius / 2) * Math.cos(start_angle + slice_angle / 2);
                        var labelY = canvas.height / 2 + (pieRadius / 2) * Math.sin(start_angle + slice_angle / 2);
                        if (this.doughnutHoleSize) {
                            var offset = (pieRadius * this.doughnutHoleSize) / 2;
                            labelX = canvas.width / 2 + (offset + pieRadius / 2) * Math.cos(start_angle + slice_angle / 2);
                            labelY = canvas.height / 2 + (offset + pieRadius / 2) * Math.sin(start_angle + slice_angle / 2);
                        }
                        var labelText = Math.round(100 * val / total_value);
                        if (labelText > 4) {
                            ctx.fillStyle = "white";
                            ctx.font = "bold 20px Arial";
                            ctx.fillText(labelText + "%", labelX, labelY);
                            start_angle += slice_angle;
                        }
                    }
                    DashCI.DEBUG && console.log("chart draw complete: " + this.data.title);
                };
                /*
                private drawLine(ctx:CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number) {
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                }
        
                private drawArc(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) {
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                    ctx.stroke();
                }
                */
                TfsQueryChartController.prototype.drawPieSlice = function (ctx, centerX, centerY, radius, startAngle, endAngle, color) {
                    if (color)
                        ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                    ctx.closePath();
                    //if (!color) {
                    //    ctx.clip();
                    //    ctx.clearRect(centerX - radius - 1, centerY - radius - 1,
                    //        radius * 2 + 2, radius * 2 + 2);
                    //}
                    ctx.fill();
                };
                TfsQueryChartController.prototype.getStyleRuleValue = function (style, selector, sheet) {
                    var sheets = typeof sheet !== 'undefined' ? [sheet] : document.styleSheets;
                    for (var i = 0, l = sheets.length; i < l; i++) {
                        var currentSheet = sheets[i];
                        var rules = currentSheet.cssRules || currentSheet.rules;
                        if (!rules) {
                            continue;
                        }
                        for (var j = 0, k = rules.length; j < k; j++) {
                            var rule = rules[j];
                            if (rule.selectorText && rule.selectorText.split(',').indexOf(selector) !== -1) {
                                return rule.style[style];
                            }
                        }
                    }
                    return null;
                };
                TfsQueryChartController.$inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "tfsResources"];
                return TfsQueryChartController;
            }());
            TfsQueryChart.TfsQueryChartController = TfsQueryChartController;
        })(TfsQueryChart = Widgets.TfsQueryChart || (Widgets.TfsQueryChart = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsQueryChart;
        (function (TfsQueryChart) {
            var TfsQueryChartDirective = /** @class */ (function () {
                function TfsQueryChartDirective() {
                    this.restrict = "E";
                    this.templateUrl = "app/widgets/tfs-query-chart/tfs-query-chart.html";
                    this.replace = false;
                    this.controller = TfsQueryChart.TfsQueryChartController;
                    this.controllerAs = "ctrl";
                    /* Binding css to directives */
                    this.css = {
                        href: "app/widgets/tfs-query-chart/tfs-query-chart.css",
                        persist: true
                    };
                }
                TfsQueryChartDirective.create = function () {
                    var directive = function () { return new TfsQueryChartDirective(); };
                    directive.$inject = [];
                    return directive;
                };
                return TfsQueryChartDirective;
            }());
            DashCI.app.directive("tfsQueryChart", TfsQueryChartDirective.create());
        })(TfsQueryChart = Widgets.TfsQueryChart || (Widgets.TfsQueryChart = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsQueryCount;
        (function (TfsQueryCount) {
            var TfsQueryCountConfigController = /** @class */ (function () {
                function TfsQueryCountConfigController($scope, $mdDialog, $q, tfsResources, colors, intervals, vm) {
                    this.$scope = $scope;
                    this.$mdDialog = $mdDialog;
                    this.$q = $q;
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
                        _this.projects = mx(result.value).orderBy(function (x) { return x.name; }).toArray();
                    })
                        .catch(function (reason) {
                        console.error(reason);
                        _this.projects = [];
                    });
                    this.$scope.$watch(function () { return _this.vm.project; }, function () { return _this.getQueries(); });
                };
                TfsQueryCountConfigController.prototype.$onInit = function () { };
                TfsQueryCountConfigController.prototype.getQueries = function () {
                    var _this = this;
                    var res = this.tfsResources();
                    if (!res || !this.vm.project)
                        return;
                    var q1 = res.query_list({ project: this.vm.project, folder: "Shared Queries" }).$promise;
                    var q2 = res.query_list({ project: this.vm.project, folder: "My Queries" }).$promise;
                    this.$q.all([q1, q2])
                        .then(function (result) {
                        var q = [];
                        angular.forEach(result[0].children || result[0].value, function (item) { return q.push(item); });
                        angular.forEach(result[1].children || result[1].value, function (item) { return q.push(item); });
                        mx(q).forEach(function (x) {
                            if (x.children)
                                x.children = mx(x.children).orderBy(function (y) { return y.name; }).toArray();
                        });
                        _this.queries = mx(q).orderBy(function (x) { return x.name; }).toArray();
                    }).catch(function (reason) {
                        console.error(reason);
                        _this.queries = [];
                    });
                };
                TfsQueryCountConfigController.prototype.ok = function () {
                    this.$mdDialog.hide(true);
                };
                TfsQueryCountConfigController.$inject = ["$scope", "$mdDialog", "$q", "tfsResources", "colors", "intervals", "config"];
                return TfsQueryCountConfigController;
            }());
            TfsQueryCount.TfsQueryCountConfigController = TfsQueryCountConfigController;
        })(TfsQueryCount = Widgets.TfsQueryCount || (Widgets.TfsQueryCount = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsQueryCount;
        (function (TfsQueryCount) {
            var TfsQueryCountController = /** @class */ (function () {
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
                TfsQueryCountController.prototype.$onInit = function () { };
                TfsQueryCountController.prototype.finalize = function () {
                    if (this.handle) {
                        this.$timeout.cancel(this.handle);
                        this.$interval.cancel(this.handle);
                    }
                    DashCI.DEBUG && console.log("dispose: " + this.data.id + "-" + this.data.title);
                };
                TfsQueryCountController.prototype.init = function () {
                    if (typeof (this.data.title) == "undefined")
                        this.data.title = this.data.title || "Query";
                    this.data.color = this.data.color || "grey";
                    //default values
                    this.data.queryId = this.data.queryId || "";
                    this.data.poolInterval = this.data.poolInterval || 20000;
                    this.updateInterval();
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
                    if (this.handle) {
                        this.$timeout.cancel(this.handle);
                        this.$interval.cancel(this.handle);
                    }
                    this.handle = this.$timeout(function () {
                        _this.handle = _this.$interval(function () { return _this.update(); }, _this.data.poolInterval);
                    }, DashCI.randomNess()); //this should create some randomness to avoid a lot of calls at the same moment.
                    this.update();
                };
                TfsQueryCountController.prototype.update = function () {
                    var _this = this;
                    if (!this.data.project || !this.data.queryId)
                        return;
                    var res = this.tfsResources();
                    if (!res)
                        return;
                    DashCI.DEBUG && console.log("start tfs request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
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
                        if (_this.data.lowerThan && !isNaN(_this.data.lowerThan.value) && _this.data.lowerThan.color) {
                            if (_this.queryCount < _this.data.lowerThan.value)
                                _this.colorClass = _this.data.lowerThan.color;
                        }
                        if (_this.data.greaterThan && !isNaN(_this.data.greaterThan.value) && _this.data.greaterThan.color) {
                            if (_this.queryCount > _this.data.greaterThan.value)
                                _this.colorClass = _this.data.greaterThan.color;
                        }
                        DashCI.DEBUG && console.log("end tfs request: " + _this.data.id + "; " + _this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
                    })
                        .catch(function (reason) {
                        _this.queryCount = null;
                        console.error(reason);
                    });
                    this.$timeout(function () { return _this.sizeFont(_this.$scope.$element.height()); }, 500);
                };
                TfsQueryCountController.$inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "tfsResources"];
                return TfsQueryCountController;
            }());
            TfsQueryCount.TfsQueryCountController = TfsQueryCountController;
        })(TfsQueryCount = Widgets.TfsQueryCount || (Widgets.TfsQueryCount = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsQueryCount;
        (function (TfsQueryCount) {
            var TfsQueryCountDirective = /** @class */ (function () {
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
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsRelease;
        (function (TfsRelease) {
            var TfsReleaseConfigController = /** @class */ (function () {
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
                        _this.projects = mx(result.value).orderBy(function (x) { return x.name; }).toArray();
                    })
                        .catch(function (reason) {
                        console.error(reason);
                        _this.projects = [];
                    });
                    this.$scope.$watch(function () { return _this.vm.project; }, function () { return _this.getReleaseDefs(); });
                };
                TfsReleaseConfigController.prototype.$onInit = function () { };
                TfsReleaseConfigController.prototype.getReleaseDefs = function () {
                    var _this = this;
                    var res = this.tfsResources();
                    if (!res || !this.vm.project)
                        return;
                    res.release_definition_list({ project: this.vm.project }).$promise
                        .then(function (result) {
                        _this.releases = mx(result.value).orderBy(function (x) { return x.name; }).toArray();
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
                TfsReleaseConfigController.$inject = ["$scope", "$mdDialog", "tfsResources", "colors", "intervals", "config"];
                return TfsReleaseConfigController;
            }());
            TfsRelease.TfsReleaseConfigController = TfsReleaseConfigController;
        })(TfsRelease = Widgets.TfsRelease || (Widgets.TfsRelease = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsRelease;
        (function (TfsRelease) {
            var TfsReleaseController = /** @class */ (function () {
                function TfsReleaseController($scope, $q, $timeout, $interval, $mdDialog, tfsResources) {
                    var _this = this;
                    this.$scope = $scope;
                    this.$q = $q;
                    this.$timeout = $timeout;
                    this.$interval = $interval;
                    this.$mdDialog = $mdDialog;
                    this.tfsResources = tfsResources;
                    this.envcontainer = {
                        width: "0%"
                    };
                    this.env = {
                        height: "0px",
                        iconSize: "0px"
                    };
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
                TfsReleaseController.prototype.$onInit = function () { };
                TfsReleaseController.prototype.finalize = function () {
                    if (this.handle) {
                        this.$timeout.cancel(this.handle);
                        this.$interval.cancel(this.handle);
                    }
                    DashCI.DEBUG && console.log("dispose: " + this.data.id + "-" + this.data.title);
                };
                TfsReleaseController.prototype.init = function () {
                    this.data.title = this.data.title || "Release";
                    this.data.color = this.data.color || "brown";
                    //default values
                    this.data.poolInterval = this.data.poolInterval || 10000;
                    this.updateInterval();
                };
                TfsReleaseController.prototype.sizeFont = function (height) {
                    var header_size = this.$scope.$element.find(".header").height();
                    var help_icon = this.$scope.$element.find(".unknown");
                    var size = Math.round(height / 1) - header_size - 5;
                    help_icon.css("font-size", size);
                    help_icon.height(size);
                    var padding = Number(this.$scope.$element.find(".envcontainer").css("padding-top")) || 5;
                    this.env.height = ((height - header_size - 25) / this.rowCount() - (padding * 2)).toFixed(2) + "px";
                    this.envcontainer.width = ((100 / this.maxColumnCount()) - 0.5).toFixed(2) + "%";
                    this.env.iconSize = this.env.height;
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
                    if (this.handle) {
                        this.$timeout.cancel(this.handle);
                        this.$interval.cancel(this.handle);
                    }
                    this.handle = this.$timeout(function () {
                        _this.handle = _this.$interval(function () { return _this.update(); }, _this.data.poolInterval);
                    }, DashCI.randomNess()); //this should create some randomness to avoid a lot of calls at the same moment.
                    this.update();
                };
                TfsReleaseController.prototype.update = function () {
                    var _this = this;
                    if (!this.data.project || !this.data.release)
                        return;
                    var res = this.tfsResources();
                    if (!res)
                        return;
                    if (!this.releaseDefinition || this.releaseDefinition.id != this.data.release) {
                        this.releaseDefinition = null;
                        res.release_definition({ project: this.data.project, release: this.data.release }).$promise
                            .then(function (result) {
                            _this.releaseDefinition = result;
                            _this.update();
                        })
                            .catch(function (error) {
                            _this.releaseDefinition = null;
                            _this.environment_rows = null;
                            console.error(error);
                        });
                    }
                    if (this.releaseDefinition) {
                        DashCI.DEBUG && console.log("start tfs request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
                        res.latest_release_environments({ project: this.data.project, release: this.data.release })
                            .$promise.then(function (result) {
                            _this.latest = result.releases.length > 0 ? result.releases[result.releases.length - 1] : null;
                            angular.forEach(result.environments, function (e) {
                                var findRelease = result.releases.filter(function (r) { return e.lastReleases.length > 0 && r.id == e.lastReleases[0].id; });
                                var lastestDef = _this.latest.environments.filter(function (re) { return re.definitionEnvironmentId == e.id; })[0];
                                if (lastestDef && lastestDef.status == "inProgress") {
                                    angular.extend(e, lastestDef);
                                }
                                else if (findRelease.length == 1) {
                                    var releaseEnv = findRelease[0].environments.filter(function (re) { return re.definitionEnvironmentId == e.id; });
                                    if (releaseEnv.length > 0)
                                        angular.extend(e, releaseEnv[0]);
                                }
                                else if (lastestDef) {
                                    e.name = lastestDef.name;
                                    e.conditions = lastestDef.conditions;
                                }
                                if (lastestDef) {
                                    var currentEnv = _this.releaseDefinition.environments.filter(function (re) { return re.id == lastestDef.definitionEnvironmentId; });
                                    e.conditions = currentEnv[0].conditions;
                                }
                                if (!e.release && e.lastReleases && e.lastReleases.length > 0)
                                    e.release = result.releases.filter(function (r) { return r.id == e.lastReleases[0].id; })[0];
                                _this.setIcon(e);
                            });
                            _this.environments = result.environments;
                            if (_this.latest) {
                                var baseEnvs = _this.environments.filter(_this.filterAutomaticAfterReleaseOrManual);
                                var rows = [];
                                angular.forEach(baseEnvs, function (item) {
                                    var row = [];
                                    row.push(item);
                                    angular.forEach(_this.filterSubSequentEnvironments(item), function (e) { return row.push(e); });
                                    rows.push(row);
                                });
                                _this.environment_rows = rows;
                            }
                            else {
                                _this.environments = null;
                                _this.environment_rows = null;
                            }
                            _this.sizeFont(_this.$scope.$element.height());
                            DashCI.DEBUG && console.log("end tfs request: " + _this.data.id + "; " + _this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
                        })
                            .catch(function (error) {
                            _this.latest = null;
                            _this.environments = null;
                            _this.releaseDefinition = null;
                            _this.environment_rows = null;
                            console.error(error);
                            _this.sizeFont(_this.$scope.$element.height());
                        });
                    }
                };
                TfsReleaseController.prototype.rowCount = function () {
                    return this.environment_rows ? this.environment_rows.length : 0;
                };
                TfsReleaseController.prototype.maxColumnCount = function () {
                    if (!this.environment_rows)
                        return 0;
                    var maxColumns = 0;
                    angular.forEach(this.environment_rows, function (row) {
                        if (row.length > maxColumns)
                            maxColumns = row.length;
                    });
                    return maxColumns;
                };
                TfsReleaseController.prototype.filterAutomaticAfterReleaseOrManual = function (element) {
                    return (element.conditions && element.conditions[0] && element.conditions[0].name == "ReleaseStarted") ||
                        (element.conditions && element.conditions.length == 0) //manual
                    ;
                };
                TfsReleaseController.prototype.filterSubSequentEnvironments = function (rootElement) {
                    var _this = this;
                    var list = this.environments.filter(function (element) {
                        return element.conditions && element.conditions[0] &&
                            element.conditions[0].conditionType == "environmentState" &&
                            element.conditions[0].name == rootElement.name;
                    });
                    angular.forEach(list, function (item) {
                        var moreList = _this.filterSubSequentEnvironments(item);
                        if (moreList.length > 0)
                            angular.forEach(moreList, function (mi) { return list.push(mi); });
                    });
                    return list;
                };
                TfsReleaseController.prototype.setIcon = function (item) {
                    if (item.release) {
                        switch (item.status) {
                            case "inProgress":
                                item.icon = "play_circle_filled";
                                break;
                            case "canceled":
                                item.icon = "remove_circle";
                                break;
                            case "notStarted":
                                item.icon = "pause_circle_filled";
                                break;
                            case "rejected":
                                item.icon = "cancel";
                                break;
                            case "succeeded":
                                item.icon = "check";
                                break;
                            default:
                                item.icon = "help";
                                break;
                        }
                        if (item && item.preDeployApprovals) {
                            var preDeploy = item.preDeployApprovals.filter(function (p) { return p.status == "pending"; });
                            if (preDeploy.length > 0)
                                item.icon = "assignment_ind";
                            preDeploy = item.preDeployApprovals.filter(function (p) { return p.status == "rejected"; });
                            if (preDeploy.length > 0)
                                item.icon = "assignment_late";
                        }
                        if (item && item.postDeployApprovals) {
                            var postDeploy = item.postDeployApprovals.filter(function (p) { return p.status == "pending"; });
                            if (postDeploy.length > 0)
                                item.icon = "assignment_ind";
                            postDeploy = item.postDeployApprovals.filter(function (p) { return p.status == "rejected"; });
                            if (postDeploy.length > 0)
                                item.icon = "assignment_late";
                        }
                    }
                    else {
                        item.icon = "";
                    }
                };
                TfsReleaseController.$inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "tfsResources"];
                return TfsReleaseController;
            }());
            TfsRelease.TfsReleaseController = TfsReleaseController;
        })(TfsRelease = Widgets.TfsRelease || (Widgets.TfsRelease = {}));
    })(Widgets = DashCI.Widgets || (DashCI.Widgets = {}));
})(DashCI || (DashCI = {}));
var DashCI;
(function (DashCI) {
    var Widgets;
    (function (Widgets) {
        var TfsRelease;
        (function (TfsRelease) {
            var TfsReleaseDirective = /** @class */ (function () {
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