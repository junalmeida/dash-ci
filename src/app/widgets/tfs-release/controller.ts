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
            this.data.color = this.data.color || "brown";

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


            this.env.iconSize = this.env.height;
        }

        public envcontainer = {
            width: "0%"
        };
        public env = {
            height: "0px",
            iconSize: "0px"
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
        public environment_rows: Resources.Tfs.IReleaseEnvironment[][];
        public releaseDefinition: Resources.Tfs.IReleaseDefinition;

        private update() {
            if (!this.data.project || !this.data.release)
                return;
            var res = this.tfsResources();
            if (!res)
                return;


            if (!this.releaseDefinition || this.releaseDefinition.id != this.data.release) {
                this.releaseDefinition = null;
                res.release_definition({ project: this.data.project, release: this.data.release }).$promise
                    .then((result) => {
                        this.releaseDefinition = result;
                        this.update();
                    })
                    .catch((error) => {
                        this.releaseDefinition = null;
                        this.environment_rows = null;
                        console.error(error);
                    });

            }

            if (this.releaseDefinition) {
                console.log("start request: " + this.data.id + "; " + this.data.title);
                res.latest_release_environments({ project: this.data.project, release: this.data.release })
                    .$promise.then((result) => {
                        this.latest = result.releases.length > 0 ? result.releases[result.releases.length - 1] : null;
                        angular.forEach(result.environments, (e) => {
                            var findRelease = result.releases.filter((r) => e.lastReleases.length > 0 && r.id == e.lastReleases[0].id);
                            var lastestDef = this.latest.environments.filter((re) => re.definitionEnvironmentId == e.id)[0];
                            if (lastestDef && lastestDef.status == "inProgress") {
                                angular.extend(e, lastestDef);
                            }
                            else if (findRelease.length == 1) {
                                var releaseEnv = findRelease[0].environments.filter((re) => re.definitionEnvironmentId == e.id);
                                if (releaseEnv.length > 0)
                                    angular.extend(e, releaseEnv[0]);
                            }
                            else if (lastestDef) {
                                e.name = lastestDef.name;
                                e.conditions = lastestDef.conditions;
                            }
                            var currentEnv = this.releaseDefinition.environments.filter((re) => re.id == lastestDef.definitionEnvironmentId);
                            e.conditions = currentEnv[0].conditions;

                            this.setIcon(e)
                            if (!e.release && e.lastReleases && e.lastReleases.length > 0)
                                e.release = result.releases.filter((r) => r.id == e.lastReleases[0].id)[0];
                        });
                        this.environments = result.environments;

                        if (this.latest) {
                            var baseEnvs = this.environments.filter(this.filterAutomaticAfterReleaseOrManual);

                            var rows: Resources.Tfs.IReleaseEnvironment[][] = [];
                            angular.forEach(baseEnvs, (item) => {
                                var row: Resources.Tfs.IReleaseEnvironment[] = [];
                                row.push(item);
                                angular.forEach(this.filterSubSequentEnvironments(item), (e) => row.push(e));
                                rows.push(row);
                            });
                            this.environment_rows = rows;
                        }
                        else {
                            this.environments = null;
                            this.environment_rows = null;
                        }
                        this.sizeFont(this.$scope.$element.height());
                    })
                    .catch((error) => {
                        this.latest = null;
                        this.environments = null;
                        this.releaseDefinition = null;
                        this.environment_rows = null;
                        console.error(error);
                        this.sizeFont(this.$scope.$element.height());
                    });
            }
        }

        private rowCount() {
            return this.environment_rows ? this.environment_rows.length : 0;
        }

        private maxColumnCount() {
            if (!this.environment_rows)
                return 0;
            var maxColumns = 0;
            angular.forEach(this.environment_rows, (row) => {
                if (row.length > maxColumns)
                    maxColumns = row.length;
            });
            return maxColumns;
        }

        public filterAutomaticAfterReleaseOrManual(element: Resources.Tfs.IReleaseEnvironment) {
            return (element.conditions && element.conditions[0] && element.conditions[0].name == "ReleaseStarted") ||
                    (element.conditions && element.conditions.length == 0)//manual
                ;
        }


        private filterSubSequentEnvironments(rootElement: Resources.Tfs.IReleaseEnvironment) {

            var list = this.environments.filter((element: Resources.Tfs.IReleaseEnvironment) =>
                element.conditions && element.conditions[0] &&
                element.conditions[0].conditionType == "environmentState" &&
                element.conditions[0].name == rootElement.name
            );

            angular.forEach(list, (item) => {
                var moreList = this.filterSubSequentEnvironments(item);
                if (moreList.length > 0)
                    angular.forEach(moreList, (mi) => list.push(mi));
            });

            return list;
        }

        private setIcon(item: Resources.Tfs.IReleaseEnvironment) {
            switch (item.status) {
                case "inProgress":
                    item.icon = "play_circle_filled"; break;
                case "canceled":
                    item.icon = "remove_circle"; break;
                case "notStarted":
                    item.icon = "pause_circle_filled"; break;
                case "rejected":
                    item.icon = "cancel"; break;
                case "succeeded":
                    item.icon = "check"; break;
                default:
                    item.icon = "help"; break;
            }
            if (item && item.preDeployApprovals) {
                var preDeploy = item.preDeployApprovals.filter((p) => p.status == "pending");
                if (preDeploy.length > 0)
                    item.icon = "assignment_ind";
                preDeploy = item.preDeployApprovals.filter((p) => p.status == "rejected");
                if (preDeploy.length > 0)
                    item.icon = "assignment_late";
            }
            if (item && item.postDeployApprovals) {
                var postDeploy = item.postDeployApprovals.filter((p) => p.status == "pending");
                if (postDeploy.length > 0)
                    item.icon = "assignment_ind";
                postDeploy = item.postDeployApprovals.filter((p) => p.status == "rejected");
                if (postDeploy.length > 0)
                    item.icon = "assignment_late";
            }
       }
    }

}