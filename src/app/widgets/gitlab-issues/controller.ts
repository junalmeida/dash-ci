namespace DashCI.Widgets.GitlabIssues {
    export interface IGitlabIssuesData extends Models.IWidgetData {
        query_type?: string;
        project?: number;
        group?: number;
        poolInterval?: number;
        labels?: string;
        status?: string;
        milestone?: string;
        lowerThan?: {
            value: number;
            color: string;
        };
        greaterThan?: {
            value: number;
            color: string;
        };
    }

    export class GitlabIssuesController implements ng.IController {
        public static $inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "gitlabResources"];

        private data: IGitlabIssuesData;

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
            this.data.type = Models.WidgetType.gitlabIssues;
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
                this.$timeout.cancel(this.handle);
                this.$interval.cancel(this.handle);
            }
            DashCI.DEBUG && console.log("dispose: " + this.data.id + "-" + this.data.title);
        }


        private init() {
            this.data.title = this.data.title || "Issues";
            this.data.color = this.data.color || "grey";

            //default values
            this.data.labels = this.data.labels || "bug";
            this.data.status = this.data.status || "opened";
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
        public colorClass: string;
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
        private update() {
            if (!this.data.project && !this.data.group)
                return;
            var res = this.gitlabResources();
            if (!res)
                return;

            DashCI.DEBUG && console.log("start gitlab request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
            res.issue_count({
                scope: this.data.query_type,
                scopeId: this.data.query_type == 'projects' ? this.data.project : this.data.group,
                labels: this.data.labels,
                milestone: this.data.milestone,
                state: this.data.status
            }).$promise.then((newCount: Resources.Gitlab.ICount) => {
                //var newCount = Math.round(Math.random() * 100);

                if (newCount.count != this.issueCount) {
                    this.issueCount = newCount.count;
                    var p = this.$scope.$element.find("p");

                    p.addClass('changed');
                    this.$timeout(() => p.removeClass('changed'), 1000);
                }

                if (this.data.lowerThan && !isNaN(this.data.lowerThan.value) && this.data.lowerThan.color) {
                    if (this.issueCount < this.data.lowerThan.value)
                        this.colorClass = this.data.lowerThan.color;
                }
                if (this.data.greaterThan && !isNaN(this.data.greaterThan.value) && this.data.greaterThan.color) {
                    if (this.issueCount > this.data.greaterThan.value)
                        this.colorClass = this.data.greaterThan.color;
                }

                DashCI.DEBUG && console.log("end gitlab request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
            })
            .catch((reason) => {
                this.issueCount = null;
                console.error(reason);
            });
            this.$timeout(() => this.sizeFont(this.$scope.$element.height()), 500);
        }

    }

}