namespace DashCI.Widgets.TfsBuild {

    class TfsBuildDirective implements ng.IDirective {
        
        static create(): ng.IDirectiveFactory {
            const directive: ng.IDirectiveFactory =
                () => new TfsBuildDirective();
            directive.$inject = [];
            return directive;
        }


        constructor() { }

        public restrict = "E";
        public templateUrl = "app/widgets/tfs-build/build.html";
        public replace = false;
        public controller = TfsBuildController;
        public controllerAs = "ctrl";
        /* Binding css to directives */
        public css = {
            href: "app/widgets/tfs-build/build.css",
            persist: true
        }

    }
    DashCI.app.directive("tfsBuild", TfsBuildDirective.create());
}