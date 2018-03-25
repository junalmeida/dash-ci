/// <reference path="../app.ts" />

namespace DashCI.Core {

    class MainController implements ng.IController {
        public static $inject = ["$scope", "$timeout", "$q", "$mdDialog", "globalOptions", "$rootScope"];
        constructor(
            private $scope: ng.IScope,
            private $timeout: ng.ITimeoutService,
            private $q: ng.IQService,
            private $mdDialog: ng.material.IDialogService,
            public options: Models.IOptions,
            private $rootscope: ng.IRootScopeService

        ) {
            this.loadData();
            window.onresize = this.updateGridSize;

            this.$scope.$on('wg-grid-full', () => {
                this.additionPossible = false;
            });

            this.$scope.$on('wg-grid-space-available', () => {
                this.additionPossible = true;
            });

            this.$scope.$on('wg-update-position', (event: ng.IAngularEvent, widgetInfo: any) => {
                DashCI.DEBUG && console.log('A widget has changed its position!', widgetInfo);
            });

            this.$scope.$on("dashci-refresh", () => {
                this.currentPage = null;
                this.selectedPageId = this.options.pages[0].id;
                this.changePage();
                this.updateGridSize();
            });
            this.$scope.$watch(() => this.selectedPageId, () => this.changePage());
            this.$scope.$watch(() => this.options.cycle, () => this.updateCycle());
            this.$scope.$watch(() => this.editable, () => this.updateCycle());
            this.updateGridSize();


            this.initCastApi();
        }


        $onInit() { }

        public selectedPageId: string;
        public currentPage: Models.IDashBoardPage;

        private changePage() {
            if (!this.currentPage || this.selectedPageId != this.currentPage.id) {
                this.currentPage = null;
                this.$timeout(() => {
                    this.currentPage = this.options.pages.filter((item) => item.id == this.selectedPageId)[0];
                }, 500);
            }
        }


        private cycleInterval: number = null;
        private updateCycle() {
            if (this.cycleInterval)
                clearInterval(this.cycleInterval)

            if (this.options.cycle && !this.editable) {
                this.cycleInterval = setInterval(() => this.cyclePage(), this.options.cycle);
            }
        }

        private cyclePage() {
            var index = this.options.pages.indexOf(this.currentPage);
            index += 1;
            if (index >= this.options.pages.length)
                index = 0;
            this.selectedPageId = this.options.pages[index].id;
            this.changePage();
        }

        public gridWidth = 800;
        public gridHeight = 600;
        public editable = false;
        public additionPossible = true;

        public gridOptions = {
            showGrid: false,
            highlightNextPosition: false
        };

        public addWidgetDialog(ev: ng.IAngularEvent): void {
            if (this.additionPossible) {
                this.$mdDialog.show({
                    controller: AddWidgetController,
                    controllerAs: "ctrl",
                    templateUrl: 'app/core/add-widget.html',
                    parent: angular.element(document.body),
                    //targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: false,

                })
                    .then((type: Models.WidgetType) => this.createWidget(type));
            }
        }


        public globalConfigDialog(ev: ng.IAngularEvent): void {
            this.$mdDialog.show({
                controller: GlobalConfigController,
                controllerAs: "ctrl",
                templateUrl: 'app/core/global-config.html',
                parent: angular.element(document.body),
                //targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: false,
                resolve: {
                    config: () => {
                        var deferred = this.$q.defer();
                        this.$timeout(() => deferred.resolve(this.options), 1);
                        return deferred.promise;
                    }
                }

            })
                .then(() => this.saveData());
        }


        public removeWidget(widget: Models.IWidgetData): void {
            var idx = this.currentPage.widgets.indexOf(widget);
            if (idx > -1) {
                this.currentPage.widgets.splice(idx, 1);
            }
        }

        public duplicateWidget(widget: Models.IWidgetData): void {
            var idx = this.currentPage.widgets.indexOf(widget);
            if (idx > -1) {
                var newWidget = angular.copy(widget);
                newWidget.position = { left: -1, top: -1, width: 6, height: 4 };

                this.currentPage.widgets.push(newWidget);
            }
        }

        public toggleEditable(): void {
            this.editable = !this.editable;
            this.gridOptions.showGrid = this.editable;
            this.saveData();
        }

        private updateGridSize = () => {
            this.$timeout(() => {

                if (this.isGoogleCast) {
                    if (window.outerHeight) {
                        this.gridWidth = window.outerWidth;
                        this.gridHeight = window.outerHeight;
                    }
                    else {
                        this.gridWidth = document.body.clientWidth;
                        this.gridHeight = document.body.clientHeight;
                    }
                }
                else {
                    var grid = document.getElementById('grid');
                    this.gridWidth = grid.clientWidth;
                    this.gridHeight = grid.clientHeight;
                }
            }, 500);
        };

        private createWidget(type: Models.WidgetType) {
            this.currentPage.widgets.push(<Models.IWidgetData>{
                type: type,
                position: { left: -1, top: -1, width: 6, height: 4}
            });
            this.saveData();
        }

        private saveData() {
            window.localStorage['dash-ci-options'] = angular.toJson(this.options);
        }


        private defOptions: Models.IOptions = {
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

        private loadData() {

            let defOptions: Models.IOptions = <any>{ "columns": 30, "rows": 25, "tfs": null, "gitlab": { "host": "https://gitlab.com", "privateToken": "xcijrZB97fv9xQnCNsJc" }, "github": [], "circleci": [], "custom": [], "pages": [{ "id": "1", "name": "GitLab", "widgets": [{ "type": 5, "position": { "left": 1, "top": 1, "width": 30, "height": 2 }, "id": "3a49", "footer": false, "header": false, "title": "Dashboard Example", "color": "transparent", "align": "center" }, { "type": 7, "position": { "left": 12, "top": 15, "width": 12, "height": 6 }, "id": "da4f", "footer": false, "header": true, "title": "All History", "color": "transparent", "ref": "*", "poolInterval": 30000, "count": 20, "project": 13083 }, { "type": 2, "position": { "left": 1, "top": 3, "width": 11, "height": 6 }, "id": "daa2", "footer": false, "header": false, "title": "Master", "color": "deep-green", "refs": "master", "poolInterval": 10000, "project": 13083 }, { "type": 2, "position": { "left": 1, "top": 9, "width": 11, "height": 6 }, "id": "97d0", "footer": false, "header": false, "title": "Docs", "color": "deep-green", "refs": "docs/*", "poolInterval": 10000, "project": 13083 }, { "type": 3, "position": { "left": 24, "top": 3, "width": 7, "height": 6 }, "id": "a7af", "footer": false, "header": true, "title": "Front End Bugs", "color": "grey", "labels": "frontend,bug", "status": "opened", "poolInterval": 10000, "query_type": "projects", "project": 13083, "greaterThan": { "value": 0, "color": "red" }, "lowerThan": { "value": 1, "color": "green" } }, { "type": 3, "position": { "left": 24, "top": 9, "width": 7, "height": 6 }, "id": "0bda", "footer": false, "header": true, "title": "Back End Bugs", "color": "grey", "labels": "bug,backend", "status": "opened", "poolInterval": 30000, "query_type": "projects", "project": 13083, "greaterThan": { "value": 0, "color": "turkoise" }, "lowerThan": { "value": 1, "color": "green" } }, { "type": 1, "position": { "left": 24, "top": 15, "width": 7, "height": 11 }, "id": "f815", "footer": false, "header": true, "title": "Clock", "color": "green" }, { "type": 5, "position": { "left": 1, "top": 22, "width": 22, "height": 2 }, "id": "353c", "footer": false, "header": false, "title": "This is an example of board using GitLab data", "color": "transparent", "align": "left" }, { "type": 5, "position": { "left": 1, "top": 24, "width": 23, "height": 2 }, "id": "d87e", "footer": false, "header": false, "title": "Use the top toolbar to configure service tokens", "color": "transparent", "align": "left" }, { "type": 7, "position": { "left": 12, "top": 9, "width": 12, "height": 6 }, "id": "4e5e", "footer": false, "header": true, "title": "Docs History", "color": "transparent", "ref": "docs/*", "poolInterval": 30000, "count": 20, "project": 13083 }, { "type": 7, "position": { "left": 12, "top": 3, "width": 12, "height": 6 }, "id": "b713", "footer": false, "header": true, "title": "Master History", "color": "transparent", "ref": "master", "poolInterval": 30000, "count": 20, "project": 13083 }, { "type": 2, "position": { "left": 1, "top": 15, "width": 11, "height": 6 }, "id": "5786", "footer": false, "header": false, "title": "All", "color": "purple", "refs": "*", "poolInterval": 10000, "project": 13083 }] }] };
            let savedOpts = <Models.IOptions>(angular.fromJson(window.localStorage['dash-ci-options']) || defOptions);

            angular.extend(this.options, defOptions, savedOpts);
            angular.forEach(savedOpts.pages, (item) => {
                item.name = item.name || "Dash-CI";
            });
            this.currentPage = this.options.pages[0]; //preparing to support multiple pages
        }

        public isGoogleCast = false;
        public castStatus = 'cast';
        public canCast = false;
        private castSender: GoogleCastSender = null;
        private castReceiver: GoogleCastReceiver = null;
        private initCastApi() {
            if (!this.CheckGoogleCast()) {
                this.castSender = new GoogleCastSender();
                this.$scope.$watch(() => this.castSender.connected, (connected) => {
                    this.castStatus = connected ? 'cast_connected' : 'cast';
                });
                this.$scope.$watch(() => this.castSender.invalidOs, (invalidOs) => {
                    this.canCast = !invalidOs;
                });
            }
            else {
                this.castReceiver = new GoogleCastReceiver();
                this.castReceiver.receiveOptions = (options: DashCI.Models.IOptions) => {
                    var defOptions = angular.copy(this.defOptions);
                    angular.extend(this.options, defOptions, options);
                    this.$rootscope.$apply();
                    this.$rootscope.$broadcast("dashci-refresh");
                };
            }
        }

        public toggleCast() {
            if (this.castStatus == 'cast') {
                //connect
                this.castSender.sendMessage(this.options);
            }
            else 
            {
                //disconnect
                this.castSender.stopApp();
            }
        }

        public userAgent : string = null;
        private CheckGoogleCast() {
            this.userAgent = navigator.userAgent;
            var crKey = this.userAgent.match(/CrKey/i);
            var tv = this.userAgent.match(/TV/i);

            this.isGoogleCast =
                (crKey && crKey.length > 0) || (tv && tv.length > 0);
            return this.isGoogleCast;
        }

        public goFullScreen() {
            var el = document.documentElement;
            var rfs = <() => void>(el.webkitRequestFullScreen || (<any>el).requestFullScreen || (<any>el).mozRequestFullScreen);
            rfs.call(el);
        }

        public isFullScreen() {
            return (<boolean>(<any>window).fullScreen) ||
                (window.innerWidth == screen.width && window.innerHeight == screen.height);
        }
    }
    DashCI.app.controller("MainController", MainController);
}