namespace DashCI.Widgets.GithubIssues {
    export interface IGithubIssuesData extends Models.IWidgetData {
        username?: string;
        repository?: string;
        poolInterval?: number;
        labels?: string;
        status?: string;
        lowerThan?: {
            value: number;
            color: string;
        };
        greaterThan?: {
            value: number;
            color: string;
        };
    }


    export class GithubIssuesController implements ng.IController {
        public static $inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "githubResources"];

        private data: IGithubIssuesData;

        constructor(
            private $scope: Models.IWidgetScope,
            private $q: ng.IQService,
            private $timeout: ng.ITimeoutService,
            private $interval: ng.IIntervalService,
            private $mdDialog: ng.material.IDialogService,
            private githubResources: (username: string) => Resources.Github.IGithubResource
        ) {
            this.data = this.$scope.data;
            this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            this.data.type = Models.WidgetType.githubIssues;
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

        private handle: ng.IPromise<any>;
        private finalize() {
            if (this.handle)
                this.$interval.cancel(this.handle);
            DashCI.DEBUG && console.log("dispose: " + this.data.id + "-" + this.data.title);
        }


        private init() {
            this.data.title = this.data.title || "Issues";
            this.data.color = this.data.color || "grey";

            //default values
            this.data.labels = this.data.labels || "bug";
            this.data.status = this.data.status || "open";
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
                controller: GithubIssuesConfigController,
                controllerAs: "ctrl",
                templateUrl: 'app/widgets/github-issues/config.html',
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

        public issueCount: number = null;
        public colorClass: string;
        private updateInterval() {
            if (this.handle)
                this.$interval.cancel(this.handle);
            this.handle = this.$timeout(() => {
                this.handle = this.$interval(() => this.update(), this.data.poolInterval);
            }, DashCI.randomNess()); //this should create some randomness to avoid a lot of calls at the same moment.
            this.update();
        }
        private update() {
            if (!this.data.repository && !this.data.username)
                return;
            var res = this.githubResources(this.data.username);
            if (!res)
                return;

            DashCI.DEBUG && console.log("start github request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
            res.issue_count({
                owner: this.data.repository.split('/')[0],
                repository: this.data.repository.split('/')[1],
                labels: this.data.labels,
                state: this.data.status
            }).$promise.then((newCount: Resources.Github.ICount) => {
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

                DashCI.DEBUG && console.log("end github request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
            })
            .catch((reason) => {
                this.issueCount = null;
                console.error(reason);
            });
            this.$timeout(() => this.sizeFont(this.$scope.$element.height()), 500);
        }

    }

}