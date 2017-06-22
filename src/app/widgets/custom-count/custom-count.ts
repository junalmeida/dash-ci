namespace DashCI.Widgets.CustomCount {

    class CustomCountDirective implements ng.IDirective {
        
        static create(): ng.IDirectiveFactory {
            const directive: ng.IDirectiveFactory =
                () => new CustomCountDirective();
            directive.$inject = [];
            return directive;
        }


        constructor() { }

        public restrict = "E";
        public templateUrl = "app/widgets/custom-count/custom-count.html";
        public replace = false;
        public controller = CustomCountController;
        public controllerAs = "ctrl";
        /* Binding css to directives */
        public css = {
            href: "app/widgets/custom-count/custom-count.css",
            persist: true
        }

    }

    DashCI.app.directive("customCount", CustomCountDirective.create());
}