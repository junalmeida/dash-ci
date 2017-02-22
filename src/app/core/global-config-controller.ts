/// <reference path="../app.ts" />

namespace DashCI.Core {

    export class GlobalConfigController implements ng.IController {
        public static $inject = ["$mdDialog", "$scope", "config"];
        constructor(
            private $mdDialog: ng.material.IDialogService,
            $scope: ng.IScope,
            public vm: Models.IOptions
        ) { 
            this.pageCount = this.vm.pages.length;
            $scope.$watch(() => this.pageCount, () => this.updatePages());
        }

        public ok() {
            this.$mdDialog.hide();
        }

        public pageCount: number;
        
        private updatePages() {
            if (this.pageCount < 1)
                this.pageCount = 1;
            if (this.pageCount > 5)
                this.pageCount = 5;

            if (this.pageCount < this.vm.pages.length)
            {
                for (var i = this.vm.pages.length; i > this.pageCount; i--) {
                    this.vm.pages.pop();
                }
            }
            else if (this.pageCount > this.vm.pages.length)
            {
                for (var i = this.vm.pages.length; i < this.pageCount; i++) {
                    var id = (this.vm.pages.length + 1).toString();
                    this.vm.pages.push({
                        id: id,
                        name: "Dash-CI " + id.toString(),
                        widgets: []
                    });
                }
            }
        }

    }
}