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

            window.addEventListener('touchstart', (e) => {
                firstMove = true;
            });

            window.addEventListener('touchmove', (e) => {
                if (firstMove) {
                    e.preventDefault();
                    firstMove = false;
                }
            });
        }

    }

    $(Config.supressIosRubberEffect);

    app.config(["$mdThemingProvider", "$resourceProvider", ($mdThemingProvider: angular.material.IThemingProvider, $resourceProvider: ng.resource.IResourceServiceProvider) => {
        $mdThemingProvider.theme('default')
            .dark()
            .accentPalette('orange');

        //$resourceProvider.defaults.stripTrailingSlashes = true;
    }]);
    app.run(["$rootScope", ($rootScope: ng.IRootScopeService) => {
        angular.element(window).on("resize", () => {
            $rootScope.$apply();
        });
    }]);


    export function wildcardMatch(pattern: string, source: string) {
        pattern = pattern.replace(/[\-\[\]\/\{\}\(\)\+\.\\\^\$\|]/g, "\\$&");
        pattern = pattern.replace(/\*/g, ".*");
        pattern = pattern.replace(/\?/g, ".");
        var regEx = new RegExp(pattern, "i");
        return regEx.test(source);
    }

    export function randomNess():number {
        return (Math.floor(Math.random() * 10) + 1) * 1000;
    }

    export var DEBUG = false;

    export class EnumEx {
        static getNamesAndValues<T extends number>(e: any) {
            return EnumEx.getNames(e).map(n => ({ name: n, value: e[n] as T }));
        }

        static getNames(e: any) {
            return EnumEx.getObjValues(e).filter(v => typeof v === "string") as string[];
        }

        static getValues<T extends number>(e: any) {
            return EnumEx.getObjValues(e).filter(v => typeof v === "number") as T[];
        }

        private static getObjValues(e: any): (number | string)[] {
            return Object.keys(e).map(k => e[k]);
        }
    }
}