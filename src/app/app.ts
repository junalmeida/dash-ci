namespace DashCI {
    export var app = angular.module("dashboard", [
        "widgetGrid",
        "ngMaterial",
        "ngResource",
        "angularCSS"
    ]);

    class Config {
        // suppress iOS' rubber band effect 
        // c.f.http://stackoverflow.com/a/26853900 

        public static supressIosRubberEffect() {
            var firstMove: boolean = false;

            window.addEventListener('touchstart', function (e) {
                firstMove = true;
            });

            window.addEventListener('touchmove', function (e) {
                if (firstMove) {
                    e.preventDefault();
                    firstMove = false;
                }
            });
        }

    }

    $(Config.supressIosRubberEffect);

    app.config(["$mdThemingProvider", ($mdThemingProvider: angular.material.IThemingProvider) => {
        $mdThemingProvider.theme('default')
            .dark()
            .accentPalette('orange');
    }]);
    app.run(["$rootScope", ($rootScope: ng.IRootScopeService) => {
        angular.element(window).on("resize", () => {
            $rootScope.$apply();
        });
    }]);
}