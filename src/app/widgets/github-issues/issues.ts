namespace DashCI.Widgets.GithubIssues {

    class GithubIssuesDirective implements ng.IDirective {
        
        static create(): ng.IDirectiveFactory {
            const directive: ng.IDirectiveFactory =
                () => new GithubIssuesDirective();
            directive.$inject = [];
            return directive;
        }


        constructor() { }

        public restrict = "E";
        public templateUrl = "app/widgets/github-issues/issues.html";
        public replace = false;
        public controller = GithubIssuesController;
        public controllerAs = "ctrl";
        /* Binding css to directives */
        public css = {
            href: "app/widgets/github-issues/issues.css",
            persist: true
        }

    }


    DashCI.app.directive("githubIssues", GithubIssuesDirective.create());
}