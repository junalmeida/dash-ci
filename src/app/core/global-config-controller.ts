/// <reference path="../app.ts" />

namespace DashCI.Core {

    export class GlobalConfigController implements ng.IController {
        public static $inject = ["$mdDialog", "config"];
        constructor(
            private $mdDialog: ng.material.IDialogService,
            public vm: Models.IOptions
        ) { }

        public ok() {
            this.$mdDialog.hide();
        }

    }
}