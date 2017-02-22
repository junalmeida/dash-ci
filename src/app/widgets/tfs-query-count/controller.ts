namespace DashCI.Widgets.TfsQueryCount {
    export class TfsQueryCountController implements ng.IController {
        public static $inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "tfsResources"];

        private data: ITfsQueryCountData;

        constructor(
            private $scope: Models.IWidgetScope,
            private $q: ng.IQService,
            private $timeout: ng.ITimeoutService,
            private $interval: ng.IIntervalService,
            private $mdDialog: ng.material.IDialogService,
            private tfsResources: () => Resources.Tfs.ITfsResource
        ) {
            this.data = this.$scope.data;
            this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            this.data.type = Models.WidgetType.tfsQueryCount;
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

            var img = this.$scope.$element.find(".avatar");
            var size = Math.round(altura - 32);
            img.width(size);
            img.height(size);
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
            var res = this.tfsResources();
            if (!res)
                return;

            res.run_query({
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
                .catch((reason) => {
                    this.queryCount = null;
                    console.error(reason);
                });

        }

    }

}