/// <reference path="../types.ts" />

namespace DashCI.Widgets {

    export class GitlabIssuesConfigController implements ng.IController {
        public static $inject = ["$mdDialog", "gitlabResources", "colors", "config"];
        constructor(
            private $mdDialog: ng.material.IDialogService,
            public gitlabResources: Widgets.Resources.Gitlab.IGitlabResource,
            public colors: Widgets.ICodeDescription[],
            public vm: IGitlabIssuesData
        ) { 
            this.init();
        }

        private init() {
            this.gitlabResources.project_list().$promise
                .then((result: Widgets.Resources.Gitlab.IProject[]) => {
                    this.projects = result;
                });
        }

        public projects: Widgets.Resources.Gitlab.IProject[];



        //public cancel() {
        //    this.$mdDialog.cancel();
        //}

        public ok() {
            this.$mdDialog.hide(true);
        }
    }
    DashCI.app.controller("GitlabIssuesConfigController", GitlabIssuesConfigController);

}