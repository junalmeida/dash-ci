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
            var help_icon = this.$scope.$element.find(".unknown");
            var size = Math.round(height / 1) - 30;
            help_icon.css("font-size", size);
            help_icon.height(size);

            //var icon = this.$scope.$element.find(".play-status md-icon");
            ////var lineSize = Math.round((altura) - 60) + "px";
            //icon.css('font-size', fontSize);
            //icon.parent().width(Math.round(altura / 1));
            ////p.css('line-height', lineSize);


            //var header = this.$scope.$element.find(".header");
            //fontSize = Math.round(altura / 1) + "px";
            //header.css('text-indent', fontSize);

            ////var title = this.$scope.$element.find("h2");
            ////fontSize = Math.round(altura / 6) + "px";
            ////title.css('font-size', fontSize);
            //var txt = this.$scope.$element.find("h4");
            //fontSize = Math.round(altura / 7) + "px";
            //txt.css('font-size', fontSize);

            //var img = this.$scope.$element.find(".avatar");
            //var size = Math.round(altura - 32);
            //img.width(size);
            //img.height(size);
        }

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

        private update() {
            if (!this.data.project || !this.data.release)
                return;
            var res = this.tfsResources();
            if (!res)
                return;


            console.log("start request: " + this.data.id + "; " + this.data.title);
            res.latest_release({ project: this.data.project, release: this.data.release })
                .$promise.then((result) => {
                    this.latest = result.value.length > 0 ? result.value[0] : null; 
                })
                .catch((error) => {
                    this.latest = null;
                    console.error(error);
                })

            this.$timeout(() => this.sizeFont(this.$scope.$element.height()), 500);
        }

    }

}