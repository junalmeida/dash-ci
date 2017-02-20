﻿/// <reference path="../types.ts" />

namespace DashCI.Widgets {

    class GitlabPipelineDirective implements ng.IDirective {
        
        static create(): ng.IDirectiveFactory {
            const directive: ng.IDirectiveFactory =
                () => new GitlabPipelineDirective();
            directive.$inject = [];
            return directive;
        }


        constructor() { }

        public restrict = "E";
        public templateUrl = "app/widgets/gitlab-pipeline/pipeline.html";
        public replace = false;
        public controller = GitlabPipelineController;
        public controllerAs = "ctrl";
        /* Binding css to directives */
        public css = {
            href: "app/widgets/gitlab-pipeline/pipeline.css",
            persist: true
        }

    }


    export interface IGitlabPipelineData extends IWidgetData {
        project?: number;
        poolInterval?: number;
        refs?: string;
    }


    class GitlabPipelineController implements ng.IController {
        public static $inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "gitlabResources"];

        private data: IGitlabPipelineData;

        constructor(
            private $scope: IWidgetScope,
            private $q: ng.IQService,
            private $timeout: ng.ITimeoutService,
            private $interval: ng.IIntervalService,
            private $mdDialog: ng.material.IDialogService,
            private gitlabResources: Widgets.Resources.Gitlab.IGitlabResource
        ) {
            this.data = this.$scope.data;
            this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            this.data.type = WidgetType.gitlabPipeline;
            this.data.footer = false;
            this.data.header = false;

            this.data.title = this.data.title || "Pipeline";
            this.data.color = this.data.color || "green";

            //default values
            this.data.refs = this.data.refs || "master";
            this.data.poolInterval = this.data.poolInterval || 10000;

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
            this.$timeout(() => this.sizeFont(this.$scope.$element.height()), 500);
        }

        private sizeFont(altura: number) {
            var icon = this.$scope.$element.find(".play-status md-icon");
            var fontSize = Math.round(altura / 1) + "px";
            //var lineSize = Math.round((altura) - 60) + "px";
            icon.css('font-size', fontSize);
            icon.parent().width(Math.round(altura / 1));
            //p.css('line-height', lineSize);

            var title = this.$scope.$element.find("h2");
            fontSize = Math.round(altura / 6) + "px";
            title.css('font-size', fontSize);

            var txt = this.$scope.$element.find("h4");
            fontSize = Math.round(altura / 8) + "px";
            txt.css('font-size', fontSize);
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
            this.handle = this.$interval(() => this.update(), this.data.poolInterval);
        }

        public icon = "help_outline";
        public latest: Resources.Gitlab.IPipeline;

        private update() {
            if (!this.data.project)
                return;


            console.log("start request: " + this.data.id + "; " + this.data.title);
            this.gitlabResources.latest_pipeline({
                project: this.data.project,
                ref: this.data.refs
            }).$promise.then((pipelines: Resources.Gitlab.IPipeline[]) => {
                console.log("end request: " + this.data.id + "; " + this.data.title);
                var new_pipeline: Resources.Gitlab.IPipeline = null;
                var refList = this.data.refs.split(",");
                pipelines = pipelines.filter((i:any) => refList.indexOf(i.ref) > -1);

                if (pipelines.length >= 1)
                    new_pipeline = pipelines[0];

                this.latest = new_pipeline;
                if (this.latest && this.latest.status) {
                    switch (this.latest.status) {
                        case "pending":
                            this.icon = "pause_circle_outline"; break;
                        case "running":
                            this.icon = "play_circle_outline"; break;
                        case "canceled":
                            this.icon = "remove_circle_outline"; break;
                        case "success":
                            this.icon = "check_circle"; break;
                        case "failed":
                            this.icon = "error_outline"; break;
                        case "default":
                            this.icon = "help_outline"; break;
                    }

                }
                else
                    this.icon = "help_outline";
                    //var p = this.$scope.$element.find("p");

                    //p.addClass('changed');
                    //this.$timeout(() => p.removeClass('changed'), 1000);

            }).catch(() => {
                this.latest = null;
            });

        }

    }

    DashCI.app.directive("gitlabPipeline", GitlabPipelineDirective.create());
}