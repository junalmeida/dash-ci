namespace DashCI.Widgets.TfsQueryChart {

    class TfsQueryChartDirective implements ng.IDirective {
        
        static create(): ng.IDirectiveFactory {
            const directive: ng.IDirectiveFactory =
                () => new TfsQueryChartDirective();
            directive.$inject = [];
            return directive;
        }


        constructor() { }

        public restrict = "E";
        public templateUrl = "app/widgets/tfs-query-chart/tfs-query-chart.html";
        public replace = false;
        public controller = TfsQueryChartController;
        public controllerAs = "ctrl";
        /* Binding css to directives */
        public css = {
            href: "app/widgets/tfs-query-chart/tfs-query-chart.css",
            persist: true
        }

    }
    DashCI.app.directive("tfsQueryChart", TfsQueryChartDirective.create());
}