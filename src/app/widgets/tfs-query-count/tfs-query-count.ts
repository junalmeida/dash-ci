namespace DashCI.Widgets.TfsQueryCount {

    class TfsQueryCountDirective implements ng.IDirective {
        
        static create(): ng.IDirectiveFactory {
            const directive: ng.IDirectiveFactory =
                () => new TfsQueryCountDirective();
            directive.$inject = [];
            return directive;
        }


        constructor() { }

        public restrict = "E";
        public templateUrl = "app/widgets/tfs-query-count/tfs-query-count.html";
        public replace = false;
        public controller = TfsQueryCountController;
        public controllerAs = "ctrl";
        /* Binding css to directives */
        public css = {
            href: "app/widgets/tfs-query-count/tfs-query-count.css",
            persist: true
        }

    }

    DashCI.app.directive("tfsQueryCount", TfsQueryCountDirective.create());
}