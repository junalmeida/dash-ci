/// <reference path="../types.ts" />

namespace DashCI.Widgets {

    export class TfsQueryCountConfigController implements ng.IController {
        public static $inject = ["$scope", "$mdDialog", "tfsResources", "colors", "config"];
        constructor(
            private $scope: ng.IScope,
            private $mdDialog: ng.material.IDialogService,
            public tfsResources: Widgets.Resources.Tfs.ITfsResource,
            public colors: Widgets.ICodeDescription[],
            public vm: ITfsQueryCountData
        ) { 
            this.init();
        }

        private init() {
            this.tfsResources.project_list().$promise
                .then((result: Widgets.Resources.Tfs.IProjectResult) => {
                    this.projects = result.value;
                });

            this.$scope.$watch(() => this.vm.project, () => this.getQueries());
        }

        public projects: Widgets.Resources.Tfs.IProject[];
        public queries: Widgets.Resources.Tfs.IQuery[];



        public getQueries() {
            this.tfsResources.query_list({ project: this.vm.project }).$promise
                .then((result: Widgets.Resources.Tfs.IQueryResult) => {
                    this.queries = result.value;
                });

        }

        public ok() {
            this.$mdDialog.hide(true);
        }
    }
    DashCI.app.controller("TfsQueryCountConfigController", TfsQueryCountConfigController);

}