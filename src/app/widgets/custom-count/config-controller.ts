namespace DashCI.Widgets.CustomCount {

    export class CustomCountConfigController implements ng.IController {
        public static $inject = ["$scope", "$mdDialog", "$q", "customResources", "colors", "intervals", "config"];
        constructor(
            private $scope: ng.IScope,
            private $mdDialog: ng.material.IDialogService,
            private $q: ng.IQService,
            public customResources: () => Resources.Custom.ICustomResource,
            public colors: Models.ICodeDescription[],
            public intervals: Models.IValueDescription[],
            public vm: ICustomCountData
        ) { 
            this.init();
        }

        private init() {
            var res = this.customResources();
            if (!res)
                return;
            //res.project_list().$promise
            //    .then((result: Resources.Custom.IProjectResult) => {
            //        this.projects = mx(result.value).orderBy(x => x.name).toArray();
            //    })
            //    .catch((reason) => {
            //        console.error(reason);
            //        this.projects = [];
            //    });

            //this.$scope.$watch(() => this.vm.project, () => this.getQueries());
        }

        public queries: Resources.Custom.IQuery[];



        public getQueries() {
            var res = this.customResources();
            if (!res || !this.vm.project)
                return;

            //var q1 = res.query_list({ project: this.vm.project, folder: "Shared Queries" }).$promise;
            //var q2 = res.query_list({ project: this.vm.project, folder: "My Queries" }).$promise;
            //this.$q.all([q1, q2])
            //    .then((result) => {
            //        var q = <DashCI.Resources.Custom.IQuery[]>[];
            //        angular.forEach(result[0].children || result[0].value, (item) => q.push(item));
            //        angular.forEach(result[1].children || result[1].value, (item) => q.push(item));

            //        this.queries = mx(q).orderBy(x => x.name).toArray();
            //    }).catch((reason) => {
            //        console.error(reason);
            //        this.queries = [];
            //    });

        }

        public ok() {
            this.$mdDialog.hide(true);
        }
    }
}