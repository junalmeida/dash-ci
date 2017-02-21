
namespace DashCI.Widgets.GitlabIssues {

    export class GitlabIssuesConfigController implements ng.IController {
        public static $inject = ["$mdDialog", "gitlabResources", "colors", "intervals", "config"];
        constructor(
            private $mdDialog: ng.material.IDialogService,
            public gitlabResources: () => Resources.Gitlab.IGitlabResource,
            public colors: Models.ICodeDescription[],
            public intervals: Models.IValueDescription[],
            public vm: IGitlabIssuesData
        ) { 
            this.init();
        }

        private init() {
            var res = this.gitlabResources();
            if (!res)
                return;

            res.project_list().$promise
                .then((result: Resources.Gitlab.IProject[]) => {
                    this.projects = result;
                })
                .catch((reason) => {
                    console.error(reason);
                    this.projects = [];
                });

            res.group_list().$promise
                .then((result) => {
                    this.groups = result;
                })
                .catch((reason) => {
                    console.error(reason);
                    this.groups = [];
                });
        }

        public projects: Resources.Gitlab.IProject[];
        public groups: Resources.Gitlab.IGroup[];



        //public cancel() {
        //    this.$mdDialog.cancel();
        //}

        public ok() {
            this.$mdDialog.hide(true);
        }
    }
}