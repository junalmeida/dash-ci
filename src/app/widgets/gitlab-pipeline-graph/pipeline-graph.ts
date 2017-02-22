namespace DashCI.Widgets.GitlabPipelineGraph {

    class GitlabPipelineGraphDirective implements ng.IDirective {
        
        static create(): ng.IDirectiveFactory {
            const directive: ng.IDirectiveFactory =
                () => new GitlabPipelineGraphDirective();
            directive.$inject = [];
            return directive;
        }


        constructor() { }

        public restrict = "E";
        public templateUrl = "app/widgets/gitlab-pipeline-graph/pipeline-graph.html";
        public replace = false;
        public controller = GitlabPipelineGraphController;
        public controllerAs = "ctrl";
        /* Binding css to directives */
        public css = {
            href: "app/widgets/gitlab-pipeline-graph/pipeline-graph.css",
            persist: true
        }

    }


    export interface IGitlabPipelineGraphData extends Models.IWidgetData {
        project?: number;
        poolInterval?: number;
        count?: number;
        ref?: string;
    }

    DashCI.app.directive("gitlabPipelineGraph", GitlabPipelineGraphDirective.create());
}