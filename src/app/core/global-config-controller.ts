/// <reference path="../app.ts" />

namespace DashCI.Core {

    export class GlobalConfigController implements ng.IController {
        public static $inject = ["$timeout", "$mdDialog", "$scope", "$rootScope", "config"];
        constructor(
            private $timeout: ng.ITimeoutService,
            private $mdDialog: ng.material.IDialogService,
            $scope: ng.IScope,
            private $rootscope: ng.IRootScopeService,
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

        public reset() {

        }

        public import() {
            var inputFile = <HTMLInputElement>$("#import").get(0);
            var reader = new FileReader();
            reader.onload = (event) => {
                try 
                {
                    var obj = angular.fromJson((<any>event.target).result);
                    if (obj && obj.pages && obj.pages.length && obj.pages.length > 0) {
                        if (confirm("This will reset your current configuration and replace with the file imported.\n\nConfirm importing the file?"))
                        {
                            this.vm.pages = null;
                            angular.extend(this.vm, obj);
                        }
                        alert("File imported successfully");
                        this.$rootscope.$apply();
                        this.$rootscope.$broadcast("dashci-refresh");
                    }
                    else
                        throw "File format not supported.";
                }
                catch (e) {
                    alert(e);
                }
            };
            reader.readAsText(inputFile.files[0]);
            inputFile.value = null;
        }

        public export() {
            var data = <Models.IOptions>jQuery.extend(true, {}, this.vm);
            data.gitlab.privateToken = null;
            data.tfs.privateToken = null;

            var datatxt = angular.toJson(data);
            var myBlob = new Blob([datatxt], { type: "application/json" });

            var url = window.URL.createObjectURL(myBlob);

            var a = document.createElement("a");
            a.style.display = "none";
            document.body.appendChild(a);
            a.href = url;
            a.download = "dash-ci.json";
            a.click();
            this.$timeout(() => window.URL.revokeObjectURL(url), 1000);

            alert("Your configuration was exported. Take note of your private keys, they are not saved to the exported file.");
        }

    }
}