namespace DashCI.Widgets.TfsQueryChart {

    export interface ITfsQueryChartData extends Models.IWidgetData {
        project?: string;
        poolInterval?: number;
        queryCount?: number;
        queryIds?: string[];
        queryColors?: string[];
    }

    export class TfsQueryChartController implements ng.IController {
        public static $inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "tfsResources"];

        private data: ITfsQueryChartData;

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
            this.data.type = Models.WidgetType.tfsQueryChart;
            this.data.footer = false;
            this.data.header = true;

            this.$scope.$watch(
                () => this.$scope.$element.height(),
                (height: number) => this.sizeFont(this.$scope.$element.width(), height)
            );
            this.$scope.$watch(
                () => this.$scope.$element.width(),
                (width: number) => this.sizeFont(width, this.$scope.$element.height())
            );
            this.$scope.$watch(
                () => this.data.poolInterval,
                (value: number) => this.updateInterval()
            );
            this.$scope.$on("$destroy", () => this.finalize());

            this.init();
        }

        private handle: ng.IPromise<any>;
        private finalize() {
            if (this.handle)
                this.$interval.cancel(this.handle);
            console.log("dispose: " + this.data.id + "-" + this.data.title);
        }

        private init() {
            this.data.title = this.data.title || "Chart";
            this.data.color = this.data.color || "grey";

            //default values
            this.data.queryCount = this.data.queryCount || 2;
            this.data.queryIds = this.data.queryIds || ["", ""];
            this.data.queryColors = this.data.queryColors || ["", ""];
            this.data.poolInterval = this.data.poolInterval || 20000;
            this.updateInterval();
            this.update();
        }

        private sizeFont(width: number, height: number) {
            this.width = width;
            this.height = height;

            this.fontSize = Math.round(height / 1.3);
            this.lineSize = Math.round((height) - 60);
        }

        public config() {
            this.$mdDialog.show({
                controller: TfsQueryChartConfigController,
                controllerAs: "ctrl",
                templateUrl: 'app/widgets/tfs-query-chart/config.html',
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

        public queryValues: number[];
        public width: number = 50;
        public height: number = 50;
        public fontSize: number = 12;
        public lineSize: number = 12;

        private updateInterval() {
            if (this.handle)
                this.$interval.cancel(this.handle);
            this.handle = this.$interval(() => this.update(), this.data.poolInterval);
        }

        private update() {
            if (!this.data.project || !this.data.queryIds || this.data.queryIds.length == 0)
                return;
            var res = this.tfsResources();
            if (!res)
                return;


            var queries:ng.IPromise<DashCI.Resources.Tfs.IRunQueryResult>[] = [];
            for (var q in this.data.queryIds) {
                var query = this.data.queryIds[q];
                if (query)
                    queries.push(res.run_query({
                        project: this.data.project,
                        queryId: query
                    }).$promise);
            }
            if (queries.length == 0)
                return;

            console.log("tfs query: " + this.data.title);
            this.$q.all(queries)
                .then(res => this.drawGraph(res))
                .catch((reason) => {
                    this.queryValues = null;
                    console.error(reason);
                });
            this.$timeout(() => this.sizeFont(this.$scope.$element.width(), this.$scope.$element.height()), 500);
        }


        private drawGraph(results: Resources.Tfs.IRunQueryResult[]) {
            var data: number[] = [];
            var labels: string[] = [];
            var colors: string[] = [];

            for (var i = 0; i < results.length; i++) {
                data.push(results[i].workItems.length);
                labels.push(results[i].workItems.length.toString());
                colors.push(this.data.queryColors[i]);
            }

            //todo: draw segments at canvas.
        }
    }

}