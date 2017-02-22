namespace DashCI.Widgets.TfsBuildGraph {

    class TfsBuildGraphDirective implements ng.IDirective {
        
        static create(): ng.IDirectiveFactory {
            const directive: ng.IDirectiveFactory =
                () => new TfsBuildGraphDirective();
            directive.$inject = [];
            return directive;
        }


        constructor() { }

        public restrict = "E";
        public templateUrl = "app/widgets/tfs-build-graph/build-graph.html";
        public replace = false;
        public controller = TfsBuildGraphController;
        public controllerAs = "ctrl";
        /* Binding css to directives */
        public css = {
            href: "app/widgets/tfs-build-graph/build-graph.css",
            persist: true
        }

    }


    export interface ITfsBuildGraphData extends Models.IWidgetData {
        project?: string;
        poolInterval?: number;
        count?: number;
        build?: number;
    }

    DashCI.app.directive("tfsBuildGraph", TfsBuildGraphDirective.create());
}