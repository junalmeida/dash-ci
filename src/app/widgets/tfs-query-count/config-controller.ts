namespace DashCI.Widgets.TfsQueryCount {

    export class TfsQueryCountConfigController implements ng.IController {
        public static $inject = ["$scope", "$mdDialog", "tfsResources", "colors", "config"];
        constructor(
            private $scope: ng.IScope,
            private $mdDialog: ng.material.IDialogService,
            public tfsResources: () => Resources.Tfs.ITfsResource,
            public colors: Models.ICodeDescription[],
            public vm: ITfsQueryCountData
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
                }).catch((reason) => console.error(reason));;

            this.$scope.$watch(() => this.vm.project, () => this.getQueries());
        }

        public projects: Resources.Tfs.IProject[];
        public queries: Resources.Tfs.IQuery[];



        public getQueries() {
            var res = this.tfsResources();
            if (!res)
                return;
            res.query_list({ project: this.vm.project }).$promise
                .then((result: Resources.Tfs.IQueryResult) => {
                    this.queries = result.value;
                }).catch((reason) => console.error(reason));

        }

        public ok() {
            this.$mdDialog.hide(true);
        }
    }
}