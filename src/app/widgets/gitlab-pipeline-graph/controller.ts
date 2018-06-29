﻿namespace DashCI.Widgets.GitlabPipelineGraph
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
        $onInit() { }
        private handle: ng.IPromise<any>;
        private finalize() {
            if (this.handle) {
                this.$timeout.cancel(this.handle);
                this.$interval.cancel(this.handle);
            }
            DashCI.DEBUG && console.log("dispose: " + this.data.id + "-" + this.data.title);
        }

        private init() {
            this.data.title = this.data.title || "Pipeline Graph";
            this.data.color = this.data.color || "blue";

            //default values
            this.data.ref = this.data.ref || "master";
            this.data.poolInterval = this.data.poolInterval || 10000;


            this.updateInterval();
        }

        private sizeFont(height: number) {
            var header_size = this.$scope.$element.find(".header").height();

            var histogram = this.$scope.$element.find(".histogram");
            histogram.height(height - 50);

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
            if (this.handle) {
                this.$timeout.cancel(this.handle);
                this.$interval.cancel(this.handle);
            }
            this.handle = this.$timeout(() => {
                this.handle = this.$interval(() => this.update(), this.data.poolInterval);
            }, DashCI.randomNess()); //this should create some randomness to avoid a lot of calls at the same moment.
            this.update();
        }

        public pipelines: Resources.Gitlab.IPipelines[];


        private update() {
            if (!this.data.project)
                return;
            var res = this.gitlabResources();
            if (!res)
                return;

            DashCI.DEBUG && console.log("start gitlab request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
            res.pipelines({
                project: this.data.project,
                ref: this.data.ref,
                count: 60 //since we don't have a filter by ref, lets take more and then filter crossing fingers
            }).$promise.then((pipelines: Resources.Gitlab.IPipelines[]) => {
                pipelines = pipelines.filter((item) => wildcardMatch(this.data.ref, item.ref)).slice(0, this.data.count).reverse();

                var promises:ng.IPromise<any>[] = [];
                pipelines.forEach(pipeline => {
                    promises.push(res.pipeline({
                        project: this.data.project,
                        pipeline_id: pipeline.id,
                    }).$promise);
                });

                this.$q.all(promises).then((pipelines: Resources.Gitlab.IPipeline[]) => {
                    var maxDuration = 1; 
                    angular.forEach(pipelines, (item) => {
                        if (maxDuration < item.duration)
                            maxDuration = item.duration;
                    });

                    var width = (100 / pipelines.length);
                    angular.forEach(pipelines, (item, i) => {
                        var height = Math.round((100 * item.duration) / maxDuration);
                        if (height < 1) height = 1;
                        item.css = {
                            height: height.toString() + "%",
                            width: width.toFixed(2) + "%",
                            left: (width * i).toFixed(2) + "%"
                        };
                    });

                    this.pipelines = pipelines;
                    this.$timeout(() => this.sizeFont(this.$scope.$element.height()), 500);
                    DashCI.DEBUG && console.log("end gitlab request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
                }).catch((reason) => {
                    this.pipelines = null;
                    console.error(reason);
                });
            }).catch((reason) => {
                this.pipelines = null;
                console.error(reason);
            });
        }

    }
}
