namespace DashCI.Widgets.GitlabIssues {

    export interface IGitlabIssuesData extends Models.IWidgetData {
        query_type?: string;
        project?: number;
        group?: number;
        poolInterval?: number;
        labels?: string;
        status?: string;
    }

    class GitlabIssuesDirective implements ng.IDirective {
        
        static create(): ng.IDirectiveFactory {
            const directive: ng.IDirectiveFactory =
                () => new GitlabIssuesDirective();
            directive.$inject = [];
            return directive;
        }


        constructor() { }

        public restrict = "E";
        public templateUrl = "app/widgets/gitlab-issues/issues.html";
        public replace = false;
        public controller = GitlabIssuesController;
        public controllerAs = "ctrl";
        /* Binding css to directives */
        public css = {
            href: "app/widgets/gitlab-issues/issues.css",
            persist: true
        }

    }


    DashCI.app.directive("gitlabIssues", GitlabIssuesDirective.create());
}