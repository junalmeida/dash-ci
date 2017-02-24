namespace DashCI.Widgets.TfsRelease {

    class TfsReleaseDirective implements ng.IDirective {
        
        static create(): ng.IDirectiveFactory {
            const directive: ng.IDirectiveFactory =
                () => new TfsReleaseDirective();
            directive.$inject = [];
            return directive;
        }


        constructor() { }

        public restrict = "E";
        public templateUrl = "app/widgets/tfs-release/release.html";
        public replace = false;
        public controller = TfsReleaseController;
        public controllerAs = "ctrl";
        /* Binding css to directives */
        public css = {
            href: "app/widgets/tfs-release/release.css",
            persist: true
        }

    }
    DashCI.app.directive("tfsRelease", TfsReleaseDirective.create());
}