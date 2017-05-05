
namespace DashCI.Widgets.GithubIssues {

    export class GithubIssuesConfigController implements ng.IController {
        public static $inject = ["$mdDialog", "$scope", "globalOptions", "githubResources", "colors", "intervals", "config"];
        constructor(
            private $mdDialog: ng.material.IDialogService,
            private $scope: ng.IScope,
            private globalOptions: Models.IOptions,
            public githubResources: (username: string) => Resources.Github.IGithubResource,
            public colors: Models.ICodeDescription[],
            public intervals: Models.IValueDescription[],
            public vm: IGithubIssuesData
        ) {

            this.$scope.$watch(() => this.vm.username, () => this.listRepositories());
            this.init();
        }

        private init() {


            this.users = [];
            angular.forEach(this.globalOptions.github, (item) => this.users.push(item.username));


        }

        public repositories: Resources.Github.IRepository[];
        public users: string[];

        private listRepositories() {
            this.repositories = [];
            var res = this.githubResources(this.vm.username);
            if (!res)
                return;
            res.repository_list().$promise
                .then((result: Resources.Github.IRepository[]) => {
                    this.repositories = mx(result).orderBy(x=> x.full_name).toArray();
                })
                .catch((reason) => {
                    console.error(reason);
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