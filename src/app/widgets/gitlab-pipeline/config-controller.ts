
namespace DashCI.Widgets.GitlabPipeline {

    export class GitlabPipelineConfigController implements ng.IController {
        public static $inject = ["$mdDialog", "gitlabResources", "colors", "intervals", "config"];
        constructor(
            private $mdDialog: ng.material.IDialogService,
            public gitlabResources: () => Resources.Gitlab.IGitlabResource,
            public colors: Models.ICodeDescription[],
            public intervals: Models.IValueDescription[],
            public vm: IGitlabPipelineData
        ) { 
            this.init();
        }
        $onInit() { }
        public initialized = false;

        private init() {
            var res = this.gitlabResources();
            if (!res) {
                this.projects = null;
                this.initialized = true;
                return;
            }

            res.project_list().$promise
                .then((result: Resources.Gitlab.IProject[]) => {
                    this.projects = mx(result).orderBy(x=> x.name_with_namespace).toArray();
                    this.initialized = true;
                })
                .catch((reason) => {
                    console.error(reason);
                    this.projects = [];
                    this.initialized = true;
                });
        }

        public projects: Resources.Gitlab.IProject[];



        //public cancel() {
        //    this.$mdDialog.cancel();
        //}

        public ok() {
            this.$mdDialog.hide(true);
        }
    }
}