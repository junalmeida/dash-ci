namespace DashCI.Widgets.CustomPostIt {
    export interface ICustomPostItData extends Models.IWidgetData {
        label?: string;
        route?: string;
        params?: string;
        poolInterval?: number;

        postItColor?: string;

        columns?: number;

        headerTokens?: string;
        line1Tokens?: string;
        line2Tokens?: string;
        avatarToken?: string;
    }


    export class CustomPostItController implements ng.IController {
        public static $inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "customResources"];

        private data: ICustomPostItData;

        constructor(
            private $scope: Models.IWidgetScope,
            private $q: ng.IQService,
            private $timeout: ng.ITimeoutService,
            private $interval: ng.IIntervalService,
            private $mdDialog: ng.material.IDialogService,
            private customResources: (label: string) => Resources.Custom.ICustomResource
        ) {
            this.data = this.$scope.data;
            this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            this.data.type = Models.WidgetType.customPostIt;
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
            this.data.title = this.data.title || "PostIt";
            this.data.color = "transparent";
            this.data.postItColor = this.data.postItColor || "amber";
            this.data.columns = this.data.columns || 1;

            //default values
            this.data.poolInterval = this.data.poolInterval || 10000;

            this.updateInterval();
        }

        private sizeFont(height: number) {
            //var p = this.$scope.$element.find("p");
            //var fontSize = Math.round(height / 1.3) + "px";
            //var lineSize = Math.round((height) - 60) + "px";
            //p.css('font-size', fontSize);
            //p.css('line-height', lineSize);
        }

        public config() {
            this.$mdDialog.show({
                controller: CustomPostItConfigController,
                controllerAs: "ctrl",
                templateUrl: 'app/widgets/custom-postit/config.html',
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

        public count: number = null;
        public list: PostItListItem[] = null;
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
            if (!this.data.label && !this.data.route)
                return;
            var res = this.customResources(this.data.label);
            if (!res)
                return;

            DashCI.DEBUG && console.log("start custom request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us") + "; " + this.data.label);
            res.execute_list({
                route: this.data.route,
                params: this.data.params
            }).$promise.then((newPostIt: Resources.Custom.IList) => {
                //var newPostIt = Math.round(Math.random() * 100);

                if (newPostIt.count != this.count) {
                    this.count = newPostIt.count;
                    var p = this.$scope.$element.find("p");

                    p.addClass('changed');
                    this.$timeout(() => p.removeClass('changed'), 1000);
                }

                this.list = mx(newPostIt.list)
                    .select((item) => {
                        var title = "";
                        var resume = "";
                        var desc = "";
                        var tokens = (this.data.headerTokens || "").split(",");
                        angular.forEach(tokens, (token) => {
                            var value = item[token];
                            if (title && value)
                                title += " - ";
                            if (value)
                                title += value;
                        });
                        tokens = (this.data.line1Tokens || "").split(",");
                        angular.forEach(tokens, (token) => {
                            var value = item[token];
                            if (resume && value)
                                resume += " - ";
                            if (value)
                                resume += value;
                        });
                        tokens = (this.data.line2Tokens || "").split(",");
                        angular.forEach(tokens, (token) => {
                            var value = item[token];
                            if (desc && value)
                                desc += " - ";
                            if (value)
                                desc += value;
                        });


                        var ret = <PostItListItem>{
                            avatarUrl: item[this.data.avatarToken],
                            resume: resume,
                            description: desc,
                            title: title,
                            colorClass: this.data.postItColor
                        };
                        return ret;

                    }).toArray();

                DashCI.DEBUG && console.log("end custom request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us") + "; " + this.data.label);
            })
            .catch((reason) => {
                this.count = null;
                console.error(reason);
            });
            this.$timeout(() => this.sizeFont(this.$scope.$element.height()), 500);
        }

    }

    export class PostItListItem {
        public avatarUrl: string;
        public title: string;
        public resume: string;
        public description: string;
        public colorClass: string;
    }

}