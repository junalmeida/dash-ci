/// <reference path="../types.ts" />

namespace DashCI.Widgets {

    class TfsQueryCountDirective implements ng.IDirective {
        
        static create(): ng.IDirectiveFactory {
            const directive: ng.IDirectiveFactory =
                () => new TfsQueryCountDirective();
            directive.$inject = [];
            return directive;
        }


        constructor() { }

        public restrict = "E";
        public templateUrl = "app/widgets/tfs-query-count/tfs-query-count.html";
        public replace = false;
        public controller = TfsQueryCountController;
        public controllerAs = "ctrl";
        /* Binding css to directives */
        public css = {
            href: "app/widgets/tfs-query-count/tfs-query-count.css",
            persist: true
        }

    }

    export interface ITfsQueryCountData extends IWidgetData {
        project?: string;
        poolInterval?: number;
        queryId?: string;
    }


    class TfsQueryCountController implements ng.IController {
        public static $inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "tfsResources"];

        private data: ITfsQueryCountData;

        constructor(
            private $scope: IWidgetScope,
            private $q: ng.IQService,
            private $timeout: ng.ITimeoutService,
            private $interval: ng.IIntervalService,
            private $mdDialog: ng.material.IDialogService,
            private tfsResources: Widgets.Resources.Tfs.ITfsResource
        ) {
            this.data = this.$scope.data;
            this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            this.data.type = WidgetType.tfsQueryCount;
            this.data.footer = false;
            this.data.header = true;

            this.data.title = this.data.title || "Query";
            this.data.color = this.data.color || "green";

            //default values
            this.data.queryId = this.data.queryId || "";
            this.data.poolInterval = this.data.poolInterval || 20000;

            this.init();
        }

        private handle: ng.IPromise<any>;
        private init() {
            this.$scope.$watch(
                () => this.$scope.$element.height(),
                (height: number) => this.sizeFont(height)
            );
            this.$scope.$watch(
                () => this.data.poolInterval,
                (value: number) => this.updateInterval()
            );

            this.updateInterval();
            this.update();
        }

        private sizeFont(altura: number) {
            var p = this.$scope.$element.find("p");
            var fontSize = Math.round(altura / 1.3) + "px";
            var lineSize = Math.round((altura) - 60) + "px";
            p.css('font-size', fontSize);
            p.css('line-height', lineSize);
        }

        public config() {
            this.$mdDialog.show({
                controller: TfsQueryCountConfigController,
                controllerAs: "ctrl",
                templateUrl: 'app/widgets/tfs-query-count/config.html',
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

        public queryCount: number;
        private updateInterval() {
            if (this.handle)
                this.$interval.cancel(this.handle);
            this.handle = this.$interval(() => this.update(), this.data.poolInterval);
        }
        private update() {
            if (!this.data.project || !this.data.queryId)
                return;

            this.tfsResources.run_query({
                project: this.data.project,
                queryId: this.data.queryId
            }).$promise.then((result: Resources.Tfs.IRunQueryResult) => {
                var newCount = result.workItems.length;

                if (newCount != this.queryCount) {
                    this.queryCount = newCount;
                    var p = this.$scope.$element.find("p");

                    p.addClass('changed');
                    this.$timeout(() => p.removeClass('changed'), 1000);
                }
            })
            .catch(() => {
                this.queryCount = null;
            });

        }

    }

    DashCI.app.directive("tfsQueryCount", TfsQueryCountDirective.create());
}