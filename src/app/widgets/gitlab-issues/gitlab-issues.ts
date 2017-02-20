﻿/// <reference path="../types.ts" />

namespace DashCI.Widgets {

    class GitlabIssuesDirective implements ng.IDirective {
        
        static create(): ng.IDirectiveFactory {
            const directive: ng.IDirectiveFactory =
                () => new GitlabIssuesDirective();
            directive.$inject = [];
            return directive;
        }


        constructor() { }

        public restrict = "E";
        public templateUrl = "app/widgets/gitlab-issues/issues.html";
        public replace = false;
        public controller = GitlabIssuesController;
        public controllerAs = "ctrl";
        /* Binding css to directives */
        public css = {
            href: "app/widgets/gitlab-issues/issues.css",
            persist: true
        }

    }

    export interface IGitlabIssuesData extends IWidgetData {
        project?: number;
        poolInterval?: number;
        labels?: string;
        status?: string;
    }


    class GitlabIssuesController implements ng.IController {
        public static $inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "gitlabResources"];

        private data: IGitlabIssuesData;

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
            this.data.type = WidgetType.gitlabIssues;
            this.data.footer = false;
            this.data.header = true;

            this.data.title = this.data.title || "Issues";
            this.data.color = this.data.color || "red";

            //default values
            this.data.labels = this.data.labels || "bug";
            this.data.status = this.data.status || "opened";
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
                controller: GitlabIssuesConfigController,
                controllerAs: "ctrl",
                templateUrl: 'app/widgets/gitlab-issues/config.html',
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

        public issueCount: number;
        private updateInterval() {
            if (this.handle)
                this.$interval.cancel(this.handle);
            this.handle = this.$interval(() => this.update(), this.data.poolInterval);
        }
        private update() {
            if (!this.data.project)
                return;


            this.gitlabResources.issue_count({
                project: this.data.project,
                labels: this.data.labels,
                state: this.data.status
            }).$promise.then((newCount: Resources.Gitlab.IIssueCount) => {
                    //var newCount = Math.round(Math.random() * 100);

                    if (newCount.count != this.issueCount) {
                        this.issueCount = newCount.count;
                        var p = this.$scope.$element.find("p");

                        p.addClass('changed');
                        this.$timeout(() => p.removeClass('changed'), 1000);
                    }
                })
                .catch(() => {
                    this.issueCount = null;
                });

        }

    }

    DashCI.app.directive("gitlabIssues", GitlabIssuesDirective.create());
}