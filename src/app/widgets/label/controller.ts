namespace DashCI.Widgets.Label
{
    export interface ILabelWidgetData extends Models.IWidgetData {
        align?: string;
    }

    export class LabelController implements ng.IController {
        public static $inject = ["$scope", "$timeout", "$mdDialog", "$q"];

        public data: ILabelWidgetData;

        constructor(
            private $scope: Models.IWidgetScope,
            private $timeout: ng.ITimeoutService,
            private $mdDialog: ng.material.IDialogService,
            private $q: ng.IQService
        ) {
            this.data = this.$scope.data;
            this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            this.data.type = Models.WidgetType.labelTitle;
            this.data.footer = false;
            this.data.header = false;
            this.$scope.$watch(
                () => this.$scope.$element.height(),
                (height: number) => this.sizeFont(height)
            );

            this.init();
        }


        private init() {

            this.data.title = this.data.title || "Label";
            this.data.color = this.data.color || "transparent";
            this.data.align = this.data.align || "left";
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
}