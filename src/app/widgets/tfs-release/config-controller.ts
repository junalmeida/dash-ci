
namespace DashCI.Widgets.TfsRelease {

    export class TfsReleaseConfigController implements ng.IController {
        public static $inject = ["$scope", "$mdDialog", "tfsResources", "colors", "intervals", "config"];
        constructor(
            private $scope: ng.IScope,
            private $mdDialog: ng.material.IDialogService,
            public tfsResources: () => Resources.Tfs.ITfsResource,
            public colors: Models.ICodeDescription[],
            public intervals: Models.IValueDescription[],
            public vm: ITfsReleaseData
        ) { 
            this.init();
        }

        private init() {
            var res = this.tfsResources();
            if (!res)
                return;
            res.project_list().$promise
                .then((result: Resources.Tfs.IProjectResult) => {
                    this.projects = result.value;
                })
                .catch((reason) => {
                    console.error(reason);
                    this.projects = [];
                });
            this.$scope.$watch(() => this.vm.project, () => this.getReleaseDefs());
        }

        public projects: Resources.Tfs.IProject[];
        public releases: Resources.Tfs.IReleaseDefinition[];


        public getReleaseDefs() {
            var res = this.tfsResources();
            if (!res || !this.vm.project)
                return;
            res.release_definition_list({ project: this.vm.project }).$promise
                .then((result: Resources.Tfs.IReleaseDefinitionResult) => {
                    this.releases = result.value;
                })
                .catch((reason) => {
                    console.error(reason);
                    this.releases = [];
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