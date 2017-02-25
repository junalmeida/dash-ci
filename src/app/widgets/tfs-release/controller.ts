namespace DashCI.Widgets.TfsRelease {
    export interface ITfsReleaseData extends Models.IWidgetData {
        project?: string;
        poolInterval?: number;
        release?: number;
    }


    export class TfsReleaseController implements ng.IController {
        public static $inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "tfsResources"];

        private data: ITfsReleaseData;

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
            this.data.type = Models.WidgetType.tfsRelease;
            this.data.footer = false;
            this.data.header = false;

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
            console.log("dispose: " + this.data.id + "-" + this.data.title);
        }


        private init() {
            this.data.title = this.data.title || "Release";
            this.data.color = this.data.color || "green";

            //default values
            this.data.poolInterval = this.data.poolInterval || 10000;

            this.updateInterval();
            this.update();
        }

        private sizeFont(height: number) {
            var header_size = this.$scope.$element.find(".header").height();
            var help_icon = this.$scope.$element.find(".unknown");
            var size = Math.round(height / 1) - header_size - 5;
            help_icon.css("font-size", size);
            help_icon.height(size);

            var padding = Number(this.$scope.$element.find(".envcontainer").css("padding-top")) || 5;

            this.env.height = ((height - header_size - 25) / this.rowCount() - (padding * 2)).toFixed(2) + "px";
            this.envcontainer.width = ((100 / this.maxColumnCount()) - 0.5).toFixed(2) + "%";
        }

        public envcontainer = {
            width: "0%"
        };
        public env = {
            height: "0px"
        };

        public config() {
            this.$mdDialog.show({
                controller: TfsReleaseConfigController,
                controllerAs: "ctrl",
                templateUrl: 'app/widgets/tfs-release/config.html',
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

        public latest: Resources.Tfs.IRelease;
        public environments: Resources.Tfs.IReleaseEnvironment[];
        public releaseDefinition: Resources.Tfs.IReleaseDefinition;

        private update() {
            if (!this.data.project || !this.data.release)
                return;
            var res = this.tfsResources();
            if (!res)
                return;


            console.log("start request: " + this.data.id + "; " + this.data.title);
            res.latest_release_environments({ project: this.data.project, release: this.data.release })
                .$promise.then((result) => {
                    this.latest = result.releases.length > 0 ? result.releases[0] : null; 
                    if (this.latest) {
                        this.environments = this.latest.environments;
                        angular.forEach(this.environments, (item) => {
                            var global = result.environments.filter((e) => e.id == item.id);
                            if (global && global.length == 1)
                                item.lastReleases = global[0].lastReleases;
                        });
                    }
                    else
                        this.environments = null;
                    this.releaseDefinition = result.releaseDefinition;
                    this.sizeFont(this.$scope.$element.height());
                })
                .catch((error) => {
                    this.latest = null;
                    this.environments = null;
                    this.releaseDefinition = null;
                    console.error(error);
                    this.sizeFont(this.$scope.$element.height());
                })

        }

        private rowCount() {
            var items = this.environments.filter(this.filterAutomaticAfterReleaseOrManual);
            return items.length;
        }

        private maxColumnCount() {
            var items = this.environments.filter(this.filterAutomaticAfterReleaseOrManual);
            var maxColumns = 0;
            angular.forEach(items, (item) => {
                var columns = this.environments.filter((e) => this.filterSubSequentEnvironments(item.name)(e));
                if (columns.length + 1> maxColumns)
                    maxColumns = columns.length + 1;
            });
            return maxColumns;
        }

        public filterAutomaticAfterReleaseOrManual(element: Resources.Tfs.IReleaseEnvironment) {
            return (element.conditions && element.conditions[0] && element.conditions[0].name == "ReleaseStarted") ||
                    (element.conditions && element.conditions.length == 0)//manual
                ;
        }


        public filterSubSequentEnvironments(rootName: string) {
            return (element: Resources.Tfs.IReleaseEnvironment) =>
                element.conditions && element.conditions[0] &&
                element.conditions[0].conditionType == "environmentState" &&
                element.conditions[0].name == rootName;
        }


    }

}