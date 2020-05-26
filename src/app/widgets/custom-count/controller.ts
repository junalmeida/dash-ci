namespace DashCI.Widgets.CustomCount {
    export interface ICustomCountData extends Models.IWidgetData {
        label?: string;
        route?: string;
        params?: string;
        poolInterval?: number;
        lowerThan?: {
            value: number;
            color: string;
        };
        greaterThan?: {
            value: number;
            color: string;
        };
    }


    export class CustomCountController implements ng.IController {
        public static $inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "customResources"];

        private data: ICustomCountData;

        constructor(
            private $scope: Models.IWidgetScope,
            private $q: ng.IQService,
            private $timeout: ng.ITimeoutService,
            private $interval: ng.IIntervalService,
            private $mdDialog: ng.material.IDialogService,
            private customResources: (label: string) => Resources.Custom.ICustomResource
        ) {
            this.data = this.$scope.data;
            this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            this.data.type = Models.WidgetType.customCount;
            this.data.footer = false;
            this.data.header = true;

            this.$scope.$watch(
                () => this.$scope.$element.height(),
                (height: number) => this.sizeFont(height)
            );
            this.$scope.$watch(
                () => this.data.poolInterval,
                (value: number) => this.updateInterval()
            );
            this.$scope.$on("$destroy", () => this.finalize());

            this.init();
        }
        $onInit() { }
        private handle: ng.IPromise<any>;
        private finalize() {
            if (this.handle) {
                try { this.$timeout.cancel(this.handle); } catch { }
                try { this.$interval.cancel(this.handle); } catch { }
            }
            DashCI.DEBUG && console.log("dispose: " + this.data.id + "-" + this.data.title);
        }


        private init() {
            if (typeof (this.data.title) == "undefined")
                this.data.title = this.data.title || "Count";
            this.data.color = this.data.color || "grey";

            //default values
            this.data.poolInterval = this.data.poolInterval || 10000;

            this.updateInterval();
        }

        private sizeFont(height: number) {
            var p = this.$scope.$element.find("p");
            var fontSize = Math.round(height / 1.3) + "px";
            var lineSize = Math.round((height) - 60) + "px";
            p.css('font-size', fontSize);
            p.css('line-height', lineSize);
        }

        public config() {
            this.$mdDialog.show({
                controller: CustomCountConfigController,
                controllerAs: "ctrl",
                templateUrl: 'app/widgets/custom-count/config.html',
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

        public count: number = null;
        public colorClass: string;
        private updateInterval() {
            if (this.handle) {
                try { this.$timeout.cancel(this.handle); } catch { }
                try { this.$interval.cancel(this.handle); } catch { }
            }
            this.handle = this.$timeout(() => {
                this.handle = this.$interval(() => this.update(), this.data.poolInterval);
            }, DashCI.randomNess()); //this should create some randomness to avoid a lot of calls at the same moment.
            this.update();
        }
        private update() {
            if (!this.data.label && !this.data.route)
                return;
            var res = this.customResources(this.data.label);
            if (!res)
                return;

            DashCI.DEBUG && console.log("start custom request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us") + "; " + this.data.label);
            res.execute_count({
                route: this.data.route,
                params: this.data.params
            }).$promise.then((newCount: Resources.Custom.ICount) => {
                //var newCount = Math.round(Math.random() * 100);

                if (newCount.count != this.count) {
                    this.count = newCount.count;
                    var p = this.$scope.$element.find("p");

                    p.addClass('changed');
                    this.$timeout(() => p.removeClass('changed'), 1000);
                }

                if (this.data.lowerThan && !isNaN(this.data.lowerThan.value) && this.data.lowerThan.color) {
                    if (this.count < this.data.lowerThan.value)
                        this.colorClass = this.data.lowerThan.color;
                }
                if (this.data.greaterThan && !isNaN(this.data.greaterThan.value) && this.data.greaterThan.color) {
                    if (this.count > this.data.greaterThan.value)
                        this.colorClass = this.data.greaterThan.color;
                }

                DashCI.DEBUG && console.log("end custom request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us") + "; " + this.data.label);
            })
            .catch((reason) => {
                this.count = null;
                console.error(reason);
            });
            this.$timeout(() => this.sizeFont(this.$scope.$element.height()), 500);
        }

    }

}