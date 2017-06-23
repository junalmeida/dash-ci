namespace DashCI.Widgets.GitlabPipeline
{
    export interface IGitlabPipelineData extends Models.IWidgetData {
        project?: number;
        poolInterval?: number;
        refs?: string;
    }

    export class GitlabPipelineController implements ng.IController {
        public static $inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "gitlabResources"];

        private data: IGitlabPipelineData;

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
            this.data.type = Models.WidgetType.gitlabPipeline;
            this.data.footer = false;
            this.data.header = false;

            this.$scope.$watch(
                () => this.$scope.$element.height(),
                (height: number) => this.sizeBy(this.$scope.$element.width(), height)
            );
            this.$scope.$watch(
                () => this.$scope.$element.width(),
                (width: number) => this.sizeBy(width, this.$scope.$element.height())
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
            DashCI.DEBUG && console.log("dispose: " + this.data.id + "-" + this.data.title);
        }

        private init() {
            this.data.title = this.data.title || "Pipeline";
            this.data.color = this.data.color || "green";

            //default values
            this.data.refs = this.data.refs || "master";
            this.data.poolInterval = this.data.poolInterval || 10000;


            this.updateInterval();
        }

        private sizeBy(width: number, height: number) {
            this.hideDetails = (width < height * 1.7);

            var icon = this.$scope.$element.find(".play-status md-icon");
            var fontSize = (Math.round(height / 1) - (this.hideDetails ? 30 : 0)) + "px";
            //var lineSize = Math.round((altura) - 60) + "px";
            icon.css('font-size', fontSize);
            icon.parent().width(Math.round(height / 1));
            //p.css('line-height', lineSize);

            var header = this.$scope.$element.find(".header");
            fontSize = Math.round(height / 1) + "px";
            header.css('text-indent', fontSize);


            //var title = this.$scope.$element.find("h2");
            //fontSize = Math.round(altura / 6) + "px";
            //title.css('font-size', fontSize);

            var txt = this.$scope.$element.find("h4");
            fontSize = Math.round(height / 7) + "px";
            txt.css('font-size', fontSize);

            var img = this.$scope.$element.find(".avatar");
            var size = Math.round(height - 32);
            img.width(size);
            img.height(size);

            this.hideAvatar = width < 390;
        }

        public config() {
            this.$mdDialog.show({
                controller: GitlabPipelineConfigController,
                controllerAs: "ctrl",
                templateUrl: 'app/widgets/gitlab-pipeline/config.html',
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
            this.handle = this.$timeout(() => {
                this.handle = this.$interval(() => this.update(), this.data.poolInterval);
            }, DashCI.randomNess()); //this should create some randomness to avoid a lot of calls at the same moment.
            this.update();
        }

        public icon = "help";
        public latest: Resources.Gitlab.IPipeline;
        public hideDetails: boolean;
        public hideAvatar: boolean;

        private update() {
            if (!this.data.project)
                return;
            var res = this.gitlabResources();
            if (!res)
                return;

            DashCI.DEBUG && console.log("start gitlab request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
            res.latest_pipeline({
                project: this.data.project,
                ref: this.data.refs
            }).$promise.then((pipelines: Resources.Gitlab.IPipeline[]) => {
                var new_pipeline: Resources.Gitlab.IPipeline = null;
                var refList = this.data.refs.split(",");
                pipelines = pipelines.filter((i: any) => refList.filter((r) => wildcardMatch(r, i.ref)).length > 0 );

                if (pipelines.length >= 1)
                    new_pipeline = pipelines[0];

                this.latest = new_pipeline;
                if (this.latest && this.latest.status) {
                    switch (this.latest.status) {
                        case "pending":
                            this.icon = "pause_circle_filled"; break;
                        case "running":
                            this.icon = "play_circle_filled"; break;
                        case "canceled":
                            this.icon = "remove_circle"; break;
                        case "success":
                            this.icon = "check"; break;
                        case "failed":
                            this.icon = "cancel"; break;
                        case "default":
                            this.icon = "help"; break;
                    }

                }
                else
                    this.icon = "help";
                //var p = this.$scope.$element.find("p");

                //p.addClass('changed');
                //this.$timeout(() => p.removeClass('changed'), 1000);
                this.resizeWidget();
                DashCI.DEBUG && console.log("end gitlab request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
            }).catch((reason) => {
                this.latest = null;
                console.error(reason);
                this.resizeWidget();
            });
        }

        private resizeWidget() {
            this.$timeout(() => this.sizeBy(this.$scope.$element.width(), this.$scope.$element.height()), 500);
        }

    }
}