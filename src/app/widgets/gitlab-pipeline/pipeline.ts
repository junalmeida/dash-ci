namespace DashCI.Widgets.GitlabPipeline {

    class GitlabPipelineDirective implements ng.IDirective {
        
        static create(): ng.IDirectiveFactory {
            const directive: ng.IDirectiveFactory =
                () => new GitlabPipelineDirective();
            directive.$inject = [];
            return directive;
        }


        constructor() { }

        public restrict = "E";
        public templateUrl = "app/widgets/gitlab-pipeline/pipeline.html";
        public replace = false;
        public controller = GitlabPipelineController;
        public controllerAs = "ctrl";
        /* Binding css to directives */
        public css = {
            href: "app/widgets/gitlab-pipeline/pipeline.css",
            persist: true
        }

    }


    export interface IGitlabPipelineData extends Models.IWidgetData {
        project?: number;
        poolInterval?: number;
        refs?: string;
    }

    DashCI.app.directive("gitlabPipeline", GitlabPipelineDirective.create());
}