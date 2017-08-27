namespace DashCI.Widgets.CustomPostIt {

    class CustomPostItDirective implements ng.IDirective {
        
        static create(): ng.IDirectiveFactory {
            const directive: ng.IDirectiveFactory =
                () => new CustomPostItDirective();
            directive.$inject = [];
            return directive;
        }


        constructor() { }

        public restrict = "E";
        public templateUrl = "app/widgets/custom-postit/custom-postit.html";
        public replace = false;
        public controller = CustomPostItController;
        public controllerAs = "ctrl";
        /* Binding css to directives */
        public css = {
            href: "app/widgets/custom-postit/custom-postit.css",
            persist: true
        }

    }

    DashCI.app.directive("customPostIt", CustomPostItDirective.create());
}