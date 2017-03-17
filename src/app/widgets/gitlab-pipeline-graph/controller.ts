namespace DashCI.Widgets.GitlabPipelineGraph
{
    export class GitlabPipelineGraphController implements ng.IController {
        public static $inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "gitlabResources"];

        private data: IGitlabPipelineGraphData;

        constructor(
            private $scope: Models.IWidgetScope,
            private $q: ng.IQService,
            private $timeout: ng.ITimeoutService,
            private $interval: ng.IIntervalService,
            private $mdDialog: ng.material.IDialogService,
            private gitlabResources: () => Resources.Gitlab.IGitlabResource
        ) {
            this.data = this.$scope.data;
            this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            this.data.type = Models.WidgetType.gitlabPipelineGraph;
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
            this.$timeout(() => this.sizeFont(this.$scope.$element.height()), 500);
        }

        private handle: ng.IPromise<any>;
        private finalize() {
            if (this.handle)
                this.$interval.cancel(this.handle);
            console.log("dispose: " + this.data.id + "-" + this.data.title);
        }

        private init() {
            this.data.title = this.data.title || "Pipeline Graph";
            this.data.color = this.data.color || "blue";

            //default values
            this.data.ref = this.data.ref || "master";
            this.data.poolInterval = this.data.poolInterval || 10000;


            this.updateInterval();
            this.update();
        }

        private sizeFont(height: number) {
            var header_size = this.$scope.$element.find(".header").height();

            var histogram = this.$scope.$element.find(".histogram");
            histogram.height(height - 60);

            var help_icon = this.$scope.$element.find(".unknown");
            var size = Math.round(height / 1) - header_size - 5;
            help_icon.css("font-size", size);
            help_icon.height(size);
        }

        public config() {
            this.$mdDialog.show({
                controller: GitlabPipelineGraphConfigController,
                controllerAs: "ctrl",
                templateUrl: 'app/widgets/gitlab-pipeline-graph/config.html',
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

        private updateInterval() {
            if (this.handle)
                this.$interval.cancel(this.handle);
            this.handle = this.$interval(() => this.update(), this.data.poolInterval);
            this.update();
        }

        public pipelines: Resources.Gitlab.IPipeline[];


        private update() {
            if (!this.data.project)
                return;
            var res = this.gitlabResources();
            if (!res)
                return;

            console.log("start request: " + this.data.id + "; " + this.data.title);
            res.recent_pipelines({
                project: this.data.project,
                ref: this.data.ref,
                count: 60 //since we don't have a filter by ref, lets take more and then filter crossing fingers
            }).$promise.then((pipelines: Resources.Gitlab.IPipeline[]) => {
                console.log("end request: " + this.data.id + "; " + this.data.title);
                pipelines = pipelines.filter((item) => wildcardMatch(this.data.ref, item.ref)).slice(0, this.data.count).reverse();
                var maxDuration = 1; 
                angular.forEach(pipelines, (item) => {
                    if (maxDuration < item.duration)
                        maxDuration = item.duration;
                });

                var width = (100 / pipelines.length);
                angular.forEach(pipelines, (item, i) => {
                    item.css = {
                        height: Math.round((100* item.duration) / maxDuration).toString() + "%",
                        width: width.toFixed(2) + "%",
                        left: (width * i).toFixed(2) + "%"
                    };
                });

                this.pipelines = pipelines;
                this.$timeout(() => this.sizeFont(this.$scope.$element.height()), 500);
            }).catch((reason) => {
                this.pipelines = null;
                console.error(reason);
            });
        }

    }
}