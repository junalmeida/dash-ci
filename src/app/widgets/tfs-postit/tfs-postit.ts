namespace DashCI.Widgets.TfsPostIt {

    class TfsPostItDirective implements ng.IDirective {
        
        static create(): ng.IDirectiveFactory {
            const directive: ng.IDirectiveFactory =
                () => new TfsPostItDirective();
            directive.$inject = [];
            return directive;
        }


        constructor() { }

        public restrict = "E";
        public templateUrl = "app/widgets/tfs-postit/tfs-postit.html";
        public replace = false;
        public controller = TfsPostItController;
        public controllerAs = "ctrl";
        /* Binding css to directives */
        public css = {
            href: "app/widgets/tfs-postit/tfs-postit.css",
            persist: true
        }

    }

    DashCI.app.directive("tfsPostIt", TfsPostItDirective.create());
}