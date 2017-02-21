
namespace DashCI.Widgets.Label {

    class LabelDirective implements ng.IDirective {
        
        static create(): ng.IDirectiveFactory {
            const directive: ng.IDirectiveFactory =
                () => new LabelDirective();
            directive.$inject = [];
            return directive;
        }


        constructor() { }

        public restrict = "E";
        public templateUrl = "app/widgets/label/label.html";
        public replace = false;
        public controller = LabelController;
        public controllerAs = "ctrl";
        /* Binding css to directives */
        public css = {
            href: "app/widgets/label/label.css",
            persist: true
        }
    }
    DashCI.app.directive("labelTitle", LabelDirective.create());
}