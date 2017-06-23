namespace DashCI.Widgets.TfsBuildGraph
{
    export interface ITfsBuildGraphData extends Models.IWidgetData {
        project?: string;
        poolInterval?: number;
        count?: number;
        build?: number;
        wildcardBuild?: boolean;
        buildName?: string;
    }

    export class TfsBuildGraphController implements ng.IController {
        public static $inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "tfsResources"];

        private data: ITfsBuildGraphData;

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
            this.data.type = Models.WidgetType.tfsBuildGraph;
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
            DashCI.DEBUG && console.log("dispose: " + this.data.id + "-" + this.data.title);
        }

        private init() {
            this.data.title = this.data.title || "Build Graph";
            this.data.color = this.data.color || "blue";
            this.data.count = this.data.count || 20;

            //default values
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
                controller: TfsBuildGraphConfigController,
                controllerAs: "ctrl",
                templateUrl: 'app/widgets/tfs-build-graph/config.html',
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

        public builds: Resources.Tfs.IBuild[];


        private update() {
            if (!this.data.project || (!this.data.wildcardBuild && !this.data.build) || (this.data.wildcardBuild && !this.data.buildName))
                return;
            var res = this.tfsResources();
            if (!res)
                return;

            DashCI.DEBUG && console.log("start tfs request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us"));

            var doQueryBuild = (builds: number|string) => {

                res.recent_builds({
                    project: this.data.project,
                    build: builds,
                    count: this.data.count
                }).$promise.then((result) => {
                    var builds = result.value.reverse();
                    var maxDuration = 1;
                    angular.forEach(builds, (item) => {
                        if (item.finishTime) {
                            var finishTime = moment(item.finishTime);
                            var startTime = moment(item.startTime);


                            item.duration = finishTime.diff(startTime, 'seconds');
                            if (maxDuration < item.duration)
                                maxDuration = item.duration;
                        }
                    });

                    var width = (100 / builds.length);
                    angular.forEach(builds, (item, i) => {
                        var height = Math.round((100 * item.duration) / maxDuration);
                        if (height < 3) height = 3;
                        item.css = {
                            height: height.toString() + "%",
                            width: width.toFixed(2) + "%",
                            left: (width * i).toFixed(2) + "%"
                        };
                    });

                    this.builds = builds;
                    this.$timeout(() => this.sizeFont(this.$scope.$element.height()), 500);
                    DashCI.DEBUG && console.log("end tfs request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
                }).catch((reason: any) => {
                    this.builds = [];
                    console.error(reason);
                });
            };



            if (this.data.wildcardBuild) {
                res.build_definition_list({
                    project: this.data.project,
                    name: this.data.buildName
                }).$promise.then((build: Resources.Tfs.IBuildDefinitionResult) => {

                    var buildIds = mx(build.value).select(x => x.id).toArray().join(",");
                    doQueryBuild(buildIds);

                }).catch((reason:any) => {
                    this.builds = [];
                    console.error(reason);
                });
            }
            else
                doQueryBuild(this.data.build);
        }

    }
}