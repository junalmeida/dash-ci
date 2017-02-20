namespace DashCI.Widgets.GitlabIssues {

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

    export interface IGitlabIssuesData extends Models.IWidgetData {
        project?: number;
        poolInterval?: number;
        labels?: string;
        status?: string;
    }

    DashCI.app.directive("gitlabIssues", GitlabIssuesDirective.create());
}