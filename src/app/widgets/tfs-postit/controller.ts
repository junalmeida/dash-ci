namespace DashCI.Widgets.TfsPostIt {
    export interface ITfsPostItData extends Models.IWidgetData {
        project?: string;
        team?: string;
        queryId?: string;

        poolInterval?: number;

        postItColor?: string;

        columns?: number;

        colorBy?: DashCI.Resources.Tfs.TfsColorBy;
    }


    export class TfsPostItController implements ng.IController {
        public static $inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "tfsResources", "colors"];

        private data: ITfsPostItData;

        constructor(
            private $scope: Models.IWidgetScope,
            private $q: ng.IQService,
            private $timeout: ng.ITimeoutService,
            private $interval: ng.IIntervalService,
            private $mdDialog: ng.material.IDialogService,
            private tfsResources: () => Resources.Tfs.ITfsResource,
            private colors: Models.ICodeDescription[] 
        ) {
            this.data = this.$scope.data;
            this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            this.data.type = Models.WidgetType.tfsPostIt;
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

            this.colors = mx(this.colors).where(x => x.code != "transparent" && x.code != "semi-transp").toArray();
        }

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
                controller: TfsPostItConfigController,
                controllerAs: "ctrl",
                templateUrl: 'app/widgets/tfs-postit/config.html',
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

        public areaColors: { [area: string]: string; } = {};
        public workItemColors: { [type: string]: string; } = {
            "Requirement": "blue",
            "User Story": "blue",
            "Release Item": "orange",
            "Release": "deep-green",
            "Feature": "purple",
            "Epic": "purple",
            "Bug": "red",
            "Issue": "amber"
        };

        private update() {
            var res = this.tfsResources();
            if (!res)
                return;

            DashCI.DEBUG && console.log("start Tfs request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us") + "; ");
            res.run_query({
                project: this.data.project,
                team: this.data.team,
                queryId: this.data.queryId
            }).$promise.then((newPostIt: Resources.Tfs.IRunQueryResult) => {
                //var newPostIt = Math.round(Math.random() * 100);

                var order = mx(newPostIt.workItems).select(x => x.id).toArray();
                var ids = order.join(",");

                res.get_workitems({
                    ids: ids
                }).$promise.then((data: Resources.Tfs.IWorkItemsResult) => {


                    if (data.count != this.count) {
                        this.count = data.count;
                        var p = this.$scope.$element.find("p");

                        p.addClass('changed');
                        this.$timeout(() => p.removeClass('changed'), 1000);
                    }

                    this.list = mx(data.value)
                        .orderBy(x=> order.indexOf(x.id))
                        .select((item) => {
                            var title = item.fields["System.Title"];
                            var resume = item.fields["System.IterationPath"];
                            var desc =  item.fields["System.AssignedTo"];
                            if (desc && desc.indexOf("<") > -1)
                                desc = desc.substr(0, desc.indexOf("<")).trim();
                            if (resume && resume.indexOf("\\") > -1)
                                resume = resume.substr(resume.indexOf("\\") + 1);

                            var color = this.data.postItColor;
                            if (this.data.colorBy && this.data.colorBy == Resources.Tfs.TfsColorBy.randomColorByPath)
                            {
                                if (!this.areaColors[resume] && this.colors.length > 0) {
                                    var ix = TfsPostItController.getRandomInt(0, this.colors.length - 1);
                                    this.areaColors[resume] = this.colors[ix].code;
                                    this.colors.splice(ix, 1);
                                }
                                else if (!this.areaColors[resume] && this.colors.length == 0) {
                                    this.areaColors[resume] = this.data.postItColor;
                                }
                                color = this.areaColors[resume];
                            }
                            else if (this.data.colorBy && this.data.colorBy == Resources.Tfs.TfsColorBy.colorByWorkItemType) {
                                var type = item.fields["System.WorkItemType"];

                                if (!this.workItemColors[type]) {
                                    this.workItemColors[type] = this.data.postItColor;
                                }
                                color = this.workItemColors[type];
                            }

                            var ret = <PostItListItem>{
                                avatarUrl: null,
                                resume: resume,
                                description: desc,
                                title: title,
                                colorClass: color
                            };
                            return ret;

                    }).toArray();

                    DashCI.DEBUG && console.log("end Tfs request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us") + "; ");
                });

            })
            .catch((reason) => {
                this.count = null;
                console.error(reason);
            });
            this.$timeout(() => this.sizeFont(this.$scope.$element.height()), 500);
        }


        // Returns a random integer between min (included) and max (included)
        static getRandomInt(min:number, max: number): number {
            return Math.floor(Math.random() * (max - min + 1)) + min;
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