﻿/// <reference path="../types.ts" />

namespace DashCI.Widgets {

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


    class LabelController implements ng.IController {
        public static $inject = ["$scope", "$timeout", "$mdDialog", "$q"];

        public data:IWidgetData;

        constructor(
            private $scope: IWidgetScope,
            private $timeout: ng.ITimeoutService,
            private $mdDialog: ng.material.IDialogService,
            private $q: ng.IQService
        ) {
            this.data = this.$scope.data;
            this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            this.data.type = WidgetType.labelTitle;

            this.data.title = this.data.title || "Label";
            this.data.footer = false;
            this.data.header = false;
            this.data.color = this.data.color || "green";

            this.init();
        }


        private init() {
            this.$scope.$watch(
                () => this.$scope.$element.height(),
                (height: number) => this.sizeFont(height)
            );
        }

        public config() {
            this.$mdDialog.show({
                controller: LabelConfigController,
                controllerAs: "ctrl",
                templateUrl: 'app/widgets/label/config.html',
                parent: angular.element(document.body),
                //targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: false,
                resolve: {
                    config: () => {
                        var deferred = this.$q.defer();
                        this.$timeout(() => deferred.resolve(this.data), 1);
                        return deferred.promise;
                    }
                }
            });
            //.then((ok) => this.createWidget(type));

        }


        private sizeFont(height: number) {
            var div = this.$scope.$element.find("div");
            var fontSize = Math.round(height / 1.6) + "px";
            var lineSize = Math.round((height) - 8) + "px";
            div.css('font-size', fontSize);
            div.css('line-height', lineSize);
        }


    }

    DashCI.app.directive("labelTitle", LabelDirective.create());
}