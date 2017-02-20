/// <reference path="../types.ts" />

namespace DashCI.Widgets {

    export class TfsBuildConfigController implements ng.IController {
        public static $inject = ["$scope", "$mdDialog", "tfsResources", "colors", "config"];
        constructor(
            private $scope: ng.IScope,
            private $mdDialog: ng.material.IDialogService,
            public tfsResources: Widgets.Resources.Tfs.ITfsResource,
            public colors: Widgets.ICodeDescription[],
            public vm: ITfsBuildData
        ) { 
            this.init();
        }

        private init() {
            this.tfsResources.project_list().$promise
                .then((result: Widgets.Resources.Tfs.IProjectResult) => {
                    this.projects = result.value;
                });
            this.$scope.$watch(() => this.vm.project, () => this.getBuilds());
        }

        public projects: Widgets.Resources.Tfs.IProject[];
        public builds: Widgets.Resources.Tfs.IBuildDefinition[];


        public getBuilds() {
            this.tfsResources.build_definition_list({ project: this.vm.project }).$promise
                .then((result: Widgets.Resources.Tfs.IBuildDefinitionResult) => {
                    this.builds = result.value;
                });

        }

        //public cancel() {
        //    this.$mdDialog.cancel();
        //}

        public ok() {
            this.$mdDialog.hide(true);
        }
    }
}