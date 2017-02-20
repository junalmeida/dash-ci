/// <reference path="../app.ts" />

namespace DashCI.Controllers {

    class MainController implements ng.IController {
        public static $inject = ["$scope", "$timeout", "$mdDialog"];
        constructor(
            private $scope: ng.IScope,
            private $timeout: ng.ITimeoutService,
            private $mdDialog: ng.material.IDialogService
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


        public currentPage: Widgets.IDashBoardPage;
        public options: Widgets.IOptions = {
            columns: 30,
            rows: 20
        };

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
                    fullscreen: false
                })
                    .then((type: Widgets.WidgetType) => this.createWidget(type));
            }
        }

        public removeWidget(widget: Widgets.IWidgetData): void {
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

        private createWidget(type: Widgets.WidgetType) {
            this.currentPage.widgets.push(<Widgets.IWidgetData>{
                type: type,
                position: { left: -1, top: -1, width: 6, height: 4}
            });
            this.saveData();
        }

        private saveData() {
            window.localStorage['dash-ci'] = angular.toJson([this.currentPage]);
        }

        private loadData() {
            var defPage = <Widgets.IDashBoardPage>{
                id: "1",
                widgets: []
            };

            var lista = <Widgets.IDashBoardPage[]> (angular.fromJson(window.localStorage['dash-ci']) || [defPage]);

            this.currentPage = lista[0];
        }
    }
    DashCI.app.controller("MainController", MainController);
}