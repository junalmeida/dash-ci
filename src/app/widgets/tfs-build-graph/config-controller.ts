
namespace DashCI.Widgets.TfsBuildGraph {

    export class TfsBuildGraphConfigController implements ng.IController {
        public static $inject = ["$scope", "$mdDialog", "tfsResources", "colors", "intervals", "config"];
        constructor(
            private $scope: ng.IScope,
            private $mdDialog: ng.material.IDialogService,
            public tfsResources: () => Resources.Tfs.ITfsResource,
            public colors: Models.ICodeDescription[],
            public intervals: Models.IValueDescription[],
            public vm: ITfsBuildGraphData
        ) { 
            this.init();
        }

        private init() {
            var res = this.tfsResources();
            if (!res)
                return;
            res.project_list().$promise
                .then((result: Resources.Tfs.IProjectResult) => {
                    this.projects = mx(result.value).orderBy(x => x.name).toArray();
                })
                .catch((reason) => {
                    console.error(reason);
                    this.projects = [];
                });
            this.$scope.$watch(() => this.vm.project, () => this.getBuilds());
        }

        public projects: Resources.Tfs.IProject[];
        public builds: Resources.Tfs.IBuildDefinition[];


        public getBuilds() {
            var res = this.tfsResources();
            if (!res || !this.vm.project)
                return;
            res.build_definition_list({ project: this.vm.project, name: "*" }).$promise
                .then((result: Resources.Tfs.IBuildDefinitionResult) => {
                    this.builds = mx(result.value).orderBy(x => x.name).toArray();
                })
                .catch((reason: any) => {
                    console.error(reason);
                    this.builds = [];
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