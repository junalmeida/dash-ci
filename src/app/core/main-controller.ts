/// <reference path="../app.ts" />

namespace DashCI.Core {

    class MainController implements ng.IController {
        public static $inject = ["$scope", "$timeout", "$q", "$mdDialog", "globalOptions"];
        constructor(
            private $scope: ng.IScope,
            private $timeout: ng.ITimeoutService,
            private $q: ng.IQService,
            private $mdDialog: ng.material.IDialogService,
            public options: Models.IOptions
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
                console.log('A widget has changed its position!', widgetInfo);
            });
            this.updateGridSize();

        }


        public currentPage: Models.IDashBoardPage;

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

        public toggleEditable(): void {
            this.editable = !this.editable;
            this.gridOptions.showGrid = this.editable;
            this.saveData();
        }

        private updateGridSize = () => {
            this.$timeout(() => {
                var grid = document.getElementById('grid');
                this.gridWidth = grid.clientWidth;
                this.gridHeight = grid.clientHeight;
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

        private loadData() {
            var defOptions:Models.IOptions = {
                columns: 30,
                rows: 20,
                tfs: null,
                gitlab: null,
                pages: [{
                    id: "1",
                    widgets: []
                }]
            }
            var savedOpts = <Models.IOptions>(angular.fromJson(window.localStorage['dash-ci-options']) || defOptions);
            angular.extend(this.options, defOptions, savedOpts);

            this.currentPage = this.options.pages[0]; //preparing to support multiple pages
        }
    }
    DashCI.app.controller("MainController", MainController);
}