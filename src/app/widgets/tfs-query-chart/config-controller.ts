namespace DashCI.Widgets.TfsQueryChart {

    export class TfsQueryChartConfigController implements ng.IController {
        public static $inject = ["$scope", "$mdDialog", "$q", "tfsResources", "colors", "intervals", "config"];
        constructor(
            private $scope: ng.IScope,
            private $mdDialog: ng.material.IDialogService,
            private $q: ng.IQService,
            public tfsResources: () => Resources.Tfs.ITfsResource,
            public colors: Models.ICodeDescription[],
            public intervals: Models.IValueDescription[],
            public vm: ITfsQueryChartData
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

            this.$scope.$watch(() => this.vm.project, () => {
                this.getTeams();
                this.getQueries();
            });
            this.$scope.$watch(() => this.vm.queryCount, () => this.setQueryList());
        }

        public projects: Resources.Tfs.IProject[];
        public teams: Resources.Tfs.ITeam[];
        public queries: Resources.Tfs.IQuery[];



        public getQueries() {
            var res = this.tfsResources();
            if (!res || !this.vm.project)
                return;

            var q1 = res.query_list({ project: this.vm.project, folder: "Shared Queries" }).$promise;
            var q2 = res.query_list({ project: this.vm.project, folder: "My Queries" }).$promise;
            this.$q.all([q1, q2])
                .then((result) => {
                    this.queries = [];
                    angular.forEach(result[0].children || result[0].value, (item) => this.queries.push(item));
                    angular.forEach(result[1].children || result[1].value, (item) => this.queries.push(item));
                }).catch((reason) => {
                    console.error(reason);
                    this.queries = [];
                });

        }

        public getTeams() {
            var res = this.tfsResources();
            if (!res || !this.vm.project)
                return;

            res.team_list({ project: this.vm.project })
                .$promise
                .then(result => {
                    this.teams = [];
                    angular.forEach(result.value, (item) => this.teams.push(item));
                })
                .catch((reason) => {
                    console.error(reason);
                    this.teams = [];
                });;
        }


        private setQueryList() {
            if (this.vm.queryIds.length < this.vm.queryCount) {
                for (var i = 0; i < this.vm.queryCount; i++) {
                    this.vm.queryIds.push("");
                    this.vm.queryColors.push("");
                }
            }
            else if (this.vm.queryIds.length > this.vm.queryCount)
            {
                while (this.vm.queryIds.length > this.vm.queryCount) {
                    this.vm.queryIds.pop();
                    this.vm.queryColors.pop();
                }
            }
        }


        public ok() {
            this.$mdDialog.hide(true);
        }
    }
}