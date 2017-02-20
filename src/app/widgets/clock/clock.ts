namespace DashCI.Widgets.Clock {

    class ClockDirective implements ng.IDirective {
        
        static create(): ng.IDirectiveFactory {
            const directive: ng.IDirectiveFactory =
                () => new ClockDirective();
            directive.$inject = [];
            return directive;
        }


        constructor() { }

        public restrict = "E";
        public templateUrl = "app/widgets/clock/clock.html";
        public replace = false;
        public controller = ClockController;
        public controllerAs = "ctrl";
        /* Binding css to directives */
        public css = {
            href: "app/widgets/clock/clock.css",
            persist: true
        }
    }
    DashCI.app.directive("clock", ClockDirective.create());
}